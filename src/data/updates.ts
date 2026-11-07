// 更新紀錄: every content change readers should know about, newest first.
// `lessons` lists lesson ids (the .mdx file name). They drive the 「新課程／已更新」 labels and each lesson's
// 「最後更新」 date. Labels only appear for entries on or after BADGE_START, so the launch history doesn't make
// every lesson look new, and they disappear BADGE_DAYS after the entry date.

export type UpdateType = 'new' | 'update' | 'fix' | 'site'
export interface Update { date: string; type: UpdateType; title: string; detail: string; lessons?: string[] }

export const BADGE_START = '2026-11-08'
export const BADGE_DAYS = 30

export const typeLabel: Record<UpdateType, { text: string; emoji: string; cls: string }> = {
  new: { text: '新課程', emoji: '🆕', cls: 'bg-info-soft text-info' },
  update: { text: '內容更新', emoji: '🔄', cls: 'bg-ok-soft text-ok' },
  fix: { text: '修正', emoji: '🔧', cls: 'bg-warn-soft text-warn' },
  site: { text: '網站功能', emoji: '✨', cls: 'bg-surface-2 text-ink-2' }
}

const SUBJECT_1 = ['ai-intro', 'data-basics', 'how-models-learn', 'ml-types', 'metrics', 'data-cleaning', 'feature-engineering',
  'data-privacy', 'ai-governance', 'deep-learning', 'generative-models', 'explainable-ai', 'ai-applications']
const SUBJECT_2 = ['llm-basics', 'genai-tools', 'prompt-engineering', 'low-code-basics', 'low-code-limits', 'rag', 'fine-tuning',
  'ai-agent', 'mcp-multi-agent', 'cost-evaluation', 'planning-testing', 'risk-management']

export const updates: Update[] = [
  {
    date: '2026-11-07', type: 'site', title: '「時事」改版為「AI 新知」',
    detail: '每天早上自動整理中文 AI 新聞並保留 30 天；每月整理一次「考點雷達」，挑出可能變成考題的新技術與法規。'
  },
  {
    date: '2026-11-07', type: 'new', title: '科目二 12 課全部上線',
    detail: '從大型語言模型的使用常識、提示工程、No/Low Code、RAG、微調、AI Agent、MCP，到成本效益、導入規劃與風險管理，涵蓋科目二全部評鑑範圍。',
    lessons: SUBJECT_2
  },
  {
    date: '2026-11-06', type: 'update', title: '第 3、10、11 課加入「延伸觀看」影片連結',
    detail: '梯度下降、Transformer 與自注意力、擴散模型等需要動畫輔助的主題，附上可以選看的中英文影片。',
    lessons: ['how-models-learn', 'deep-learning', 'generative-models']
  },
  {
    date: '2026-11-06', type: 'new', title: '科目一 13 課全部上線',
    detail: '從 AI 是什麼、資料處理、機器學習、評估指標，到資料隱私、AI 治理、深度學習、生成式 AI 與可解釋 AI，涵蓋科目一全部評鑑範圍。',
    lessons: SUBJECT_1
  }
]

const DAY = 86400_000
const onOrAfter = (a: string, b: string) => a >= b

/** Newest entry that mentions this lesson, or undefined. */
export function lastChange(lessonId: string) {
  return updates.filter(u => u.lessons?.includes(lessonId)).sort((a, b) => b.date.localeCompare(a.date))[0]
}

/** 「新課程」or「已更新」 while a post-launch change is under BADGE_DAYS old. */
export function lessonBadge(lessonId: string, now = new Date()): { kind: 'new' | 'updated'; update: Update } | null {
  const u = lastChange(lessonId)
  if (!u || !onOrAfter(u.date, BADGE_START)) return null
  if (now.getTime() - new Date(`${u.date}T00:00:00+08:00`).getTime() > BADGE_DAYS * DAY) return null
  return { kind: u.type === 'new' ? 'new' : 'updated', update: u }
}

export const fmtDate = (d: string) => d.replaceAll('-', '/')
