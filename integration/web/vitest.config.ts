import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**"],
      exclude: ["dist/**", "node_modules/**"],
    },
    globals: true,
    environment: "jsdom",
    setupFiles: ["dotenv/config"],
  },
});
