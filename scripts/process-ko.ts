#!/usr/bin/env node

/**
 * Process content from origin to ko folder with spell checking
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Correct Korean spelling and grammar
async function correctKoreanSpelling(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `다음 한국어 텍스트의 맞춤법과 문법을 최소한으로 교정해주세요. 원문의 의미와 스타일을 최대한 유지하되, 명백한 맞춤법 오류만 수정해주세요. YAML frontmatter는 수정하지 마세요. 수정된 전체 텍스트만 반환해주세요.

${content}`
        }
      ]
    });

    const correctedText = completion.choices[0]?.message?.content || content;
    return correctedText;
  } catch (error) {
    console.error('[ERROR] Failed to correct spelling:', error);
    return content; // Return original content on error
  }
}

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

  // Process files
  let processedCount = 0;

  for (const relativePath of changedFiles) {
    try {
      const srcPath = path.join(srcDir, relativePath);
      const filename = path.basename(relativePath);
      const destPath = path.join(destDir, filename);

      // Read file content
      const content = await fs.readFile(srcPath, 'utf-8');

      console.log(`[PROCESSING] ${filename}...`);

      // Correct spelling
      const correctedContent = await correctKoreanSpelling(content);

      // Write corrected content to destination
      await fs.writeFile(destPath, correctedContent, 'utf-8');

      console.log(`[DONE] ${filename}`);
      processedCount++;

    } catch (error) {
      console.error(`[ERROR] Failed to process ${relativePath}: ${error}`);
    }
  }

  console.log(`[SUMMARY] processed: ${processedCount} files`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}
