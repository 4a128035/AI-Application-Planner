// 新技術解說: each week, a few new technologies or rules from the news that could become exam questions,
// explained for beginners. Newest issue first. Each item names its scope code, the lesson that covers it,
// and a source we actually read (not just the headline).

export interface RadarItem {
  title: string
  date: string          // when it happened
  plain?: string        // what it is, in plain words
  why: string           // how it might be tested
  code: string          // 評鑑範圍代碼
  lesson: { label: string; path: string }
  source: { label: string; url: string }
}
export interface RadarIssue { label: string; items: RadarItem[] }

export const radar: RadarIssue[] = [
  {
    label: '2026/11/09～11/15',
    items: [
      {
        title: '小模型做雜事、大模型做判斷：Meta 推出 Muse Ember',
        date: '2026 年 11 月 9 日',
        plain: 'AI 代理執行任務時，很多步驟只是呼叫工具、擷取資料、分派工作。Muse Ember 是專做這類重複步驟的輕量模型，價格約每百萬輸入 token 0.1 美元，可以和大模型搭配分工。',
        why: '這就是「模型路由」：簡單的交給便宜模型，困難的才交給強大模型。考題常問「怎麼在不犧牲品質下降低成本」。要注意，小模型失敗率高時反而要重做，未必比較省。',
        code: 'L12301',
        lesson: { label: '科目二第 10 課：導入評估', path: 'l12/cost-evaluation/' },
        source: { label: 'Meta 開發者文件', url: 'https://dev.meta.ai/models/muse-ember' }
      },
      {
        title: 'AI 的緊急停止鈕：OpenAI 的 Control Room',
        date: '2026 年 11 月 11 日',
        plain: '發現研究中的 AI 代理行為可疑時，系統能在 35 秒內切斷它取得模型輸出的管道。設計是「失效關閉」：控制系統本身壞掉或被竄改時，預設拒絕所有請求，而不是放行。',
        why: '對應風險管理的「人類監督」與「失效時預設安全」。情境題可能問：AI 代理出現異常時，哪個設計最能防止損害擴大。',
        code: 'L12303',
        lesson: { label: '科目二第 12 課：風險管理', path: 'l12/risk-management/' },
        source: { label: 'TechNews 科技新報', url: 'https://technews.tw/2026/11/11/openai-builds-a-kill-switch-for-its-research-models/' }
      },
      {
        title: 'AI 寫的文字也有浮水印：Claude 擴大文字浮水印',
        date: '2026 年 11 月起',
        plain: '在 AI 生成的文字裡嵌入看不見的統計訊號，事後可以偵測「這段文字有 AI 參與」。Anthropic 使用的是 Google DeepMind 公開的 SynthID-Text 技術，不會加入任何字元。',
        why: '考過影片的 SynthID 和 C2PA，文字浮水印是延伸。重點觀念一樣：偵測到浮水印是 AI 參與的證據，沒偵測到卻不能證明是人寫的。',
        code: 'L12201',
        lesson: { label: '科目二第 2 課：生成式 AI 工具地圖', path: 'l12/genai-tools/' },
        source: { label: 'The Decoder', url: 'https://the-decoder.com/anthropics-text-watermark-is-easy-to-bypass-on-several-older-claude-models/' }
      },
      {
        title: '聯合航空禁止 AI 代理幫旅客訂票',
        date: '2026 年 11 月 11 日',
        plain: '旅客的 AI 代理仍然可以查航班和票價，但不能完成購買或修改訂位。航空公司擔心個資外洩、帳號被盜用，以及 AI 在旅客沒有確認的情況下誤買或誤改。',
        why: '對應 AI Agent 的權限設計：付款、改約這類不可逆的動作，應該交回給人確認（人在迴圈內）。這類「企業開始限制 Agent」的情境很適合出成考題。',
        code: 'L12202',
        lesson: { label: '科目二第 8 課：AI Agent', path: 'l12/ai-agent/' },
        source: { label: 'AeroTime', url: 'https://www.aerotime.aero/articles/united-airlines-to-block-third-party-ai-agents-from-accessing-digital-platforms' }
      },
      {
        title: '醫療 AI 的下一步：AI 代理的治理',
        date: '查證於 2026 年 11 月',
        plain: '衛福部 2026 年 5 月發布《醫療機構應用生成式人工智慧指引》，涵蓋病歷撰寫、臨床決策支援等用途，但「具自主決策能力的 AI 代理」因為病人安全與責任風險較高，暫時沒有納入，留待下一階段處理。',
        why: '可以對照風險分級：同樣是 AI，能自己採取行動的代理，風險比只產生內容的工具高。另外指引要求最終臨床判斷由醫事人員負責，是「人類問責」的例子。',
        code: 'L11102',
        lesson: { label: '科目一第 9 課：AI 治理', path: 'l11/ai-governance/' },
        source: { label: '理律法律事務所', url: 'https://www.leeandli.com/TW/Newsletters/7656.htm' }
      }
    ]
  },
  {
    label: '2026 年 11 月・法規整理',
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
