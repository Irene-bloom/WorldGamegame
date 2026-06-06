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

export default function Home() {
  const [state, setState] = useState<GameState>(() => freshState());
  const [mounted, setMounted] = useState(false);

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
  const node = currentNode(state, level);
  const atDeadEnd = isAtDeadEnd(state, level);

  function handleChoose(choice: Choice) {
    setState((s) => applyChoice(s, level, choice));
  }
  function handleObserve(peekNodeId: string) {
    setState((s) => applyObserve(s, peekNodeId));
  }
  function handleBacktrack() {
    setState((s) => backtrack(s, level));
  }
  function handleRestart() {
    clearState();
    setState(freshState(state.levelId));
  }

  // 避免 SSR/CSR 首屏不一致（localStorage 只在客户端有）
  if (!mounted || !node) {
    return (
      <main className="min-h-screen flex items-center justify-center text-mist">
        花园正在展开……
      </main>
    );
  }

  // 进度统计
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
          <h1 className="font-serif text-xl text-alpha" style={{ color: "#5eead4" }}>
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

      {/* 通关横幅 */}
      {state.reached && !node.isCenter && (
        <div className="mb-4 rounded-lg border border-center/30 bg-center/5 px-4 py-2 text-center text-sm"
             style={{ borderColor: "rgba(240,171,252,0.3)", color: "#f0abfc" }}>
          ✦ 你已抵达过花园的中心。
        </div>
      )}

      {/* 主体：左叙事 / 右观察 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* 左：当前节点叙事 + 选择 */}
        <section className="card-glow rounded-xl bg-panel/70 backdrop-blur p-6 min-h-[480px]">
          <NodePanel
            node={node}
            state={state}
            onChoose={handleChoose}
            onBacktrack={handleBacktrack}
            onRestart={handleRestart}
          />
        </section>

        {/* 右：跨线观察 */}
        <aside className="rounded-xl bg-panel2/50 border border-white/5 p-6 min-h-[480px]">
          <ObservePanel
            peeks={node.observe}
            state={state}
            onObserve={handleObserve}
          />
        </aside>
      </div>

      <footer className="mt-6 text-center text-[11px] text-mist/30">
        改编自博尔赫斯《小径分岔的花园》 · 原型 v0.1
      </footer>
    </main>
  );
}
