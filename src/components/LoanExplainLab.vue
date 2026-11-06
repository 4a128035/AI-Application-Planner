<script setup lang="ts">
// Explain one loan decision two ways: per-feature contributions (for a linear model these equal SHAP values)
// and counterfactuals ("what would have to change to get approved?"). Bars are SVG attributes (CSP-safe).
import { computed, reactive } from 'vue'

const BASE = 50, PASS = 50   // 平均申請人的分數；50 分以上核准
const features = [
  { id: 'income', label: '年收入', unit: '萬', min: 20, max: 150, step: 5, mean: 60, w: 0.5, actionable: true },
  { id: 'debt', label: '負債比', unit: '%', min: 0, max: 80, step: 5, mean: 35, w: -1, actionable: true },
  { id: 'years', label: '信用紀錄', unit: '年', min: 0, max: 20, step: 1, mean: 6, w: 2, actionable: false }
] as const
type Id = typeof features[number]['id']
const x = reactive<Record<Id, number>>({ income: 50, debt: 45, years: 3 })

const parts = computed(() => features.map(f => ({ ...f, c: f.w * (x[f.id] - f.mean) })))
const score = computed(() => BASE + parts.value.reduce((s, p) => s + p.c, 0))
const approved = computed(() => score.value >= PASS)

// Single-feature counterfactuals: the smallest change to one feature that reaches the pass mark.
const counterfactuals = computed(() => {
  const need = PASS - score.value
  if (need <= 0) return []
  return features.map(f => {
    const raw = x[f.id] + need / f.w
    const target = f.w > 0 ? Math.ceil(raw) : Math.floor(raw)
    const possible = target >= f.min && target <= f.max
    return { ...f, target, possible }
  })
})

const unit = (u: string) => (u === '%' ? u : ` ${u}`)
const show = (n: number) => String(Math.round(n * 10) / 10).replace('-', '−')
const fmt = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n).toFixed(1).replace(/\.0$/, '')
const MID = 160, SCALE = 3
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="loan-title">
    <h3 id="loan-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🏦</span>貸款審核解釋器</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      一個簡化的信用評分模型：<strong class="text-ink">平均申請人得 {{ BASE }} 分，{{ PASS }} 分以上核准</strong>。調整這位申請人的資料，看看每個特徵把分數往上推還是往下拉。
    </p>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div v-for="f in features" :key="f.id" class="rounded-[var(--radius-btn)] bg-surface-2 p-3">
        <label :for="`loan-${f.id}`" class="flex items-baseline justify-between text-sm font-extrabold">
          <span>{{ f.label }}</span><span class="text-lg text-brand">{{ x[f.id] }}{{ unit(f.unit) }}</span>
        </label>
        <input :id="`loan-${f.id}`" v-model.number="x[f.id]" type="range" :min="f.min" :max="f.max" :step="f.step"
               class="mt-1 h-11 w-full cursor-pointer accent-[var(--brand)]" aria-describedby="loan-result" />
        <p class="text-xs font-bold text-ink-2">平均：{{ f.mean }}{{ unit(f.unit) }}</p>
      </div>
    </div>

    <p id="loan-result" class="mt-5 rounded-[var(--radius-btn)] px-4 py-3 text-lg font-extrabold" :class="approved ? 'bg-ok-soft' : 'bg-bad-soft'" aria-live="polite">
      <span aria-hidden="true">{{ approved ? '✅' : '❌' }}</span> {{ show(score) }} 分：{{ approved ? '核准' : '拒絕' }}
    </p>

    <h4 class="mt-5 font-extrabold">① 每個特徵貢獻了幾分？（類似 SHAP 值）</h4>
    <svg viewBox="0 0 320 112" class="mx-auto mt-2 block w-full max-w-[30rem] rounded-[var(--radius-btn)] bg-surface-2" role="img"
         :aria-label="parts.map(p => `${p.label} ${fmt(p.c)} 分`).join('、')">
      <line :x1="MID" y1="6" :x2="MID" y2="106" class="stroke-line" stroke-width="2" />
      <g v-for="(p, i) in parts" :key="p.id">
        <text x="6" :y="26 + i * 34" class="fill-ink-2 text-[12px] font-bold">{{ p.label }}</text>
        <rect :x="p.c >= 0 ? MID : MID + Math.max(p.c * SCALE, -96)" :y="13 + i * 34" :width="Math.max(Math.min(Math.abs(p.c) * SCALE, 96), 2)" height="18" rx="4"
              :class="p.c >= 0 ? 'fill-ok' : 'fill-bad'" />
        <text :x="p.c >= 0 ? MID - 6 : MID + 6" :y="26 + i * 34" :text-anchor="p.c >= 0 ? 'end' : 'start'"
              class="fill-ink text-[12px] font-extrabold">{{ fmt(p.c) }}</text>
      </g>
    </svg>
    <p class="mt-2 text-sm leading-[1.7] text-ink-2">平均分數 {{ BASE }} ＋ 各特徵的貢獻 ＝ 這位申請人的分數。每一筆預測都能這樣拆開來看，就是<strong class="text-ink">局部解釋</strong>。</p>

    <h4 class="mt-5 font-extrabold">② 怎樣才會被核准？（反事實解釋）</h4>
    <p v-if="approved" class="mt-2 text-[15px] leading-[1.75] text-ink-2">已經核准了。試著把年收入調低、負債比調高，看看反事實解釋會怎麼說。</p>
    <ul v-else class="mt-2 space-y-2">
      <li v-for="c in counterfactuals" :key="c.id" class="rounded-[var(--radius-btn)] bg-surface-2 px-4 py-3 text-[15px] leading-[1.7]">
        <template v-if="!c.possible"><strong>{{ c.label }}</strong>：只改這一項，怎麼調都不夠。</template>
        <template v-else>
          如果<strong>{{ c.label }}</strong>{{ c.w > 0 ? '提高' : '降低' }}到 <strong class="text-brand">{{ c.target }}{{ unit(c.unit) }}</strong>，就會核准。
          <span v-if="!c.actionable" class="font-bold text-ink"><span aria-hidden="true">⚠️</span> 但信用紀錄年數無法馬上改變，這個建議不具可操作性。</span>
        </template>
      </li>
    </ul>
  </section>
</template>
