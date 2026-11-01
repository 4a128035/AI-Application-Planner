# AI 讀書會

iPAS AI 應用規劃師（初級）互動式學習網站：用生活比喻、互動圖解和情境小測驗，給不懂 AI 的上班族一次讀懂一個概念。

🌐 網站：https://4a128035.github.io/AI-Application-Planner/

- 〈[設計規範](https://4a128035.github.io/AI-Application-Planner/design/)〉：設計原則、色彩、字體、元件、RWD、無障礙
- 〈[資安設計](https://4a128035.github.io/AI-Application-Planner/security/)〉：威脅模型、分層防護、已知限制

## 技術

Astro 7・Tailwind CSS 4・Vue 3（互動元件）・MDX（教材）・GitHub Actions → GitHub Pages

## 本機開發

需要 Node.js 22 以上。

```bash
npm install
npm run dev       # 本機預覽，存檔即時更新（注意：CSP 只在 build 後生效）
npm run build     # 建置正式版到 dist/
npm run preview   # 預覽建置結果（含 CSP）
```

推送到 `main` 後，GitHub Actions 會先跑 `npm audit`，通過才建置並部署。

## 新增教學單元

1. 在 `src/content/lessons/` 新增 `.mdx`，frontmatter 欄位見 `src/content.config.ts`
   - `subject`：`l11`（科目一）或 `l12`（科目二）
   - `code`：官方評鑑代碼，例如 `L11302`，單元會自動出現在科目總覽對應的位置
   - `quiz`：情境題，每題 4 個選項，每個選項都要有 `why` 解析
2. 可用元件（在 MDX 內 import）：
   - `<Callout type="analogy|key|trap|note">`：生活比喻／重點／考試陷阱／補充
   - `<Misconception claim="…">`：可點開的常見誤區
   - `<DecisionTree client:visible tree={…} />`：互動判斷流程
   - `<YouTube id="…" title="…" />`：點擊後才載入的影片

範例見 `src/content/lessons/ml-types.mdx`。

## 架構與聲明

模擬考題庫存放於私人後端（Google Apps Script＋試算表），不在本 repo 中。本站為個人學習用途，非 iPAS 官方網站；教材與示範題為自行撰寫。
