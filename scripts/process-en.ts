#!/usr/bin/env node

/**
 * Translate content from ko to en folder
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Translate Korean to English
async function translateToEnglish(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Translate the following Korean markdown content to English. Preserve the YAML frontmatter structure exactly, but translate the title and description fields. Translate the body content naturally while maintaining the markdown formatting, links, and structure. Return only the translated content.

${content}`
        }
      ]
    });

    const translatedText = completion.choices[0]?.message?.content || content;
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

  // Process files
  let processedCount = 0;

  try {
    const markdownFiles = await getMarkdownFiles(srcDir);

    for (const srcPath of markdownFiles) {
      try {
        // Get filename
        const filename = path.basename(srcPath);
        const destPath = path.join(destDir, filename);

        // Read file content
        const content = await fs.readFile(srcPath, 'utf-8');

        console.log(`[TRANSLATING] ${filename}...`);

        // Translate to English
        const translatedContent = await translateToEnglish(content);

        // Write translated content to destination
        await fs.writeFile(destPath, translatedContent, 'utf-8');

        console.log(`[DONE] ${filename}`);
        processedCount++;

      } catch (error) {
        console.error(`[ERROR] Failed to process ${srcPath}: ${error}`);
      }
    }
  } catch (error) {
    console.error(`[ERROR] Failed to read source directory: ${error}`);
    return;
  }

  console.log(`[SUMMARY] translated: ${processedCount} files`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}
