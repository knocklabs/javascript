import { defineConfig } from "vitest/config";

const sharedConfig = defineConfig({
  test: {
    coverage: {
      provider: "v8",
      all: true,
      include: ["integration/*/src/**"],
      exclude: [
        "**/*.test.ts",
        "**/test/**",
        "*.d.ts",
        "**/dist/**",
        "**/node_modules/**",
      ],
    },
    globals: true,
    environment: "jsdom",
  },
});
export default sharedConfig;
