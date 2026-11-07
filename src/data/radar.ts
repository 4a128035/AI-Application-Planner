// 考點雷達: news hand-picked each month because it could become an exam question.
// Each item names its scope code, the lesson that covers it, and a source we actually checked.

export interface RadarItem {
  title: string
  date: string          // when it happened
  why: string           // how it might be tested
  code: string          // 評鑑範圍代碼
  lesson: { label: string; path: string }
  source: { label: string; url: string }
}
export interface RadarIssue { month: string; items: RadarItem[] }

export const radar: RadarIssue[] = [
  {
    month: '2026 年 11 月',
    items: [
      {
        title: '歐盟通過「數位綜合法案」，AI 法案高風險義務延後',
        date: '2026 年 7 月生效',
        why: '多數高風險 AI 的義務延到 2027 年 12 月。考題可能問「依風險分級，哪一類要符合最嚴格的規範」。',
        code: 'L11102',
        lesson: { label: '科目一第 9 課：AI 治理', path: 'l11/ai-governance/' },
        source: { label: 'AI Act Explorer', url: 'https://artificialintelligenceact.eu/ai-act-explorer/digital-omnibus/' }
      },
      {
        title: '數發部發布《人工智慧風險分類框架》v1.0',
        date: '2026 年 7 月',
        why: '依《人工智慧基本法》訂定，把風險分成技術缺陷、人機互動、社會衝擊三大類。可能出成「哪一類屬於高風險 AI 應用」。',
        code: 'L11102',
        lesson: { label: '科目一第 9 課：AI 治理', path: 'l11/ai-governance/' },
        source: { label: '理律法律事務所', url: 'https://www.leeandli.com/TW/NewslettersDetail/7661.htm' }
      },
      {
        title: '個資法修正已公布，施行日期仍待行政院公告',
        date: '查證於 2026 年 11 月',
        why: '新增外洩通知與通報義務；個資會仍在籌備處階段。考題多半考觀念：目的外利用、去識別化。',
        code: 'L11203',
        lesson: { label: '科目一第 8 課：資料隱私與安全', path: 'l11/data-privacy/' },
        source: { label: '個資會籌備處', url: 'https://www.pdpc.gov.tw/News_Content/20/1010/' }
      },
      {
        title: 'MCP 捐給 Linux 基金會，成為業界共同維護的標準',
        date: '2025 年 12 月',
        why: '已經考過「MCP 和 RAG 的差別」「MCP 的流程順序」。新的方向可能是 MCP 與 Skill、A2A 的分工。',
        code: 'L12202',
        lesson: { label: '科目二第 9 課：MCP 與多代理協作', path: 'l12/mcp-multi-agent/' },
        source: { label: 'Anthropic', url: 'https://anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation' }
      }
    ]
  }
]
