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
    },
  };
});
