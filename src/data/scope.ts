// Official 評鑑內容範圍 (115.06 version). Lessons attach to these codes via their `code` field.

export type SubjectId = 'l11' | 'l12'

export interface ScopeItem { code: string; title: string; hint: string }
export interface ScopeTopic { code: string; title: string; items: ScopeItem[] }
export interface Subject {
  id: SubjectId
  short: string
  title: string
  emoji: string
  tone: 'brand' | 'accent'
  blurb: string
  topics: ScopeTopic[]
}

export const subjects: Subject[] = [
  {
    id: 'l11',
    short: '科目一',
    title: '人工智慧基礎概論',
    emoji: '🧠',
    tone: 'brand',
    blurb: 'AI 是什麼、資料怎麼整理、機器怎麼學習，以及鑑別式和生成式 AI 的差別。',
    topics: [
      {
        code: 'L111', title: '人工智慧概念', items: [
          { code: 'L11101', title: 'AI 的定義與分類', hint: '弱 AI／強 AI、圖靈測試' },
          { code: 'L11102', title: 'AI 治理概念', hint: '公部門 AI 手冊、金融業 AI 指引、人在迴圈' }
        ]
      },
      {
        code: 'L112', title: '資料處理與分析概念', items: [
          { code: 'L11201', title: '資料基本概念與來源', hint: '結構化／半結構化／非結構化、大數據 5V' },
          { code: 'L11202', title: '資料整理與分析流程', hint: '遺漏值、離群值、標準化、資料洩漏' },
          { code: 'L11203', title: '資料隱私與安全', hint: 'k-匿名、差分隱私、聯邦學習' }
        ]
      },
      {
        code: 'L113', title: '機器學習概念', items: [
          { code: 'L11301', title: '機器學習基本原理', hint: '損失函數、梯度下降、過擬合、交叉驗證' },
          { code: 'L11302', title: '常見的機器學習模型', hint: '學習類型、評估指標、CNN／RNN／Transformer' }
        ]
      },
      {
        code: 'L114', title: '鑑別式 AI 與生成式 AI 概念', items: [
          { code: 'L11401', title: '基本原理', hint: 'GAN、VAE、擴散模型、可解釋 AI' },
          { code: 'L11402', title: '整合應用', hint: '影像分類／偵測／分割、語音、生成技術' }
        ]
      }
    ]
  },
  {
    id: 'l12',
    short: '科目二',
    title: '生成式 AI 應用與規劃',
    emoji: '🛠️',
    tone: 'accent',
    blurb: '不寫程式也能做 AI 應用、怎麼把生成式 AI 用好，以及企業導入的評估與風險。',
    topics: [
      {
        code: 'L121', title: 'No code / Low code 概念', items: [
          { code: 'L12101', title: '基本概念', hint: 'No Code 與 Low Code 差在哪、Webhook、路由' },
          { code: 'L12102', title: '優勢與限制', hint: '被平台綁住、高度客製化、極限效能' }
        ]
      },
      {
        code: 'L122', title: '生成式 AI 應用領域與工具使用', items: [
          { code: 'L12201', title: '應用領域與常見工具', hint: 'ChatGPT、Gemini、Copilot、Cursor、Claude Code' },
          { code: 'L12202', title: '如何善用生成式 AI 工具', hint: '提示工程、RAG、AI Agent、MCP' }
        ]
      },
      {
        code: 'L123', title: '生成式 AI 導入評估規劃', items: [
          { code: 'L12301', title: '導入評估', hint: 'TCO、ROI、Token 成本計算' },
          { code: 'L12302', title: '導入規劃', hint: '目標設定 → POC → 試點 → 擴散' },
          { code: 'L12303', title: '風險管理', hint: 'Prompt Injection、越獄、資料漂移、幻覺' }
        ]
      }
    ]
  }
]

export const subjectById = Object.fromEntries(subjects.map(s => [s.id, s])) as Record<SubjectId, Subject>
