# 开发日志 DEVLOG · 《小径分岔的花园》

> 逐步记录每一次改动、原因和结论，方便后续复盘。**最新记录在最上面。**

---

## 2026-06-06 · 步骤 2：数据层（时间分岔图 + 游戏状态 + 第一关）

- **做了什么**：
  - `lib/story.ts`：定义了整套时间分岔图的数据模型（`StoryNode` / `Choice` / `ObservePeek` / `Level`），并写好**第一关《两扇门与一口井》**的完整静态数据。
  - `lib/game-state.ts`：游戏状态 `GameState`（当前节点 / 已访问 / 已观察 / 死路 / 是否通关）+ localStorage 存取（`loadState`/`saveState`/`clearState`）+ 核心引擎纯函数（`applyChoice` 选择、`applyObserve` 观察、`backtrack` 回溯、`isChoiceAvailable` 进阶选项门控）。
  - `lib/narrator.ts`：叙事润色接口（预留）。第一版直接返回静态文本，未来接 AI 只改这里，不动 UI/引擎。
  - 类型检查 `tsc --noEmit` 通过，0 错误。
- **第一关的谜题设计（核心）**：
  - **谜题 1（入门）**：在「长廊分岔」观察点，能窥见邻近线里「另一个你推左门被落石压死」→ 推理出本线该选**右门**。不看线索就是盲猜。
  - **谜题 2（进阶 / 世界规则 R2 对称）**：在「井厅」观察点，能窥见邻近线里「井是假的诱饵，合上井盖会露出暗格」→ 正确解是**合井盖走暗格**而非下井。关键：「走暗格」选项用 `requiresObserved` 锁住，**必须先窥见邻近线线索才会出现**，逼玩家真去观察、推理。
- **为什么这么设计**：
  - 数据驱动：游戏逻辑只读这份数据，「加内容 = 加数据」，不改引擎。
  - 谜题严密可解：不看邻近线=盲猜，看了=能唯一推出答案——这正是「跨线观察推理」机制成立的证明。
  - 回溯而非 Game Over：走死路退回上一个分岔点，契合「所有时间线并存」的世界观。
- **结论 / 下一步**：
  - 数据层和引擎就绪、类型干净。下一步（步骤 3）做叙事交互：`NodePanel` + `page.tsx`，先让游戏能读节点、点选择、在节点间跳转跑起来（暂不画分岔网图）。

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
