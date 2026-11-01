# AI 應用規劃師讀書會

iPAS AI 應用規劃師（初級）互動式學習網站：用生活比喻、圖解、影片和情境小測驗準備考試。

🌐 網站：https://4a128035.github.io/AI-Application-Planner/

## 本機開發

需要 Node.js 18 以上。

```bash
npm install
npm run docs:dev      # 本機預覽，存檔即時更新
npm run docs:build    # 建置正式版
```

推送到 `main` 後，GitHub Actions 會自動建置並部署到 GitHub Pages。

## 新增教學單元

1. 在 `docs/l11/`（科目一）或 `docs/l12/`（科目二）新增 `.md` 檔
2. 到 `docs/.vitepress/config.mts` 的 `sidebar` 加入連結
3. 可用的元件：
   - 小測驗：題目寫在頁面 frontmatter 的 `quiz:`，再放 `<Quiz :questions="$frontmatter.quiz" />`（格式參考 `docs/l11/ml-types.md`）
   - YouTube：`<YouTube id="影片ID" title="影片標題" />`

## 架構與聲明

架構說明見網站上的〈關於本站〉。模擬考題庫存放於私人後端，不在本 repo 中。本站為個人學習用途，非 iPAS 官方網站。
