<script setup lang="ts">
// Drag the decision threshold and watch TP/FP/FN/TN, precision and recall move.
// Teaches the exam's favourite trade-off: lower threshold → recall ↑, precision ↓.
// No inline style bindings (CSP forbids style attributes); state is shown with classes and <progress>.
import { computed, ref } from 'vue'

interface Person { id: number; sick: boolean; score: number }

// 20 people, 6 truly sick. Scores are the model's predicted probability of being sick.
const people: Person[] = [
  0.95, 0.88, 0.76, 0.62, 0.45, 0.30
].map((score, i) => ({ id: i, sick: true, score }))
  .concat([0.82, 0.68, 0.55, 0.40, 0.35, 0.25, 0.20, 0.15, 0.12, 0.10, 0.08, 0.06, 0.05, 0.03]
    .map((score, i) => ({ id: 100 + i, sick: false, score })))
  .sort((a, b) => b.score - a.score)

const threshold = ref(0.5)
const presets = [
  { label: '寬鬆 0.25', value: 0.25 },
  { label: '預設 0.50', value: 0.5 },
  { label: '嚴格 0.85', value: 0.85 }
]

type Outcome = 'tp' | 'fp' | 'fn' | 'tn'
const outcomeOf = (p: Person): Outcome => {
  const positive = p.score >= threshold.value - 1e-9
  return p.sick ? (positive ? 'tp' : 'fn') : (positive ? 'fp' : 'tn')
}

const counts = computed(() => {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 }
  for (const p of people) c[outcomeOf(p)]++
  return c
})

const ratio = (a: number, b: number) => (b === 0 ? 0 : a / b)
const metrics = computed(() => {
  const { tp, fp, fn, tn } = counts.value
  const precision = ratio(tp, tp + fp)
  const recall = ratio(tp, tp + fn)
  return [
    { key: 'precision', name: '精確率 Precision', q: '判定陽性的人裡，真的生病的比例', value: precision },
    { key: 'recall', name: '召回率 Recall', q: '真的生病的人裡，被抓到的比例', value: recall },
    { key: 'f1', name: 'F1 分數', q: '精確率與召回率的調和平均', value: ratio(2 * precision * recall, precision + recall) },
    { key: 'accuracy', name: '準確率 Accuracy', q: '全部 20 人裡判斷正確的比例', value: ratio(tp + tn, people.length) }
  ]
})

const story = computed(() => {
  const { fp, fn } = counts.value
  if (fn === 0) return `一個病人都沒漏掉（召回率 100%），代價是有 ${fp} 位健康的人要白跑一趟複檢。`
  if (fp === 0) return `判定陽性的全都真的生病（精確率 100%），但有 ${fn} 位病人被漏掉了。`
  return `漏掉 ${fn} 位病人、誤報 ${fp} 位健康的人。往左拉會抓到更多病人，往右拉會減少誤報。`
})

const pct = (v: number) => `${Math.round(v * 100)}%`

const cardClass: Record<Outcome, string> = {
  tp: 'border-ok bg-ok-soft',
  fp: 'border-warn bg-warn-soft',
  fn: 'border-bad bg-bad-soft border-dashed',
  tn: 'border-line bg-surface'
}
const tagText: Record<Outcome, string> = { tp: '抓到', fp: '誤報', fn: '漏掉', tn: '排除' }
const tagClass: Record<Outcome, string> = { tp: 'text-ok', fp: 'text-warn', fn: 'text-bad', tn: 'text-ink-2' }
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="lab-title">
    <h3 id="lab-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🎚️</span>門檻實驗室：癌症初步篩檢</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      模型幫每個人算出「罹癌機率」。分數 ≥ 門檻就判定<strong class="text-ink">陽性</strong>，送去做精密複檢。拖動滑桿看看會發生什麼事。
    </p>

    <div class="mt-5 rounded-[var(--radius-btn)] bg-surface-2 p-4">
      <label for="threshold" class="flex items-baseline justify-between font-bold">
        <span>判定門檻</span>
        <span class="text-2xl font-extrabold text-brand">{{ threshold.toFixed(2) }}</span>
      </label>
      <input
        id="threshold" v-model.number="threshold" type="range" min="0.05" max="0.95" step="0.05"
        class="mt-2 h-11 w-full cursor-pointer accent-[var(--brand)]"
        aria-describedby="lab-story"
      />
      <div class="mt-1 flex justify-between text-xs font-bold text-ink-2"><span>← 寬鬆（多抓）</span><span>嚴格（少誤報）→</span></div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button v-for="p in presets" :key="p.value" type="button"
                class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors"
                :class="Math.abs(threshold - p.value) < 1e-9 ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface hover:border-brand'"
                @click="threshold = p.value">{{ p.label }}</button>
      </div>
    </div>

    <p id="lab-story" class="mt-4 rounded-[var(--radius-btn)] bg-brand-soft px-4 py-3 font-bold leading-[1.75]" aria-live="polite">{{ story }}</p>

    <!-- 20 people, highest score first -->
    <ul class="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="20 位受檢者">
      <li v-for="p in people" :key="p.id"
          class="flex flex-col items-center rounded-[var(--radius-btn)] border-2 py-2 transition-colors"
          :class="cardClass[outcomeOf(p)]"
          :aria-label="`${p.sick ? '真的生病' : '健康'}，分數 ${p.score.toFixed(2)}，${tagText[outcomeOf(p)]}`">
        <span class="text-xl" aria-hidden="true">{{ p.sick ? '🤒' : '🙂' }}</span>
        <span class="text-xs font-bold text-ink-2">{{ p.score.toFixed(2) }}</span>
        <span class="text-[11px] font-extrabold" :class="tagClass[outcomeOf(p)]">{{ tagText[outcomeOf(p)] }}</span>
      </li>
    </ul>
    <p class="mt-2 text-xs font-bold text-ink-2">🤒 真的生病　🙂 健康　｜　實線框＝判定陽性・虛線紅框＝漏掉的病人</p>

    <dl class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div class="rounded-[var(--radius-btn)] bg-ok-soft p-3"><dt class="text-xs font-bold text-ok">抓到 TP</dt><dd class="text-2xl font-extrabold">{{ counts.tp }}</dd></div>
      <div class="rounded-[var(--radius-btn)] bg-warn-soft p-3"><dt class="text-xs font-bold text-warn">誤報 FP</dt><dd class="text-2xl font-extrabold">{{ counts.fp }}</dd></div>
      <div class="rounded-[var(--radius-btn)] bg-bad-soft p-3"><dt class="text-xs font-bold text-bad">漏掉 FN</dt><dd class="text-2xl font-extrabold">{{ counts.fn }}</dd></div>
      <div class="rounded-[var(--radius-btn)] bg-surface-2 p-3"><dt class="text-xs font-bold text-ink-2">排除 TN</dt><dd class="text-2xl font-extrabold">{{ counts.tn }}</dd></div>
    </dl>

    <ul class="mt-5 space-y-3">
      <li v-for="m in metrics" :key="m.key">
        <div class="flex items-baseline justify-between gap-3">
          <span class="font-extrabold">{{ m.name }}</span>
          <span class="text-lg font-extrabold text-brand">{{ pct(m.value) }}</span>
        </div>
        <progress class="mt-1 h-2.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-surface-2 [&::-webkit-progress-value]:bg-brand [&::-webkit-progress-value]:transition-all"
                  :value="m.value" max="1" :aria-label="m.name" />
        <p class="mt-1 text-xs text-ink-2">{{ m.q }}</p>
      </li>
    </ul>
  </section>
</template>
