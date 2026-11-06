<script setup lang="ts">
// One street scene, three computer-vision outputs: classification (one label), detection (boxes),
// segmentation (every pixel coloured by class). Pure SVG with class-based colours (CSP-safe).
import { computed, ref } from 'vue'

type Mode = 'cls' | 'det' | 'seg'
const mode = ref<Mode>('cls')
const modes: { id: Mode; label: string }[] = [
  { id: 'cls', label: '影像分類' },
  { id: 'det', label: '物件偵測' },
  { id: 'seg', label: '影像分割' }
]

const boxes = [
  { label: '汽車 97%', x: 104, y: 118, w: 92, h: 62 },
  { label: '汽車 91%', x: 209, y: 130, w: 82, h: 56 },
  { label: '樹 88%', x: 16, y: 32, w: 62, h: 82 }
]
const legend = [
  { cls: 'bg-info', label: '天空' },
  { cls: 'bg-brand', label: '樹' },
  { cls: 'bg-ok', label: '草地' },
  { cls: 'bg-warn', label: '道路' },
  { cls: 'bg-bad', label: '汽車' }
]

const info = computed(() => ({
  cls: { out: '整張圖 → 1 個標籤', text: '模型只回答「這張圖是什麼」：街景，有車。不知道車在哪裡、有幾台。', use: '例：判斷照片裡有沒有煙霧、這顆蘋果熟了沒' },
  det: { out: '每個物件 → 方框 ＋ 類別 ＋ 信心分數', text: '模型找出「有什麼、在哪裡」，用方框框起來，可以數出有 2 台車。', use: '例：統計安全帽配戴率、找出貨架缺貨的位置' },
  seg: { out: '每個像素 → 1 個類別', text: '模型替每一個像素標上類別，邊界最精確，可以算出道路、草地各占多少面積。', use: '例：標出煙霧的精確範圍、計算道路受損面積' }
}[mode.value]))
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="cv-title">
    <h3 id="cv-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">👁️</span>同一張圖，三種電腦視覺任務</h3>

    <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="選擇任務">
      <button v-for="m in modes" :key="m.id" type="button"
              class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors"
              :class="mode === m.id ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface hover:border-brand'"
              :aria-pressed="mode === m.id" @click="mode = m.id">{{ m.label }}</button>
    </div>

    <svg viewBox="0 0 320 200" class="mx-auto mt-4 block w-full max-w-[32rem] overflow-hidden rounded-[var(--radius-btn)]" role="img"
         :aria-label="`街景示意圖，目前顯示${modes.find(m => m.id === mode)?.label}的結果：${info.out}`">
      <!-- 場景 -->
      <rect x="0" y="0" width="320" height="92" class="fill-info-soft" />
      <rect x="0" y="92" width="320" height="40" class="fill-ok-soft" />
      <rect x="0" y="132" width="320" height="68" class="fill-line" />
      <rect x="0" y="163" width="320" height="3" class="fill-surface" />
      <rect x="41" y="74" width="10" height="38" class="fill-warn" />
      <circle cx="46" cy="62" r="26" class="fill-ok" />
      <g class="fill-ink-2">
        <rect x="110" y="140" width="80" height="28" rx="6" /><rect x="128" y="124" width="44" height="22" rx="6" />
        <rect x="215" y="152" width="70" height="24" rx="6" /><rect x="230" y="138" width="38" height="18" rx="6" />
      </g>
      <g class="fill-ink"><circle cx="128" cy="170" r="8" /><circle cx="172" cy="170" r="8" /><circle cx="232" cy="178" r="7" /><circle cx="268" cy="178" r="7" /></g>

      <!-- 分割：每個區域上色 -->
      <g v-if="mode === 'seg'" fill-opacity="0.6">
        <rect x="0" y="0" width="320" height="92" class="fill-info" />
        <rect x="0" y="92" width="320" height="40" class="fill-ok" />
        <rect x="0" y="132" width="320" height="68" class="fill-warn" />
        <rect x="41" y="74" width="10" height="38" class="fill-brand" /><circle cx="46" cy="62" r="26" class="fill-brand" />
        <g class="fill-bad">
          <rect x="110" y="140" width="80" height="28" rx="6" /><rect x="128" y="124" width="44" height="22" rx="6" />
          <circle cx="128" cy="170" r="8" /><circle cx="172" cy="170" r="8" />
          <rect x="215" y="152" width="70" height="24" rx="6" /><rect x="230" y="138" width="38" height="18" rx="6" />
          <circle cx="232" cy="178" r="7" /><circle cx="268" cy="178" r="7" />
        </g>
      </g>

      <!-- 偵測：方框 -->
      <g v-if="mode === 'det'">
        <g v-for="b in boxes" :key="b.label">
          <rect :x="b.x" :y="b.y" :width="b.w" :height="b.h" fill="none" class="stroke-bad" stroke-width="3" stroke-dasharray="6 4" rx="3" />
          <rect :x="b.x" :y="b.y - 16" :width="b.label.length * 8 + 10" height="16" class="fill-bad" rx="3" />
          <text :x="b.x + 5" :y="b.y - 4" class="fill-surface text-[11px] font-extrabold">{{ b.label }}</text>
        </g>
      </g>

      <!-- 分類：一個標籤 -->
      <g v-if="mode === 'cls'">
        <rect x="186" y="12" width="122" height="30" rx="15" class="fill-surface stroke-brand" stroke-width="2" />
        <text x="247" y="32" text-anchor="middle" class="fill-ink text-[13px] font-extrabold">街景（有車）</text>
      </g>
    </svg>

    <ul v-if="mode === 'seg'" class="mt-3 flex flex-wrap justify-center gap-3 text-sm font-bold" aria-label="分割顏色說明">
      <li v-for="l in legend" :key="l.label" class="flex items-center gap-1.5"><span class="inline-block size-3 rounded-sm opacity-70" :class="l.cls" aria-hidden="true"></span>{{ l.label }}</li>
    </ul>

    <div class="mt-4 rounded-[var(--radius-btn)] bg-brand-soft px-4 py-3" aria-live="polite">
      <p class="font-extrabold">輸出：{{ info.out }}</p>
      <p class="mt-1 leading-[1.7]">{{ info.text }}</p>
      <p class="mt-1 text-sm font-bold text-ink-2">{{ info.use }}</p>
    </div>
  </section>
</template>
