export const SITE_URL = 'https://jayonthegreen.github.io';

const AUTHOR = {
  '@type': 'Person',
  name: 'jay',
  url: SITE_URL,
} as const;

const DEFAULT_IMAGE = `${SITE_URL}/img/default.jpeg`;

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'jay',
    description: 'things about thinking',
    url: `${SITE_URL}/`,
    inLanguage: 'ko',
    author: AUTHOR,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface PostData {
  title?: string;
  description?: string;
  created_at?: Date;
  modified_at?: Date;
  date?: Date;
  tags?: unknown;
}

export function blogPostingJsonLd(id: string, data: PostData) {
  const url = `${SITE_URL}/post/${id}/`;
  const published = data.created_at || data.date;
  const modified = data.modified_at || published;
  const keywords = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === 'string')
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title || id,
    ...(data.description && { description: data.description }),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: DEFAULT_IMAGE,
    inLanguage: 'ko',
    author: AUTHOR,
    publisher: AUTHOR,
    ...(published && { datePublished: published.toISOString() }),
    ...(modified && { dateModified: modified.toISOString() }),
    ...(keywords && keywords.length > 0 && { keywords: keywords.join(', ') }),
  };
}
