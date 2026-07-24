import { defineConfig } from "vitest/config";

const sharedConfig = defineConfig({
  test: {
    projects: ["packages/*"],
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
        // Dev-only playground (yarn dev:local), not part of the shipped package
        "**/src/App.tsx",
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
