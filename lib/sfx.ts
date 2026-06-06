// 《小径分岔的花园》· 音效（Web Audio API 合成，无需任何音频文件）
//
// 浏览器策略：AudioContext 必须在用户首次交互后才能 resume。
// 我们懒加载、首次点击时 resume，并提供静音开关（存 localStorage）。

let ctx: AudioContext | null = null;
let muted = false;

// 初始化静音偏好（仅客户端）
if (typeof window !== "undefined") {
  muted = window.localStorage.getItem("forking-garden:muted") === "1";
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // 用户手势后可能仍是 suspended，尝试唤醒
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** 播放一个简单的包络音：频率、时长、波形、音量 */
function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.08,
  when = 0
) {
  const ac = getCtx();
  if (!ac || muted) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  // 轻微下滑，更柔和
  osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.8, 40), t0 + dur);
  // ADSR 简化：快起音 + 指数衰减
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// —— 各场景音效 ——

/** 普通选择/点击：清脆的木质短音 */
export function sfxClick() {
  tone(523.25, 0.12, "triangle", 0.07); // C5
}

/** 悬停（可选，轻） */
export function sfxHover() {
  tone(784, 0.05, "sine", 0.025); // G5 极轻
}

/** 侧耳倾听 / 窥见邻近线：两声上行的空灵音 */
export function sfxObserve() {
  tone(440, 0.18, "sine", 0.06, 0); // A4
  tone(660, 0.28, "sine", 0.05, 0.1); // E5
}

/** 走入死路：低沉的下行闷音 */
export function sfxDeadEnd() {
  tone(196, 0.35, "sawtooth", 0.06, 0); // G3
  tone(146.83, 0.45, "sine", 0.05, 0.08); // D3
}

/** 回溯：一个温和的回弹音 */
export function sfxBacktrack() {
  tone(330, 0.14, "triangle", 0.05); // E4
}

/** 抵达中心 / 通关：上行的小琶音 */
export function sfxWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((f, i) => tone(f, 0.4, "sine", 0.07, i * 0.13));
}

// —— 静音控制 ——

export function isMuted(): boolean {
  return muted;
}

export function toggleMuted(): boolean {
  muted = !muted;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("forking-garden:muted", muted ? "1" : "0");
  }
  // 取消静音时播一声反馈
  if (!muted) sfxClick();
  return muted;
}

/** 首次用户交互时调用，确保音频上下文已唤醒 */
export function primeAudio() {
  getCtx();
}
