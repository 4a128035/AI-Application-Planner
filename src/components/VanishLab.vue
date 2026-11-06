<script setup lang="ts">
// Vanishing-gradient "telephone game": the error signal starts at 1 at the output and is multiplied
// by the activation's best-case slope at every layer on the way back (Sigmoid ≤ 0.25, ReLU = 1).
// Bars are SVG rects sized by attributes (CSP-safe).
import { computed, ref } from 'vue'

const act = ref<'sigmoid' | 'relu'>('sigmoid')
const layers = ref(5)
const slope = computed(() => (act.value === 'sigmoid' ? 0.25 : 1))

// Layer 1 is next to the input; the signal reaching layer k has passed (layers − k + 1) activations.
const bars = computed(() => Array.from({ length: layers.value }, (_, i) => {
  const hops = layers.value - i
  return { layer: i + 1, hops, value: slope.value ** hops }
}))
const first = computed(() => bars.value[0])

const W = 190, ROW = 30, LABEL = 58, RIGHT = 96
const fmt = (hops: number) => act.value === 'relu' ? '100%' : `1/${(4 ** hops).toLocaleString('en-US')}`
const pct = (v: number) => v >= 0.01 ? `${(v * 100).toFixed(v >= 0.1 ? 0 : 1)}%` : '不到 1%'

const verdict = computed(() => act.value === 'relu'
  ? `ReLU 在輸入為正時斜率固定是 1，傳回第 1 層的訊號一點都沒少，前面的層也學得動。`
  : first.value.hops === 1
    ? '只有 1 層時，訊號剩 1/4，還算學得動。試著加深網路看看。'
    : first.value.value >= 0.01
      ? `經過 ${first.value.hops} 層後，傳回第 1 層的訊號只剩 ${fmt(first.value.hops)}（${pct(first.value.value)}），已經大幅縮小。再加深看看。`
      : `經過 ${first.value.hops} 層後，傳回第 1 層的訊號只剩 ${fmt(first.value.hops)}（${pct(first.value.value)}）。前面的層幾乎收不到「該怎麼改」的訊號，這就是梯度消失。`)
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="vanish-title">
    <h3 id="vanish-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">📣</span>梯度傳話遊戲</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      訓練時，「答錯多少」的訊號（梯度）從輸出層<strong class="text-ink">一層一層往回傳</strong>。每經過一層，就要乘上啟動函數的斜率。
      Sigmoid 的斜率<strong class="text-ink">最多只有 0.25</strong>，ReLU 在輸入為正時則是 <strong class="text-ink">1</strong>。下面以最理想的情況計算。
    </p>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <div class="rounded-[var(--radius-btn)] bg-surface-2 p-3" role="group" aria-label="隱藏層的啟動函數">
        <p class="text-sm font-extrabold">隱藏層的啟動函數</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button v-for="a in (['sigmoid', 'relu'] as const)" :key="a" type="button"
                  class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors"
                  :class="act === a ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface hover:border-brand'"
                  :aria-pressed="act === a" @click="act = a">{{ a === 'sigmoid' ? 'Sigmoid' : 'ReLU' }}</button>
        </div>
      </div>
      <div class="rounded-[var(--radius-btn)] bg-surface-2 p-3">
        <label for="vl" class="flex items-baseline justify-between text-sm font-extrabold">
          <span>網路深度</span><span class="text-xl text-brand">{{ layers }} 層</span>
        </label>
        <input id="vl" v-model.number="layers" type="range" min="1" max="10" step="1"
               class="mt-1 h-11 w-full cursor-pointer accent-[var(--brand)]" aria-describedby="vanish-verdict" />
      </div>
    </div>

    <svg :viewBox="`0 0 ${LABEL + W + RIGHT} ${layers * ROW + 36}`" class="mx-auto mt-4 block w-full max-w-[30rem] rounded-[var(--radius-btn)] bg-surface-2" role="img"
         :aria-label="`各層收到的梯度：第 1 層 ${fmt(first.hops)}`">
      <text x="6" y="20" class="fill-ink-2 text-[12px] font-bold">← 往輸入層傳回（輸出層的訊號 = 100%）</text>
      <g v-for="(b, i) in bars" :key="b.layer">
        <text x="6" :y="32 + i * ROW + 15" class="fill-ink-2 text-[13px] font-bold">第 {{ b.layer }} 層</text>
        <rect :x="LABEL" :y="32 + i * ROW" :width="W" height="20" rx="5" class="fill-line" />
        <rect :x="LABEL" :y="32 + i * ROW" :width="Math.max(b.value * W, 2)" height="20" rx="5"
              :class="b.value < 0.01 ? 'fill-bad' : 'fill-brand'" />
        <text :x="LABEL + W + 6" :y="32 + i * ROW + 15" class="fill-ink text-[13px] font-extrabold">{{ fmt(b.hops) }}</text>
      </g>
    </svg>

    <p id="vanish-verdict" class="mt-4 rounded-[var(--radius-btn)] px-4 py-3 font-bold leading-[1.7]"
       :class="act === 'relu' || first.hops === 1 ? 'bg-ok-soft' : 'bg-bad-soft'" aria-live="polite">{{ verdict }}</p>
  </section>
</template>
