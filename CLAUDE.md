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
- `npm run sync-gdrive` - Sync content from Google Drive to `/content/` directory
- `npm run process-content` - Process content from `/content/` to `/src/pages/post/` with filename sanitization and link conversion

## Architecture Overview

This is a Gatsby-based blog with a two-stage automated content management system:

### Content Pipeline
1. **Google Drive Sync**: Content is authored in Google Drive and automatically synced to the `/content/` directory via GitHub Actions
2. **Content Processing**: Raw markdown files are processed and copied to `/src/pages/post/` with sanitized filenames and converted Obsidian-style links
3. **Gatsby Build**: Processed markdown files are built into static pages using Gatsby's markdown transformer

### Key Directories
- `/content/` - Raw markdown files synced from Google Drive (Korean filenames)
- `/src/pages/post/` - Processed markdown files with sanitized filenames for Gatsby
- `/src/templates/` - Gatsby page templates
- `/static/` and `/public/img/` - Static assets and images

### Content Processing Details
- Filename sanitization: Spaces converted to hyphens, special characters removed
- Frontmatter processing: `links` fields are removed from YAML frontmatter
- Obsidian link conversion: `[[document|display]]` → `[display](/resource/document)` and `[[document]]` → `[document](/resource/document)`
- Content cleaning: Removes meaningless single character lines

## Automated Workflows

### Content Sync (GitHub Actions)
- Runs daily at 3 AM KST (6 PM UTC previous day)
- Can be manually triggered via workflow_dispatch
- Uses Google Drive API with service account authentication
- TypeScript scripts handle folder download, file processing and hash comparison
- Compares file hashes to only sync changed content
- Automatically commits and pushes changes

### Site Deployment
- Triggers on pushes to master branch
- Builds site with `npm run build`
- Deploys to GitHub Pages using gh-pages branch

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
- **Authentication**: Google service account for API access (no Python dependencies)

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
- `DEST_DIR` - Destination directory for synced content (default: "content")

### Local Development Setup
1. Copy `.env.example` to `.env`
2. Fill in the required environment variables
3. Never commit the `.env` file to the repository

### Setting up Google Drive API
1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a service account and download the JSON key
4. Share your Google Drive folder with the service account email
5. For local development: Add credentials to your `.env` file
6. For GitHub Actions: Add the JSON key as `GOOGLE_SERVICE_ACCOUNT_KEY` secret in GitHub

### Environment Configuration
The project uses a centralized environment configuration module at `src/config/env.ts` that:
- Loads environment variables from `.env` file
- Validates required environment variables
- Provides type-safe access to configuration values
- Throws clear error messages for missing required variables