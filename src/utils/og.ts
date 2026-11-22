import { SITE_URL } from './jsonld';

export const DEFAULT_OG_IMAGE = '/img/default.jpeg';

const MD_IMAGE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/;

/** 상대/사이트 경로를 절대 URL로. 외부 http(s) URL은 그대로. */
export function absoluteImageUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${SITE_URL}${encodeURI(decodeURI(path))}`;
}

/**
 * 글의 대표(OG) 이미지.
 * 1) frontmatter `image` (명시 지정) → 2) 본문 첫 이미지 → 3) 없으면 undefined (기본 이미지 사용).
 */
export function postOgImage(entry: { body?: string; data: Record<string, unknown> }): string | undefined {
  const fm = entry.data.image;
  if (typeof fm === 'string' && fm.trim()) return absoluteImageUrl(fm.trim());
  const m = entry.body?.match(MD_IMAGE);
  return m ? absoluteImageUrl(m[1]) : undefined;
}
