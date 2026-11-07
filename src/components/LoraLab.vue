<script setup lang="ts">
// LoRA calculator for one d×d weight matrix: full fine-tuning updates d² numbers,
// LoRA trains two thin matrices (d×r and r×d) = 2·d·r numbers. SVG sizes are attributes (CSP-safe).
import { computed, ref } from 'vue'

const dims = [1024, 4096, 8192]
const ranks = [1, 2, 4, 8, 16, 32, 64]
const d = ref(4096)
const ri = ref(3)
const r = computed(() => ranks[ri.value])

const full = computed(() => d.value * d.value)
const lora = computed(() => 2 * d.value * r.value)
const pct = computed(() => (lora.value / full.value) * 100)
const fmt = (n: number) => n.toLocaleString('en-US')
const pctText = computed(() => pct.value >= 1 ? `${pct.value.toFixed(1)}%` : pct.value >= 0.1 ? `${pct.value.toFixed(2)}%` : `${pct.value.toFixed(3)}%`)

const S = 150
const thin = computed(() => Math.max((r.value / d.value) * S, 2))
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="lora-title">
    <h3 id="lora-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🧮</span>LoRA 計算機：只訓練「一小條」</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      模型裡有很多 d × d 的權重矩陣。<strong class="text-ink">完整微調</strong>要更新整個矩陣；<strong class="text-ink">LoRA</strong> 則把原矩陣凍結，只訓練兩個很「瘦」的小矩陣（d × r 和 r × d），r 就是「秩」（rank）。
    </p>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <div class="rounded-[var(--radius-btn)] bg-surface-2 p-3" role="group" aria-label="矩陣大小 d">
        <p class="text-sm font-extrabold">矩陣大小 d</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button v-for="v in dims" :key="v" type="button" class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors"
                  :class="d === v ? 'border-accent bg-accent text-on-brand' : 'border-line bg-surface hover:border-accent'"
                  :aria-pressed="d === v" @click="d = v">{{ fmt(v) }}</button>
        </div>
      </div>
      <div class="rounded-[var(--radius-btn)] bg-surface-2 p-3">
        <label for="lora-r" class="flex items-baseline justify-between text-sm font-extrabold"><span>秩 r</span><span class="text-xl text-accent">{{ r }}</span></label>
        <input id="lora-r" v-model.number="ri" type="range" min="0" :max="ranks.length - 1" step="1"
               class="mt-1 h-11 w-full cursor-pointer accent-[var(--accent)]" :aria-valuetext="`r = ${r}`" aria-describedby="lora-result" />
      </div>
    </div>

    <div class="mt-5 grid items-center gap-4 sm:grid-cols-2">
      <svg :viewBox="`0 0 ${S * 2 + 60} ${S + 30}`" class="mx-auto block w-full max-w-[22rem]" role="img"
           :aria-label="`完整矩陣 ${fmt(full)} 個參數，LoRA 只有 ${fmt(lora)} 個`">
        <rect x="0" y="0" :width="S" :height="S" rx="6" class="fill-line" />
        <text :x="S / 2" :y="S + 22" text-anchor="middle" class="fill-ink-2 text-[13px] font-bold">完整微調 d × d</text>
        <rect :x="S + 40" y="0" :width="thin" :height="S" rx="2" class="fill-accent" />
        <rect :x="S + 40 + thin + 8" y="0" :width="S - thin - 8" :height="thin" rx="2" class="fill-accent" />
        <text :x="S + 40 + S / 2" :y="S + 22" text-anchor="middle" class="fill-ink-2 text-[13px] font-bold">LoRA：d × r ＋ r × d</text>
      </svg>
      <dl class="space-y-2 text-[15px]">
        <div class="flex justify-between gap-3 rounded-[var(--radius-btn)] bg-surface-2 px-4 py-2"><dt class="font-bold">完整微調</dt><dd class="font-extrabold">{{ fmt(full) }}</dd></div>
        <div class="flex justify-between gap-3 rounded-[var(--radius-btn)] bg-accent-soft px-4 py-2"><dt class="font-bold">LoRA</dt><dd class="font-extrabold">{{ fmt(lora) }}</dd></div>
      </dl>
    </div>

    <p id="lora-result" class="mt-4 rounded-[var(--radius-btn)] bg-accent-soft px-4 py-3 font-bold leading-[1.7]" aria-live="polite">
      LoRA 要訓練的參數只有完整微調的 {{ pctText }}。r 越大，能學的變化越多，但要訓練的參數也越多。
    </p>
    <p class="mt-3 text-sm leading-[1.7] text-ink-2">這裡只算一個矩陣。真實模型有上百個這樣的矩陣，但比例相同。</p>
  </section>
</template>
