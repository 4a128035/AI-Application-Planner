// Checks every optional video in src/data/videos.json still exists on YouTube and is still on the expected
// channel, using YouTube's public oEmbed endpoint (no API key). Exits 1 if anything is missing or moved.
// Usage: node scripts/check-videos.mjs
import { readFile } from 'node:fs/promises'

const videos = JSON.parse(await readFile(new URL('../src/data/videos.json', import.meta.url), 'utf8'))
const problems = []

for (const [key, v] of Object.entries(videos)) {
  if (!/^[\w-]{11}$/.test(v.id)) { problems.push(`${key}: malformed id`); continue }
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${v.id}`)}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) { problems.push(`${key}: HTTP ${res.status} (removed or private?)`); continue }
    const info = await res.json()
    if (info.author_name !== v.author) problems.push(`${key}: channel is now "${info.author_name}", expected "${v.author}"`)
    else console.log(`ok  ${key}  ${info.title}`)
  } catch (err) {
    problems.push(`${key}: request failed (${err.name})`)
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(`\nAll ${Object.keys(videos).length} videos OK.`)
