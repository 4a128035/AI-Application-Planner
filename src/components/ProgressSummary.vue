<script setup lang="ts">
// Home-page widget: how far this reader has got, read from the quiz progress in this browser.
import { computed, onMounted, ref } from 'vue'
import { readPicks } from '../lib/progress'

interface LessonInfo { id: string; title: string; emoji: string; href: string; total: number }
const props = defineProps<{ lessons: LessonInfo[]; plannedTotal: number }>()

const done = ref<Record<string, number>>({})
const ready = ref(false)

onMounted(() => {
  done.value = Object.fromEntries(props.lessons.map(l => [l.id, Object.keys(readPicks(l.id)).length]))
  ready.value = true
})

const finished = computed(() => props.lessons.filter(l => l.total > 0 && (done.value[l.id] ?? 0) >= l.total).length)
const nextLesson = computed(() => props.lessons.find(l => (done.value[l.id] ?? 0) < l.total) ?? props.lessons[0])
const greeting = computed(() => {
  if (!ready.value || finished.value === 0) return '今天讀 15 分鐘就好，從第一個單元開始吧 ☕'
  if (finished.value === props.lessons.length) return '目前上線的單元你都讀完了！等新單元或到模擬考挑戰看看 💪'
  return `已經完成 ${finished.value} 個單元，繼續保持 🔥`
})
</script>

<template>
  <div class="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
    <p class="font-bold">{{ greeting }}</p>
    <div class="mt-4 flex items-center gap-3">
      <progress
        class="h-3 flex-1 overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-surface-2 [&::-webkit-progress-value]:bg-brand"
        :value="finished" :max="plannedTotal" aria-label="全部單元完成進度"
      />
      <span class="text-sm font-extrabold text-ink-2">{{ finished }} / {{ plannedTotal }} 單元</span>
    </div>
    <a v-if="nextLesson" :href="nextLesson.href"
       class="mt-5 flex min-h-14 items-center gap-3 rounded-[var(--radius-btn)] bg-brand px-5 font-extrabold text-on-brand shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5">
      <span aria-hidden="true" class="text-xl">{{ nextLesson.emoji }}</span>
      <span class="flex-1">{{ finished ? '繼續讀' : '開始讀' }}：{{ nextLesson.title }}</span>
      <span aria-hidden="true">→</span>
    </a>
  </div>
</template>
