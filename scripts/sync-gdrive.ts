#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { tmpdir } from 'os';
import { google } from 'googleapis';
import { env } from '../env';

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

// Check if folder was modified within the last N days
async function isFolderRecentlyModified(drive: any, folderId: string, daysThreshold: number = 3): Promise<boolean> {
  try {
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'modifiedTime'
    });
    
    const modifiedTime = new Date(response.data.modifiedTime);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
    
    const isRecent = modifiedTime > thresholdDate;
    console.log(`[INFO] Folder last modified: ${modifiedTime.toISOString()}`);
    console.log(`[INFO] Threshold date (${daysThreshold} days ago): ${thresholdDate.toISOString()}`);
    console.log(`[INFO] Is recently modified: ${isRecent}`);
    
    return isRecent;
  } catch (error) {
    console.warn(`[WARN] Could not check folder modification time: ${error}`);
    return true; // If we can't check, assume it's modified to be safe
  }
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

// Get all files in a Google Drive folder recursively
async function getAllFilesInFolder(drive: any, folderId: string, folderPath: string = ''): Promise<Array<{ file: DriveFile, path: string }>> {
  const files: Array<{ file: DriveFile, path: string }> = [];
  
  try {
    let pageToken: string | undefined = undefined;
    
    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, parents, mimeType, size)',
        pageToken: pageToken
      });
      
      const items = response.data.files || [];
      
      for (const item of items) {
        const currentPath = folderPath ? `${folderPath}/${item.name}` : item.name;
        
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively get files from subfolder
          const subFolderFiles = await getAllFilesInFolder(drive, item.id, currentPath);
          files.push(...subFolderFiles);
        } else {
          // Regular file
          files.push({ file: item, path: currentPath });
        }
      }
      
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    
  } catch (error) {
    console.error(`[ERROR] Failed to list files in folder ${folderId}:`, error);
    throw error;
  }
  
  return files;
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

// Copy file with metadata
async function copyFile(src: string, dest: string): Promise<void> {
  await ensureParentDir(dest);
  await fs.copyFile(src, dest);
  
  // Copy timestamps
  const stats = await fs.stat(src);
  await fs.utimes(dest, stats.atime, stats.mtime);
}

async function main() {

  const destPath = path.resolve(DEST_DIR);
  await fs.mkdir(destPath, { recursive: true });

  // 1) Initialize Google Drive API
  console.log('[INFO] Initializing Google Drive API...');
  const drive = initializeDriveAPI();

  // 2) Check if folder was recently modified (within 3 days)
  console.log(`[INFO] Checking if folder ${FOLDER_ID} was modified recently...`);
  const isRecentlyModified = await isFolderRecentlyModified(drive, FOLDER_ID, 3);
  
  if (!isRecentlyModified) {
    console.log('[INFO] Folder not modified within the last 3 days. Skipping sync.');
    return;
  }
  
  console.log('[INFO] Folder was recently modified. Proceeding with sync...');

  // 3) Create temporary directory
  const tmpRoot = await fs.mkdtemp(path.join(tmpdir(), 'gdrive_sync_'));
  
  try {
    console.log(`[INFO] Downloading folder id=${FOLDER_ID} -> ${tmpRoot}`);
    
    // Get all files in the Google Drive folder
    const driveFiles = await getAllFilesInFolder(drive, FOLDER_ID);
    console.log(`[INFO] Found ${driveFiles.length} files in Google Drive folder`);
    
    // Download each file
    for (const { file, path: filePath } of driveFiles) {
      const localPath = path.join(tmpRoot, filePath);
      console.log(`[DOWNLOAD] ${filePath}`);
      await downloadFile(drive, file.id, localPath);
    }

    // 3) Build manifests and compare changes
    const srcManifest = await buildManifest(tmpRoot);
    let destManifest: FileManifest = {};
    
    try {
      destManifest = await buildManifest(destPath);
    } catch (error) {
      // Destination directory might not exist or be empty
      console.log('[INFO] Destination directory empty or not accessible, treating as new sync');
    }

    const toAddOrUpdate: string[] = [];
    const toDelete: string[] = [];

    // Find files to add or update
    for (const [relativePath, { size, hash }] of Object.entries(srcManifest)) {
      if (!destManifest[relativePath]) {
        toAddOrUpdate.push(relativePath);
      } else {
        const { size: destSize, hash: destHash } = destManifest[relativePath];
        if (size !== destSize || hash !== destHash) {
          toAddOrUpdate.push(relativePath);
        }
      }
    }

    // Find files to delete (exist in dest but not in src)
    for (const relativePath of Object.keys(destManifest)) {
      if (!srcManifest[relativePath]) {
        toDelete.push(relativePath);
      }
    }

    // 4) Apply deletions
    for (const relativePath of toDelete) {
      const targetPath = path.join(destPath, relativePath);
      try {
        await fs.unlink(targetPath);
        console.log(`[DEL] ${relativePath}`);
      } catch (error) {
        // File might already be deleted
      }
    }

    // 5) Apply additions/updates (copy only necessary files)
    for (const relativePath of toAddOrUpdate) {
      const srcPath = path.join(tmpRoot, relativePath);
      const destFilePath = path.join(destPath, relativePath);
      await copyFile(srcPath, destFilePath);
      console.log(`[UPD] ${relativePath}`);
    }

    // 6) Summary
    console.log(`[SUMMARY] updated: ${toAddOrUpdate.length}, deleted: ${toDelete.length}`);

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