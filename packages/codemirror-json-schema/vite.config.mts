/// <reference types="vitest" />
import { codecovVitePlugin } from "@codecov/vite-plugin";
import { resolve } from "path";
import { LibraryFormats, defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import noBundlePlugin from "vite-plugin-no-bundle";

const ENTRYPOINTS = {
  index: resolve(__dirname, "src/index.ts"),
  "json5/index": resolve(__dirname, "src/json5/index.ts"),
  "yaml/index": resolve(__dirname, "src/yaml/index.ts"),
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const CJS = env.BUILD_TARGET?.toLocaleLowerCase()?.match("cjs");
  const formats: LibraryFormats[] = CJS ? ["cjs"] : ["es"];

  return {
    plugins: [
      dts({
        outDir: "dist/types",
      }),
      noBundlePlugin({ root: "./src" }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: "@knocklabs/codemirror-json-schema",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: ENTRYPOINTS,
        fileName: `[name]`,
        name: "codemirror-json-schema",
        formats,
      },
      rollupOptions: {
        // External packages that should not be bundled
        external: [
          "@codemirror/autocomplete",
          "@codemirror/lang-json",
          "@codemirror/lang-yaml",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "codemirror-json5",
          "json5",
        ],
        output: {
          interop: "compat",
          entryFileNames: () => {
            return `[name].${CJS ? "js" : "mjs"}`;
          },
          // Override to allow named and default exports in the same file
          exports: "named",
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
});
