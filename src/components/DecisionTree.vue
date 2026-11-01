<script setup lang="ts">
// Step-by-step "answer a question, see the next one" flowchart.
// tree.nodes: question nodes; tree.results: leaf cards. A choice's `to` points at either.
import { computed, ref } from 'vue'

interface Choice { label: string; to: string }
interface Node { q: string; choices: Choice[] }
interface Result { emoji: string; title: string; desc: string }
interface Tree { title: string; start: string; nodes: Record<string, Node>; results: Record<string, Result> }

const props = defineProps<{ tree: Tree }>()

// Each step remembers which choice was taken so the path reads like a conversation.
const steps = ref<{ id: string; picked?: number }[]>([{ id: props.tree.start }])
const last = computed(() => steps.value[steps.value.length - 1])
const result = computed(() => props.tree.results[last.value.id])

function pick(stepIndex: number, choiceIndex: number) {
  const id = steps.value[stepIndex].id
  const to = props.tree.nodes[id].choices[choiceIndex].to
  steps.value = [...steps.value.slice(0, stepIndex), { id, picked: choiceIndex }, { id: to }]
}

function restart() {
  steps.value = [{ id: props.tree.start }]
}
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-label="互動判斷流程">
    <div class="mb-5 flex items-center justify-between gap-3">
      <h3 class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🧭</span>{{ tree.title }}</h3>
      <button v-if="steps.length > 1" type="button" class="min-h-11 rounded-full px-4 text-sm font-bold text-ink-2 hover:bg-surface-2" @click="restart">↺ 從頭開始</button>
    </div>

    <ol class="space-y-4">
      <template v-for="(step, si) in steps" :key="si + step.id">
        <li v-if="tree.nodes[step.id]" class="relative pl-10">
          <span class="absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full bg-brand text-sm font-extrabold text-on-brand">{{ si + 1 }}</span>
          <span v-if="si < steps.length - 1" class="absolute left-[13px] top-8 bottom-[-12px] w-0.5 bg-line" aria-hidden="true" />
          <p class="mb-3 font-bold leading-[1.7]">{{ tree.nodes[step.id].q }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(c, ci) in tree.nodes[step.id].choices" :key="ci" type="button"
              class="min-h-11 rounded-full border-2 px-4 text-[15px] font-bold transition-colors"
              :class="step.picked === ci ? 'border-brand bg-brand text-on-brand'
                : step.picked === undefined ? 'border-line bg-surface hover:border-brand' : 'border-line bg-surface text-ink-2 opacity-70 hover:opacity-100'"
              :aria-pressed="step.picked === ci"
              @click="pick(si, ci)"
            >{{ c.label }}</button>
          </div>
        </li>
      </template>
    </ol>

    <div v-if="result" class="mt-6 flex items-start gap-4 rounded-[var(--radius-card)] bg-brand-soft p-5" aria-live="polite">
      <span class="text-4xl" aria-hidden="true">{{ result.emoji }}</span>
      <div>
        <p class="text-xl font-extrabold text-brand">{{ result.title }}</p>
        <p class="mt-1 leading-[1.75]">{{ result.desc }}</p>
      </div>
    </div>
  </section>
</template>
