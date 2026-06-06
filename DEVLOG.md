# 开发日志 DEVLOG · 《小径分岔的花园》

> 逐步记录每一次改动、原因和结论，方便后续复盘。**最新记录在最上面。**

---

## 2026-06-06 · 步骤 1：项目脚手架 + Git 对接

- **做了什么**：
  - 在 `worldgame/` 下搭起 Next.js 15 + React 19 + TypeScript + Tailwind 的脚手架（复用 weeklygame 的成熟配置）。
  - 配置文件：`package.json`、`next.config.js`、`postcss.config.js`、`tailwind.config.ts`、`tsconfig.json`、`.gitignore`、`.env.example`。
  - 应用骨架：`app/layout.tsx`、`app/globals.css`、`app/page.tsx`（临时占位首页）。
  - 自定义了一套「夜色花园」主题配色：深绿黑底色 + 两条时间线的颜色（青 `alpha` / 琥珀 `beta`）+ 中心微光紫 `center`。
  - 初始化 git，对接远程空仓库 `https://github.com/Irene-bloom/WorldGamegame`。
  - 建立本开发日志 `DEVLOG.md`。
- **为什么**：
  - 复用已验证的技术栈，避免从零踩坑，让用户也熟悉。
  - 主题配色换成花园/时间迷宫风格，和《小径分岔的花园》的世界观契合，而不是照搬周目的紫色。
  - 先跑通一个能 `npm run dev` 的空项目，确认地基没问题，再往上堆功能。
- **结论 / 下一步**：
  - 脚手架就绪。下一步（步骤 2）写数据层：`lib/story.ts`（时间分岔图的类型定义 + 第一关静态数据）和 `lib/game-state.ts`（游戏状态 + localStorage 存取）。
