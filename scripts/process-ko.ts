#!/usr/bin/env node

/**
 * Copy content from origin to ko folder
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// Get all markdown files recursively
async function getMarkdownFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  async function walkDir(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  await walkDir(dirPath);
  return files;
}

async function main(): Promise<void> {
  const srcDir = 'content/origin';
  const destDir = 'content/ko';

  // Check if source directory exists
  try {
    await fs.access(srcDir);
  } catch (error) {
    console.error(`Error: Source directory ${srcDir} does not exist`);
    return;
  }

  // Create destination directory
  await fs.mkdir(destDir, { recursive: true });

  // Read changes manifest to get only changed files
  const changesPath = path.join(srcDir, '.changes.json');
  let changedFiles: string[] = [];

  try {
    const changesContent = await fs.readFile(changesPath, 'utf-8');
    const changes = JSON.parse(changesContent);
    changedFiles = changes.downloaded || [];

    // Filter only markdown files
    changedFiles = changedFiles.filter(f => f.endsWith('.md'));

    console.log(`[INFO] Found ${changedFiles.length} changed markdown files`);

    if (changedFiles.length === 0) {
      console.log('[INFO] No markdown files to process');
      return;
    }
  } catch (error) {
    console.log('[INFO] No changes manifest found, processing all files');
    // If no changes file, process all files
    const allFiles = await getMarkdownFiles(srcDir);
    changedFiles = allFiles.map(f => path.relative(srcDir, f));
  }

  // Copy files
  let copiedCount = 0;

  for (const relativePath of changedFiles) {
    try {
      const srcPath = path.join(srcDir, relativePath);
      const filename = path.basename(relativePath);
      const destPath = path.join(destDir, filename);

      console.log(`[COPYING] ${filename}...`);

      // Copy file content directly
      await fs.copyFile(srcPath, destPath);

      console.log(`[DONE] ${filename}`);
      copiedCount++;

    } catch (error) {
      console.error(`[ERROR] Failed to copy ${relativePath}: ${error}`);
    }
  }

  console.log(`[SUMMARY] copied: ${copiedCount} files`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}
