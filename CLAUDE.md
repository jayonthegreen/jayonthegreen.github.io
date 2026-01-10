# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run develop` - Start Gatsby development server
- `npm run start` - Alias for develop
- `npm run build` - Build the site for production
- `npm run serve` - Serve the built site locally
- `npm run clean` - Clean Gatsby cache
- `npm run typecheck` - Run TypeScript type checking

### Content Management
- `npm run process-content` - Process content from `/content/post/` to `/src/pages/post/` with filename sanitization and link conversion

### Newsletter
- `npm run generate-economic-newsletter` - Generate economic daily newsletter with market data (S&P 500, VIX, etc.) and send to Telegram

## Architecture Overview

This is a Gatsby-based blog with automated content processing and deployment.

### Content Pipeline
1. **Content Editing**: Edit markdown files directly in `/content/post/` (via Claude Desktop + Obsidian MCP)
2. **Content Processing** (`npm run process-content`):
   - Processes all files from `/content/post/` to `/src/pages/post/`
   - Sanitizes filenames: spaces → hyphens, removes special characters (keeps Korean)
   - Removes `links:` field from YAML frontmatter
   - Converts Obsidian-style links: `[[doc|text]]` → `[text](/resource/doc)`
   - Cleans meaningless single-character lines
3. **Gatsby Build**: Processed markdown files are built into static pages
4. **Deployment**: GitHub Actions deploys to GitHub Pages on push to master

### Key Directories
- `/content/post/` - Raw markdown files for blog posts
- `/content/report/` - Raw markdown files for reports (not listed on homepage)
- `/src/pages/post/` - Processed blog posts for Gatsby
- `/src/pages/report/` - Processed reports for Gatsby
- `/src/templates/` - Gatsby page templates
- `/static/` and `/public/img/` - Static assets and images
- `/crawl/` - Crawled/archived data
  - `/crawl/iren-reports/` - IREN investor reports (PDFs)
  - `/crawl/newsletters/` - Economic newsletter archives
  - `/crawl/thermometer/` - Market thermometer archives

## Automated Workflows

### Site Deployment (GitHub Actions)
- Triggers on pushes to master branch
- Runs `process-content` then `build`
- Deploys to GitHub Pages

### Economic Newsletter (GitHub Actions)
- Runs daily at 9 AM KST (0:00 UTC)
- Fetches S&P 500, VIX, P/E Ratio data
- Generates AI-powered market insights
- Sends to Telegram and saves to `/src/pages/report/`

## Development Notes

### Content Development
- Content is edited via Claude Desktop with Obsidian MCP
- Edit files in `/content/post/`, commit & push
- GitHub Actions handles processing and deployment

### Technical Stack
- **Framework**: Gatsby 5 with TypeScript
- **Styling**: PostCSS with global CSS files
- **Content**: Markdown with frontmatter
- **Deployment**: GitHub Pages via GitHub Actions
- **Analytics**: Google Analytics (gtag)

## Site Structure

### Pages
- `/` - Homepage listing all blog posts sorted by date
- `/post/[slug]` - Individual blog post pages

### Components
- `Nav.tsx` - Site navigation component
- `markdown.tsx` - Template for blog post pages
- `useSiteMetadata.ts` - Hook for accessing site metadata

## Environment Variables

### Required for Economic Newsletter
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - Telegram chat ID
- `OPENAI_API_KEY` - (Optional) For AI-powered market insights
