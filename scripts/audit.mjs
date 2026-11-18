// Dependency audit for CI: fails on any high or critical advisory, except ones listed below.
// Only list an advisory when no patched version exists yet and it cannot affect this static site.
// Each exception has an expiry date; after it, the advisory fails the build again so it gets re-checked.
import { execSync } from 'node:child_process'

const allow = {
  // picomatch ReDoS (<= 4.0.7, no patched release yet). Only used at build time on our own glob
  // patterns, never on visitor input, and the published site is static HTML.
  'GHSA-fc5q-39xc-vjpf': '2026-12-31'
}

let out
try {
  out = execSync('npm audit --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
} catch (e) {
  out = e.stdout // npm audit exits non-zero when it finds anything
}
const report = JSON.parse(out)
const today = new Date().toISOString().slice(0, 10)

const found = new Map()
for (const v of Object.values(report.vulnerabilities ?? {})) {
  for (const via of v.via) {
    if (typeof via !== 'object' || !['high', 'critical'].includes(via.severity)) continue
    const id = via.url.split('/').pop()
    found.set(id, `${via.severity}  ${via.name}  ${via.title}  ${via.url}`)
  }
}

let failed = false
for (const [id, line] of found) {
  const until = allow[id]
  if (until && today <= until) {
    console.log(`allowed until ${until}: ${line}`)
  } else {
    console.error(until ? `exception expired ${until}: ${line}` : line)
    failed = true
  }
}
console.log(found.size === 0 ? 'No high or critical advisories.' : '')
process.exit(failed ? 1 : 0)
