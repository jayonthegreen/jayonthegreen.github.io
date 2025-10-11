#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { tmpdir } from 'os';
import { google } from 'googleapis';
import { env } from '../env';
import { sendTelegramMessage } from '../src/utils/telegram';

const { GDRIVE_FOLDER_ID: FOLDER_ID, DEST_DIR, GOOGLE_SERVICE_ACCOUNT_KEY: SERVICE_ACCOUNT_KEY } = env;

interface FileManifest {
  [relativePath: string]: {
    size: number;
    hash: string;
  };
}

interface DriveFile {
  id: string;
  name: string;
  parents?: string[];
  mimeType: string;
  size?: string;
}

// Calculate SHA256 hash of a file
async function sha256sum(filePath: string, chunkSize: number = 1024 * 1024): Promise<string> {
  const hash = crypto.createHash('sha256');
  const fileHandle = await fs.open(filePath, 'r');
  const buffer = Buffer.alloc(chunkSize);
  
  try {
    let position = 0;
    while (true) {
      const { bytesRead } = await fileHandle.read(buffer, 0, chunkSize, position);
      if (bytesRead === 0) break;
      
      hash.update(buffer.subarray(0, bytesRead));
      position += bytesRead;
    }
  } finally {
    await fileHandle.close();
  }
  
  return hash.digest('hex');
}

// Build manifest of all files in a directory
async function buildManifest(rootPath: string): Promise<FileManifest> {
  const manifest: FileManifest = {};
  
  async function walkDir(dirPath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
        try {
          const stats = await fs.stat(fullPath);
          const hash = await sha256sum(fullPath);
          manifest[relativePath] = {
            size: stats.size,
            hash: hash
          };
        } catch (error) {
          console.warn(`[WARN] hash failed: ${fullPath} (${error})`);
        }
      }
    }
  }
  
  await walkDir(rootPath);
  return manifest;
}

// Ensure parent directory exists
async function ensureParentDir(filePath: string) {
  const parentDir = path.dirname(filePath);
  await fs.mkdir(parentDir, { recursive: true });
}

// Get lightweight metadata of all files in a Google Drive folder recursively
async function getFileMetadata(drive: any, folderId: string, folderPath: string = ''): Promise<FileManifest> {
  const metadata: FileManifest = {};
  
  try {
    let pageToken: string | undefined = undefined;
    
    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, parents, mimeType, size, modifiedTime)',
        pageToken: pageToken
      });
      
      const items = response.data.files || [];
      
      for (const item of items) {
        const currentPath = folderPath ? `${folderPath}/${item.name}` : item.name;
        
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively get metadata from subfolder
          const subFolderMetadata = await getFileMetadata(drive, item.id, currentPath);
          Object.assign(metadata, subFolderMetadata);
        } else {
          // Regular file - use modifiedTime as hash for comparison
          metadata[currentPath] = {
            size: parseInt(item.size) || 0,
            hash: item.modifiedTime || 'unknown'
          };
        }
      }
      
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    
  } catch (error) {
    console.error(`[ERROR] Failed to get file metadata from folder ${folderId}:`, error);
    throw error;
  }
  
  return metadata;
}

// Initialize Google Drive API
function initializeDriveAPI() {
  if (!SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  let credentials;
  try {
    credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
  } catch (error) {
    throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });

  return google.drive({ version: 'v3', auth });
}

// Get files that need to be downloaded based on metadata comparison
async function getChangedFiles(drive: any, folderId: string, localMetadata: FileManifest, folderPath: string = ''): Promise<Array<{ file: DriveFile, path: string, action: 'add' | 'update' }>> {
  const changedFiles: Array<{ file: DriveFile, path: string, action: 'add' | 'update' }> = [];
  
  try {
    let pageToken: string | undefined = undefined;
    
    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, parents, mimeType, size, modifiedTime)',
        pageToken: pageToken
      });
      
      const items = response.data.files || [];
      
      for (const item of items) {
        const currentPath = folderPath ? `${folderPath}/${item.name}` : item.name;
        
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively get files from subfolder
          const subFolderChangedFiles = await getChangedFiles(drive, item.id, localMetadata, currentPath);
          changedFiles.push(...subFolderChangedFiles);
        } else {
          // Check if this file needs downloading
          const remoteSize = parseInt(item.size) || 0;
          const remoteHash = item.modifiedTime || 'unknown';
          
          if (!localMetadata[currentPath]) {
            // New file
            changedFiles.push({ file: item, path: currentPath, action: 'add' });
          } else {
            // Check if modified
            const { size: localSize, hash: localHash } = localMetadata[currentPath];
            if (remoteSize !== localSize || remoteHash !== localHash) {
              changedFiles.push({ file: item, path: currentPath, action: 'update' });
            }
          }
        }
      }
      
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    
  } catch (error) {
    console.error(`[ERROR] Failed to get changed files from folder ${folderId}:`, error);
    throw error;
  }
  
  return changedFiles;
}

// Download a file from Google Drive
async function downloadFile(drive: any, fileId: string, destPath: string): Promise<void> {
  await ensureParentDir(destPath);
  
  try {
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    
    const writer = require('fs').createWriteStream(destPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`[ERROR] Failed to download file ${fileId} to ${destPath}:`, error);
    throw error;
  }
}

// Check if any files need syncing by comparing metadata
function needsSync(remoteMetadata: FileManifest, localMetadata: FileManifest): boolean {
  // Check if any remote files are new or modified
  for (const [relativePath, { size, hash }] of Object.entries(remoteMetadata)) {
    if (!localMetadata[relativePath]) {
      console.log(`[CHANGE] New file: ${relativePath}`);
      return true;
    } else {
      const { size: localSize, hash: localHash } = localMetadata[relativePath];
      if (size !== localSize || hash !== localHash) {
        console.log(`[CHANGE] Modified file: ${relativePath}`);
        return true;
      }
    }
  }

  // Check if any local files were deleted remotely
  for (const relativePath of Object.keys(localMetadata)) {
    if (!remoteMetadata[relativePath]) {
      console.log(`[CHANGE] Deleted file: ${relativePath}`);
      return true;
    }
  }

  return false;
}

// Copy file with metadata
async function copyFile(src: string, dest: string): Promise<void> {
  await ensureParentDir(dest);
  await fs.copyFile(src, dest);

  // Copy timestamps
  const stats = await fs.stat(src);
  await fs.utimes(dest, stats.atime, stats.mtime);
}

// Extract title from markdown file
async function extractTitleFromMarkdown(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Look for YAML frontmatter title
    if (lines[0]?.trim() === '---') {
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '---') break;
        if (line.startsWith('title:')) {
          return line.substring(6).trim().replace(/^["']|["']$/g, '');
        }
      }
    }

    // Look for first H1 heading
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
    }

    // Fallback to filename
    return path.basename(filePath, path.extname(filePath));
  } catch (error) {
    console.warn(`[WARN] Failed to extract title from ${filePath}`);
    return null;
  }
}

// Send Telegram notification for changed files
async function notifyFileChange(filePath: string, action: 'add' | 'update'): Promise<void> {
  // Only notify for markdown files
  if (!filePath.endsWith('.md')) {
    return;
  }

  const title = await extractTitleFromMarkdown(filePath);
  if (!title) {
    return;
  }

  const emoji = action === 'add' ? '📝' : '✏️';
  const actionText = action === 'add' ? 'New post' : 'Updated';
  const message = `${emoji} ${actionText}: ${title}`;

  try {
    await sendTelegramMessage(message);
  } catch (error) {
    console.warn(`[WARN] Failed to send Telegram notification for ${filePath}:`, error);
  }
}

async function main() {

  const destPath = path.resolve(DEST_DIR);
  await fs.mkdir(destPath, { recursive: true });

  // 1) Initialize Google Drive API
  console.log('[INFO] Initializing Google Drive API...');
  const drive = initializeDriveAPI();

  // 2) Get local manifest for comparison
  let localMetadata: FileManifest = {};
  try {
    localMetadata = await buildManifest(destPath);
    console.log(`[INFO] Found ${Object.keys(localMetadata).length} local files`);
  } catch (error) {
    console.log('[INFO] No local files found, treating as initial sync');
  }

  // 3) Create temporary directory
  const tmpRoot = await fs.mkdtemp(path.join(tmpdir(), 'gdrive_sync_'));
  
  try {
    // Get only files that have changed
    const changedFiles = await getChangedFiles(drive, FOLDER_ID, localMetadata);
    console.log(`[INFO] Found ${changedFiles.length} files that need downloading`);
    
    if (changedFiles.length === 0) {
      console.log('[INFO] No files to download');
      return;
    }
    
    console.log(`[INFO] Downloading changed files to ${tmpRoot}`);
    
    // Download only changed files
    for (const { file, path: filePath, action } of changedFiles) {
      const localPath = path.join(tmpRoot, filePath);
      console.log(`[${action.toUpperCase()}] ${filePath}`);
      await downloadFile(drive, file.id, localPath);
    }

    // 4) Handle deletions - check for files that exist locally but not remotely
    const remoteMetadata = await getFileMetadata(drive, FOLDER_ID);
    const toDelete: string[] = [];
    
    for (const relativePath of Object.keys(localMetadata)) {
      if (!remoteMetadata[relativePath]) {
        toDelete.push(relativePath);
      }
    }

    // Apply deletions
    for (const relativePath of toDelete) {
      const targetPath = path.join(destPath, relativePath);
      try {
        await fs.unlink(targetPath);
        console.log(`[DEL] ${relativePath}`);
      } catch (error) {
        // File might already be deleted
      }
    }

    // 5) Copy downloaded files to destination and send notifications
    const srcManifest = await buildManifest(tmpRoot);
    for (const [relativePath] of Object.entries(srcManifest)) {
      const srcPath = path.join(tmpRoot, relativePath);
      const destFilePath = path.join(destPath, relativePath);
      await copyFile(srcPath, destFilePath);
      console.log(`[COPY] ${relativePath}`);

      // Find the action for this file and send notification
      const changedFile = changedFiles.find(cf => cf.path === relativePath);
      if (changedFile) {
        await notifyFileChange(destFilePath, changedFile.action);
      }
    }

    // 6) Save changed files list for next processing steps
    const changedFilesList = changedFiles.map(cf => cf.path);
    const changeManifest = {
      downloaded: changedFilesList,
      deleted: toDelete,
      timestamp: new Date().toISOString()
    };
    await fs.writeFile(
      path.join(destPath, '.changes.json'),
      JSON.stringify(changeManifest, null, 2),
      'utf-8'
    );

    // 7) Summary
    console.log(`[SUMMARY] downloaded: ${changedFiles.length}, deleted: ${toDelete.length}`);

  } finally {
    // Cleanup temporary directory
    try {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    } catch (error) {
      console.warn(`[WARN] Failed to cleanup temp directory: ${tmpRoot}`);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}