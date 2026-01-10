import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { sendTelegramMessage } from '../src/utils/telegram';

dotenv.config();

// GitHub repository info for constructing URLs
const GITHUB_REPO = 'jayonthegreen/jayonthegreen.github.io';
const GITHUB_BRANCH = 'master';
const REPORTS_DIR_NAME = 'crawl/iren-reports';

// Maximum number of reports to download per execution
const MAX_DOWNLOADS_PER_RUN = 1;

interface ReportInfo {
  title: string;
  date: string;
  pdfUrl: string;
  filename: string;
  githubUrl?: string;
}

// Sanitize filename - remove special characters, replace spaces with hyphens
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Download PDF file using curl (more reliable for redirects)
async function downloadPdf(url: string, filepath: string): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    await execAsync(`curl -L -s -o "${filepath}" "${url}"`, { timeout: 60000 });
  } catch (error) {
    throw new Error(`Failed to download: ${error}`);
  }
}

// Generate GitHub URL for a file
function getGithubUrl(filename: string): string {
  return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${REPORTS_DIR_NAME}/${encodeURIComponent(filename)}`;
}

// Send Telegram notification for new reports with GitHub URLs
async function sendNewReportNotification(reports: ReportInfo[]): Promise<void> {
  if (reports.length === 0) {
    return;
  }

  const message = `📄 <b>New IREN Reports Available</b>

${reports.map((r, i) => `${i + 1}. <b>${r.title}</b>
   📅 ${r.date}
   🔗 <a href="${r.githubUrl}">View on GitHub</a>`).join('\n\n')}`;

  await sendTelegramMessage({
    text: message,
    parseMode: 'HTML'
  });
}

// Generate markdown file with all reports
function generateReportsMarkdown(reports: ReportInfo[], reportsDir: string): void {
  const today = new Date().toISOString().split('T')[0];

  let markdown = `# IREN Investor Reports

Last updated: ${today}

## Reports List

| Title | Date | PDF |
|-------|------|-----|
`;

  for (const report of reports) {
    const pdfExists = fs.existsSync(path.join(reportsDir, report.filename));
    const pdfLink = pdfExists
      ? `[📥 ${report.filename}](${report.filename})`
      : `[🔗 External Link](${report.pdfUrl})`;

    markdown += `| ${report.title} | ${report.date} | ${pdfLink} |\n`;
  }

  markdown += `
---

Total: ${reports.length} reports
`;

  const markdownPath = path.join(reportsDir, 'README.md');
  fs.writeFileSync(markdownPath, markdown);
  console.log(`📝 Updated reports markdown: ${markdownPath}`);
}

// Fetch reports using Playwright
async function fetchReportsWithPlaywright(): Promise<ReportInfo[]> {
  const { chromium } = await import('playwright');

  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('📄 Navigating to IREN reports page...');
    await page.goto('https://iren.com/investors/reports', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait for content to load
    await page.waitForTimeout(3000);

    console.log('🔍 Extracting report links...');

    // Extract reports - find card containers with title and PDF link
    const reports = await page.evaluate(() => {
      const results: { title: string; pdfUrl: string; date: string }[] = [];
      const seenUrls = new Set<string>();

      // Find all PDF download links
      const pdfLinks = document.querySelectorAll('a[href*="iren.gcs-web.com/static-files"]');

      pdfLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || seenUrls.has(href)) return;

        seenUrls.add(href);

        // Find the parent card/container element
        let container = link.closest('div[class*="card"], div[class*="report"], div[class*="item"], article, section > div, li');
        if (!container) {
          // Try to find any reasonable parent
          container = link.parentElement?.parentElement?.parentElement || link.parentElement;
        }

        let title = '';
        let date = '';

        if (container) {
          // Look for title in headings or prominent text elements
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
          for (const heading of headings) {
            const text = heading.textContent?.trim();
            if (text && text.length > 5 && !text.toLowerCase().includes('pdf version') && !text.toLowerCase().includes('download')) {
              title = text;
              break;
            }
          }

          // If no heading found, look for the first significant text that's not "PDF Version"
          if (!title) {
            const allText = container.querySelectorAll('p, span, div');
            for (const el of allText) {
              const text = el.textContent?.trim();
              if (text && text.length > 10 && text.length < 150 &&
                  !text.toLowerCase().includes('pdf version') &&
                  !text.toLowerCase().includes('download') &&
                  !text.match(/^\d{4}-\d{2}-\d{2}$/)) {
                title = text;
                break;
              }
            }
          }

          // Look for date - be more specific to avoid matching partial words
          const dateText = container.textContent || '';
          const dateMatch = dateText.match(/(?:^|\s)((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})|(\d{4}-\d{2}-\d{2})/i);
          if (dateMatch) {
            date = (dateMatch[1] || dateMatch[2] || dateMatch[3]).trim();
          }
        }

        // Fallback: use URL hash as identifier if no title found
        if (!title) {
          const urlParts = href.split('/');
          const uuid = urlParts[urlParts.length - 1];
          title = `IREN Report ${uuid.substring(0, 8)}`;
        }

        // Default date if not found
        if (!date) {
          date = new Date().toISOString().split('T')[0];
        }

        results.push({
          title: title.replace(/\s+/g, ' ').trim(),
          pdfUrl: href,
          date
        });
      });

      return results;
    });

    console.log(`📋 Found ${reports.length} reports on page`);

    // Log found reports for debugging
    reports.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title} (${r.date})`);
    });

    // Generate filenames and GitHub URLs
    return reports.map(r => {
      const filename = `${sanitizeFilename(r.title)}.pdf`;
      return {
        ...r,
        filename,
        githubUrl: getGithubUrl(filename)
      };
    });

  } finally {
    await browser.close();
  }
}

// Get list of existing PDF files
function getExistingPdfs(reportsDir: string): Set<string> {
  const existing = new Set<string>();

  if (!fs.existsSync(reportsDir)) {
    return existing;
  }

  const files = fs.readdirSync(reportsDir);
  files.forEach(file => {
    if (file.endsWith('.pdf')) {
      existing.add(file);
    }
  });

  return existing;
}

// Save new reports info for later notification (used by GitHub Action)
function saveNewReportsInfo(reports: ReportInfo[], reportsDir: string): void {
  const infoPath = path.join(reportsDir, '.new-reports.json');
  fs.writeFileSync(infoPath, JSON.stringify(reports, null, 2));
  console.log(`📝 Saved new reports info to ${infoPath}`);
}

// Load new reports info (used for sending notification after commit)
function loadNewReportsInfo(reportsDir: string): ReportInfo[] {
  const infoPath = path.join(reportsDir, '.new-reports.json');
  if (fs.existsSync(infoPath)) {
    const content = fs.readFileSync(infoPath, 'utf-8');
    return JSON.parse(content);
  }
  return [];
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const notifyOnly = args.includes('--notify-only');

  const reportsDir = path.join(process.cwd(), 'crawl/iren-reports');

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // If notify-only mode, just send notification for previously downloaded reports
  if (notifyOnly) {
    console.log('📱 Sending notification for new reports...');
    const newReports = loadNewReportsInfo(reportsDir);
    if (newReports.length > 0) {
      await sendNewReportNotification(newReports);
      // Clean up the info file
      const infoPath = path.join(reportsDir, '.new-reports.json');
      if (fs.existsSync(infoPath)) {
        fs.unlinkSync(infoPath);
      }
    } else {
      console.log('✅ No new reports to notify about.');
    }
    return;
  }

  console.log('🔍 Fetching IREN reports...');

  try {
    // Fetch reports using Playwright
    const reports = await fetchReportsWithPlaywright();

    if (reports.length === 0) {
      console.log('⚠️  No reports found on the page');
      return;
    }

    // Get already downloaded PDFs
    const existingPdfs = getExistingPdfs(reportsDir);
    console.log(`📂 Already downloaded: ${existingPdfs.size} PDFs`);

    // Filter to only new reports (PDFs that don't exist yet)
    const allNewReports = reports.filter(r => !existingPdfs.has(r.filename));
    console.log(`🆕 Total new reports available: ${allNewReports.length}`);

    // Limit to MAX_DOWNLOADS_PER_RUN
    const newReports = allNewReports.slice(0, MAX_DOWNLOADS_PER_RUN);
    console.log(`📥 Will download: ${newReports.length} (max ${MAX_DOWNLOADS_PER_RUN} per run)`);

    // Download new reports
    const downloadedReports: ReportInfo[] = [];

    for (const report of newReports) {
      const filepath = path.join(reportsDir, report.filename);

      console.log(`⬇️  Downloading: ${report.title}`);
      console.log(`   URL: ${report.pdfUrl}`);
      console.log(`   File: ${report.filename}`);

      try {
        await downloadPdf(report.pdfUrl, filepath);

        // Verify file was downloaded
        if (fs.existsSync(filepath)) {
          const stats = fs.statSync(filepath);
          console.log(`   ✅ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
          downloadedReports.push(report);
        } else {
          console.log(`   ❌ File not created`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to download: ${error}`);
      }
    }

    // Generate/update markdown file with all reports
    generateReportsMarkdown(reports, reportsDir);

    console.log(`\n📊 Summary: Downloaded ${downloadedReports.length} new reports`);

    // Save info about new reports for notification after commit
    if (downloadedReports.length > 0) {
      saveNewReportsInfo(downloadedReports, reportsDir);
      console.log('💾 New reports info saved. Will notify after commit.');
    } else {
      console.log('✅ No new reports. All up to date!');
    }

    console.log('🎉 IREN report fetch completed!');

  } catch (error) {
    console.error('❌ Error fetching IREN reports:', error);
    process.exit(1);
  }
}

main();
