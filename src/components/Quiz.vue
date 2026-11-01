<script setup lang="ts">
// One question per card. Every option reveals its own explanation after answering,
// because the exam is scenario-based: knowing why distractors are wrong matters most.
// All text is rendered with {{ }} interpolation (auto-escaped) — never v-html.
import { computed, onMounted, ref } from 'vue'
import { readPicks, writePicks, type Picks } from '../lib/progress'

interface Option { text: string; why: string }
interface Question { id: string; code?: string; stem: string; options: Option[]; answer: number }

const props = defineProps<{ lessonId: string; questions: Question[]; title?: string }>()

const letters = ['A', 'B', 'C', 'D']
const picks = ref<Picks>({})
const current = ref(0)
const showSummary = ref(false)
const announce = ref('')

onMounted(() => {
  picks.value = readPicks(props.lessonId)
  const firstOpen = props.questions.findIndex(q => !(q.id in picks.value))
  if (firstOpen === -1 && props.questions.length) showSummary.value = true
  else current.value = Math.max(firstOpen, 0)
})

const q = computed(() => props.questions[current.value])
const answered = computed(() => props.questions.filter(x => x.id in picks.value).length)
const correct = computed(() => props.questions.filter(x => picks.value[x.id] === x.answer).length)
const isAnswered = computed(() => q.value.id in picks.value)
const isLast = computed(() => current.value === props.questions.length - 1)

function choose(i: number) {
  if (isAnswered.value) return
  picks.value = { ...picks.value, [q.value.id]: i }
  writePicks(props.lessonId, picks.value)
  announce.value = i === q.value.answer ? '答對了！' : `答錯了，正解是 ${letters[q.value.answer]}`
}

function next() {
  if (isLast.value) showSummary.value = true
  else current.value++
}

function goTo(i: number) {
  current.value = i
  showSummary.value = false
}

function reset() {
  picks.value = {}
  writePicks(props.lessonId, {})
  goTo(0)
}

function state(i: number): 'answer' | 'wrong' | 'dim' | 'idle' {
  if (!isAnswered.value) return 'idle'
  if (i === q.value.answer) return 'answer'
  if (i === picks.value[q.value.id]) return 'wrong'
  return 'dim'
}

const optionClass = {
  idle: 'border-line bg-surface hover:border-brand hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]',
  answer: 'border-ok bg-ok-soft',
  wrong: 'border-bad bg-bad-soft',
  dim: 'border-line bg-surface opacity-75'
}
const letterClass = {
  idle: 'bg-surface-2 text-ink-2',
  answer: 'bg-ok text-surface',
  wrong: 'bg-bad text-surface',
  dim: 'bg-surface-2 text-ink-2'
}

const verdict = computed(() => {
  const r = props.questions.length ? correct.value / props.questions.length : 0
  if (r === 1) return { emoji: '🏆', text: '全部答對！這個單元你已經掌握了。' }
  if (r >= 0.6) return { emoji: '👍', text: '很不錯！點下面答錯的題目，再看一次每個選項的解析。' }
  return { emoji: '🌱', text: '沒關係，回到上面再讀一次重點，然後重新作答看看。' }
})
</script>

<template>
  <section class="not-prose my-10 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-soft)]" aria-labelledby="quiz-title">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-4 sm:px-6">
      <h2 id="quiz-title" class="flex items-center gap-2 text-lg font-extrabold">
        <span aria-hidden="true">📝</span>{{ title ?? '情境小測驗' }}
      </h2>
      <div class="flex items-center gap-3 text-sm font-bold text-ink-2">
        <span>{{ answered }} / {{ questions.length }}</span>
        <progress
          class="h-2 w-24 overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-brand [&::-webkit-progress-value]:transition-all"
          :value="answered" :max="questions.length" aria-label="作答進度"
        />
      </div>
    </header>

    <p class="sr-only" aria-live="polite">{{ announce }}</p>

    <!-- Question card -->
    <div v-if="!showSummary && q" class="px-5 py-6 sm:px-6">
      <nav class="mb-5 flex flex-wrap gap-2" aria-label="題目">
        <button
          v-for="(item, i) in questions" :key="item.id" type="button"
          class="grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold transition-colors"
          :class="[
            i === current ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface' : '',
            !(item.id in picks) ? 'bg-surface-2 text-ink-2'
              : picks[item.id] === item.answer ? 'bg-ok text-surface' : 'bg-bad text-surface'
          ]"
          :aria-label="`第 ${i + 1} 題`" :aria-current="i === current ? 'step' : undefined"
          @click="goTo(i)"
        >{{ i + 1 }}</button>
      </nav>

      <p class="mb-5 text-[17px] font-semibold leading-[1.8]">
        <span v-if="q.code" class="mr-2 inline-flex rounded-full bg-brand-soft px-2.5 py-0.5 align-[2px] text-xs font-bold text-brand">{{ q.code }}</span>{{ q.stem }}
      </p>

      <ul class="space-y-3">
        <li v-for="(opt, i) in q.options" :key="i">
          <button
            type="button"
            class="flex min-h-14 w-full items-start gap-3 rounded-[var(--radius-btn)] border-2 px-4 py-3 text-left leading-[1.7] transition-all disabled:cursor-default"
            :class="optionClass[state(i)]"
            :disabled="isAnswered"
            @click="choose(i)"
          >
            <span class="grid h-7 w-7 flex-none place-items-center rounded-full text-sm font-extrabold" :class="letterClass[state(i)]">{{ letters[i] }}</span>
            <span class="pt-0.5">{{ opt.text }}</span>
          </button>
          <p v-if="isAnswered" class="mt-2 px-2 text-[15px] leading-[1.75]"
             :class="state(i) === 'answer' ? 'text-ok' : state(i) === 'wrong' ? 'text-bad' : 'text-ink-2'">
            <strong class="font-extrabold">{{ state(i) === 'answer' ? '✅ 正解' : state(i) === 'wrong' ? '❌ 你選的' : '為什麼不是' }}：</strong>{{ opt.why }}
          </p>
        </li>
      </ul>

      <div v-if="isAnswered" class="mt-6 flex justify-end">
        <button type="button" class="min-h-12 rounded-[var(--radius-btn)] bg-brand px-6 font-extrabold text-on-brand shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5" @click="next">
          {{ isLast ? '看結果 →' : '下一題 →' }}
        </button>
      </div>
    </div>

    <!-- Summary card -->
    <div v-else-if="showSummary" class="px-5 py-8 text-center sm:px-6">
      <p class="text-5xl" aria-hidden="true">{{ verdict.emoji }}</p>
      <p class="mt-3 text-2xl font-extrabold">{{ questions.length }} 題答對 {{ correct }} 題</p>
      <p class="mx-auto mt-2 max-w-md text-ink-2">{{ verdict.text }}</p>
      <ul class="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
        <li v-for="(item, i) in questions" :key="item.id">
          <button type="button" class="min-h-11 rounded-full px-4 text-sm font-bold"
                  :class="picks[item.id] === item.answer ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'" @click="goTo(i)">
            第 {{ i + 1 }} 題 {{ picks[item.id] === item.answer ? '✓' : '✗' }}
          </button>
        </li>
      </ul>
      <button type="button" class="mt-6 min-h-12 rounded-[var(--radius-btn)] border-2 border-line px-6 font-extrabold transition-colors hover:border-brand" @click="reset">
        重新作答
      </button>
    </div>
  </section>
</template>
