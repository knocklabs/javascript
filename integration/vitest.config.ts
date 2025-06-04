import path from "path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  return {
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      env: loadEnv(mode, "./", ""),
      include: ["./tests/**/*.test.tsx"],
      // alias: {
      //   // "@knocklabs/react": path.resolve(__dirname, "../packages/react"),
      //   // "react": path.resolve(__dirname, "node_modules/react"),
      //   // "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      //   react: path.resolve(process.cwd(), "./node_modules/react"),
      //   "react-dom": path.resolve(process.cwd(), "./node_modules/react-dom"),
      // },
    },
  };
});
