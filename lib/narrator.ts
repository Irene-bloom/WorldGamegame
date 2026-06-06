// 《小径分岔的花园》· 叙事润色接口（预留）
//
// 第一版是纯静态的：直接返回 story.ts 里写好的文本。
// 以后接入 AI（@anthropic-ai/sdk）时，只需替换这里的实现，
// 让 AI 在「不改变谜题逻辑」的前提下，把场景描述润色得更有氛围、更随机。
// 游戏其它部分都通过这个接口拿文案，所以接 AI 时无需改动 UI 或引擎。

import type { StoryNode } from "./story";

/**
 * 取一个节点的叙事正文。
 * 当前：直接返回静态 body。
 * 未来：可改为 async，调用 AI 基于 node.body + 上下文生成润色版本。
 */
export function narrateNode(node: StoryNode): string {
  return node.body;
}

/**
 * 取一条「窥见邻近线」的线索文字。
 * 当前：原样返回。未来可由 AI 改写得更隐晦/更有诗意。
 */
export function narratePeek(hint: string): string {
  return hint;
}

// —— 未来接入 AI 的占位示例（暂不启用）——
//
// import Anthropic from "@anthropic-ai/sdk";
// export async function narrateNodeAI(node: StoryNode): Promise<string> {
//   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//   const msg = await client.messages.create({
//     model: "claude-sonnet-4-5",
//     max_tokens: 400,
//     system: "你是博尔赫斯式的叙事者。在不改变事实和谜题线索的前提下，" +
//             "把给定的场景描述润色得更有氛围。保持简洁、冷峻、带宿命感。",
//     messages: [{ role: "user", content: node.body }],
//   });
//   const block = msg.content[0];
//   return block.type === "text" ? block.text : node.body;
// }
