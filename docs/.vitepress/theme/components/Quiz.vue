<script setup lang="ts">
// Usage in Markdown: put questions in the page frontmatter under `quiz:`,
// then write <Quiz :questions="$frontmatter.quiz" />
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

interface Option { text: string; why: string }
interface Question { id: string; code?: string; stem: string; options: Option[]; answer: number }

const props = defineProps<{ questions: Question[]; title?: string }>()
const { page } = useData()

const letters = ['A', 'B', 'C', 'D', 'E']
const picked = ref<Record<string, number>>({})
const storageKey = computed(() => `quiz:${page.value.relativePath}`)

// Answers are a per-viewer convenience; the page must still work when storage is unavailable.
onMounted(() => {
  try {
    const saved = localStorage.getItem(storageKey.value)
    if (saved) picked.value = JSON.parse(saved)
  } catch { /* storage blocked: start fresh */ }
})

function save() {
  try { localStorage.setItem(storageKey.value, JSON.stringify(picked.value)) } catch { /* ignore */ }
}

function choose(q: Question, i: number) {
  if (q.id in picked.value) return
  picked.value = { ...picked.value, [q.id]: i }
  save()
}

function reset() {
  picked.value = {}
  save()
}

const answered = computed(() => props.questions.filter(q => q.id in picked.value).length)
const correct = computed(() => props.questions.filter(q => picked.value[q.id] === q.answer).length)
const done = computed(() => answered.value === props.questions.length)

function optionClass(q: Question, i: number) {
  if (!(q.id in picked.value)) return ''
  if (i === q.answer) return 'is-answer'
  if (i === picked.value[q.id]) return 'is-wrong'
  return 'is-dim'
}
</script>

<template>
  <section class="quiz">
    <header class="quiz-head">
      <strong>📝 {{ title ?? '情境小測驗' }}</strong>
      <span class="quiz-score">已作答 {{ answered }} / {{ questions.length }}，答對 {{ correct }} 題</span>
    </header>

    <article v-for="(q, n) in questions" :key="q.id" class="q">
      <p class="q-stem">
        <span class="q-no">{{ n + 1 }}.</span>
        <span v-if="q.code" class="q-code">{{ q.code }}</span>
        {{ q.stem }}
      </p>

      <ul class="q-options">
        <li v-for="(opt, i) in q.options" :key="i">
          <button
            type="button"
            class="q-opt"
            :class="optionClass(q, i)"
            :disabled="q.id in picked"
            @click="choose(q, i)"
          >
            <span class="q-letter">({{ letters[i] }})</span>
            <span>{{ opt.text }}</span>
          </button>
          <p v-if="q.id in picked" class="q-why" :class="optionClass(q, i)">
            <template v-if="i === q.answer">✅ 正解：</template>
            <template v-else-if="i === picked[q.id]">❌ 你選的：</template>
            <template v-else>　為什麼不是：</template>
            {{ opt.why }}
          </p>
        </li>
      </ul>
    </article>

    <footer class="quiz-foot">
      <span v-if="done">🎉 完成！{{ questions.length }} 題答對 {{ correct }} 題。錯的題目把每個選項的解析再讀一次。</span>
      <button v-if="answered > 0" type="button" class="quiz-reset" @click="reset">重新作答</button>
    </footer>
  </section>
</template>

<style scoped>
.quiz {
  margin: 32px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.quiz-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.quiz-score { font-size: 14px; color: var(--vp-c-text-2); }
.q { padding: 16px 0; border-top: 1px dashed var(--vp-c-divider); }
.q-stem { margin: 0 0 12px; line-height: 1.7; }
.q-no { font-weight: 700; margin-right: 4px; }
.q-code {
  display: inline-block; margin-right: 6px; padding: 0 6px; border-radius: 4px;
  font-size: 12px; background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1);
}
.q-options { list-style: none; padding: 0; margin: 0; }
.q-options li { margin: 0 0 8px; }
.q-opt {
  display: flex; gap: 6px; width: 100%; text-align: left;
  padding: 10px 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px;
  background: var(--vp-c-bg); color: var(--vp-c-text-1); line-height: 1.6; cursor: pointer;
  transition: border-color .2s;
}
.q-opt:hover:not(:disabled) { border-color: var(--vp-c-brand-1); }
.q-opt:disabled { cursor: default; }
.q-letter { flex: none; font-weight: 600; }
.q-opt.is-answer { border-color: var(--vp-c-green-1); background: var(--vp-c-green-soft); }
.q-opt.is-wrong { border-color: var(--vp-c-red-1); background: var(--vp-c-red-soft); }
.q-opt.is-dim { opacity: .7; }
.q-why { margin: 6px 0 4px 12px; font-size: 14px; line-height: 1.7; color: var(--vp-c-text-2); }
.q-why.is-answer { color: var(--vp-c-green-1); }
.q-why.is-wrong { color: var(--vp-c-red-1); }
.quiz-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; }
.quiz-reset {
  padding: 6px 14px; border-radius: 8px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg); color: var(--vp-c-text-1); cursor: pointer;
}
.quiz-reset:hover { border-color: var(--vp-c-brand-1); }
</style>
