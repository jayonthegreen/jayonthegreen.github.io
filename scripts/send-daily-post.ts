#!/usr/bin/env node

/**
 * 매일 텔레그램으로 블로그 글 1개를 전송한다.
 *
 * - src/pages/post/*.md 중 sent-posts.json 에 없는 글 하나를 골라 전송
 * - 미전송 글 중 무작위 선택
 * - 본문 전체를 텔레그램으로 전송 (4096자 초과 시 분할)
 * - 전송 후 sent-posts.json 갱신 → CI에서 commit/push 하여 중복 방지
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { sendTelegramMessage } from '../src/utils/telegram';

dotenv.config();

const POSTS_DIR = path.join(__dirname, '..', 'src', 'pages', 'post');
const SENT_LOG_PATH = path.join(__dirname, '..', 'data', 'sent-posts.json');
const SITE_URL = 'https://jayonthegreen.github.io';
const TELEGRAM_LIMIT = 3800; // 4096 안전 여유

interface SentLog {
  sent: string[];
}

interface PostMeta {
  slug: string;
  filePath: string;
  title: string;
  description: string;
  date: string;
  body: string;
}

function parseFrontmatter(raw: string): { fm: Record<string, string>; body: string } {
  const lines = raw.split('\n');
  if (lines[0]?.trim() !== '---') {
    return { fm: {}, body: raw };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return { fm: {}, body: raw };

  const fm: Record<string, string> = {};
  for (let i = 1; i < end; i++) {
    const m = lines[i].match(/^([\w-]+)\s*:\s*(.*)$/);
    if (m) {
      fm[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  const body = lines.slice(end + 1).join('\n').trim();
  return { fm, body };
}

function loadPosts(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts: PostMeta[] = [];
  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { fm, body } = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, '');
    posts.push({
      slug,
      filePath,
      title: fm.title || slug,
      description: fm.description || '',
      date: fm.created_at || fm.date || '',
      body,
    });
  }
  return posts;
}

function loadSentLog(): SentLog {
  if (!fs.existsSync(SENT_LOG_PATH)) {
    return { sent: [] };
  }
  const raw = fs.readFileSync(SENT_LOG_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveSentLog(log: SentLog): void {
  fs.writeFileSync(SENT_LOG_PATH, JSON.stringify(log, null, 2) + '\n', 'utf-8');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function chunkBody(body: string, limit: number): string[] {
  if (body.length <= limit) return [body];
  const chunks: string[] = [];
  let remaining = body;
  while (remaining.length > limit) {
    // 단락 경계로 자른다 (\n\n)
    let cut = remaining.lastIndexOf('\n\n', limit);
    if (cut < limit / 2) cut = remaining.lastIndexOf('\n', limit);
    if (cut < limit / 2) cut = limit;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendPost(post: PostMeta): Promise<void> {
  const url = `${SITE_URL}/post/${encodeURI(post.slug)}/`;

  // 헤더 메시지: 제목 + 설명 + 날짜 + URL
  const headerLines = [
    `<b>${escapeHtml(post.title)}</b>`,
    post.description ? `<i>${escapeHtml(post.description)}</i>` : '',
    post.date ? `📅 ${escapeHtml(post.date)}` : '',
    `🔗 ${url}`,
  ].filter(Boolean);
  const header = headerLines.join('\n');

  await sendTelegramMessage({ text: header, parseMode: 'HTML' });
  await sleep(500);

  // 본문은 escape 후 분할 전송 (HTML parse mode)
  const escapedBody = escapeHtml(post.body);
  const chunks = chunkBody(escapedBody, TELEGRAM_LIMIT);
  for (let i = 0; i < chunks.length; i++) {
    const prefix = chunks.length > 1 ? `(${i + 1}/${chunks.length})\n\n` : '';
    await sendTelegramMessage({ text: prefix + chunks[i], parseMode: 'HTML' });
    await sleep(500);
  }
}

async function main(): Promise<void> {
  const posts = loadPosts();
  const log = loadSentLog();
  const sentSet = new Set(log.sent);

  const unsent = posts.filter((p) => !sentSet.has(p.slug));

  if (unsent.length === 0) {
    console.log('✅ 모든 글을 이미 전송했습니다.');
    // 텔레그램에는 알리지 않고 조용히 종료
    return;
  }

  const next = unsent[Math.floor(Math.random() * unsent.length)];

  console.log(`📤 전송 대상: ${next.slug} (${next.date})`);
  console.log(`   진행률: ${log.sent.length + 1} / ${posts.length} (남은 ${unsent.length}개 중 무작위)`);

  await sendPost(next);

  log.sent.push(next.slug);
  saveSentLog(log);
  console.log('✅ 전송 완료 및 로그 저장');
}

main().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
