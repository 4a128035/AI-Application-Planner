<script setup lang="ts">
// Low-code workflow simulator: Webhook trigger → AI intent → Router (branching) → one of three actions.
// The reader picks a customer message and an amount and sees which branch fires.
import { computed, ref } from 'vue'

const messages = [
  { text: '我上週買的冰箱壞了，我要退貨退款！', intent: '退費' },
  { text: '請問我的訂單什麼時候會出貨？', intent: '查詢出貨' },
  { text: '收到的耳機有雜音，可以退錢嗎？', intent: '退費' }
]
const pick = ref(0)
const amount = ref(15000)
const intent = computed(() => messages[pick.value].intent)
const branch = computed(() => intent.value !== '退費' ? 'reply' : amount.value > 10000 ? 'urgent' : 'refund')

const branches = [
  { id: 'urgent', cond: '意圖＝退費 且 金額 > 10,000', action: '🚨 立即通知主管處理' },
  { id: 'refund', cond: '意圖＝退費 且 金額 ≤ 10,000', action: '🧾 自動建立退費單' },
  { id: 'reply', cond: '其他意圖', action: '💬 AI 依知識庫自動回覆' }
]
const fmt = (n: number) => n.toLocaleString('en-US')
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="wf-title">
    <h3 id="wf-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🔀</span>自動化流程模擬：這則訊息會走哪條路？</h3>

    <fieldset class="mt-4">
      <legend class="text-sm font-extrabold">① 客人傳來的訊息</legend>
      <div class="mt-2 space-y-2">
        <label v-for="(m, i) in messages" :key="i" class="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-btn)] border-2 px-3 py-2 text-[15px]"
               :class="pick === i ? 'border-accent bg-accent-soft' : 'border-line bg-surface'">
          <input v-model="pick" type="radio" name="wf-msg" :value="i" class="size-4 accent-[var(--accent)]" />
          <span>「{{ m.text }}」</span>
        </label>
      </div>
    </fieldset>
    <div class="mt-3 rounded-[var(--radius-btn)] bg-surface-2 p-3">
      <label for="wf-amt" class="flex items-baseline justify-between text-sm font-extrabold">
        <span>訂單金額</span><span class="text-lg text-accent">{{ fmt(amount) }} 元</span>
      </label>
      <input id="wf-amt" v-model.number="amount" type="range" min="1000" max="30000" step="1000"
             class="mt-1 h-11 w-full cursor-pointer accent-[var(--accent)]" aria-describedby="wf-result" />
    </div>

    <ol class="mt-5 space-y-2" aria-label="流程節點">
      <li class="rounded-[var(--radius-btn)] border-2 border-accent bg-accent-soft px-4 py-2.5 text-[15px] font-bold">⚡ Webhook 觸發：客服系統一收到訊息，就主動通知流程開始</li>
      <li class="text-center text-ink-2" aria-hidden="true">↓</li>
      <li class="rounded-[var(--radius-btn)] border-2 border-accent bg-accent-soft px-4 py-2.5 text-[15px] font-bold">🤖 AI 判斷意圖：<span class="text-accent">{{ intent }}</span></li>
      <li class="text-center text-ink-2" aria-hidden="true">↓</li>
      <li class="rounded-[var(--radius-btn)] border-2 border-accent bg-accent-soft px-4 py-2.5 text-[15px] font-bold">🔀 條件分支（Router）：依條件決定下一步</li>
      <li class="text-center text-ink-2" aria-hidden="true">↓</li>
      <li>
        <ul class="grid gap-2 sm:grid-cols-3">
          <li v-for="b in branches" :key="b.id" class="rounded-[var(--radius-btn)] border-2 px-3 py-2.5 text-sm leading-[1.6]"
              :class="branch === b.id ? 'border-accent bg-accent-soft font-bold' : 'border-dashed border-line text-ink-2'">
            <span class="block text-xs font-bold">{{ b.cond }}</span>
            <span class="mt-1 block">{{ b.action }}</span>
            <span v-if="branch === b.id" class="sr-only">（目前走這條路）</span>
          </li>
        </ul>
      </li>
    </ol>

    <p id="wf-result" class="mt-4 rounded-[var(--radius-btn)] bg-surface-2 px-4 py-3 font-bold leading-[1.7]" aria-live="polite">
      結果：{{ branches.find(b => b.id === branch)?.action }}
      <span v-if="intent === '退費'" class="block text-sm font-normal text-ink-2">退費金額 {{ fmt(amount) }} 元{{ amount > 10000 ? '超過' : '沒有超過' }} 10,000 元。</span>
      <span v-else class="block text-sm font-normal text-ink-2">不是退費意圖，金額不影響結果。</span>
    </p>
  </section>
</template>
