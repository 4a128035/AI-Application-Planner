<script setup lang="ts">
// Drag a value; see its Z-score and where it sits relative to the mean and standard deviations.
// Also shows Min-Max scaling for comparison. SVG positions are attributes (CSP-safe).
import { computed, ref } from 'vue'

const MU = 50000, SIGMA = 10000          // 會員年消費：平均 5 萬、標準差 1 萬
const MIN = 10000, MAX = 110000          // 資料中的最小、最大值（給 Min-Max 用）
const x = ref(70000)

const z = computed(() => (x.value - MU) / SIGMA)
const minmax = computed(() => (x.value - MIN) / (MAX - MIN))

// Bell curve over μ ± 4σ
const X0 = 20, X1 = 340, BASE = 130, TOP = 25
const sx = (v: number) => X0 + ((v - (MU - 4 * SIGMA)) / (8 * SIGMA)) * (X1 - X0)
const sy = (v: number) => BASE - Math.exp(-(((v - MU) / SIGMA) ** 2) / 2) * (BASE - TOP)
const curve = Array.from({ length: 81 }, (_, i) => MU - 4 * SIGMA + i * SIGMA / 10)
  .map(v => `${sx(v).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')
const ticks = [-3, -2, -1, 0, 1, 2, 3].map(k => ({ k, v: MU + k * SIGMA }))

const money = (v: number) => `${(v / 10000).toFixed(1)} 萬`
const meaning = computed(() => {
  const a = Math.abs(z.value)
  if (a < 0.05) return '剛好等於平均。'
  const dir = z.value > 0 ? '高於' : '低於'
  const rare = a >= 3 ? '非常罕見，可能是離群值，值得查證。' : a >= 2 ? `已經算是少見的${z.value > 0 ? '高' : '低'}了。` : '還在一般範圍內。'
  return `${dir}平均 ${a.toFixed(1)} 個標準差，${rare}`
})
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="z-title">
    <h3 id="z-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🧮</span>Z 分數計算機</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">全體會員的年消費：<strong class="text-ink">平均 μ = 5 萬</strong>、<strong class="text-ink">標準差 σ = 1 萬</strong>。拖動滑桿，看某位會員換算成 Z 分數是多少。</p>

    <div class="mt-5 rounded-[var(--radius-btn)] bg-surface-2 p-4">
      <label for="zx" class="flex items-baseline justify-between font-bold">
        <span>這位會員的年消費</span>
        <span class="text-2xl font-extrabold text-brand">{{ money(x) }}</span>
      </label>
      <input id="zx" v-model.number="x" type="range" min="15000" max="90000" step="1000"
             class="mt-2 h-11 w-full cursor-pointer accent-[var(--brand)]" aria-describedby="z-meaning" />
    </div>

    <svg viewBox="0 0 360 160" class="mt-4 w-full rounded-[var(--radius-btn)] bg-surface-2" role="img"
         :aria-label="`常態曲線，目前位置 Z 分數 ${z.toFixed(1)}`">
      <polyline :points="curve" fill="none" class="stroke-ink-2" stroke-width="2.5" />
      <line :x1="X0" :y1="BASE" :x2="X1" :y2="BASE" class="stroke-line" stroke-width="2" />
      <template v-for="t in ticks" :key="t.k">
        <line :x1="sx(t.v)" :y1="BASE" :x2="sx(t.v)" :y2="BASE + 5" class="stroke-ink-2" />
        <text :x="sx(t.v)" :y="BASE + 17" text-anchor="middle" class="fill-ink-2 text-[10px] font-bold">{{ t.k === 0 ? 'μ' : (t.k > 0 ? '+' : '') + t.k + 'σ' }}</text>
      </template>
      <line :x1="sx(x)" :y1="TOP - 8" :x2="sx(x)" :y2="BASE" class="stroke-brand" stroke-width="3" />
      <circle :cx="sx(x)" :cy="sy(x)" r="6" class="fill-brand" />
      <text :x="sx(x)" :y="TOP - 12" text-anchor="middle" class="fill-brand text-[12px] font-extrabold">Z = {{ z.toFixed(1) }}</text>
    </svg>

    <div class="mt-4 rounded-[var(--radius-btn)] bg-brand-soft px-4 py-3">
      <p class="font-mono text-sm font-bold">Z = (x − μ) ÷ σ = ({{ money(x) }} − 5.0 萬) ÷ 1.0 萬 = <span class="text-lg text-brand">{{ z.toFixed(1) }}</span></p>
      <p id="z-meaning" class="mt-1 font-bold leading-[1.7]" aria-live="polite">意思是：{{ meaning }}</p>
    </div>

    <p class="mt-3 text-[15px] leading-[1.75] text-ink-2">
      對照 <strong class="text-ink">Min-Max 縮放</strong>（資料最小 1 萬、最大 11 萬）：(x − 最小) ÷ (最大 − 最小) =
      <strong class="text-ink">{{ minmax.toFixed(2) }}</strong>，一定落在 0～1 之間。Z 分數則<strong class="text-ink">沒有上下限</strong>，可以是負數，也可以大於 1。
    </p>
  </section>
</template>
