import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 羊皮纸植物园 · 亮色主题
        parchment: "#f5f0e6", // 背景：暖米
        panel: "#fffdf8",     // 面板：米白
        panel2: "#f3ecdd",    // 次级面板：浅米
        line: "#e2d8c3",      // 描边/分隔线
        ink: "#3a3228",       // 主文字：深棕
        mute: "#8a7f6c",      // 次要文字：灰棕
        // 三种语义色（在亮底上的可读版本）
        alpha: "#2f8f7f",     // 当前线 —— 松绿
        beta: "#c8962a",      // 邻近线 —— 金褐
        center: "#b06ab0",    // 中心 —— 葵紫
        vine: "#5a7d52",      // 藤蔓绿（连线/点缀）
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        serif: ['Georgia', 'Songti SC', 'STSong', 'SimSun', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
