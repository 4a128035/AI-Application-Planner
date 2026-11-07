<script setup lang="ts">
// Token cost & payback calculator: AI cost = messages × tokens ÷ 1000 × price, compared with manual cost.
// "Other monthly costs" shows how ignoring maintenance/cloud/compliance overstates the return.
import { computed, ref } from 'vue'

const n = ref(800)        // 每月則數
const tok = ref(2500)     // 每則 Token 數
const price = ref(0.6)    // 元 / 1,000 Token
const manual = ref(50)    // 人工每則成本（元）
const setup = ref(150000) // 一次性整合費（元）
const other = ref(0)      // 其他每月成本（元）

const tokens = computed(() => n.value * tok.value)
const aiToken = computed(() => (tokens.value / 1000) * price.value)
const aiMonthly = computed(() => aiToken.value + other.value)
const human = computed(() => n.value * manual.value)
const saving = computed(() => human.value - aiMonthly.value)
const payback = computed(() => (saving.value > 0 ? setup.value / saving.value : Infinity))
const fmt = (v: number) => Math.round(v).toLocaleString('en-US')

const sliders = [
  { id: 'n', label: '每月處理則數', model: n, min: 100, max: 2000, step: 100, unit: '則' },
  { id: 'tok', label: '每則平均 Token（輸入＋輸出）', model: tok, min: 500, max: 5000, step: 500, unit: 'Token' },
  { id: 'price', label: 'Token 單價（每 1,000 Token）', model: price, min: 0.1, max: 2, step: 0.1, unit: '元' },
  { id: 'manual', label: '人工處理每則成本', model: manual, min: 10, max: 100, step: 10, unit: '元' },
  { id: 'setup', label: '一次性系統整合費', model: setup, min: 50000, max: 500000, step: 50000, unit: '元' },
  { id: 'other', label: '其他每月成本（維護、雲端、資安）', model: other, min: 0, max: 40000, step: 2000, unit: '元' }
]
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="cost-title">
    <h3 id="cost-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">💰</span>Token 成本與回收期計算機</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">情境：用生成式 AI 取代人工回覆多語言客服訊息。調整數字，看每月能省多少、多久回本。</p>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div v-for="s in sliders" :key="s.id" class="rounded-[var(--radius-btn)] bg-surface-2 p-3">
        <label :for="`cost-${s.id}`" class="flex items-baseline justify-between gap-2 text-sm font-extrabold">
          <span>{{ s.label }}</span><span class="shrink-0 text-accent">{{ s.id === 'price' ? s.model.value.toFixed(1) : fmt(s.model.value) }} {{ s.unit }}</span>
        </label>
        <input :id="`cost-${s.id}`" v-model.number="s.model.value" type="range" :min="s.min" :max="s.max" :step="s.step"
               class="mt-1 h-11 w-full cursor-pointer accent-[var(--accent)]" aria-describedby="cost-result" />
      </div>
    </div>

    <dl class="mt-5 grid gap-2 text-[15px] sm:grid-cols-2">
      <div class="rounded-[var(--radius-btn)] bg-surface-2 px-4 py-3"><dt class="text-sm font-bold text-ink-2">每月 Token 用量</dt>
        <dd class="font-extrabold">{{ fmt(n) }} × {{ fmt(tok) }} ＝ {{ fmt(tokens) }} Token</dd></div>
      <div class="rounded-[var(--radius-btn)] bg-surface-2 px-4 py-3"><dt class="text-sm font-bold text-ink-2">每月 Token 費用</dt>
        <dd class="font-extrabold">{{ fmt(tokens) }} ÷ 1,000 × {{ price.toFixed(1) }} ＝ {{ fmt(aiToken) }} 元</dd></div>
      <div class="rounded-[var(--radius-btn)] bg-surface-2 px-4 py-3"><dt class="text-sm font-bold text-ink-2">原本人工成本</dt>
        <dd class="font-extrabold">{{ fmt(n) }} × {{ fmt(manual) }} ＝ {{ fmt(human) }} 元／月</dd></div>
      <div class="rounded-[var(--radius-btn)] bg-surface-2 px-4 py-3"><dt class="text-sm font-bold text-ink-2">AI 每月總成本</dt>
        <dd class="font-extrabold">{{ fmt(aiToken) }} ＋ {{ fmt(other) }} ＝ {{ fmt(aiMonthly) }} 元</dd></div>
    </dl>

    <p id="cost-result" class="mt-4 rounded-[var(--radius-btn)] px-4 py-3 font-bold leading-[1.7]" :class="saving > 0 ? 'bg-accent-soft' : 'bg-bad-soft'" aria-live="polite">
      <template v-if="saving > 0">每月節省 {{ fmt(saving) }} 元，整合費 {{ fmt(setup) }} 元約 <span class="text-accent">{{ payback.toFixed(1) }} 個月</span>回收。</template>
      <template v-else>AI 每月總成本已經高於人工，永遠回不了本。這就是只看 Token 費用、忽略其他成本的風險。</template>
    </p>
  </section>
</template>
