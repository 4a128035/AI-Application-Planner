<script setup lang="ts">
// Diffusion-model sketch: a 12×12 picture is blended with fixed random noise step by step (training),
// and "generation" plays the same path backwards. Cell brightness uses the SVG fill-opacity attribute (CSP-safe).
// This is a simplified illustration, not the real noise schedule.
import { computed, onBeforeUnmount, ref } from 'vue'

const ART = [
  '............',
  '..##....##..',
  '.####..####.',
  '############',
  '############',
  '############',
  '.##########.',
  '..########..',
  '...######...',
  '....####....',
  '.....##.....',
  '............'
]
const N = 12, STEPS = 10, CELL = 20
const clean = ART.flatMap(r => [...r].map(c => (c === '#' ? 1 : 0)))

// Fixed pseudo-random noise (same every load) so the picture is reproducible.
let seed = 7
const noise = clean.map(() => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 })

const t = ref(0)
const playing = ref(false)
const cells = computed(() => clean.map((c, i) => ({
  x: (i % N) * CELL, y: Math.floor(i / N) * CELL,
  v: c * (1 - t.value / STEPS) + noise[i] * (t.value / STEPS)
})))

const stage = computed(() => {
  if (t.value === 0) return '原始圖片：一顆清楚的愛心。'
  if (t.value <= 4) return `加了 ${t.value * 10}% 的雜訊，還看得出形狀。`
  if (t.value < STEPS) return `加了 ${t.value * 10}% 的雜訊，形狀幾乎看不出來了。`
  return '100% 雜訊：完全看不出原本的圖。生成就是從這裡開始。'
})

let timer: ReturnType<typeof setInterval> | undefined
function stop() { if (timer) clearInterval(timer); timer = undefined; playing.value = false }
function play() {
  stop()
  t.value = STEPS
  playing.value = true
  timer = setInterval(() => { if (t.value > 0) t.value--; else stop() }, 450)
}
onBeforeUnmount(stop)
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="diff-title">
    <h3 id="diff-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🌫️</span>擴散模型：先弄糊，再學會變清楚</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      <strong class="text-ink">訓練時</strong>：把清楚的圖一步步加上雜訊（滑桿往右），讓模型學「每一步加了什麼雜訊」。
      <strong class="text-ink">生成時</strong>：從一張純雜訊開始，讓模型一步步把雜訊去掉（按下播放）。
    </p>

    <div class="mt-5 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
      <svg :viewBox="`0 0 ${N * CELL} ${N * CELL}`" class="mx-auto block w-56 rounded-[var(--radius-btn)] bg-surface-2 sm:w-60" role="img"
           :aria-label="`示意圖：雜訊程度 ${t * 10}%`">
        <rect v-for="(c, i) in cells" :key="i" :x="c.x + 1" :y="c.y + 1" :width="CELL - 2" :height="CELL - 2" rx="3"
              class="fill-brand" :fill-opacity="c.v.toFixed(2)" />
      </svg>

      <div>
        <label for="dt" class="flex items-baseline justify-between font-bold">
          <span>雜訊程度</span><span class="text-2xl font-extrabold text-brand">{{ t * 10 }}%</span>
        </label>
        <input id="dt" v-model.number="t" type="range" min="0" :max="STEPS" step="1" :disabled="playing"
               class="mt-2 h-11 w-full cursor-pointer accent-[var(--brand)] disabled:cursor-default" aria-describedby="diff-stage" />
        <div class="flex justify-between text-xs font-bold text-ink-2"><span>← 生成方向</span><span>訓練方向 →</span></div>
        <button type="button" class="mt-4 min-h-11 rounded-full border-2 border-brand bg-brand px-5 text-sm font-bold text-on-brand disabled:opacity-60"
                :disabled="playing" @click="play">{{ playing ? '生成中…' : '▶ 播放生成過程（從雜訊到圖片）' }}</button>
        <p id="diff-stage" class="mt-4 rounded-[var(--radius-btn)] bg-brand-soft px-4 py-3 font-bold leading-[1.7]" aria-live="polite">{{ stage }}</p>
      </div>
    </div>
    <p class="mt-4 text-sm leading-[1.7] text-ink-2">這是簡化的示意。真正的擴散模型會在數十到上千個步驟中逐步去雜訊，而且模型生成的是「全新的圖」，不是還原某一張特定的原圖。</p>
  </section>
</template>
