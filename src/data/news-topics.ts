// Which archived headlines the AI 新聞 page shows, and under which exam topic.
// The archive keeps every AI headline; filtering happens only here at build time, so loosening a rule
// later brings old headlines back instead of losing them.

// Finance, gossip, politics and infrastructure news: about AI companies, not about new AI technology.
const NOISE = /股|營收|目標價|IPO|掛牌|募資|投資|降評|升評|醜聞|外遇|婚外情|財報|虧損|美股|散戶|估值|市值|飆漲|大漲|跌逾|止跌|分析師|華爾街|董事會|執行長|用電|耗電|電力|產能|短缺|川習|黑名單|採購|資料中心|裁員|訴訟|罰款/i

// Headlines that announce something new: a release, a method, a standard, a rule.
const NEW_TECH = /推出|發表|公布|開源|上線|釋出|發布|新增|亮相|首款|新一代|新型|框架|協定|標準|技術|研究|模型|架構|指引|法案|規範|草案|準則/

export interface NewsTopic {
  id: string
  emoji: string
  name: string
  match: RegExp | null
  lesson?: { label: string; path: string }
}

// Checked in this order; the first match wins. Rules and security come first because their headlines
// often also mention agents or models.
export const topics: NewsTopic[] = [
  { id: 'law', emoji: '⚖️', name: '法規與治理', match: /法規|法案|立法|法律|規範|指引|治理|政策|監管|合規|準則|個資|著作權/,
    lesson: { label: '科目一第 9 課：AI 治理', path: 'l11/ai-governance/' } },
  { id: 'risk', emoji: '🛡️', name: 'AI 資安與風險', match: /駭|資安|外洩|攻擊|竊密|漏洞|失控|深偽|詐騙|偽造|封鎖|網攻|惡意/,
    lesson: { label: '科目二第 12 課：風險管理', path: 'l12/risk-management/' } },
  { id: 'agent', emoji: '🤖', name: 'AI 代理與 MCP', match: /代理|agent|MCP|A2A|操作.{0,6}App/i,
    lesson: { label: '科目二第 8 課：AI Agent', path: 'l12/ai-agent/' } },
  { id: 'gen', emoji: '🎨', name: '生成式影像與影音', match: /生成|影片|圖像|影像|語音|拍片|繪圖|音樂|動畫/,
    lesson: { label: '科目一第 11 課：生成式 AI 原理', path: 'l11/generative-models/' } },
  { id: 'model', emoji: '🧠', name: '新模型與工具', match: /模型|Gemini|Claude|GPT|Llama|Muse|LLM|開源/i,
    lesson: { label: '科目二第 1 課：大型語言模型', path: 'l12/llm-basics/' } },
  { id: 'other', emoji: '🔬', name: '其他新技術', match: null }
]

export const isTechNews = (title: string) => !NOISE.test(title) && NEW_TECH.test(title)

export const topicOf = (title: string) => topics.find(t => t.match?.test(title)) ?? topics[topics.length - 1]
