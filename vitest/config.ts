import { defineConfig } from "vitest/config";

const sharedConfig = defineConfig({
  test: {
    coverage: {
      provider: "v8",
      all: true,
      include: ["packages/*/src/**"],
      exclude: [
        "**/*.test.ts",
        "**/test/**",
        "*.d.ts",
        "**/dist/**",
        "**/node_modules/**",
        // Ignore config packages
        "packages/eslint-config",
        "packages/prettier-config",
        "packages/typescript-config",
        "packages/types",
      ],
    },
    globals: true,
    environment: "jsdom",
  },
});
export default sharedConfig;
