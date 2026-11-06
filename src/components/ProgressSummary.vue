<script setup lang="ts">
// Home-page widget: how far this reader has got, read from the quiz progress in this browser.
// One bar per subject, counted against the lessons published so far.
import { computed, onMounted, ref } from 'vue'
import { readPicks } from '../lib/progress'

interface LessonInfo { id: string; subject: string; title: string; emoji: string; href: string; total: number }
interface SubjectInfo { id: string; short: string; tone: 'brand' | 'accent' }
const props = defineProps<{ lessons: LessonInfo[]; subjects: SubjectInfo[] }>()

const done = ref<Record<string, number>>({})
const ready = ref(false)

onMounted(() => {
  done.value = Object.fromEntries(props.lessons.map(l => [l.id, Object.keys(readPicks(l.id)).length]))
  ready.value = true
})

const isDone = (l: LessonInfo) => l.total > 0 && (done.value[l.id] ?? 0) >= l.total
const finished = computed(() => props.lessons.filter(isDone).length)
const rows = computed(() => props.subjects.map(s => {
  const list = props.lessons.filter(l => l.subject === s.id)
  return { ...s, total: list.length, finished: list.filter(isDone).length }
}))
const nextLesson = computed(() => props.lessons.find(l => (done.value[l.id] ?? 0) < l.total) ?? props.lessons[0])
const greeting = computed(() => {
  if (!ready.value || finished.value === 0) return '今天讀 15 分鐘就好，從第一課開始吧 ☕'
  if (finished.value === props.lessons.length) return '目前上線的課你都讀完了！等新課程或到模擬考挑戰看看 💪'
  return `已經完成 ${finished.value} 課，繼續保持 🔥`
})

const bar = {
  brand: '[&::-moz-progress-bar]:bg-brand [&::-webkit-progress-value]:bg-brand',
  accent: '[&::-moz-progress-bar]:bg-accent [&::-webkit-progress-value]:bg-accent'
} as const
</script>

<template>
  <div class="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
    <p class="font-bold">{{ greeting }}</p>
    <ul class="mt-4 space-y-3">
      <li v-for="r in rows" :key="r.id" class="flex items-center gap-3">
        <span class="w-14 shrink-0 text-sm font-extrabold">{{ r.short }}</span>
        <template v-if="r.total">
          <progress
            class="h-3 flex-1 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-surface-2" :class="bar[r.tone]"
            :value="r.finished" :max="r.total" :aria-label="`${r.short}完成進度`"
          />
          <span class="w-16 shrink-0 text-right text-sm font-extrabold text-ink-2">{{ r.finished }} / {{ r.total }} 課</span>
        </template>
        <span v-else class="flex-1 text-sm font-bold text-ink-2">即將上線</span>
      </li>
    </ul>
    <p class="mt-2 text-xs font-bold text-ink-2">完成一課＝做完該課的小測驗。進度只存在這個瀏覽器裡。</p>
    <a v-if="nextLesson" :href="nextLesson.href"
       class="mt-5 flex min-h-14 items-center gap-3 rounded-[var(--radius-btn)] bg-brand px-5 font-extrabold text-on-brand shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5">
      <span aria-hidden="true" class="text-xl">{{ nextLesson.emoji }}</span>
      <span class="flex-1">{{ finished ? '繼續讀' : '開始讀' }}：{{ nextLesson.title }}</span>
      <span aria-hidden="true">→</span>
    </a>
  </div>
</template>
