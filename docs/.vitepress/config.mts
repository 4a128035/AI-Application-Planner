import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-TW',
  title: 'AI 應用規劃師讀書會',
  description: 'iPAS AI 應用規劃師（初級）互動式學習網站：用情境、比喻與小測驗準備考試',
  base: '/AI-Application-Planner/',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '首頁', link: '/' },
      { text: '科目一', link: '/l11/' },
      { text: '科目二', link: '/l12/' },
      { text: 'AI 時事', link: '/news/' },
      { text: '模擬考', link: '/exam/' },
      { text: '關於本站', link: '/about' }
    ],

    sidebar: {
      '/l11/': [
        {
          text: '科目一：人工智慧基礎概論',
          items: [
            { text: '單元總覽', link: '/l11/' },
            { text: '機器學習的四種學法', link: '/l11/ml-types' }
          ]
        }
      ],
      '/l12/': [
        {
          text: '科目二：生成式 AI 應用與規劃',
          items: [{ text: '單元總覽', link: '/l12/' }]
        }
      ]
    },

    search: { provider: 'local' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/4a128035/AI-Application-Planner' }
    ],

    outline: { label: '本頁重點', level: [2, 3] },
    docFooter: { prev: '上一單元', next: '下一單元' },
    lastUpdated: { text: '最後更新' },
    returnToTopLabel: '回到頂端',
    sidebarMenuLabel: '單元選單',
    darkModeSwitchLabel: '深色模式',

    footer: {
      message: '本站為個人讀書會學習用途，非 iPAS 官方網站。考試資訊請以<a href="https://ipd.nat.gov.tw/ipas/AIAP/">官方公告</a>為準。'
    }
  }
})
