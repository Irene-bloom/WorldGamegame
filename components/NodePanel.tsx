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

  const paragraphs = narrateNode(node).split("\n\n");

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: node.timeline === "alpha" ? "#2f8f7f" : "#c8962a" }}
          />
          <span className="text-[11px] tracking-widest text-mute uppercase">
            {node.timeline === "alpha" ? "当前时间线" : "邻近时间线"}
          </span>
        </div>
        <h2
          className="font-serif text-xl sm:text-2xl"
          style={{ color: isCenter ? "#9a55a0" : "#3a3228" }}
        >
          {node.title}
        </h2>
      </div>

      {/* 叙事正文 */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 leading-relaxed text-[14px] sm:text-[15px] text-ink/90">
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: renderEmphasis(p) }} />
        ))}
      </div>

      {/* 底部：选择 / 回溯 / 重开。跳读（只读）模式下不显示可操作按钮。 */}
      <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
        {readOnly ? (
          <p className="text-center text-xs text-mute/60 py-2">
            —— 这是另一处分岔的景象 ——
          </p>
        ) : isCenter ? (
          <button
            onClick={onRestart}
            className="press w-full py-3 rounded-lg font-medium transition border"
            style={{ borderColor: "rgba(176,106,176,0.4)", color: "#9a55a0", background: "rgba(176,106,176,0.08)" }}
          >
            ✦ 重新走进花园
          </button>
        ) : isDeadEnd ? (
          <button
            onClick={onBacktrack}
            className="press w-full py-3 rounded-lg font-medium transition
                       bg-panel2 border border-line text-mute hover:text-ink hover:border-vine/50"
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
                className={`press w-full py-3 px-4 rounded-lg text-left transition border text-[14px] sm:text-[15px]
                  ${
                    available
                      ? "bg-panel2 border-line hover:border-vine hover:bg-vine/10 text-ink cursor-pointer"
                      : "bg-panel2/40 border-line/60 text-mute/40 cursor-not-allowed"
                  }`}
              >
                <span className="mr-2" style={{ color: available ? "#2f8f7f" : undefined }}>
                  {available ? "→" : "🔒"}
                </span>
                {available ? choice.label : "？？？（你似乎还缺少某种线索）"}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// 把 **xxx** 渲染成高亮强调（松绿）。先转义 HTML 再替换，避免注入。
function renderEmphasis(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /\*\*(.+?)\*\*/g,
    '<strong style="color:#2f8f7f;font-weight:600">$1</strong>'
  );
}
