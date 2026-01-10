#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import { sendTelegramMessage } from '../src/utils/telegram';

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

// Get action type (add/update) from git status
async function getFileAction(filePath: string): Promise<'add' | 'update'> {
  const { execSync } = require('child_process');

  try {
    // Check if file exists in the previous commit
    execSync(`git show HEAD:${filePath}`, { stdio: 'pipe' });
    return 'update'; // File exists in previous commit = update
  } catch (error) {
    return 'add'; // File doesn't exist in previous commit = add
  }
}

async function main() {
  const { execSync } = require('child_process');

  // Get list of committed markdown files from the last commit
  const output = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf-8' });
  const committedFiles = output
    .split('\n')
    .filter(file => file.endsWith('.md'))
    .filter(file => file.startsWith('content/post/'));

  if (committedFiles.length === 0) {
    console.log('[INFO] No markdown files to notify');
    return;
  }

  console.log(`[INFO] Found ${committedFiles.length} committed files to notify`);

  // Send notification for each file
  for (const filePath of committedFiles) {
    const title = await extractTitleFromMarkdown(filePath);
    if (!title) {
      continue;
    }

    const action = await getFileAction(filePath);
    const emoji = action === 'add' ? '📝' : '✏️';
    const actionText = action === 'add' ? 'New post' : 'Updated';
    const message = `${emoji} ${actionText}: ${title}`;

    try {
      await sendTelegramMessage({ text: message });
      console.log(`[SENT] ${message}`);
    } catch (error) {
      console.warn(`[WARN] Failed to send notification for ${filePath}:`, error);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}
