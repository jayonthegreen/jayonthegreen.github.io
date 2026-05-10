import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('post')).sort((a, b) => {
    const da = (a.data.created_at || a.data.date)?.getTime() ?? 0;
    const db = (b.data.created_at || b.data.date)?.getTime() ?? 0;
    return db - da;
  });

  const items = posts.map((p) => {
    const date = p.data.created_at || p.data.date;
    return {
      title: p.data.title || p.id,
      description: p.data.description || '',
      link: `/post/${p.id}/`,
      pubDate: date,
      content: p.body || '',
    };
  });

  return rss({
    title: "Jay's Blog RSS Feed",
    description: 'things about thinking',
    site: context.site!,
    items,
  });
}
