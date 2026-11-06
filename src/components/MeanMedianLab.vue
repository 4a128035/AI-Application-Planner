<script setup lang="ts">
// Drag one extreme value (the boss's salary) and watch the mean move while the median stays put.
// Teaches: skew direction (mean > median ⇒ right-skewed), why the median is robust,
// and why skewed columns should be filled with the median, not the mean.
// SVG positions are attributes (not style), so the strict CSP is unaffected.
import { computed, ref } from 'vue'

// Nine staff salaries (萬元／月). Their sum is 38.5, so with the boss at 5 the mean equals the median (4.35).
const staff = [3.2, 3.5, 3.8, 4.0, 4.2, 4.5, 4.8, 5.0, 5.5]
const boss = ref(5)

const all = computed(() => [...staff, boss.value].sort((a, b) => a - b))
const mean = computed(() => all.value.reduce((s, v) => s + v, 0) / all.value.length)
const median = computed(() => {
  const a = all.value, m = a.length / 2
  return a.length % 2 ? a[Math.floor(m)] : (a[m - 1] + a[m]) / 2
})
const gap = computed(() => mean.value - median.value)
const shape = computed(() => gap.value > 0.3
  ? { label: '右偏（正偏）', text: '少數特別大的值，把平均數往右（往大）拉走了。' }
  : { label: '大致對稱', text: '平均數和中位數幾乎一樣，資料沒有明顯偏向一邊。' })

// Number line from 0 to a little past the largest value
const X0 = 16, X1 = 344
const maxV = computed(() => Math.max(10, boss.value) * 1.05)
const sx = (v: number) => X0 + (v / maxV.value) * (X1 - X0)
const ticks = computed(() => {
  const step = maxV.value > 60 ? 20 : maxV.value > 25 ? 10 : 2
  return Array.from({ length: Math.floor(maxV.value / step) + 1 }, (_, i) => i * step)
})
const fmt = (v: number) => v.toFixed(2)
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="mm-title">
    <h3 id="mm-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">⚖️</span>平均數 vs. 中位數實驗室</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">一家小公司有 9 位員工和 1 位老闆。拖動滑桿調高老闆的月薪，看看「平均月薪」和「中位數月薪」各自怎麼變。</p>

    <div class="mt-5 rounded-[var(--radius-btn)] bg-surface-2 p-4">
      <label for="boss" class="flex items-baseline justify-between font-bold">
        <span>👔 老闆月薪</span>
        <span class="text-2xl font-extrabold text-accent">{{ boss }} 萬</span>
      </label>
      <input id="boss" v-model.number="boss" type="range" min="5" max="100" step="1"
             class="mt-2 h-11 w-full cursor-pointer accent-[var(--accent)]" aria-describedby="mm-shape" />
    </div>

    <svg viewBox="0 0 360 120" class="mt-4 w-full rounded-[var(--radius-btn)] bg-surface-2" role="img"
         :aria-label="`數線：平均數 ${fmt(mean)} 萬，中位數 ${fmt(median)} 萬`">
      <line :x1="X0" y1="70" :x2="X1" y2="70" class="stroke-line" stroke-width="2" />
      <template v-for="t in ticks" :key="t">
        <line :x1="sx(t)" y1="66" :x2="sx(t)" y2="74" class="stroke-ink-2" stroke-width="1" />
        <text :x="sx(t)" y="90" text-anchor="middle" class="fill-ink-2 text-[10px] font-bold">{{ t }}</text>
      </template>
      <circle v-for="(v, i) in staff" :key="i" :cx="sx(v)" cy="70" r="5" class="fill-ink-2 opacity-70" />
      <circle :cx="sx(boss)" cy="70" r="7" class="fill-accent" />
      <!-- median marker (above the line) -->
      <line :x1="sx(median)" y1="24" :x2="sx(median)" y2="62" class="stroke-brand" stroke-width="3" />
      <text :x="sx(median)" y="18" text-anchor="start" class="fill-brand text-[11px] font-extrabold">中位數</text>
      <!-- mean marker (below the line) -->
      <line :x1="sx(mean)" y1="78" :x2="sx(mean)" y2="104" class="stroke-accent" stroke-width="3" />
      <text :x="sx(mean)" y="116" text-anchor="middle" class="fill-accent text-[11px] font-extrabold">平均數</text>
    </svg>

    <dl class="mt-4 grid grid-cols-2 gap-2">
      <div class="rounded-[var(--radius-btn)] bg-brand-soft p-3">
        <dt class="text-xs font-bold text-brand">中位數（排中間的那個）</dt>
        <dd class="text-2xl font-extrabold">{{ fmt(median) }} 萬</dd>
      </div>
      <div class="rounded-[var(--radius-btn)] bg-accent-soft p-3">
        <dt class="text-xs font-bold text-accent">平均數（加總 ÷ 人數）</dt>
        <dd class="text-2xl font-extrabold">{{ fmt(mean) }} 萬</dd>
      </div>
    </dl>

    <p id="mm-shape" class="mt-4 rounded-[var(--radius-btn)] bg-surface-2 px-4 py-3 leading-[1.75]" aria-live="polite">
      <strong class="font-extrabold">{{ shape.label }}：</strong>{{ shape.text }}
    </p>

    <p class="mt-3 text-[15px] leading-[1.75]">
      🩹 如果有一位員工的月薪欄位是<strong class="font-extrabold">空的</strong>（遺漏值），
      補「平均數」會補成 <strong class="font-extrabold text-accent">{{ fmt(mean) }} 萬</strong>，
      補「中位數」會補成 <strong class="font-extrabold text-brand">{{ fmt(median) }} 萬</strong>。
      <span v-if="gap > 0.3">哪一個比較像一般員工的薪水？</span>
    </p>
  </section>
</template>
