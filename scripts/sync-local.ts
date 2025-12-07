#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

// Source folder (Obsidian vault)
const SOURCE_DIR = '/Users/kozha/Library/Mobile Documents/iCloud~md~obsidian/Documents/Jay/03 Resource/Blog';
const DEST_DIR = 'content/origin';

interface FileManifest {
  [relativePath: string]: {
    size: number;
    hash: string;
  };
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
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      console.warn(`[WARN] Cannot read directory: ${dirPath}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip hidden files and directories
      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile()) {
        // Only process markdown files
        if (!entry.name.endsWith('.md')) {
          continue;
        }

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

// Copy file with metadata
async function copyFile(src: string, dest: string): Promise<void> {
  await ensureParentDir(dest);
  await fs.copyFile(src, dest);

  // Copy timestamps
  const stats = await fs.stat(src);
  await fs.utimes(dest, stats.atime, stats.mtime);
}

async function main() {
  const sourcePath = path.resolve(SOURCE_DIR);
  const destPath = path.resolve(DEST_DIR);

  // Check if source directory exists
  try {
    await fs.access(sourcePath);
  } catch (error) {
    console.error(`[ERROR] Source directory does not exist: ${sourcePath}`);
    process.exit(1);
  }

  await fs.mkdir(destPath, { recursive: true });

  console.log(`[INFO] Source: ${sourcePath}`);
  console.log(`[INFO] Destination: ${destPath}`);

  // 1) Build manifests for both directories
  console.log('[INFO] Building source manifest...');
  const sourceManifest = await buildManifest(sourcePath);
  console.log(`[INFO] Found ${Object.keys(sourceManifest).length} source files`);

  console.log('[INFO] Building destination manifest...');
  let destManifest: FileManifest = {};
  try {
    destManifest = await buildManifest(destPath);
    console.log(`[INFO] Found ${Object.keys(destManifest).length} destination files`);
  } catch (error) {
    console.log('[INFO] No destination files found, treating as initial sync');
  }

  // 2) Find files to add, update, or delete
  const toAdd: string[] = [];
  const toUpdate: string[] = [];
  const toDelete: string[] = [];

  // Check for new or updated files
  for (const [relativePath, sourceInfo] of Object.entries(sourceManifest)) {
    if (!destManifest[relativePath]) {
      toAdd.push(relativePath);
    } else if (destManifest[relativePath].hash !== sourceInfo.hash) {
      toUpdate.push(relativePath);
    }
  }

  // Check for deleted files
  for (const relativePath of Object.keys(destManifest)) {
    if (!sourceManifest[relativePath]) {
      toDelete.push(relativePath);
    }
  }

  // 3) Apply changes
  // Copy new files
  for (const relativePath of toAdd) {
    const srcPath = path.join(sourcePath, relativePath);
    const destFilePath = path.join(destPath, relativePath);
    console.log(`[ADD] ${relativePath}`);
    await copyFile(srcPath, destFilePath);
  }

  // Copy updated files
  for (const relativePath of toUpdate) {
    const srcPath = path.join(sourcePath, relativePath);
    const destFilePath = path.join(destPath, relativePath);
    console.log(`[UPDATE] ${relativePath}`);
    await copyFile(srcPath, destFilePath);
  }

  // Delete removed files
  for (const relativePath of toDelete) {
    const destFilePath = path.join(destPath, relativePath);
    console.log(`[DELETE] ${relativePath}`);
    try {
      await fs.unlink(destFilePath);
    } catch (error) {
      console.warn(`[WARN] Failed to delete: ${relativePath}`);
    }
  }

  // 4) Save changes for next processing steps
  const actuallyChangedFiles = [...toAdd, ...toUpdate];
  const changeManifest = {
    downloaded: actuallyChangedFiles,
    deleted: toDelete,
    timestamp: new Date().toISOString()
  };
  await fs.writeFile(
    path.join(destPath, '.changes.json'),
    JSON.stringify(changeManifest, null, 2),
    'utf-8'
  );

  // 5) Summary
  console.log(`[SUMMARY] added: ${toAdd.length}, updated: ${toUpdate.length}, deleted: ${toDelete.length}`);

  if (actuallyChangedFiles.length === 0 && toDelete.length === 0) {
    console.log('[INFO] No changes detected');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}
