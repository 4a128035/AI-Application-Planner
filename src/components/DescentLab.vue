<script setup lang="ts">
// Gradient descent on a 1-D loss curve: loss(w) = (w − 3)² + 1, minimum at w = 3.
// Pick a learning rate and step through updates  w ← w − lr · loss'(w)  to see
// "too small → slow", "just right → fast", "too big → overshoot and diverge".
// Drawn in SVG: positions are SVG attributes, not style attributes, so the strict CSP is fine.
import { computed, onBeforeUnmount, ref } from 'vue'

const W0 = -1
const loss = (w: number) => (w - 3) ** 2 + 1
const grad = (w: number) => 2 * (w - 3)

// Plot area: w ∈ [-2, 8], loss ∈ [1, 26]
const X0 = 20, X1 = 340, Y0 = 20, Y1 = 200
const sx = (w: number) => X0 + ((w + 2) / 10) * (X1 - X0)
const sy = (l: number) => Y1 - ((Math.min(l, 26) - 1) / 25) * (Y1 - Y0)
const curve = Array.from({ length: 81 }, (_, i) => -2 + i * 0.125)
  .map(w => `${sx(w).toFixed(1)},${sy(loss(w)).toFixed(1)}`).join(' ')

const rates = [
  { lr: 0.05, label: '太小 0.05', note: '每步都走得很保守，要走很多步才到谷底。' },
  { lr: 0.3, label: '剛好 0.3', note: '幾步就穩穩走到谷底。' },
  { lr: 1.05, label: '太大 1.05', note: '一步跨太大，越過谷底到對面，而且越跳越高。' }
]
const lr = ref(0.3)
const path = ref<number[]>([W0])
const w = computed(() => path.value[path.value.length - 1])
const outOfRange = computed(() => w.value < -2 || w.value > 8)
const converged = computed(() => Math.abs(w.value - 3) < 0.05)
const steps = computed(() => path.value.length - 1)

let timer: ReturnType<typeof setInterval> | undefined
function stop() { if (timer) { clearInterval(timer); timer = undefined } }
onBeforeUnmount(stop)

function step() {
  if (outOfRange.value || converged.value || steps.value >= 60) return stop()
  path.value = [...path.value, w.value - lr.value * grad(w.value)]
}
function run() {
  stop()
  timer = setInterval(() => { step(); if (outOfRange.value || converged.value || steps.value >= 60) stop() }, 350)
}
function reset() { stop(); path.value = [W0] }
function choose(r: number) { lr.value = r; reset() }

const trail = computed(() => path.value
  .filter(v => v >= -2 && v <= 8)
  .map(v => `${sx(v).toFixed(1)},${sy(loss(v)).toFixed(1)}`).join(' '))

const status = computed(() => {
  if (outOfRange.value) return `💥 暴衝了！走了 ${steps.value} 步，誤差不降反升，衝出畫面。學習率太大。`
  if (converged.value) return `🎯 第 ${steps.value} 步抵達谷底，誤差降到最低。`
  if (steps.value === 0) return '按「走一步」或「自動走」，看看模型怎麼下山。'
  if (steps.value >= 60) return `🐢 走了 ${steps.value} 步還沒到谷底。學習率太小，要走很久。`
  return `第 ${steps.value} 步：參數 w = ${w.value.toFixed(2)}，誤差 = ${loss(w.value).toFixed(2)}`
})
const note = computed(() => rates.find(r => r.lr === lr.value)?.note)
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="descent-title">
    <h3 id="descent-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">⛰️</span>下山實驗室：學習率怎麼選</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      曲線是「誤差」：越低越好，谷底就是最佳參數。模型每一步都看坡度（<strong class="text-ink">梯度</strong>）往下走，一步走多遠由<strong class="text-ink">學習率</strong>決定。
    </p>

    <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="選擇學習率">
      <button v-for="r in rates" :key="r.lr" type="button"
              class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors"
              :class="lr === r.lr ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface hover:border-brand'"
              :aria-pressed="lr === r.lr" @click="choose(r.lr)">{{ r.label }}</button>
    </div>
    <p class="mt-2 text-sm text-ink-2">{{ note }}</p>

    <svg viewBox="0 0 360 220" class="mt-4 w-full rounded-[var(--radius-btn)] bg-surface-2" role="img"
         :aria-label="`誤差曲線，目前在第 ${steps} 步`">
      <line :x1="X0" :y1="Y1" :x2="X1" :y2="Y1" class="stroke-line" stroke-width="2" />
      <polyline :points="curve" fill="none" class="stroke-ink-2" stroke-width="3" stroke-linecap="round" />
      <circle :cx="sx(3)" :cy="sy(1)" r="5" class="fill-ok" />
      <text :x="sx(3)" :y="Y1 + 15" text-anchor="middle" class="fill-ok text-[11px] font-bold">谷底（最佳）</text>
      <polyline v-if="path.length > 1" :points="trail" fill="none" class="stroke-accent" stroke-width="2" stroke-dasharray="4 4" />
      <template v-for="(v, i) in path" :key="i">
        <circle v-if="v >= -2 && v <= 8" :cx="sx(v)" :cy="sy(loss(v))"
                :r="i === path.length - 1 ? 8 : 4"
                :class="i === path.length - 1 ? 'fill-brand' : 'fill-accent opacity-70'" />
      </template>
      <text x="22" y="16" class="fill-ink-2 text-[11px] font-bold">↑ 誤差</text>
      <text :x="X1" :y="Y1 + 15" text-anchor="end" class="fill-ink-2 text-[11px] font-bold">參數 w →</text>
    </svg>

    <p class="mt-4 rounded-[var(--radius-btn)] bg-brand-soft px-4 py-3 font-bold leading-[1.75]" aria-live="polite">{{ status }}</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <button type="button" class="min-h-12 rounded-[var(--radius-btn)] bg-brand px-5 font-extrabold text-on-brand disabled:opacity-50"
              :disabled="outOfRange || converged" @click="step">走一步</button>
      <button type="button" class="min-h-12 rounded-[var(--radius-btn)] border-2 border-brand px-5 font-extrabold text-brand disabled:opacity-50"
              :disabled="outOfRange || converged" @click="run">自動走</button>
      <button type="button" class="min-h-12 rounded-[var(--radius-btn)] border-2 border-line px-5 font-extrabold hover:border-brand" @click="reset">重來</button>
    </div>
  </section>
</template>
