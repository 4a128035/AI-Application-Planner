<script setup lang="ts">
// "Put the steps in order" drill. Pass the steps in the CORRECT order plus a fixed display order (`mix`),
// so the server and browser render the same shuffled list. Tap steps to build an answer, then check it.
import { computed, ref } from 'vue'

interface Step { text: string; why: string }
const props = defineProps<{ title: string; steps: Step[]; mix: number[] }>()

const picked = ref<number[]>([])
const done = computed(() => picked.value.length === props.steps.length)
const correct = computed(() => picked.value.filter((s, i) => s === i).length)
const allRight = computed(() => done.value && correct.value === props.steps.length)

function tap(i: number) { if (!picked.value.includes(i)) picked.value = [...picked.value, i] }
function undo() { picked.value = picked.value.slice(0, -1) }
function reset() { picked.value = [] }
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" :aria-label="title">
    <h3 class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🔢</span>{{ title }}</h3>
    <p class="mt-1 text-sm text-ink-2">依照你認為的正確順序，逐一點選下面的步驟。</p>

    <div class="mt-4 grid gap-2">
      <button v-for="i in mix" :key="i" type="button" :disabled="picked.includes(i)"
              class="flex min-h-11 items-start gap-3 rounded-[var(--radius-btn)] border-2 px-3 py-2.5 text-left text-[15px] leading-[1.6] transition-colors disabled:cursor-default"
              :class="picked.includes(i) ? 'border-line bg-surface-2 opacity-60' : 'border-line bg-surface hover:border-accent'"
              @click="tap(i)">
        <span class="grid size-7 flex-none place-items-center rounded-full text-sm font-extrabold"
              :class="picked.includes(i) ? 'bg-accent text-on-brand' : 'bg-surface-2'">{{ picked.includes(i) ? picked.indexOf(i) + 1 : '？' }}</span>
        <span>{{ steps[i].text }}</span>
      </button>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <button v-if="picked.length && !done" type="button" class="min-h-11 rounded-full border-2 border-line px-4 text-sm font-bold hover:border-accent" @click="undo">↶ 復原一步</button>
      <button v-if="picked.length" type="button" class="min-h-11 rounded-full border-2 border-line px-4 text-sm font-bold hover:border-accent" @click="reset">↺ 重來</button>
    </div>

    <div v-if="done" class="mt-4 rounded-[var(--radius-btn)] px-4 py-3" :class="allRight ? 'bg-ok-soft' : 'bg-warn-soft'" aria-live="polite">
      <p class="font-extrabold">{{ allRight ? '🏆 完全正確！' : `${steps.length} 步中排對 ${correct} 步。正確順序是：` }}</p>
      <ol class="mt-2 space-y-1.5 text-[15px] leading-[1.7]">
        <li v-for="(s, i) in steps" :key="i">
          <strong>{{ i + 1 }}. {{ s.text }}</strong>
          <span class="block text-ink-2">{{ s.why }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>
