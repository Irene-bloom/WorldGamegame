import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 花园 / 时间迷宫 主题
        ink: "#0e1512",       // 最深的底色(夜色花园)
        panel: "#141d18",     // 面板
        panel2: "#1b2722",    // 次级面板
        vine: "#3a5a40",      // 藤蔓绿
        mist: "#8a9a91",      // 雾灰(次要文字)
        // 两条时间线的颜色
        alpha: "#5eead4",     // 当前线 / alpha —— 青
        beta: "#fbbf24",      // 邻近线 / beta —— 琥珀
        center: "#f0abfc",    // 中心 —— 微光紫
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        serif: ['Georgia', 'Songti SC', 'SimSun', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
