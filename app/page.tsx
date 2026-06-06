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

export default function Home() {
  const [state, setState] = useState<GameState>(() => freshState());
  const [mounted, setMounted] = useState(false);
  // 「跳读查看」：点击分岔网上的节点临时查看其叙事，不改变进度。null = 看当前节点。
  const [viewNodeId, setViewNodeId] = useState<string | null>(null);

  // 载入本地存档
  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  // 状态变化即存档
  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  const level = getLevel(state.levelId);
  const liveNode = currentNode(state, level);
  const atDeadEnd = isAtDeadEnd(state, level);

  // 当前展示的节点：跳读优先，否则是真实当前节点
  const viewing = viewNodeId ? level.nodes[viewNodeId] : undefined;
  const shownNode = viewing ?? liveNode;
  const isPeeking = !!viewing && viewing.id !== state.currentNodeId;

  function handleChoose(choice: Choice) {
    setViewNodeId(null);
    setState((s) => applyChoice(s, level, choice));
  }
  function handleObserve(peekNodeId: string) {
    setState((s) => applyObserve(s, peekNodeId));
  }
  function handleBacktrack() {
    setViewNodeId(null);
    setState((s) => backtrack(s, level));
  }
  function handleRestart() {
    clearState();
    setViewNodeId(null);
    setState(freshState(state.levelId));
  }

  if (!mounted || !liveNode || !shownNode) {
    return (
      <main className="min-h-screen flex items-center justify-center text-mist">
        花园正在展开……
      </main>
    );
  }

  const total = Object.keys(level.nodes).length;
  const seen = state.visited.length;

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
      {/* 顶栏 */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-mist/60 uppercase">
            The Garden of Forking Paths
          </p>
          <h1 className="font-serif text-xl" style={{ color: "#5eead4" }}>
            小径分岔的花园
            <span className="text-mist/50 text-sm font-sans ml-2">· {level.title}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] text-mist/50">已探索分岔</p>
            <p className="text-sm text-mist">
              {seen} / {total}
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="text-xs text-mist/50 hover:text-mist border border-white/10
                       rounded px-3 py-1.5 transition hover:border-white/25"
          >
            重走
          </button>
        </div>
      </header>

      {state.reached && !liveNode.isCenter && (
        <div
          className="mb-4 rounded-lg border px-4 py-2 text-center text-sm"
          style={{ borderColor: "rgba(240,171,252,0.3)", color: "#f0abfc", background: "rgba(240,171,252,0.05)" }}
        >
          ✦ 你已抵达过花园的中心。
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* 左列：分岔网图 + 节点叙事 */}
        <div className="space-y-5">
          {/* 分岔网可视化 */}
          <section className="rounded-xl bg-panel2/40 border border-white/5 p-4">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[11px] tracking-widest text-mist/50 uppercase">
                时间分岔网
              </span>
              <Legend />
            </div>
            <div className="w-full" style={{ aspectRatio: "16 / 11" }}>
              <ForkGraph level={level} state={state} onPeekNode={(id) => setViewNodeId(id)} />
            </div>
          </section>

          {/* 节点叙事 + 选择 */}
          <section className="card-glow rounded-xl bg-panel/70 backdrop-blur p-6 min-h-[360px] relative">
            {isPeeking && (
              <div className="mb-4 flex items-center justify-between rounded-lg bg-panel2/70 border border-white/10 px-3 py-2">
                <span className="text-xs text-mist/70">
                  正在跳读此处分岔（不影响你的进度）
                </span>
                <button
                  onClick={() => setViewNodeId(null)}
                  className="text-xs px-2 py-1 rounded border border-alpha/30 transition hover:bg-alpha/10"
                  style={{ color: "#5eead4" }}
                >
                  ↩ 回到我所在的当下
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

        {/* 右列：跨线观察（始终对应真实当前节点，而非跳读节点） */}
        <aside className="rounded-xl bg-panel2/50 border border-white/5 p-6 lg:sticky lg:top-8 self-start min-h-[480px]">
          <ObservePanel peeks={liveNode.observe} state={state} onObserve={handleObserve} />
        </aside>
      </div>

      <footer className="mt-6 text-center text-[11px] text-mist/30">
        改编自博尔赫斯《小径分岔的花园》 · 原型 v0.1
      </footer>
    </main>
  );
}

function Legend() {
  const items = [
    { c: "#5eead4", t: "当前线" },
    { c: "#fbbf24", t: "邻近线" },
    { c: "#f0abfc", t: "中心" },
    { c: "#4a5a51", t: "死路" },
  ];
  return (
    <div className="flex items-center gap-3">
      {items.map((it) => (
        <span key={it.t} className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: it.c }} />
          <span className="text-[10px] text-mist/50">{it.t}</span>
        </span>
      ))}
    </div>
  );
}
