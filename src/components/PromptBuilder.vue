<script setup lang="ts">
// Prompt builder: toggle the six parts of a clear prompt and read the assembled prompt.
// Each missing part shows what the model would have to guess. Text only, no generated output.
import { computed, reactive } from 'vue'

const parts = [
  { id: 'role', label: '角色／情境', text: '你是一家電商公司的資深客服，說話親切、專業。', miss: '用什麼身分和口吻說話' },
  { id: 'context', label: '背景資訊', text: '本公司網站將在 12 月 3 日凌晨 2 點到 5 點進行系統維護，期間無法下單，已付款的訂單不受影響。', miss: '維護的時間、影響範圍（只能自己編，很容易寫錯）' },
  { id: 'task', label: '明確任務', text: '請寫一封通知會員的電子郵件，說明維護時間與影響，並提醒會員提前完成購物。', miss: '到底要寫什麼、寫給誰' },
  { id: 'example', label: '範例', text: '參考我們過去的通知信開頭：「親愛的會員您好，感謝您一直以來的支持……」', miss: '公司習慣的寫法與風格' },
  { id: 'format', label: '輸出格式', text: '格式：主旨一行，內文 150 字以內，分成三小段。', miss: '要多長、要不要主旨、怎麼分段' },
  { id: 'limit', label: '限制條件', text: '不要使用表情符號，不要承諾任何補償或優惠。', miss: '哪些話不能說（可能擅自答應補償）' }
] as const
type Id = typeof parts[number]['id']
const on = reactive<Record<Id, boolean>>({ role: false, context: false, task: true, example: false, format: false, limit: false })

const chosen = computed(() => parts.filter(p => on[p.id]))
const missing = computed(() => parts.filter(p => !on[p.id]))
const prompt = computed(() => chosen.value.length ? chosen.value.map(p => p.text).join('\n') : '（還沒有任何內容）')
const score = computed(() => chosen.value.length)
const level = computed(() => score.value <= 2 ? { text: '太模糊：AI 只能靠猜', tone: 'bg-bad-soft' }
  : score.value <= 4 ? { text: '還可以：但仍有地方要 AI 自己猜', tone: 'bg-warn-soft' }
    : { text: '很清楚：AI 幾乎不必猜', tone: 'bg-ok-soft' })
</script>

<template>
  <section class="not-prose my-10 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6" aria-labelledby="pb-title">
    <h3 id="pb-title" class="flex items-center gap-2 text-lg font-extrabold"><span aria-hidden="true">🧱</span>提示詞組裝器</h3>
    <p class="mt-2 text-[15px] leading-[1.75] text-ink-2">任務：請 AI 寫一封「網站維護暫停服務」的會員通知信。勾選要放進提示詞的部分，看看 AI 還需要猜哪些事。</p>

    <div class="mt-5 grid gap-2 sm:grid-cols-3" role="group" aria-label="提示詞的組成部分">
      <button v-for="p in parts" :key="p.id" type="button"
              class="min-h-11 rounded-[var(--radius-btn)] border-2 px-3 py-2 text-left text-sm font-bold transition-colors"
              :class="on[p.id] ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-accent'"
              :aria-pressed="on[p.id]" @click="on[p.id] = !on[p.id]">
        <span aria-hidden="true">{{ on[p.id] ? '☑' : '☐' }}</span> {{ p.label }}
      </button>
    </div>

    <p class="mt-5 text-sm font-extrabold">組好的提示詞</p>
    <pre class="mt-2 whitespace-pre-wrap rounded-[var(--radius-btn)] border border-line bg-surface-2 p-4 font-sans text-[15px] leading-[1.75]">{{ prompt }}</pre>

    <div class="mt-4 rounded-[var(--radius-btn)] px-4 py-3" :class="level.tone" aria-live="polite">
      <p class="font-extrabold">{{ score }} / 6・{{ level.text }}</p>
      <ul v-if="missing.length" class="mt-2 space-y-1 text-[15px] leading-[1.7]">
        <li v-for="m in missing" :key="m.id">❓ 少了「{{ m.label }}」：AI 要自己猜 {{ m.miss }}</li>
      </ul>
      <p v-else class="mt-1 text-[15px] leading-[1.7]">六個部分都有了。實際使用時不一定每次都要全部寫，但越重要的任務，越值得寫清楚。</p>
    </div>
  </section>
</template>
