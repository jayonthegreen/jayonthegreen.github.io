#!/usr/bin/env node

/**
 * Translate content from ko to en folder
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import OpenAI from 'openai';
import { env } from '../env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Translate Korean to English
async function translateToEnglish(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Translate the following Korean markdown content to English. Preserve the YAML frontmatter structure exactly, but translate the title and description fields. Translate the body content naturally while maintaining the markdown formatting, links, and structure.

IMPORTANT: Do NOT wrap the output in code blocks (no \`\`\`yaml, \`\`\`markdown, or any other code fence). Return the raw markdown content directly.

${content}`
        }
      ]
    });

    let translatedText = completion.choices[0]?.message?.content || content;

    // Remove code block wrappers if GPT adds them
    translatedText = translatedText.replace(/^```(?:yaml|markdown|md)?\s*\n/i, '');
    translatedText = translatedText.replace(/\n```\s*$/i, '');

    return translatedText;
  } catch (error) {
    console.error('[ERROR] Failed to translate:', error);
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
  const originDir = 'content/origin';
  const srcDir = 'content/ko';
  const destDir = 'content/en';

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
  const changesPath = path.join(originDir, '.changes.json');
  let changedFiles: string[] = [];

  try {
    const changesContent = await fs.readFile(changesPath, 'utf-8');
    const changes = JSON.parse(changesContent);
    changedFiles = changes.downloaded || [];

    // Filter only markdown files
    changedFiles = changedFiles.filter(f => f.endsWith('.md'));

    console.log(`[INFO] Found ${changedFiles.length} changed markdown files`);

    if (changedFiles.length === 0) {
      console.log('[INFO] No markdown files to translate');
      return;
    }
  } catch (error) {
    console.log('[INFO] No changes manifest found, translating all files');
    // If no changes file, process all files
    const allFiles = await getMarkdownFiles(srcDir);
    changedFiles = allFiles.map(f => path.relative(srcDir, f));
  }

  // Process files
  let processedCount = 0;
  const totalFiles = changedFiles.length;

  for (let i = 0; i < changedFiles.length; i++) {
    const relativePath = changedFiles[i];

    try {
      const filename = path.basename(relativePath);
      const srcPath = path.join(srcDir, filename);
      const destPath = path.join(destDir, filename);

      // Read file content from ko directory
      const content = await fs.readFile(srcPath, 'utf-8');

      console.log(`[${i + 1}/${totalFiles}] [TRANSLATING] ${filename}...`);

      // Translate to English
      const translatedContent = await translateToEnglish(content);

      // Write translated content to destination
      await fs.writeFile(destPath, translatedContent, 'utf-8');

      console.log(`[${i + 1}/${totalFiles}] [DONE] ${filename}`);
      processedCount++;

      // Add delay between API calls to avoid rate limiting (2 seconds)
      if (i < changedFiles.length - 1) {
        console.log('[WAITING] 2 seconds before next translation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`[ERROR] Failed to process ${relativePath}: ${error}`);
    }
  }

  console.log(`[SUMMARY] translated: ${processedCount} files`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}
