// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { obsidianLinks } from './src/remark/obsidian-links.mjs';

// process-content.ts 와 동일한 sanitize 규칙
function sanitizeFilename(name) {
  return name.replace(/\s+/g, '-').replace(/[^\w\-가-힣]/g, '');
}

// frontmatter 에서 modified_at / created_at 추출
function readDates(dir) {
  const map = new Map();
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return map;
  }
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(join(dir, file), 'utf-8');
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) continue;
    const fm = Object.fromEntries(
      m[1]
        .split('\n')
        .map((l) => l.match(/^([\w-]+)\s*:\s*(.*)$/))
        .filter(Boolean)
        .map((mm) => [mm[1], mm[2].trim().replace(/^["']|["']$/g, '')])
    );
    const slug = sanitizeFilename(file.replace(/\.md$/, ''));
    map.set(slug, fm.modified_at || fm.created_at || '');
  }
  return map;
}

const postDates = readDates('./content/post');

export default defineConfig({
  site: 'https://jayonthegreen.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    remarkPlugins: [obsidianLinks],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/report/'),
      serialize: (item) => {
        const path = new URL(item.url).pathname;
        const m = path.match(/^\/post\/([^/]+)\/?$/);
        let lastmod;
        if (m) {
          lastmod = postDates.get(decodeURIComponent(m[1]));
        }
        return {
          url: item.url,
          changefreq: 'weekly',
          priority: path === '/' ? 1.0 : 0.7,
          ...(lastmod ? { lastmod } : {}),
        };
      },
    }),
  ],
});
