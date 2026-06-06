"use client";

// 当前节点的叙事正文 + 选择按钮 + 死路回溯按钮。

import { narrateNode } from "@/lib/narrator";
import { isChoiceAvailable, type GameState } from "@/lib/game-state";
import type { Choice, StoryNode } from "@/lib/story";

export function NodePanel({
  node,
  state,
  readOnly = false,
  onChoose,
  onBacktrack,
  onRestart,
}: {
  node: StoryNode;
  state: GameState;
  readOnly?: boolean;
  onChoose: (choice: Choice) => void;
  onBacktrack: () => void;
  onRestart: () => void;
}) {
  const isDeadEnd = !!node.isDeadEnd;
  const isCenter = !!node.isCenter;

  // 段落化：把 body 按空行拆成段落，** ** 处理成强调
  const paragraphs = narrateNode(node).split("\n\n");

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              background: node.timeline === "alpha" ? "#5eead4" : "#fbbf24",
            }}
          />
          <span className="text-xs tracking-widest text-mist uppercase">
            {node.timeline === "alpha" ? "当前时间线" : "邻近时间线"}
          </span>
        </div>
        <h2
          className="font-serif text-2xl"
          style={{ color: isCenter ? "#f0abfc" : "#e8efe9" }}
        >
          {node.title}
        </h2>
      </div>

      {/* 叙事正文 */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 leading-relaxed text-[15px] text-[#d6e0d9]">
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: renderEmphasis(p) }} />
        ))}
      </div>

      {/* 底部：选择 / 回溯 / 重开。跳读（只读）模式下不显示可操作按钮。 */}
      <div className="mt-6 space-y-3">
        {readOnly ? (
          <p className="text-center text-xs text-mist/40 py-2">
            —— 这是另一处分岔的景象 ——
          </p>
        ) : isCenter ? (
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-lg font-medium transition
                       bg-center/20 border border-center/40 text-center
                       hover:bg-center/30"
            style={{ borderColor: "rgba(240,171,252,0.4)", color: "#f0abfc" }}
          >
            ✦ 重新走进花园
          </button>
        ) : isDeadEnd ? (
          <button
            onClick={onBacktrack}
            className="w-full py-3 rounded-lg font-medium transition
                       bg-panel2 border border-vine/40 text-mist hover:text-[#e8efe9]
                       hover:border-vine"
          >
            ↩ 退回上一个分岔点
          </button>
        ) : (
          node.choices.map((choice, i) => {
            const available = isChoiceAvailable(choice, state);
            return (
              <button
                key={i}
                disabled={!available}
                onClick={() => available && onChoose(choice)}
                className={`w-full py-3 px-4 rounded-lg text-left transition border
                  ${
                    available
                      ? "bg-panel2 border-vine/40 hover:border-alpha hover:bg-vine/15 text-[#e8efe9] cursor-pointer"
                      : "bg-panel/40 border-white/5 text-mist/40 cursor-not-allowed"
                  }`}
              >
                <span className="mr-2 text-alpha/70">{available ? "→" : "🔒"}</span>
                {available ? choice.label : "？？？（你似乎还缺少某种线索）"}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// 把 **xxx** 渲染成高亮强调（青色）。先转义 HTML 再替换，避免注入。
function renderEmphasis(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /\*\*(.+?)\*\*/g,
    '<strong style="color:#5eead4;font-weight:600">$1</strong>'
  );
}
