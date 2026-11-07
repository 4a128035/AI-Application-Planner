// Build-time AI news: fetch a short whitelist of RSS feeds while the site is built (GitHub Actions rebuilds daily),
// so readers' browsers never contact third parties and the CSP stays closed.
// Only titles, dates and links are kept (no article text). Every link must be https on the source's own domain.
// A feed that fails or times out is skipped; the build never breaks because of news.

export interface NewsSource { id: string; name: string; url: string; lang: 'zh' | 'en'; hosts: string[]; aiOnly: boolean }
export interface NewsItem { title: string; link: string; date: string; source: string; lang: 'zh' | 'en' }

export const sources: NewsSource[] = [
  { id: 'technews', name: 'TechNews 科技新報', url: 'https://technews.tw/category/ai/feed/', lang: 'zh', hosts: ['technews.tw'], aiOnly: false },
  { id: 'ithome', name: 'iThome', url: 'https://www.ithome.com.tw/rss', lang: 'zh', hosts: ['ithome.com.tw'], aiOnly: false },
  { id: 'inside', name: 'INSIDE', url: 'https://www.inside.com.tw/feed/rss', lang: 'zh', hosts: ['inside.com.tw'], aiOnly: false },
  { id: 'openai', name: 'OpenAI', url: 'https://openai.com/news/rss.xml', lang: 'en', hosts: ['openai.com'], aiOnly: true },
  { id: 'google', name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', lang: 'en', hosts: ['blog.google'], aiOnly: true },
  { id: 'deepmind', name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', lang: 'en', hosts: ['deepmind.google'], aiOnly: true }
]

const DAYS = 14
const PER_SOURCE = 15
// Uppercase "AI" is matched case-sensitively so words like "Taiwan" don't count.
const AI_UPPER = /AI|LLM|GPT/
const AI_WORDS = /人工智慧|生成式|語言模型|機器學習|深度學習|神經網路|聊天機器人|代理|agent|openai|anthropic|chatgpt|gemini|claude|copilot|deepmind|nvidia|輝達/i

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
function clean(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}
const tag = (block: string, name: string) => clean(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1] ?? '')

function parseDate(s: string): Date | null {
  if (!s) return null
  // iThome uses "2026-11-06  06:11:05" with no zone; it is Taiwan time.
  const local = s.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/)
  const d = new Date(local ? `${local[1]}T${local[2]}+08:00` : s)
  return Number.isNaN(d.getTime()) ? null : d
}

function safeLink(raw: string, hosts: string[]): string | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    return hosts.some(h => u.hostname === h || u.hostname.endsWith(`.${h}`)) ? u.href : null
  } catch { return null }
}

async function fetchSource(src: NewsSource, since: number): Promise<NewsItem[]> {
  const res = await fetch(src.url, {
    signal: AbortSignal.timeout(10000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Application-Planner news fetcher)', Accept: 'application/rss+xml, application/xml, text/xml' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const xml = (await res.text()).slice(0, 3_000_000)
  const items: NewsItem[] = []
  for (const block of xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? []) {
    const title = tag(block, 'title').slice(0, 200)
    const link = safeLink(tag(block, 'link'), src.hosts)
    const date = parseDate(tag(block, 'pubDate') || tag(block, 'dc:date'))
    if (!title || !link || !date || date.getTime() < since) continue
    if (!src.aiOnly && !(AI_UPPER.test(title) || AI_WORDS.test(title))) continue
    items.push({ title, link, date: date.toISOString(), source: src.name, lang: src.lang })
    if (items.length >= PER_SOURCE) break
  }
  return items
}

export async function getNews() {
  const since = Date.now() - DAYS * 86400_000
  const results = await Promise.allSettled(sources.map(s => fetchSource(s, since)))
  const failed = sources.filter((_, i) => results[i].status === 'rejected').map(s => s.name)
  const seen = new Set<string>()
  const items = results
    .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(it => { const k = it.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
  return { items, failed, updatedAt: new Date().toISOString() }
}
