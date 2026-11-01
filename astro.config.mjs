// @ts-check
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'

// Astro hashes its bundled scripts automatically, but not `is:inline` ones.
// The pre-paint theme script is inline on purpose, so hash the exact file here.
const themeInit = readFileSync(new URL('./src/scripts/theme-init.js', import.meta.url), 'utf8')
const themeInitHash = /** @type {`sha256-${string}`} */ (`sha256-${createHash('sha256').update(themeInit).digest('base64')}`)

export default defineConfig({
  site: 'https://4a128035.github.io',
  base: '/AI-Application-Planner',
  trailingSlash: 'always',
  integrations: [mdx(), vue()],
  vite: {
    plugins: [tailwindcss()],
    // Never inline assets as data: URLs (Vite does this for files < 4 KB, e.g. small
    // font subsets). Real files keep font-src/img-src strict at 'self'.
    build: { assetsInlineLimit: 0 }
  },

  build: {
    // Keep every stylesheet as a file so style-src can stay 'self' + hashes.
    inlineStylesheets: 'never'
  },

  // Shiki highlighting relies on inline styles, which our CSP forbids; lessons have no code blocks.
  markdown: { syntaxHighlight: false },

  security: {
    // Astro hashes its own inline scripts/styles into script-src / style-src.
    // Everything else is listed explicitly; see the /security page for the reasoning.
    csp: {
      algorithm: 'SHA-256',
      scriptDirective: { hashes: [themeInitHash] },
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://i.ytimg.com",
        "font-src 'self'",
        "connect-src 'self'",
        'frame-src https://www.youtube-nocookie.com',
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests'
      ]
    }
  }
})
