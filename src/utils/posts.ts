import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'post'>;

export function postDate(p: Post): Date | undefined {
  return p.data.created_at || p.data.date;
}

export function postTags(p: Post): string[] {
  const tags = p.data.tags;
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** 모든 포스트를 최신순으로 반환 */
export async function sortedPosts(): Promise<Post[]> {
  return (await getCollection('post')).sort((a, b) => {
    const da = postDate(a)?.getTime() ?? 0;
    const db = postDate(b)?.getTime() ?? 0;
    return db - da;
  });
}

export function fmtYearMonth(d?: Date): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}.${m}`;
}

/** 아카이브 URL 파라미터용 (예: "2026-05") */
export function archiveKey(d?: Date): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
