import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// process-content.ts 와 동일한 sanitize 규칙 — URL 슬러그 호환성 유지
function sanitize(name: string): string {
  return name.replace(/\s+/g, '-').replace(/[^\w\-가-힣]/g, '');
}

const frontmatter = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    created_at: z.coerce.string().optional(),
    modified_at: z.coerce.string().optional(),
    date: z.coerce.string().optional(),
    tags: z.any().optional(),
  })
  .passthrough();

const post = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/post',
    generateId: ({ entry }) => sanitize(entry.replace(/\.md$/, '')),
  }),
  schema: frontmatter,
});

const report = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/report',
    generateId: ({ entry }) => sanitize(entry.replace(/\.md$/, '')),
  }),
  schema: frontmatter,
});

const resource = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/resource',
    generateId: ({ entry }) => sanitize(entry.replace(/\.md$/, '')),
  }),
  schema: frontmatter,
});

export const collections = { post, report, resource };
