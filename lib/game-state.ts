// 《小径分岔的花园》· 游戏状态 + localStorage 存取 + 核心引擎逻辑
//
// 所有状态本地存储（localStorage），无需后端即可跑通 Demo。
// 参考 weeklygame/lib/game.ts 的 loadState/saveState 模式。

import {
  DEFAULT_LEVEL_ID,
  getLevel,
  type Choice,
  type Level,
  type StoryNode,
} from "./story";

const STORAGE_KEY = "forking-garden:v1";

/** 玩家在一关里的进度状态 */
export interface GameState {
  levelId: string;
  /** 当前所在节点 id */
  currentNodeId: string;
  /** 走过的节点（用于在图上点亮路径），含当前节点 */
  visited: string[];
  /** 已观察（窥见）过的邻近节点 id —— 解锁的线索 / 进阶选项的钥匙 */
  observed: string[];
  /** 已知的死路节点 id（图上标灰） */
  deadEnds: string[];
  /** 是否已抵达中心（通关） */
  reached: boolean;
}

/** 新游戏的初始状态 */
export function freshState(levelId: string = DEFAULT_LEVEL_ID): GameState {
  const level = getLevel(levelId);
  return {
    levelId,
    currentNodeId: level.entryId,
    visited: [level.entryId],
    observed: [],
    deadEnds: [],
    reached: false,
  };
}

// ——————————————————————————————————————————————
// localStorage 存取
// ——————————————————————————————————————————————

export function loadState(): GameState {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as GameState;
    // 基本校验：节点必须存在，否则重置（防止旧存档/坏数据）
    const level = getLevel(parsed.levelId);
    if (!parsed.currentNodeId || !level.nodes[parsed.currentNodeId]) {
      return freshState(parsed.levelId);
    }
    return {
      levelId: parsed.levelId ?? DEFAULT_LEVEL_ID,
      currentNodeId: parsed.currentNodeId,
      visited: parsed.visited ?? [parsed.currentNodeId],
      observed: parsed.observed ?? [],
      deadEnds: parsed.deadEnds ?? [],
      reached: parsed.reached ?? false,
    };
  } catch {
    return freshState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 忽略存储失败（隐私模式等）
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ——————————————————————————————————————————————
// 核心引擎：选择 / 观察 / 回溯
// 全部是纯函数：吃进 (state, ...)，吐出新的 state，方便 React setState。
// ——————————————————————————————————————————————

/**
 * 一个选项当前是否可选。
 * 若选项带 requiresObserved，则必须已经观察过对应邻近节点。
 */
export function isChoiceAvailable(choice: Choice, state: GameState): boolean {
  if (choice.requiresObserved) {
    return state.observed.includes(choice.requiresObserved);
  }
  return true;
}

/** 做出一个选择，走向目标节点，返回新状态。 */
export function applyChoice(
  state: GameState,
  level: Level,
  choice: Choice
): GameState {
  const target = level.nodes[choice.to];
  if (!target) return state;

  const visited = state.visited.includes(target.id)
    ? state.visited
    : [...state.visited, target.id];

  const deadEnds =
    target.isDeadEnd && !state.deadEnds.includes(target.id)
      ? [...state.deadEnds, target.id]
      : state.deadEnds;

  return {
    ...state,
    currentNodeId: target.id,
    visited,
    deadEnds,
    reached: state.reached || !!target.isCenter,
  };
}

/**
 * 在观察点「窥见」一条邻近线，记录已观察的邻近节点 id（解锁线索 / 进阶选项）。
 * 返回新状态。重复观察是幂等的。
 */
export function applyObserve(state: GameState, peekNodeId: string): GameState {
  if (state.observed.includes(peekNodeId)) return state;
  return { ...state, observed: [...state.observed, peekNodeId] };
}

/**
 * 从死路回溯：退回「上一个还活着的分岔点」。
 * 实现：从 visited 末尾往回找，跳过所有死路节点，停在第一个非死路节点。
 */
export function backtrack(state: GameState, level: Level): GameState {
  // 当前节点若不是死路，原样返回（理论上只在死路才会调用）
  const path = [...state.visited];
  // 从后往前找第一个「非死路」节点
  for (let i = path.length - 1; i >= 0; i--) {
    const node = level.nodes[path[i]];
    if (node && !node.isDeadEnd) {
      return { ...state, currentNodeId: node.id };
    }
  }
  // 兜底：回到入口
  return { ...state, currentNodeId: level.entryId };
}

/** 当前节点是否死路（UI 据此显示「回溯」按钮） */
export function isAtDeadEnd(state: GameState, level: Level): boolean {
  const node = level.nodes[state.currentNodeId];
  return !!node?.isDeadEnd;
}

/** 取当前节点对象 */
export function currentNode(state: GameState, level: Level): StoryNode | undefined {
  return level.nodes[state.currentNodeId];
}
