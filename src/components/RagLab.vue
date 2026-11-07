<script setup lang="ts">
// RAG retrieval lab: one question, six document chunks. Compare keyword search, semantic (vector) search,
// and semantic search + reranker, then see the prompt that is actually sent to the LLM.
// Similarity and rerank scores are illustrative, fixed values.
import { computed, ref } from 'vue'

const question = '請假要提前幾天申請？'
const chunks = [
  { id: 'A', src: '《休假申請規定》第 3 條', text: '特休、事假應於 3 個工作天前，於系統提出申請。', sim: 0.86, rerank: 0.95 },
  { id: 'B', src: '《請假常見問答》', text: '請假期間的薪資，依勞基法規定計算。', sim: 0.78, rerank: 0.3 },
  { id: 'C', src: '《休假申請規定》第 5 條', text: '病假得於事後 3 日內補辦申請。', sim: 0.74, rerank: 0.7 },
  { id: 'D', src: '《員工旅遊辦法》', text: '旅遊假需於出發 2 週前登記。', sim: 0.71, rerank: 0.55 },
  { id: 'E', src: '《加班管理辦法》', text: '加班應事先經主管核准。', sim: 0.62, rerank: 0.2 },
  { id: 'F', src: '《資訊安全規範》', text: '系統密碼每 90 天更換一次。', sim: 0.12, rerank: 0.05 }
]
type Mode = 'keyword' | 'vector' | 'rerank'
const mode = ref<Mode>('vector')
const modes: { id: Mode; label: string }[] = [
  { id: 'keyword', label: '關鍵字搜尋' },
  { id: 'vector', label: '語意搜尋（向量）' },
  { id: 'rerank', label: '語意搜尋＋重排序' }
]
const K = 3

const results = computed(() => {
  if (mode.value === 'keyword') return chunks.filter(c => (c.src + c.text).includes('請假'))
  const byVec = [...chunks].sort((a, b) => b.sim - a.sim)
  if (mode.value === 'vector') return byVec.slice(0, K)
  return byVec.slice(0, 5).sort((a, b) => b.rerank - a.rerank).slice(0, K)   // 先取前 5 名，再重新排序取前 3
})
const hasAnswer = computed(() => results.value.some(c => c.id === 'A'))
// 最好的結果：答案排第一，而且沒有混入不相關的文件（B 是講薪資的）
const clean = computed(() => results.value[0]?.id === 'A' && !results.value.some(c => c.id === 'B'))

const note = computed(() => ({
  keyword: '只找得到字面上有「請假」的文件。真正的答案寫在《休假申請規定》，字面上是「休假」，所以被漏掉了。',
  vector: '語意搜尋找到了「休假申請規定」，因為它和「請假」意思相近。不過排第 2 的是講薪資的文件，和問題不太相關。',
  rerank: '重排序器重新判斷「哪段真的在回答這個問題」，把講薪資的文件往後排，留下和申請期限有關的內容。'
}[mode.value]))
const scoreOf = (c: typeof chunks[number]) => mode.value === 'rerank' ? `重排分數 ${c.rerank.toFixed(2)}` : mode.value === 'vector' ? `相似度 ${c.sim.toFixed(2)}` : '含關鍵字'
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="rag-title">
    <h3 id="rag-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🔎</span>RAG 檢索實驗：AI 會拿到哪些資料？</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">員工問：<strong class="text-ink">「{{ question }}」</strong>公司知識庫裡有 6 段文件。換不同的檢索方式，看看哪幾段會被送給 AI。</p>

    <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="檢索方式">
      <button v-for="m in modes" :key="m.id" type="button"
              class="min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors"
              :class="mode === m.id ? 'border-accent bg-accent text-on-brand' : 'border-line bg-surface hover:border-accent'"
              :aria-pressed="mode === m.id" @click="mode = m.id">{{ m.label }}</button>
    </div>

    <ul class="mt-4 space-y-2" aria-label="知識庫文件">
      <li v-for="c in chunks" :key="c.id" class="flex items-start gap-3 rounded-[var(--radius-btn)] border-2 px-3 py-2.5 text-[15px] leading-[1.6]"
          :class="results.some(r => r.id === c.id) ? 'border-accent bg-accent-soft' : 'border-line opacity-70'">
        <span class="grid size-7 flex-none place-items-center rounded-full bg-surface-2 text-sm font-extrabold">{{ c.id }}</span>
        <span class="flex-1"><strong class="block text-sm">{{ c.src }}</strong>{{ c.text }}</span>
        <span v-if="results.some(r => r.id === c.id)" class="flex-none text-xs font-extrabold">第 {{ results.findIndex(r => r.id === c.id) + 1 }} 名<span class="block font-bold text-ink-2">{{ scoreOf(c) }}</span></span>
      </li>
    </ul>

    <p class="mt-4 rounded-[var(--radius-btn)] px-4 py-3 font-bold leading-[1.7]" :class="clean ? 'bg-ok-soft' : hasAnswer ? 'bg-warn-soft' : 'bg-bad-soft'" aria-live="polite">
      {{ clean ? '✅' : hasAnswer ? '⚠️' : '❌' }} {{ note }}
    </p>

    <p class="mt-5 text-sm font-extrabold">實際送給 AI 的提示詞</p>
    <pre class="mt-2 whitespace-pre-wrap rounded-[var(--radius-btn)] border border-line bg-surface-2 p-4 font-sans text-sm leading-[1.75]">請只根據下列資料回答，並註明引用的編號；資料中沒有答案就說不知道。
<template v-for="c in results" :key="c.id">[{{ c.id }}] {{ c.src }}：{{ c.text }}
</template>問題：{{ question }}</pre>
    <p class="mt-3 text-sm leading-[1.7] text-ink-2">分數是示意的。真實系統會用 Embedding 模型把文字轉成向量，再計算相似度。</p>
  </section>
</template>
