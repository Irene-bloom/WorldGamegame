"use client";

// 跨线观察面板：游戏的核心机制。
// 在「观察点」节点，玩家可以「侧耳倾听」邻近时间线，窥见另一个自己的命运（线索）。
// 已观察到的线索会留存显示，并可能解锁当前节点的进阶选项。

import { narratePeek } from "@/lib/narrator";
import type { GameState } from "@/lib/game-state";
import type { ObservePeek } from "@/lib/story";

export function ObservePanel({
  peeks,
  state,
  onObserve,
}: {
  peeks: ObservePeek[] | undefined;
  state: GameState;
  onObserve: (peekNodeId: string) => void;
}) {
  const hasPeeks = peeks && peeks.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-beta" style={{ background: "#fbbf24" }} />
          <span className="text-xs tracking-widest text-mist uppercase">侧耳倾听</span>
        </div>
        <h3 className="font-serif text-lg text-[#e8efe9]">邻近的时间线</h3>
      </div>

      {!hasPeeks ? (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-mist/60 text-sm leading-relaxed">
            这里听不到别的时间线。
            <br />
            分岔尚未在此交汇——只能凭自己向前。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {peeks!.map((peek) => {
            const observed = state.observed.includes(peek.peekNodeId);
            return (
              <div key={peek.peekNodeId}>
                {observed ? (
                  <div
                    className="animate-peek rounded-lg border border-beta/30 bg-beta/5 p-4"
                    style={{ borderColor: "rgba(251,191,36,0.3)" }}
                  >
                    <p
                      className="text-[14px] leading-relaxed text-[#e7d9b8]"
                      dangerouslySetInnerHTML={{ __html: renderEmphasis(narratePeek(peek.hint)) }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => onObserve(peek.peekNodeId)}
                    className="w-full rounded-lg border border-dashed border-beta/40 bg-panel2/40
                               p-4 text-left transition hover:bg-beta/10 hover:border-beta"
                    style={{ borderColor: "rgba(251,191,36,0.4)" }}
                  >
                    <span className="text-beta/90 text-sm" style={{ color: "#fbbf24" }}>
                      ◌ 侧耳倾听这条分岔……
                    </span>
                    <p className="text-mist/50 text-xs mt-1">
                      窥见另一个你在此处的命运
                    </p>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-[11px] text-mist/40 leading-relaxed">
        提示：你没有选的路，在别处真实地发生着。
        从邻近线的命运里，推断出你自己该怎么走。
      </p>
    </div>
  );
}

function renderEmphasis(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /\*\*(.+?)\*\*/g,
    '<strong style="color:#fbbf24;font-weight:600">$1</strong>'
  );
}
