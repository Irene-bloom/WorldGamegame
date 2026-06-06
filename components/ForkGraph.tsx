"use client";

// 时间分岔网的可视化（SVG）。
// 节点按 pos 布局；choice 边=实线，observe 边=虚线（连向邻近线）。
// 只显示玩家「已经知道」的部分（走过的 + 当前可选目标 + 已观察到的邻近线），保留迷雾感。
// 点击已知节点可跳读其叙事（只读查看，不改变进度）。

import { getEdges, type Level, type StoryNode } from "@/lib/story";
import { isChoiceAvailable, type GameState } from "@/lib/game-state";

const TL_COLOR: Record<string, string> = {
  alpha: "#2f8f7f", // 松绿
  beta: "#c8962a", // 金褐
};

export function ForkGraph({
  level,
  state,
  onPeekNode,
}: {
  level: Level;
  state: GameState;
  onPeekNode?: (nodeId: string) => void;
}) {
  const edges = getEdges(level);

  // 计算「已知节点」集合：
  //  - 走过的（visited）
  //  - 已观察到的邻近线节点（observed）
  //  - 当前节点的可选选项目标（让玩家看到眼前的分岔）
  const known = new Set<string>([...state.visited, ...state.observed]);
  const cur = level.nodes[state.currentNodeId];
  if (cur) {
    for (const c of cur.choices) {
      if (isChoiceAvailable(c, state)) known.add(c.to);
    }
  }

  const nodes = Object.values(level.nodes).filter((n) => known.has(n.id));
  const visibleEdges = edges.filter((e) => known.has(e.from) && known.has(e.to));

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      style={{ minHeight: 280 }}
    >
      {/* 连线 */}
      {visibleEdges.map((e, i) => {
        const a = level.nodes[e.from];
        const b = level.nodes[e.to];
        if (!a || !b) return null;
        const path = curve(a.pos, b.pos);
        const isObserve = e.kind === "observe";
        return (
          <path
            key={`e${i}`}
            d={path}
            fill="none"
            stroke={isObserve ? "#c8962a" : "#7a9a6e"}
            strokeWidth={isObserve ? 0.4 : 0.6}
            strokeDasharray={isObserve ? "1.5 1.2" : undefined}
            opacity={isObserve ? 0.55 : 0.75}
          />
        );
      })}

      {/* 节点 */}
      {nodes.map((n) => (
        <NodeDot
          key={n.id}
          node={n}
          isCurrent={n.id === state.currentNodeId}
          isDeadEnd={state.deadEnds.includes(n.id) || !!n.isDeadEnd}
          isVisited={state.visited.includes(n.id)}
          onClick={onPeekNode ? () => onPeekNode(n.id) : undefined}
        />
      ))}
    </svg>
  );
}

function NodeDot({
  node,
  isCurrent,
  isDeadEnd,
  isVisited,
  onClick,
}: {
  node: StoryNode;
  isCurrent: boolean;
  isDeadEnd: boolean;
  isVisited: boolean;
  onClick?: () => void;
}) {
  const { x, y } = node.pos;
  const base = node.isCenter ? "#b06ab0" : TL_COLOR[node.timeline] ?? "#8a7f6c";

  let fill = base;
  let stroke = base;
  let r = 2.2;
  let op = 1;

  if (isDeadEnd) {
    fill = "#d8ccb2";
    stroke = "#b3a589";
    op = 0.7;
  } else if (!isVisited) {
    // 已知但未亲身到达（如眼前的选项目标 / 邻近线）：空心暗示
    fill = "#fffdf8";
    op = 0.95;
  }

  if (node.isCenter) r = 3;
  if (isCurrent) r = 3.2;

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      opacity={op}
    >
      {/* 当前节点的脉冲光环 */}
      {isCurrent && (
        <circle cx={x} cy={y} r={5} fill="none" stroke={base} strokeWidth={0.4} opacity={0.5}>
          <animate attributeName="r" values="3.5;6;3.5" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}
      {/* 中心节点的星芒 */}
      {node.isCenter && !isDeadEnd && (
        <circle cx={x} cy={y} r={4.2} fill="none" stroke="#b06ab0" strokeWidth={0.3} opacity={0.45} />
      )}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.5}
      />
      {/* 死路打叉 */}
      {isDeadEnd && (
        <text x={x} y={y + 0.9} fontSize={2.6} textAnchor="middle" fill="#9a8c70">
          ✕
        </text>
      )}
      {/* 标签 */}
      <text
        x={x}
        y={y + (node.isCenter ? 6 : 4.6)}
        fontSize={2.3}
        textAnchor="middle"
        fill={isCurrent ? base : "#6b6253"}
        opacity={isDeadEnd ? 0.6 : 0.9}
      >
        {shortLabel(node.title)}
      </text>
    </g>
  );
}

/** 两点之间画一条柔和的竖向贝塞尔曲线 */
function curve(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
}

/** 去掉〔邻近线〕前缀，标签太长时截断 */
function shortLabel(title: string): string {
  const t = title.replace(/^〔.*?〕/, "");
  return t.length > 7 ? t.slice(0, 6) + "…" : t;
}
