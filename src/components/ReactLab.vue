<script setup lang="ts">
// Same booking request, two systems: a fixed automation flow vs a ReAct agent (think → act → observe).
// Step through each one. Tool calls are shown as structured arguments to illustrate function calling.
import { computed, ref } from 'vue'

type Kind = 'think' | 'act' | 'observe' | 'reply'
interface Step { kind: Kind; text: string; code?: string }

const flows: Record<'auto' | 'agent', Step[]> = {
  auto: [
    { kind: 'act', text: '依固定流程：查詢週五 19:00、4 人的空位', code: 'search_tables(date="週五", time="19:00", people=4)' },
    { kind: 'observe', text: '回傳：19:00 已客滿' },
    { kind: 'act', text: '依固定流程：「沒有空位」就走失敗分支' },
    { kind: 'reply', text: '很抱歉，訂位失敗。' }
  ],
  agent: [
    { kind: 'think', text: '使用者要週五晚上 7 點、4 位。先查有沒有空位。' },
    { kind: 'act', text: '呼叫訂位系統', code: 'search_tables(date="週五", time="19:00", people=4)' },
    { kind: 'observe', text: '回傳：19:00 已客滿；18:30 和 20:00 有空位。' },
    { kind: 'think', text: '19:00 沒位子。改時間會影響使用者，應該先問，不要擅自決定。' },
    { kind: 'act', text: '詢問使用者：「19:00 客滿了，18:30 或 20:00 可以嗎？」' },
    { kind: 'observe', text: '使用者回覆：「20:00 可以。」' },
    { kind: 'think', text: '確認是 20:00、4 位，可以下訂了。' },
    { kind: 'act', text: '呼叫訂位系統', code: 'book_table(date="週五", time="20:00", people=4)' },
    { kind: 'observe', text: '回傳：訂位成功，編號 A1024。' },
    { kind: 'reply', text: '已幫您訂好週五 20:00、4 位，訂位編號 A1024。' }
  ]
}
const label: Record<Kind, string> = { think: '💭 思考', act: '🛠️ 行動', observe: '👀 觀察', reply: '💬 回覆' }

const mode = ref<'auto' | 'agent'>('agent')
const shown = ref(1)
const steps = computed(() => flows[mode.value])
function setMode(m: 'auto' | 'agent') { mode.value = m; shown.value = 1 }
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="react-title">
    <h3 id="react-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🍽️</span>同一個請求，兩種系統</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">使用者說：<strong class="text-ink">「幫我訂這週五晚上 7 點、4 個人的餐廳。」</strong>但 19:00 剛好客滿。</p>

    <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="選擇系統">
      <button v-for="m in (['auto', 'agent'] as const)" :key="m" type="button"
              class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors"
              :class="mode === m ? 'border-accent bg-accent text-on-brand' : 'border-line bg-surface hover:border-accent'"
              :aria-pressed="mode === m" @click="setMode(m)">{{ m === 'auto' ? '⚙️ 傳統自動化（固定流程）' : '🤖 AI Agent（ReAct）' }}</button>
    </div>

    <ol class="mt-4 space-y-2" aria-live="polite">
      <li v-for="(s, i) in steps.slice(0, shown)" :key="mode + i" class="rounded-[var(--radius-btn)] border-l-4 px-4 py-2.5 text-[15px] leading-[1.7]"
          :class="s.kind === 'reply' ? 'border-accent bg-accent-soft font-bold' : s.kind === 'think' ? 'border-info bg-info-soft' : 'border-line bg-surface-2'">
        <span class="mr-1 text-sm font-extrabold">{{ label[s.kind] }}</span>{{ s.text }}
        <code v-if="s.code" class="mt-1 block overflow-x-auto rounded-md bg-surface px-2 py-1 text-[13px]">{{ s.code }}</code>
      </li>
    </ol>

    <div class="mt-3 flex flex-wrap gap-2">
      <button v-if="shown < steps.length" type="button" class="min-h-11 rounded-full border-2 border-accent bg-accent px-5 text-sm font-bold text-on-brand" @click="shown++">下一步 →</button>
      <button v-if="shown > 1" type="button" class="min-h-11 rounded-full border-2 border-line px-4 text-sm font-bold hover:border-accent" @click="shown = 1">↺ 從頭看</button>
    </div>

    <p v-if="shown === steps.length" class="mt-4 text-[15px] leading-[1.75] text-ink-2">
      {{ mode === 'auto'
        ? '固定流程只會照預先畫好的路走，遇到沒想到的情況就失敗。切換到 AI Agent 看看差別。'
        : 'Agent 依「目標」動態決定下一步：觀察結果、調整策略、必要時詢問使用者，再呼叫工具完成任務。這就是 ReAct：推理（Reason）與行動（Act）交替進行。' }}
    </p>
  </section>
</template>
