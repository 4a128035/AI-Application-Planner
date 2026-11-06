<script setup lang="ts">
// k-anonymity lab: the reader plays an attacker who knows a neighbour's zip, age and gender,
// then generalises columns to see when she stops being unique — and when k alone still leaks.
import { computed, reactive } from 'vue'

interface Row { zip: string; age: number; sex: string; dx: string }
const rows: Row[] = [
  { zip: '701', age: 28, sex: '女', dx: '流感' },   // 目標：鄰居林小姐
  { zip: '701', age: 24, sex: '女', dx: '流感' },
  { zip: '702', age: 23, sex: '男', dx: '胃炎' },
  { zip: '702', age: 29, sex: '男', dx: '糖尿病' },
  { zip: '704', age: 41, sex: '女', dx: '高血壓' },
  { zip: '704', age: 47, sex: '女', dx: '糖尿病' },
  { zip: '708', age: 45, sex: '男', dx: '胃炎' },
  { zip: '708', age: 43, sex: '男', dx: '高血壓' }
]
const TARGET = 0

const groups = [
  { id: 'zip', label: '郵遞區號', levels: ['完整區號', '只留 70*', '隱藏'] },
  { id: 'age', label: '年齡', levels: ['實際年齡', '10 歲區間', '隱藏'] },
  { id: 'sex', label: '性別', levels: ['保留', '隱藏'] }
] as const
const lv = reactive({ zip: 0, age: 0, sex: 0 })

const show = (r: Row) => ({
  zip: lv.zip === 0 ? r.zip : lv.zip === 1 ? '70*' : '＊',
  age: lv.age === 0 ? String(r.age) : lv.age === 1 ? `${Math.floor(r.age / 10) * 10}–${Math.floor(r.age / 10) * 10 + 9}` : '＊',
  sex: lv.sex === 0 ? r.sex : '＊'
})
const key = (r: Row) => { const s = show(r); return `${s.zip}|${s.age}|${s.sex}` }

const table = computed(() => rows.map((r, i) => ({ ...show(r), dx: r.dx, i, match: key(r) === key(rows[TARGET]) })))
const matches = computed(() => table.value.filter(r => r.match))
const k = computed(() => {
  const n: Record<string, number> = {}
  rows.forEach(r => { n[key(r)] = (n[key(r)] ?? 0) + 1 })
  return Math.min(...Object.values(n))
})
const dxKinds = computed(() => [...new Set(matches.value.map(r => r.dx))])
const allHidden = computed(() => lv.zip === 2 && lv.age === 2 && lv.sex === 1)

const verdict = computed(() => {
  const n = matches.value.length
  if (n === 1) return { tone: 'bad', icon: '🚨', text: `只剩 1 人符合：一定是她，診斷「${rows[TARGET].dx}」曝光了。` }
  if (dxKinds.value.length === 1) return { tone: 'warn', icon: '⚠️', text: `有 ${n} 人符合，看起來安全，但他們的診斷全是「${dxKinds.value[0]}」。不用知道是哪一位，也知道她得了${dxKinds.value[0]}。這叫「同質性攻擊」。` }
  return { tone: 'ok', icon: '✅', text: `有 ${n} 人符合，診斷有 ${dxKinds.value.length} 種，攻擊者無法確定她的病。` }
})
const toneClass = { bad: 'bg-bad-soft text-bad', warn: 'bg-warn-soft text-warn', ok: 'bg-ok-soft text-ok' } as const

const btn = (on: boolean) => on ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface hover:border-brand'
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="k-title">
    <h3 id="k-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🕵️</span>當一次攻擊者：認得出鄰居嗎？</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">
      某診所公開了一份「已刪除姓名」的就診資料。你知道鄰居林小姐<strong class="text-ink">住 701 區、28 歲、女性</strong>，也知道她最近去過這間診所。
      試著把欄位「模糊化」，看看要模糊到什麼程度，才認不出她。
    </p>

    <div class="mt-5 grid gap-4 sm:grid-cols-3">
      <div v-for="g in groups" :key="g.id" class="rounded-[var(--radius-btn)] bg-surface-2 p-3" role="group" :aria-label="g.label">
        <p class="text-sm font-extrabold">{{ g.label }}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button v-for="(name, i) in g.levels" :key="name" type="button"
                  class="min-h-11 rounded-full border-2 px-3 text-sm font-bold transition-colors"
                  :class="btn(lv[g.id] === i)" :aria-pressed="lv[g.id] === i"
                  @click="lv[g.id] = i">{{ name }}</button>
        </div>
      </div>
    </div>

    <div class="mt-5 overflow-x-auto rounded-[var(--radius-btn)] border border-line">
      <table class="w-full text-center text-[15px]">
        <caption class="sr-only">公開的就診資料，符合林小姐條件的列會被標示</caption>
        <thead class="bg-surface-2 text-sm">
          <tr><th scope="col" class="px-2 py-2">郵遞區號</th><th scope="col" class="px-2 py-2">年齡</th><th scope="col" class="px-2 py-2">性別</th><th scope="col" class="px-2 py-2">診斷</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in table" :key="r.i" class="border-t border-line" :class="r.match ? 'bg-brand-soft font-extrabold' : ''">
            <td class="px-2 py-2">{{ r.zip }}</td>
            <td class="px-2 py-2">{{ r.age }}</td>
            <td class="px-2 py-2">{{ r.sex }}</td>
            <td class="px-2 py-2">{{ r.dx }}<span v-if="r.match" class="sr-only">（符合條件）</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex flex-wrap gap-3 text-sm font-bold">
      <span class="rounded-full bg-surface-2 px-3 py-1">符合她條件的人：{{ matches.length }} 位</span>
      <span class="rounded-full bg-surface-2 px-3 py-1">整份資料 k = {{ k }}</span>
    </div>

    <p class="mt-3 rounded-[var(--radius-btn)] px-4 py-3 font-bold leading-[1.7]" :class="toneClass[verdict.tone]" aria-live="polite">
      <span aria-hidden="true">{{ verdict.icon }}</span> <span class="text-ink">{{ verdict.text }}</span>
    </p>
    <p v-if="allHidden" class="mt-3 text-[15px] leading-[1.75] text-ink-2">
      全部隱藏最安全，但研究人員也沒辦法分析地區、年齡和性別了。<strong class="text-ink">隱私和資料的分析價值，需要取捨。</strong>
    </p>
  </section>
</template>
