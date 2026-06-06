// 《小径分岔的花园》· 时间分岔图的数据模型 + 第一关静态数据
//
// 整个游戏是一张「时间分岔网」：节点(StoryNode) = 一个事件场景，
// 选择(Choice) = 从一个节点通往另一个节点的分岔。
// 玩法引擎只读取这份数据来驱动，所以「加内容 = 加数据」，不用改逻辑。
//
// 世界规则（见 DEVLOG / 计划）：
//   R1 分岔：每个抉择节点，选择让时间线分裂。
//   R2 并存：你没选的路，在「邻近线」里真实发生着。
//   R3 观察：某些节点是「观察点」，能窥见邻近线的片段（线索）。
//   R4 有限：分岔是「若干」而非「全部」，谜题有边界。
//   R5 中心：抵达「中心」即通关。

// ——————————————————————————————————————————————
// 类型定义
// ——————————————————————————————————————————————

/** 时间线 id —— 第一关有两条：青(alpha) / 琥珀(beta) */
export type TimelineId = "alpha" | "beta";

/** 一个选择：从当前节点通往某个节点的分岔 */
export interface Choice {
  /** 选项文字，如「推开左门」 */
  label: string;
  /** 目标节点 id */
  to: string;
  /**
   * 可选：解锁条件。只有当玩家已经「观察」过某个邻近节点时，这个选项才出现/可选。
   * 用于进阶谜题（必须先窥见邻近线，才知道/才能走某条路）。
   */
  requiresObserved?: string;
  /**
   * 可选：这是一步「致命选择」——选了会走入死路。
   * 引擎据此把目标节点标记为已知死路。（也可以直接让 to 指向 isDeadEnd 节点。）
   */
  fatal?: boolean;
}

/** 观察点能窥见的一条邻近线片段 */
export interface ObservePeek {
  /** 窥见的是哪个邻近节点（通常在另一条时间线上） */
  peekNodeId: string;
  /** 玩家「侧耳倾听」时看到/听到的线索文字 */
  hint: string;
}

/** 一个节点 = 时间分岔网上的一个事件场景 */
export interface StoryNode {
  id: string;
  /** 属于哪条时间线（决定在图上的颜色） */
  timeline: TimelineId;
  /** 标题，显示在节点上和叙事面板顶部 */
  title: string;
  /** 文字叙事（以后可由 AI 润色） */
  body: string;
  /** 在分岔网图上的坐标（SVG 布局用），x/y 是 0~100 的相对百分比 */
  pos: { x: number; y: number };
  /** 2~3 个选择。终局节点（中心/死路）可以为空数组 */
  choices: Choice[];
  /** 若是观察点：能窥见哪些邻近节点的片段 */
  observe?: ObservePeek[];
  /** 是否为「中心」（通关点） */
  isCenter?: boolean;
  /** 是否死路（走到这里这条线就断了，需要回溯） */
  isDeadEnd?: boolean;
}

/** 一整关 = 一组节点 + 入口 */
export interface Level {
  id: string;
  title: string;
  /** 入口节点 id */
  entryId: string;
  /** 所有节点，按 id 索引 */
  nodes: Record<string, StoryNode>;
}

// ——————————————————————————————————————————————
// 第一关数据：《两扇门与一口井》
// ——————————————————————————————————————————————
//
// 关卡结构（→ 表示选择走向；★=观察点；☠=死路；◎=中心）：
//
//   start(入口)
//     └─ corridor「长廊尽头的分岔」★ 观察点1
//          ├─ 选「左门」→ door_left ☠（邻近线警告过：左门有落石）
//          └─ 选「右门」→ well_room「井厅」★ 观察点2（进阶谜题）
//                 ├─ 选「直接下井」→ well_fall ☠（盲目下井会摔死）
//                 └─ 选「先合上井盖再走暗格」→ center ◎（需先观察 beta 线的暗格）
//
// 谜题设计：
//   谜题1（入门）：corridor 是观察点，能窥见 beta 线里「另一个你推左门被落石压死」。
//                 → 推理出本线该选「右门」。（不看线索就是盲猜。）
//   谜题2（进阶 / R2 对称）：well_room 是观察点，能窥见 beta 线里
//                 「另一个你在井厅发现：井其实是假的，真正的出口在合上井盖后露出的暗格」。
//                 → 本线正确解是「先合上井盖，走暗格」而不是「下井」。
//                 这一步用 requiresObserved 锁住：必须先窥见 beta 的暗格线索，
//                 「走暗格」选项才会出现——逼玩家真的去观察、去推理。

export const LEVEL_ONE: Level = {
  id: "level-1",
  title: "两扇门与一口井",
  entryId: "start",
  nodes: {
    // —— 入口 ——
    start: {
      id: "start",
      timeline: "alpha",
      title: "花园入口",
      body: `你推开锈蚀的铁门，走进曾祖父崔朋留下的花园。

没有花，没有草。只有一条向前延伸、又不断分岔的石廊，像一句永远写不完的句子。

你忽然明白祖辈的传言是真的：这不是园林，是一座用时间砌成的迷宫。每当你做出选择，那些你没有选的路，并不会消失——它们在别处，真实地延续着。

你深吸一口气，向前走去。`,
      pos: { x: 50, y: 8 },
      choices: [{ label: "沿石廊向前走", to: "corridor" }],
    },

    // —— 观察点1 / 分岔1 ——
    corridor: {
      id: "corridor",
      timeline: "alpha",
      title: "长廊尽头的分岔",
      body: `石廊在尽头一分为二：一扇**左门**，一扇**右门**。门后都是浓得化不开的黑。

门楣上各刻着一行字，却被岁月磨得无法辨认。两扇门看上去毫无区别。

就在你犹豫时，你听见了——不是用耳朵，而是某种更深的感官。仿佛隔着一层薄纸，另一条时间线里的声音正渗过来。`,
      pos: { x: 50, y: 30 },
      observe: [
        {
          peekNodeId: "door_left_beta",
          hint: "你侧耳倾听邻近的时间线——那里，另一个『你』正推开**左门**。脚步声、然后是头顶传来沉重的摩擦……轰隆一声，落石封死了门道，再无声息。",
        },
      ],
      choices: [
        { label: "推开左门", to: "door_left", fatal: true },
        { label: "推开右门", to: "well_room" },
      ],
    },

    // —— 死路1：左门（被落石压死）——
    door_left: {
      id: "door_left",
      timeline: "alpha",
      title: "左门之后",
      body: `你推开左门。门后是一道狭窄的下行石阶。

你刚迈出第二步，头顶传来沉重的摩擦声——和你在邻近线里听到的，一模一样。

来不及了。

（这条时间线在此终结。你可以**退回上一个分岔点**，换一条路重走——别忘了，你早已听过这里的回响。）`,
      pos: { x: 28, y: 52 },
      choices: [],
      isDeadEnd: true,
    },

    // —— 邻近线节点（beta）：左门的下场，供 alpha 线在 corridor 窥见 ——
    door_left_beta: {
      id: "door_left_beta",
      timeline: "beta",
      title: "〔邻近线〕左门之后",
      body: `（这是邻近时间线里发生的事——另一个你的命运。）

他推开左门，走下石阶。落石封门，无人生还。`,
      pos: { x: 14, y: 52 },
      choices: [],
      isDeadEnd: true,
    },

    // —— 观察点2 / 分岔2：井厅（进阶谜题）——
    well_room: {
      id: "well_room",
      timeline: "alpha",
      title: "井厅",
      body: `右门之后是一间圆形的石厅。正中央，一口**古井**幽幽地张着口，深不见底。井壁湿滑，隐约有水声从下方传来。

厅里没有别的出口。看起来，唯一的去路就是下到井里。

可是……崔朋造的是迷宫，不是坟墓。最显而易见的路，往往是他留给莽撞者的陷阱。

你再次静下心，向邻近的时间线侧耳倾听。`,
      pos: { x: 68, y: 54 },
      observe: [
        {
          peekNodeId: "well_secret_beta",
          hint: "邻近线里，另一个『你』没有急着下井。他绕着井走，无意间踩到一块松动的地砖——**井口的石盖缓缓合拢**，而墙面随之裂开一道**暗格**，露出向下的真正通道。他回头看了一眼那口井：原来井是假的，是诱饵。",
        },
      ],
      choices: [
        { label: "攀着井壁下到井里", to: "well_fall", fatal: true },
        {
          label: "合上井盖，走墙后的暗格",
          to: "center",
          // 进阶谜题的关键：必须先窥见 beta 线的暗格线索，这个选项才出现。
          requiresObserved: "well_secret_beta",
        },
      ],
    },

    // —— 死路2：盲目下井 ——
    well_fall: {
      id: "well_fall",
      timeline: "alpha",
      title: "井底",
      body: `你抓住湿滑的井壁，一寸寸往下。

水声越来越近，可你的手指终究撑不住青苔。一脚踩空——

井，深不见底。而它显然不打算让你抵达任何地方。

（这条时间线在此终结。退回井厅，也许邻近线早已告诉过你：井，是假的。）`,
      pos: { x: 82, y: 76 },
      choices: [],
      isDeadEnd: true,
    },

    // —— 邻近线节点（beta）：暗格的真相，供 alpha 线在 well_room 窥见 ——
    well_secret_beta: {
      id: "well_secret_beta",
      timeline: "beta",
      title: "〔邻近线〕暗格",
      body: `（这是邻近时间线里发生的事——另一个你的发现。）

他合上井盖，墙后的暗格打开，露出通往中心的真正道路。井，不过是个诱饵。`,
      pos: { x: 52, y: 78 },
      choices: [],
    },

    // —— 中心（通关）——
    center: {
      id: "center",
      timeline: "alpha",
      title: "花园的中心",
      body: `你合上井盖，墙面应声裂开。暗格之后，是一间小小的、点着一盏长明灯的石室。

灯下有一张纸，是崔朋的字迹：

「致终于走到这里的你——

我用一生写一部谁也读不完的小说，造一座谁也走不出的迷宫。后来我明白，它们是同一件东西。

时间永远分岔，通向无数的未来。在其中一个未来里，我是你的敌人；在另一个里，是你的朋友。你没有选的那些路，并不曾消失。它们和你一样真实，只是你听不见。

而你刚刚学会了倾听。这就够了。」

你握紧那张纸。花园在身后轻轻合拢，像一句终于写完的句子。

—— 第一关 · 通关 ——`,
      pos: { x: 50, y: 94 },
      choices: [],
      isCenter: true,
    },
  },
};

/** 当前启用的关卡（以后可扩展成多关） */
export const LEVELS: Record<string, Level> = {
  "level-1": LEVEL_ONE,
};

export const DEFAULT_LEVEL_ID = "level-1";

// ——————————————————————————————————————————————
// 便捷查询函数
// ——————————————————————————————————————————————

export function getLevel(levelId: string = DEFAULT_LEVEL_ID): Level {
  return LEVELS[levelId] ?? LEVEL_ONE;
}

export function getNode(levelId: string, nodeId: string): StoryNode | undefined {
  return getLevel(levelId).nodes[nodeId];
}
