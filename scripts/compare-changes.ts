#!/usr/bin/env node

/**
 * Compare content/origin and content/ko files
 * Shows what spelling/grammar corrections were made
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface FileComparison {
  filename: string;
  changes: Array<{
    type: 'changed' | 'unchanged';
    lineNumber: number;
    original: string;
    corrected: string;
  }>;
  totalLines: number;
  changedLines: number;
}

async function compareFiles(originPath: string, koPath: string): Promise<FileComparison> {
  const originContent = await fs.readFile(originPath, 'utf-8');
  const koContent = await fs.readFile(koPath, 'utf-8');

  const originLines = originContent.split('\n');
  const koLines = koContent.split('\n');

  const changes: FileComparison['changes'] = [];
  let changedLines = 0;

  const maxLines = Math.max(originLines.length, koLines.length);

  for (let i = 0; i < maxLines; i++) {
    const origLine = originLines[i] || '';
    const koLine = koLines[i] || '';

    if (origLine !== koLine) {
      changes.push({
        type: 'changed',
        lineNumber: i + 1,
        original: origLine,
        corrected: koLine
      });
      changedLines++;
    }
  }

  return {
    filename: path.basename(originPath),
    changes,
    totalLines: maxLines,
    changedLines
  };
}

async function generateMarkdownReport(comparisons: FileComparison[]): Promise<string> {
  const lines: string[] = [];

  lines.push('# Content Processing Report: Origin → Korean Spell Check\n');
  lines.push(`Generated: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n`);

  // Summary
  lines.push('## Summary\n');
  const totalFiles = comparisons.length;
  const filesWithChanges = comparisons.filter(c => c.changedLines > 0).length;
  const totalChangedLines = comparisons.reduce((sum, c) => sum + c.changedLines, 0);

  lines.push(`- **Total files processed**: ${totalFiles}`);
  lines.push(`- **Files with changes**: ${filesWithChanges}`);
  lines.push(`- **Total lines changed**: ${totalChangedLines}\n`);

  // Files without changes
  const unchangedFiles = comparisons.filter(c => c.changedLines === 0);
  if (unchangedFiles.length > 0) {
    lines.push('## Files Without Changes\n');
    unchangedFiles.forEach(file => {
      lines.push(`- ${file.filename}`);
    });
    lines.push('');
  }

  // Detailed changes
  const changedFiles = comparisons.filter(c => c.changedLines > 0);
  if (changedFiles.length > 0) {
    lines.push('## Detailed Changes\n');

    changedFiles.forEach(file => {
      lines.push(`### ${file.filename}\n`);
      lines.push(`**Changed lines**: ${file.changedLines} / ${file.totalLines}\n`);

      // Show first 10 changes
      const changesToShow = file.changes.slice(0, 10);

      changesToShow.forEach(change => {
        lines.push(`**Line ${change.lineNumber}:**`);
        lines.push('```diff');
        lines.push(`- ${change.original}`);
        lines.push(`+ ${change.corrected}`);
        lines.push('```\n');
      });

      if (file.changes.length > 10) {
        lines.push(`*... and ${file.changes.length - 10} more changes*\n`);
      }

      lines.push('---\n');
    });
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  const originDir = 'content/origin';
  const koDir = 'content/ko';
  const reportPath = 'content/CHANGES_REPORT.md';

  console.log('[INFO] Comparing origin and ko directories...');

  // Get all markdown files from origin
  const originFiles = await fs.readdir(originDir);
  const markdownFiles = originFiles.filter(f => f.endsWith('.md') && f !== '.changes.json');

  const comparisons: FileComparison[] = [];

  for (const filename of markdownFiles) {
    const originPath = path.join(originDir, filename);
    const koPath = path.join(koDir, filename);

    try {
      await fs.access(koPath);
      const comparison = await compareFiles(originPath, koPath);
      comparisons.push(comparison);
      console.log(`[COMPARE] ${filename}: ${comparison.changedLines} lines changed`);
    } catch (error) {
      console.log(`[SKIP] ${filename}: no corresponding ko file`);
    }
  }

  // Generate markdown report
  const report = await generateMarkdownReport(comparisons);
  await fs.writeFile(reportPath, report, 'utf-8');

  console.log(`\n[DONE] Report saved to ${reportPath}`);
  console.log(`[SUMMARY] Compared ${comparisons.length} files`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[ERROR]', error);
    process.exit(1);
  });
}
