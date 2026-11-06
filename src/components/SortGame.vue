<script setup lang="ts">
// Quick "which bucket?" drill: each item gets one tap, instant feedback and a one-line reason.
// Reusable: pass any buckets and items. Text is interpolated (escaped), never v-html.
import { computed, ref } from 'vue'

interface Bucket { id: string; label: string; emoji: string }
interface Item { text: string; emoji: string; answer: string; why: string }
const props = defineProps<{ title: string; buckets: Bucket[]; items: Item[] }>()

const picks = ref<Record<number, string>>({})
const done = computed(() => Object.keys(picks.value).length)
const correct = computed(() => props.items.filter((it, i) => picks.value[i] === it.answer).length)
const label = (id: string) => props.buckets.find(b => b.id === id)?.label ?? id

function pick(i: number, bucket: string) {
  if (i in picks.value) return
  picks.value = { ...picks.value, [i]: bucket }
}
function reset() { picks.value = {} }

function btnClass(i: number, b: string) {
  if (!(i in picks.value)) return 'border-line bg-surface hover:border-brand'
  if (b === props.items[i].answer) return 'border-ok bg-ok-soft text-ok'
  if (b === picks.value[i]) return 'border-bad bg-bad-soft text-bad'
  return 'border-line bg-surface opacity-60'
}
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" :aria-label="title">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🧺</span>{{ title }}</h3>
      <span class="text-sm font-bold text-ink-2" aria-live="polite">{{ done }} / {{ items.length }}・答對 {{ correct }}</span>
    </div>

    <ol class="mt-5 space-y-4">
      <li v-for="(it, i) in items" :key="i" class="rounded-[var(--radius-btn)] bg-surface-2 p-4">
        <p class="flex items-start gap-3 font-bold leading-[1.7]">
          <span class="text-2xl" aria-hidden="true">{{ it.emoji }}</span>
          <span>{{ it.text }}</span>
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="b in buckets" :key="b.id" type="button"
            class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors disabled:cursor-default"
            :class="btnClass(i, b.id)" :disabled="i in picks"
            @click="pick(i, b.id)"
          ><span aria-hidden="true">{{ b.emoji }}</span> {{ b.label }}</button>
        </div>
        <p v-if="i in picks" class="mt-3 text-[15px] leading-[1.7]" :class="picks[i] === it.answer ? 'text-ok' : 'text-bad'">
          <strong class="font-extrabold">{{ picks[i] === it.answer ? '✅ 答對' : `❌ 答案是「${label(it.answer)}」` }}：</strong>
          <span class="text-ink">{{ it.why }}</span>
        </p>
      </li>
    </ol>

    <div v-if="done === items.length" class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-btn)] bg-brand-soft px-4 py-3">
      <span class="font-extrabold">{{ items.length }} 題答對 {{ correct }} 題 {{ correct === items.length ? '🏆' : '👍' }}</span>
      <button type="button" class="min-h-11 rounded-full border-2 border-line bg-surface px-4 text-sm font-bold hover:border-brand" @click="reset">再玩一次</button>
    </div>
  </section>
</template>
