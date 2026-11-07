<script setup lang="ts">
// Temperature lab: next-token probabilities = softmax(score / T). Drag T, then sample a few times.
// Bars are SVG rects sized by attributes (CSP-safe). Uses the 科目二 accent colour.
import { computed, ref } from 'vue'

const words = ['好', '溫馨', '安靜', '文青', '熱鬧']
const scores = [3.0, 2.4, 2.0, 1.4, 0.8]   // 模型對每個候選字的原始分數（示意）
const t = ref(1.0)

const probs = computed(() => {
  const e = scores.map(s => Math.exp(s / t.value))
  const sum = e.reduce((a, b) => a + b, 0)
  return e.map(x => x / sum)
})

const samples = ref<string[]>([])
function draw() {
  samples.value = Array.from({ length: 10 }, () => {
    let r = Math.random(), i = 0
    while (i < probs.value.length - 1 && r >= probs.value[i]) { r -= probs.value[i]; i++ }
    return words[i]
  })
}
const distinct = computed(() => new Set(samples.value).size)

const hint = computed(() => t.value <= 0.3
  ? '溫度很低：幾乎每次都選最可能的字，輸出穩定、一致，但缺乏變化。'
  : t.value < 1
    ? '溫度中等偏低：大多選最可能的字，偶爾出現其他選擇。'
    : t.value <= 1.2
      ? '溫度 1：照模型原本的機率來選。'
      : '溫度偏高：機率被「拉平」，冷門的字也有機會出現，變化多，但也更容易離題。')

const W = 200, LABEL = 52
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="temp-title">
    <h3 id="temp-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🌡️</span>溫度實驗室：下一個字會是什麼？</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      模型正在寫：<strong class="text-ink">「這家咖啡廳的氣氛很＿」</strong>。它替每個候選字算出機率，再<strong class="text-ink">依機率抽一個</strong>。拖動溫度，看機率怎麼變。
    </p>

    <div class="mt-5 rounded-[var(--radius-btn)] bg-surface-2 p-4">
      <label for="temp" class="flex items-baseline justify-between font-bold">
        <span>溫度（Temperature）</span><span class="text-2xl font-extrabold text-accent">{{ t.toFixed(1) }}</span>
      </label>
      <input id="temp" v-model.number="t" type="range" min="0.1" max="2" step="0.1"
             class="mt-2 h-11 w-full cursor-pointer accent-[var(--accent)]" aria-describedby="temp-hint" />
      <div class="flex justify-between text-xs font-bold text-ink-2"><span>穩定、一致</span><span>多樣、有創意</span></div>
    </div>

    <svg :viewBox="`0 0 ${LABEL + W + 64} ${words.length * 30 + 8}`" class="mx-auto mt-4 block w-full max-w-[28rem] rounded-[var(--radius-btn)] bg-surface-2" role="img"
         :aria-label="words.map((w, i) => `${w} ${(probs[i] * 100).toFixed(1)}%`).join('、')">
      <g v-for="(w, i) in words" :key="w">
        <text x="10" :y="24 + i * 30" class="fill-ink text-[14px] font-bold">{{ w }}</text>
        <rect :x="LABEL" :y="10 + i * 30" :width="W" height="20" rx="5" class="fill-line" />
        <rect :x="LABEL" :y="10 + i * 30" :width="Math.max(probs[i] * W, 2)" height="20" rx="5" class="fill-accent" />
        <text :x="LABEL + W + 8" :y="24 + i * 30" class="fill-ink text-[13px] font-extrabold">{{ (probs[i] * 100).toFixed(1) }}%</text>
      </g>
    </svg>

    <p id="temp-hint" class="mt-4 rounded-[var(--radius-btn)] bg-accent-soft px-4 py-3 font-bold leading-[1.7]" aria-live="polite">{{ hint }}</p>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" class="min-h-11 rounded-full border-2 border-accent bg-accent px-5 text-sm font-bold text-on-brand" @click="draw">🎲 用這個溫度抽 10 次</button>
      <span v-if="samples.length" class="text-sm font-bold text-ink-2" aria-live="polite">出現了 {{ distinct }} 種不同的字</span>
    </div>
    <p v-if="samples.length" class="mt-3 flex flex-wrap gap-2">
      <span v-for="(s, i) in samples" :key="i" class="rounded-full border border-line bg-surface-2 px-3 py-1 text-sm font-bold">{{ s }}</span>
    </p>
    <p class="mt-4 text-sm leading-[1.7] text-ink-2">候選字的原始分數是示意的。真實模型每一步要從數萬個 Token 裡挑，但原理相同。</p>
  </section>
</template>
