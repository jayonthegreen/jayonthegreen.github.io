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
- `npm run sync-gdrive` - Sync content from Google Drive to `/content/origin/` directory (sends Telegram notifications for changes)
- `npm run process-ko` - Copy Korean content from `/content/origin/` to `/content/ko/`
- `npm run process-en` - Translate Korean content to English from `/content/ko/` to `/content/en/` (only changed files)
- `npm run process-content` - Process content from `/content/origin/` to `/src/pages/post/` with filename sanitization and link conversion

### Newsletter
- `npm run generate-sp500` - Generate S&P 500 daily newsletter with market data (YoY, WoW, DoD, 90-day MA) and send to Telegram

## Architecture Overview

This is a Gatsby-based blog with a multi-stage automated content management system:

### Content Pipeline
1. **Google Drive Sync** (`npm run sync-gdrive`):
   - Content is authored in Google Drive and automatically synced to `/content/origin/`
   - Only downloads changed files (based on modified time comparison)
   - Saves list of changed files to `.changes.json` for next processing steps
   - Handles file deletions automatically

2. **Copy to Korean folder** (`npm run process-ko`):
   - Reads changed files from `.changes.json` (or processes all if not found)
   - Copies content from `/content/origin/` to `/content/ko/`
   - No spell checking or modification (done manually during writing)
   - Output: `/content/ko/*.md` (Korean content)

3. **English Translation** (`npm run process-en`):
   - Reads changed files from `.changes.json` (or processes all if not found)
   - Uses OpenAI GPT-4o to translate Korean content to English
   - Only translates changed/new files to save API resources
   - Translates frontmatter (title, description) and body content
   - Maintains markdown formatting and structure
   - Output: `/content/en/*.md` (English translated content)

4. **Gatsby Content Processing** (`npm run process-content`):
   - Processes all files from `/content/origin/` to `/src/pages/post/`
   - Sanitizes filenames: spaces → hyphens, removes special characters (keeps Korean)
   - Removes `links:` field from YAML frontmatter
   - Converts Obsidian-style links: `[[doc|text]]` → `[text](/resource/doc)`
   - Cleans meaningless single-character lines
   - Clears destination directory before processing

5. **Gatsby Build**: Processed markdown files are built into static pages using Gatsby's markdown transformer

### Key Directories
- `/content/origin/` - Raw markdown files synced from Google Drive (with Korean filenames)
- `/content/ko/` - Spell-checked Korean content
- `/content/en/` - English translated content
- `/src/pages/post/` - Final processed markdown files with sanitized filenames for Gatsby
- `/src/templates/` - Gatsby page templates
- `/static/` and `/public/img/` - Static assets and images
- `/newsletters/` - Generated S&P 500 daily newsletters in markdown format

## Automated Workflows

### Content Sync (GitHub Actions)
- Runs every 10 minutes between 7 AM - 11 PM KST (22:00-14:00 UTC)
- Can be manually triggered via workflow_dispatch
- Uses Google Drive API with service account authentication
- TypeScript scripts handle folder download, file processing and hash comparison
- Compares file hashes to only sync changed content
- Processes content pipeline in sequence:
  1. Sync from Google Drive to `/content/origin/`
  2. Spell check Korean content to `/content/ko/`
  3. Translate to English in `/content/en/`
  4. Process to Gatsby pages in `/src/pages/post/`
- Automatically commits and pushes changes
- Triggers deployment workflow after successful commit

### Site Deployment
- Triggers on pushes to master branch
- Builds site with `npm run build`
- Deploys to GitHub Pages using gh-pages branch

### S&P 500 Newsletter (GitHub Actions)
- Runs daily at 9 AM KST (0:00 UTC)
- Can be manually triggered via workflow_dispatch
- Fetches S&P 500 data from Yahoo Finance API
- Calculates performance metrics:
  - Day over Day (DoD) - 1 day comparison
  - Week over Week (WoW) - 7 day comparison
  - Year over Year (YoY) - 365 day comparison
  - 90-day moving average and comparison
- Generates markdown newsletter in `/newsletters/` directory
- Sends formatted message to Telegram
- Automatically commits and pushes newsletter to repository

## Development Notes

### Content Development
- Content is managed externally in Google Drive
- Local content changes will be overwritten by sync process
- Focus development on React components, styling, and Gatsby configuration

### Technical Stack
- **Framework**: Gatsby 5 with TypeScript
- **Styling**: PostCSS with global CSS files
- **Content**: Markdown with frontmatter, processed via gatsby-transformer-remark
- **Content Scripts**: TypeScript with Node.js for content processing
- **Deployment**: GitHub Pages via GitHub Actions
- **Analytics**: Google Analytics (gtag)

### Dependencies
- **Node.js**: TypeScript execution via `tsx` for content processing scripts
- **Google APIs**: `googleapis` npm package for Google Drive API access
- **OpenAI API**: `openai` npm package for spell checking and translation
- **Authentication**:
  - Google service account for Drive API access
  - OpenAI API key for GPT-4o access

## Site Structure

### Pages
- `/` - Homepage listing all blog posts sorted by date
- `/post/[slug]` - Individual blog post pages generated from markdown files

### Components
- `Nav.tsx` - Site navigation component
- `markdown.tsx` - Template for blog post pages
- `useSiteMetadata.ts` - Hook for accessing site metadata

### GraphQL Queries
- Homepage queries all markdown files with frontmatter (title, date, description)
- Post pages query individual markdown files with HTML content and metadata
- Filtering applied to only include files from `/pages/post/` directory

## Environment Variables

### Required for Content Sync
- `GDRIVE_FOLDER_ID` - The ID of the Google Drive folder to sync
- `GOOGLE_SERVICE_ACCOUNT_KEY` - JSON string of Google service account credentials
- `OPENAI_API_KEY` - OpenAI API key for content translation (ko → en)
- `DEST_DIR` - Destination directory for synced content (default: "content/origin")

### Required for S&P 500 Newsletter
- `TELEGRAM_BOT_TOKEN` - Telegram bot token for sending newsletter messages
- `TELEGRAM_CHAT_ID` - Telegram chat ID where messages will be sent

### Local Development Setup
1. Copy `.env.example` to `.env`
2. Fill in the required environment variables
3. Never commit the `.env` file to the repository

### Setting up APIs

#### Google Drive API
1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a service account and download the JSON key
4. Share your Google Drive folder with the service account email
5. For local development: Add credentials to your `.env` file
6. For GitHub Actions: Add the JSON key as `GOOGLE_SERVICE_ACCOUNT_KEY` secret in GitHub

#### OpenAI API
1. Create an OpenAI account and obtain an API key
2. For local development: Add `OPENAI_API_KEY` to your `.env` file
3. For GitHub Actions: Add the API key as `OPENAI_API_KEY` secret in GitHub

#### Telegram Bot
1. Create a Telegram bot using @BotFather
2. Get the bot token from @BotFather
3. Start a chat with your bot and send a message
4. Get your chat ID by visiting `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. For local development: Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to your `.env` file
6. For GitHub Actions: Add both values as secrets in GitHub repository settings

### Environment Configuration
The project uses a centralized environment configuration module at `src/config/env.ts` that:
- Loads environment variables from `.env` file
- Validates required environment variables
- Provides type-safe access to configuration values
- Throws clear error messages for missing required variables