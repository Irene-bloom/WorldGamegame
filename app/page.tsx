"use client";

import { useEffect, useState } from "react";
import {
  applyChoice,
  applyObserve,
  backtrack,
  clearState,
  currentNode,
  freshState,
  isAtDeadEnd,
  loadState,
  saveState,
  type GameState,
} from "@/lib/game-state";
import { getLevel, type Choice } from "@/lib/story";
import { NodePanel } from "@/components/NodePanel";
import { ObservePanel } from "@/components/ObservePanel";
import { ForkGraph } from "@/components/ForkGraph";
import {
  isMuted,
  primeAudio,
  sfxBacktrack,
  sfxClick,
  sfxDeadEnd,
  sfxObserve,
  sfxWin,
  toggleMuted,
} from "@/lib/sfx";

export default function Home() {
  const [state, setState] = useState<GameState>(() => freshState());
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(false);
  // 「跳读查看」：点击分岔网上的节点临时查看其叙事，不改变进度。null = 看当前节点。
  const [viewNodeId, setViewNodeId] = useState<string | null>(null);

  // 载入本地存档
  useEffect(() => {
    setState(loadState());
    setMuted(isMuted());
    setMounted(true);
  }, []);

  // 状态变化即存档
  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  const level = getLevel(state.levelId);
  const liveNode = currentNode(state, level);

  const viewing = viewNodeId ? level.nodes[viewNodeId] : undefined;
  const shownNode = viewing ?? liveNode;
  const isPeeking = !!viewing && viewing.id !== state.currentNodeId;

  function handleChoose(choice: Choice) {
    primeAudio();
    setViewNodeId(null);
    setState((s) => {
      const next = applyChoice(s, level, choice);
      const target = level.nodes[choice.to];
      // 音效反馈：通关 / 死路 / 普通选择
      if (target?.isCenter) sfxWin();
      else if (target?.isDeadEnd) sfxDeadEnd();
      else sfxClick();
      return next;
    });
  }
  function handleObserve(peekNodeId: string) {
    primeAudio();
    sfxObserve();
    setState((s) => applyObserve(s, peekNodeId));
  }
  function handleBacktrack() {
    sfxBacktrack();
    setViewNodeId(null);
    setState((s) => backtrack(s, level));
  }
  function handleRestart() {
    sfxClick();
    clearState();
    setViewNodeId(null);
    setState(freshState(state.levelId));
  }
  function handlePeekNode(id: string) {
    sfxClick();
    setViewNodeId(id);
  }
  function handleToggleMute() {
    setMuted(toggleMuted());
  }

  if (!mounted || !liveNode || !shownNode) {
    return (
      <main className="min-h-screen flex items-center justify-center text-mute">
        花园正在展开……
      </main>
    );
  }

  const total = Object.keys(level.nodes).length;
  const seen = state.visited.length;

  return (
    <main className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
      {/* 顶栏 */}
      <header className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] tracking-[0.25em] text-mute/70 uppercase">
            The Garden of Forking Paths
          </p>
          <h1 className="font-serif text-lg sm:text-xl leading-tight" style={{ color: "#2f8f7f" }}>
            小径分岔的花园
            <span className="text-mute/70 text-xs sm:text-sm font-sans ml-2 block sm:inline">
              · {level.title}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right hidden xs:block sm:block">
            <p className="text-[10px] text-mute/60">已探索</p>
            <p className="text-sm text-mute">
              {seen} / {total}
            </p>
          </div>
          {/* 静音开关 */}
          <button
            onClick={handleToggleMute}
            aria-label={muted ? "开启音效" : "关闭音效"}
            title={muted ? "开启音效" : "关闭音效"}
            className="press w-9 h-9 grid place-items-center rounded-lg border border-line bg-panel
                       text-mute hover:text-ink hover:border-vine/40 transition"
          >
            {muted ? "🔇" : "🔈"}
          </button>
          <button
            onClick={handleRestart}
            className="press text-xs text-mute hover:text-ink border border-line bg-panel
                       rounded-lg px-3 py-2 transition hover:border-vine/40"
          >
            重走
          </button>
        </div>
      </header>

      {state.reached && !liveNode.isCenter && (
        <div
          className="mb-4 rounded-lg border px-4 py-2 text-center text-sm"
          style={{ borderColor: "rgba(176,106,176,0.35)", color: "#9a55a0", background: "rgba(176,106,176,0.08)" }}
        >
          ✦ 你已抵达过花园的中心。
        </div>
      )}

      {/* 主体：手机单列堆叠；桌面左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 sm:gap-5">
        {/* 左列：分岔网图 + 节点叙事 */}
        <div className="space-y-4 sm:space-y-5 order-1">
          {/* 分岔网可视化 */}
          <section className="rounded-xl bg-panel2/60 border border-line p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 px-1 gap-2">
              <span className="text-[10px] sm:text-[11px] tracking-widest text-mute/60 uppercase shrink-0">
                时间分岔网
              </span>
              <Legend />
            </div>
            <div className="w-full" style={{ aspectRatio: "16 / 11" }}>
              <ForkGraph level={level} state={state} onPeekNode={handlePeekNode} />
            </div>
          </section>

          {/* 节点叙事 + 选择 */}
          <section className="card-glow rounded-xl bg-panel p-4 sm:p-6 min-h-[320px] sm:min-h-[360px]">
            {isPeeking && (
              <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-panel2 border border-line px-3 py-2">
                <span className="text-xs text-mute">正在跳读此处分岔（不影响进度）</span>
                <button
                  onClick={() => {
                    sfxClick();
                    setViewNodeId(null);
                  }}
                  className="press text-xs px-2 py-1 rounded border transition shrink-0"
                  style={{ color: "#2f8f7f", borderColor: "rgba(47,143,127,0.35)" }}
                >
                  ↩ 回到当下
                </button>
              </div>
            )}
            <NodePanel
              node={shownNode}
              state={state}
              readOnly={isPeeking}
              onChoose={handleChoose}
              onBacktrack={handleBacktrack}
              onRestart={handleRestart}
            />
          </section>
        </div>

        {/* 右列：跨线观察。手机端排在叙事之后 */}
        <aside className="rounded-xl bg-panel2/60 border border-line p-4 sm:p-6 lg:sticky lg:top-8 self-start min-h-[260px] sm:min-h-[480px] order-2">
          <ObservePanel peeks={liveNode.observe} state={state} onObserve={handleObserve} />
        </aside>
      </div>

      <footer className="mt-6 text-center text-[10px] sm:text-[11px] text-mute/50">
        改编自博尔赫斯《小径分岔的花园》 · 原型 v0.1
      </footer>
    </main>
  );
}

function Legend() {
  const items = [
    { c: "#2f8f7f", t: "当前线" },
    { c: "#c8962a", t: "邻近线" },
    { c: "#b06ab0", t: "中心" },
    { c: "#a99", t: "死路" },
  ];
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
      {items.map((it) => (
        <span key={it.t} className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: it.c }} />
          <span className="text-[9px] sm:text-[10px] text-mute/60">{it.t}</span>
        </span>
      ))}
    </div>
  );
}
