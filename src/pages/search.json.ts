import { getCollection } from 'astro:content';

// 마크다운 문법을 걷어내고 검색용 플레인 텍스트만 남긴다
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ') // 코드 블록
    .replace(/`[^`]*`/g, ' ') // 인라인 코드
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 이미지
    .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, doc, __, text) => text || doc) // 옵시디언 링크
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 일반 링크
    .replace(/<[^>]+>/g, ' ') // HTML 태그
    .replace(/^#{1,6}\s+/gm, '') // 헤딩
    .replace(/^>\s?/gm, '') // 인용
    .replace(/^[-*+]\s+/gm, '') // 리스트
    .replace(/[*_~]{1,3}/g, '') // 강조
    .replace(/\s+/g, ' ') // 공백 정리
    .trim();
}

export async function GET() {
  const posts = (await getCollection('post')).sort((a, b) => {
    const da = (a.data.created_at || a.data.date)?.getTime() ?? 0;
    const db = (b.data.created_at || b.data.date)?.getTime() ?? 0;
    return db - da;
  });

  const index = posts.map((p) => {
    const date = p.data.created_at || p.data.date;
    return {
      id: p.id,
      title: p.data.title || p.id,
      description: p.data.description || '',
      date: date ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}` : '',
      body: stripMarkdown(p.body || ''),
    };
  });

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
