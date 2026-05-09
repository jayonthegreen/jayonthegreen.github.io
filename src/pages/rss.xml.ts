import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('post')).sort((a, b) => {
    const da = a.data.created_at || a.data.date || '';
    const db = b.data.created_at || b.data.date || '';
    return db.localeCompare(da);
  });

  const items = await Promise.all(
    posts.map(async (p) => {
      const date = p.data.created_at || p.data.date || '';
      return {
        title: p.data.title,
        description: p.data.description || '',
        link: `/post/${p.id}/`,
        pubDate: date ? new Date(date) : undefined,
        content: p.body || '',
      };
    })
  );

  return rss({
    title: "Jay's Blog RSS Feed",
    description: 'things about thinking',
    site: context.site!,
    items,
  });
}
