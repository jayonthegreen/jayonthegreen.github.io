# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (Node >= 20).

### Development
- `pnpm dev` (alias `pnpm start`) - Start the Astro dev server
- `pnpm build` - Build the static site to `/dist`
- `pnpm preview` - Serve the built site locally
- `pnpm typecheck` - Run `astro check` (TypeScript + Astro diagnostics)

### Scripts
- `pnpm send-daily-post` - Send one not-yet-sent blog post to Telegram, then update `data/sent-posts.json`
- `pnpm notify-changes` - Notify Telegram about changed content
- `pnpm fetch-iren-reports` - Download new IREN investor reports (PDFs) into `/crawl/iren-reports/`

## Architecture Overview

This is an **Astro 6** static blog deployed to GitHub Pages.

### Content Pipeline
1. **Authoring**: Write/edit markdown directly in `/content/post/` (via Claude Desktop + Obsidian MCP)
2. **Content Collections**: `src/content.config.ts` defines `post` and `resource` collections that load
   markdown directly from `/content/post/` and `/content/resource/` via Astro's `glob` loader.
   - URL slugs are derived by sanitizing filenames: spaces → hyphens, special chars removed (Korean kept)
   - Frontmatter fields: `title`, `description`, `created_at`, `modified_at`, `tags` (all optional)
3. **Obsidian links**: the remark plugin `src/remark/obsidian-links.mjs` converts `[[doc|text]]`-style links
4. **Build & Deploy**: pushing to `master` triggers GitHub Actions → `pnpm build` → GitHub Pages

> Note: `/src/pages/post/` and `/src/pages/resource/` are build artifacts (stale-prone).
> `/content/` is the source of truth.

### Key Directories
- `/content/post/` - Blog posts (listed on homepage)
- `/content/resource/` - Resource pages (not listed on homepage)
- `/src/pages/` - Astro routes: `index.astro`, `post/[...slug].astro`, `resource/[...slug].astro`, `rss.xml.ts`, `404.astro`
- `/src/layouts/` - `BaseLayout.astro`
- `/src/components/` - `Nav.astro`
- `/src/remark/` - Remark markdown plugins
- `/src/utils/` - Shared utils (e.g. `telegram.ts`)
- `/src/styles/` - Global CSS (`reset.css`, `global.css`)
- `/scripts/` - Standalone tsx scripts (daily post, change notifications, IREN reports)
- `/data/` - Runtime state (e.g. `sent-posts.json`)
- `/crawl/iren-reports/` - Archived IREN investor reports (PDFs)
- `/dist/` - Build output

## Automated Workflows (GitHub Actions)

- **`deploy.yml`** - On push to `master` (or `repository_dispatch: deploy-site`): `pnpm build` → deploy to GitHub Pages
- **`daily-post.yml`** - Daily at 08:00 KST (23:00 UTC): runs `send-daily-post`, commits the updated sent log

## Technical Stack
- **Framework**: Astro 6 (static output, `trailingSlash: always`)
- **Language**: TypeScript
- **Styling**: Global CSS
- **Content**: Markdown with frontmatter, via Astro content collections
- **Deployment**: GitHub Pages via GitHub Actions
- **Extras**: `@astrojs/sitemap` (with per-post `lastmod`), `@astrojs/rss`

## Environment Variables

Used by the Telegram scripts (`send-daily-post`, `notify-changes`, `fetch-iren-reports`):
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - Telegram chat ID
