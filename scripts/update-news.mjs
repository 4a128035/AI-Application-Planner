// Daily AI news update: fetch a whitelist of RSS feeds, merge with the saved archive, keep the last 30 days,
// and write src/data/news-archive.json (committed by the scheduled workflow, then read by the AI 新知 page).
// Feeds only carry their latest few dozen items, so the archive is what makes news last a month.
// Only titles, dates and https links on each source's own domain are kept (no article text).
// A failed feed is skipped and the existing archive is kept, so a bad day never empties the page.
// Usage: node scripts/update-news.mjs
import { readFile, writeFile } from 'node:fs/promises'

const ARCHIVE = new URL('../src/data/news-archive.json', import.meta.url)
const KEEP_DAYS = 30
const MAX_ITEMS = 2000

export const sources = [
  { id: 'technews', name: 'TechNews 科技新報', url: 'https://technews.tw/category/ai/feed/', lang: 'zh', hosts: ['technews.tw'], aiOnly: false },
  { id: 'ithome', name: 'iThome', url: 'https://www.ithome.com.tw/rss', lang: 'zh', hosts: ['ithome.com.tw'], aiOnly: false },
  { id: 'inside', name: 'INSIDE', url: 'https://www.inside.com.tw/feed/rss', lang: 'zh', hosts: ['inside.com.tw'], aiOnly: false },
  { id: 'openai', name: 'OpenAI', url: 'https://openai.com/news/rss.xml', lang: 'en', hosts: ['openai.com'], aiOnly: true },
  { id: 'google', name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', lang: 'en', hosts: ['blog.google'], aiOnly: true },
  { id: 'deepmind', name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', lang: 'en', hosts: ['deepmind.google'], aiOnly: true }
]

// Uppercase "AI" is matched case-sensitively so words like "Taiwan" don't count.
const AI_UPPER = /AI|LLM|GPT/
const AI_WORDS = /人工智慧|生成式|語言模型|機器學習|深度學習|神經網路|聊天機器人|代理|agent|openai|anthropic|chatgpt|gemini|claude|copilot|deepmind|nvidia|輝達/i

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
function clean(raw) {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}
const tag = (block, name) => clean(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1] ?? '')

function parseDate(s) {
  if (!s) return null
  // iThome uses "2026-11-06  06:11:05" with no zone; it is Taiwan time.
  const local = s.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/)
  const d = new Date(local ? `${local[1]}T${local[2]}+08:00` : s)
  return Number.isNaN(d.getTime()) ? null : d
}

function safeLink(raw, hosts) {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    return hosts.some(h => u.hostname === h || u.hostname.endsWith(`.${h}`)) ? u.href : null
  } catch { return null }
}

async function fetchSource(src, since) {
  const res = await fetch(src.url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Application-Planner news fetcher)', Accept: 'application/rss+xml, application/xml, text/xml' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const xml = (await res.text()).slice(0, 3_000_000)
  const items = []
  for (const block of xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? []) {
    const title = tag(block, 'title').slice(0, 200)
    const link = safeLink(tag(block, 'link'), src.hosts)
    const date = parseDate(tag(block, 'pubDate') || tag(block, 'dc:date'))
    if (!title || !link || !date || date.getTime() < since || date.getTime() > Date.now() + 86400_000) continue
    if (!src.aiOnly && !(AI_UPPER.test(title) || AI_WORDS.test(title))) continue
    items.push({ title, link, date: date.toISOString(), source: src.name, lang: src.lang })
  }
  return items
}

async function loadArchive() {
  try {
    const data = JSON.parse(await readFile(ARCHIVE, 'utf8'))
    return Array.isArray(data.items) ? data.items : []
  } catch { return [] }
}

const since = Date.now() - KEEP_DAYS * 86400_000
const old = await loadArchive()
const results = await Promise.allSettled(sources.map(s => fetchSource(s, since)))
const failed = sources.filter((_, i) => results[i].status === 'rejected').map(s => s.name)
const fresh = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []))

// Newest copy wins; drop duplicates by link and by title (the same story is often in two feeds).
const byLink = new Map()
for (const it of [...old, ...fresh]) byLink.set(it.link, it)
const seenTitle = new Set()
const items = [...byLink.values()]
  .filter(it => new Date(it.date).getTime() >= since)
  .sort((a, b) => b.date.localeCompare(a.date))
  .filter(it => { const k = it.title.toLowerCase(); if (seenTitle.has(k)) return false; seenTitle.add(k); return true })
  .slice(0, MAX_ITEMS)

const added = items.filter(it => !old.some(o => o.link === it.link)).length
await writeFile(ARCHIVE, JSON.stringify({
  updatedAt: new Date().toISOString(),
  keepDays: KEEP_DAYS,
  failed,
  sources: sources.map(({ name, lang }) => ({ name, lang })),
  items
}, null, 1) + '\n')
console.log(`news: ${items.length} kept, ${added} new, failed: ${failed.join(', ') || 'none'}`)
