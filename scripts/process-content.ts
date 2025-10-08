#!/usr/bin/env node

/**
 * Process content folder files to src/pages/post
 * Converts files from Google Drive sync to Gatsby-compatible format
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// Sanitize filename: replace spaces with hyphens, remove special characters
function sanitizeFilename(title: string): string {
  return title
    .replace(/\s+/g, '-')
    .replace(/[^\w\-가-힣]/g, ''); // Keep Korean characters
}

// Convert Obsidian links to hyperlinks
function convertObsidianLinksToHyperlinks(content: string): string {
  // [[document|display]] → [display](/resource/document)
  content = content.replace(/\[\[([^\[\]|]+)\|([^\[\]]+)\]\]/g, '[$2](/resource/$1)');
  // [[document]] → [document](/resource/document)
  content = content.replace(/\[\[([^\[\]|]+)\]\]/g, '[$1](/resource/$1)');
  return content;
}

// Clean content: remove meaningless single characters and fix formatting
function cleanContent(content: string): string {
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip first line if it's a meaningless single character (not frontmatter)
    if (i === 0 && line.trim() && line.trim() !== '---' && line.trim().length <= 2) {
      continue;
    }
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n');
}

// Process markdown file content
function processMarkdownFile(content: string): string {
  // First clean the content
  content = cleanContent(content);
  const lines = content.split('\n');
  
  // Handle frontmatter
  if (lines.length > 0 && lines[0] === '---') {
    let frontmatterEnd = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        frontmatterEnd = i;
        break;
      }
    }
    
    if (frontmatterEnd > 0) {
      // Remove links field from frontmatter
      const frontmatterLines: string[] = [];
      let skipLinks = false;
      
      for (let i = 1; i < frontmatterEnd; i++) {
        const line = lines[i];
        
        if (line.startsWith('links:')) {
          skipLinks = true;
          continue;
        } else if (skipLinks && (line.startsWith('  ') || line.startsWith('\t') || line.startsWith('- '))) {
          // Skip sub-items of links field (including list items)
          continue;
        } else if (skipLinks && !line.startsWith('  ') && !line.startsWith('\t') && !line.startsWith('- ') && line.trim() !== '') {
          skipLinks = false;
        }
        
        if (!skipLinks) {
          frontmatterLines.push(line);
        }
      }
      
      // Get body content
      const bodyLines = lines.slice(frontmatterEnd + 1);
      const bodyContent = bodyLines.join('\n');
      
      // Convert Obsidian links
      const processedBodyContent = convertObsidianLinksToHyperlinks(bodyContent);
      
      // Combine final content
      return '---\n' + frontmatterLines.join('\n') + '\n---\n' + processedBodyContent;
    }
  }
  
  // If no frontmatter, just convert Obsidian links
  return convertObsidianLinksToHyperlinks(content);
}

// Clear destination directory
async function clearDestinationDirectory(destPath: string): Promise<void> {
  try {
    const entries = await fs.readdir(destPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(destPath, entry.name);
      
      if (entry.isFile()) {
        await fs.unlink(fullPath);
        console.log(`[CLEAR] ${entry.name}`);
      } else if (entry.isDirectory()) {
        await fs.rm(fullPath, { recursive: true });
        console.log(`[CLEAR] ${entry.name}/`);
      }
    }
  } catch (error) {
    // Directory might not exist, which is fine
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
  const destDir = 'src/pages/post';
  
  // Check if source directory exists
  try {
    await fs.access(srcDir);
  } catch (error) {
    console.error(`Error: Source directory ${srcDir} does not exist`);
    return;
  }
  
  // Create destination directory
  await fs.mkdir(destDir, { recursive: true });
  
  // Clear destination directory
  console.log(`[INFO] Clearing destination directory: ${destDir}`);
  await clearDestinationDirectory(destDir);
  
  // Process files
  let processedCount = 0;
  
  try {
    const markdownFiles = await getMarkdownFiles(srcDir);
    
    for (const srcPath of markdownFiles) {
      try {
        // Get original filename without extension
        const originalName = path.basename(srcPath, '.md');
        
        // Sanitize filename
        const sanitizedName = sanitizeFilename(originalName);
        const destFilename = `${sanitizedName}.md`;
        const destPath = path.join(destDir, destFilename);
        
        // Read file content
        const content = await fs.readFile(srcPath, 'utf-8');
        
        // Process markdown file
        const processedContent = processMarkdownFile(content);
        
        // Write processed content to destination
        await fs.writeFile(destPath, processedContent, 'utf-8');
        
        console.log(`[PROCESS] ${path.basename(srcPath)} -> ${destFilename}`);
        processedCount++;
        
      } catch (error) {
        console.error(`[ERROR] Failed to process ${srcPath}: ${error}`);
      }
    }
  } catch (error) {
    console.error(`[ERROR] Failed to read source directory: ${error}`);
    return;
  }
  
  console.log(`[SUMMARY] processed: ${processedCount} files`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}