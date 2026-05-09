// Obsidian-style 링크를 표준 markdown 링크로 변환:
//   [[document|display]] → [display](/resource/{sanitized})
//   [[document]]        → [document](/resource/{sanitized})
// process-content.ts 의 변환 규칙과 동일.

import { visit } from 'unist-util-visit';

function sanitize(name) {
  return name.replace(/\s+/g, '-').replace(/[^\w\-가-힣]/g, '');
}

function convertText(text) {
  // [[doc|display]] | [[doc]]
  return text.replace(/\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\]/g, (_, doc, disp) => {
    const slug = sanitize(doc.trim());
    const display = (disp || doc).trim();
    return `[${display}](/resource/${slug}/)`;
  });
}

export function obsidianLinks() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value || !node.value.includes('[[')) return;

      // [[..]] 를 link 노드로 분해. 단순 텍스트 치환 후 다시 파싱하기보다,
      // 정규식으로 분리해서 mdast 노드로 만든다.
      const segments = [];
      const regex = /\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\]/g;
      let last = 0;
      let m;
      while ((m = regex.exec(node.value)) !== null) {
        if (m.index > last) {
          segments.push({ type: 'text', value: node.value.slice(last, m.index) });
        }
        const slug = sanitize(m[1].trim());
        const display = (m[2] || m[1]).trim();
        segments.push({
          type: 'link',
          url: `/resource/${slug}/`,
          children: [{ type: 'text', value: display }],
        });
        last = regex.lastIndex;
      }
      if (segments.length === 0) return;
      if (last < node.value.length) {
        segments.push({ type: 'text', value: node.value.slice(last) });
      }
      parent.children.splice(index, 1, ...segments);
      return index + segments.length;
    });
  };
}
