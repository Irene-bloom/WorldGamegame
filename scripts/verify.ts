// 端到端通关验证脚本（不进 git 主逻辑，仅用于 CI/手动验证）。
// 模拟玩家在纯函数引擎上的操作，断言：
//   1) 正确通关路径能抵达中心；
//   2) 谜题2 的进阶选项在未观察时被锁、观察后解锁（机制成立）；
//   3) 两条死路都会被标记，且能从死路回溯到分岔点；
//   4) 盲目路径（不观察）走不到进阶解。

import {
  LEVEL_ONE,
} from "../lib/story";
import {
  applyChoice,
  applyObserve,
  backtrack,
  freshState,
  isAtDeadEnd,
  isChoiceAvailable,
} from "../lib/game-state";

const level = LEVEL_ONE;
let pass = 0;
let fail = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ FAIL: ${name}`);
  }
}

function choiceByLabel(nodeId: string, label: string) {
  const n = level.nodes[nodeId];
  const c = n.choices.find((x) => x.label.includes(label));
  if (!c) throw new Error(`no choice "${label}" at ${nodeId}`);
  return c;
}

console.log("\n[A] 正确通关路径");
{
  let s = freshState();
  check("起点在 start", s.currentNodeId === "start");

  // start -> corridor
  s = applyChoice(s, level, choiceByLabel("start", "沿石廊"));
  check("到达 corridor（分岔1/观察点1）", s.currentNodeId === "corridor");

  // 观察邻近线，得知左门会死
  s = applyObserve(s, "door_left_beta");
  check("已观察 door_left_beta", s.observed.includes("door_left_beta"));

  // 选右门 -> well_room
  s = applyChoice(s, level, choiceByLabel("corridor", "右门"));
  check("到达 well_room（分岔2/观察点2）", s.currentNodeId === "well_room");

  // 进阶谜题：未观察暗格前，「走暗格」必须是锁住的
  const secretChoice = choiceByLabel("well_room", "暗格");
  check(
    "未观察暗格时，『走暗格』选项被锁",
    isChoiceAvailable(secretChoice, s) === false
  );

  // 观察邻近线暗格真相
  s = applyObserve(s, "well_secret_beta");
  check(
    "观察暗格后，『走暗格』选项解锁",
    isChoiceAvailable(secretChoice, s) === true
  );

  // 走暗格 -> center
  s = applyChoice(s, level, secretChoice);
  check("抵达 center（中心）", s.currentNodeId === "center");
  check("reached = true（通关）", s.reached === true);
}

console.log("\n[B] 死路1：左门 + 回溯");
{
  let s = freshState();
  s = applyChoice(s, level, choiceByLabel("start", "沿石廊"));
  s = applyChoice(s, level, choiceByLabel("corridor", "左门"));
  check("到达 door_left（死路）", s.currentNodeId === "door_left");
  check("door_left 被标记为死路", s.deadEnds.includes("door_left"));
  check("isAtDeadEnd = true", isAtDeadEnd(s, level) === true);
  // 回溯
  s = backtrack(s, level);
  check("回溯到 corridor（上一个非死路分岔点）", s.currentNodeId === "corridor");
}

console.log("\n[C] 死路2：盲目下井 + 回溯");
{
  let s = freshState();
  s = applyChoice(s, level, choiceByLabel("start", "沿石廊"));
  s = applyChoice(s, level, choiceByLabel("corridor", "右门"));
  s = applyChoice(s, level, choiceByLabel("well_room", "井里"));
  check("到达 well_fall（死路）", s.currentNodeId === "well_fall");
  check("well_fall 被标记为死路", s.deadEnds.includes("well_fall"));
  s = backtrack(s, level);
  check("回溯到 well_room", s.currentNodeId === "well_room");
}

console.log("\n[D] 机制证明：不观察就到不了进阶解");
{
  let s = freshState();
  s = applyChoice(s, level, choiceByLabel("start", "沿石廊"));
  s = applyChoice(s, level, choiceByLabel("corridor", "右门"));
  // 完全不观察，well_room 唯一「可选」的就是下井（死路）
  const available = level.nodes["well_room"].choices.filter((c) =>
    isChoiceAvailable(c, s)
  );
  check(
    "未观察时 well_room 只有 1 个可选项（下井）",
    available.length === 1 && available[0].to === "well_fall"
  );
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败\n`);
if (fail > 0) process.exit(1);
