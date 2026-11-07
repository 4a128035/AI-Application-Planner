<script setup lang="ts">
// MCP request walkthrough: Host → Client → Server → data → back to Host. Step through one tool call.
import { ref } from 'vue'

const nodes = [
  { icon: '🧑‍💻', name: 'AI Host', role: '使用者面對的 AI 應用', text: '員工問：「訂單 A1024 出貨了嗎？」模型判斷需要查資料，決定使用「查詢訂單」這個工具。' },
  { icon: '🔌', name: 'MCP Client', role: 'Host 裡的連接器', text: 'Client 把請求整理成 MCP 的標準格式，送給提供這個工具的 Server。' },
  { icon: '🗄️', name: 'MCP Server', role: '把系統能力包裝成工具', text: '訂單系統的 MCP Server 公開了「查詢訂單」工具，收到請求後開始處理。' },
  { icon: '🔎', name: '資料查詢', role: '後端系統', text: 'Server 向公司的訂單資料庫查詢 A1024，取得「11 月 5 日已出貨」。' },
  { icon: '💬', name: '回傳 AI Host', role: '產生回答', text: '結果經 Client 回到 Host，模型依據真實資料回答：「您的訂單已於 11 月 5 日出貨。」' }
]
const at = ref(0)
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="mcp-title">
    <h3 id="mcp-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🔁</span>一次 MCP 工具呼叫，資料怎麼走？</h3>

    <ol class="mt-4 grid gap-2 sm:grid-cols-5" aria-label="MCP 流程">
      <li v-for="(n, i) in nodes" :key="n.name">
        <button type="button" class="flex h-full min-h-11 w-full flex-col items-center rounded-[var(--radius-btn)] border-2 px-2 py-3 text-center transition-colors"
                :class="i === at ? 'border-accent bg-accent-soft' : i < at ? 'border-line bg-surface-2' : 'border-dashed border-line bg-surface'"
                :aria-current="i === at ? 'step' : undefined" @click="at = i">
          <span class="text-2xl" aria-hidden="true">{{ n.icon }}</span>
          <span class="mt-1 text-sm font-extrabold">{{ i + 1 }}. {{ n.name }}</span>
          <span class="text-xs font-bold text-ink-2">{{ n.role }}</span>
        </button>
      </li>
    </ol>

    <p class="mt-4 rounded-[var(--radius-btn)] bg-accent-soft px-4 py-3 font-bold leading-[1.7]" aria-live="polite">
      <span class="text-accent">第 {{ at + 1 }} 步・{{ nodes[at].name }}：</span>{{ nodes[at].text }}
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button v-if="at > 0" type="button" class="min-h-11 rounded-full border-2 border-line px-4 text-sm font-bold hover:border-accent" @click="at--">← 上一步</button>
      <button v-if="at < nodes.length - 1" type="button" class="min-h-11 rounded-full border-2 border-accent bg-accent px-5 text-sm font-bold text-on-brand" @click="at++">下一步 →</button>
    </div>
  </section>
</template>
