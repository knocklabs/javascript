/// <reference types="vitest" />
import { codecovVitePlugin } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { createRequire } from "module";
import path from "path";
import preserveDirectives from "rollup-preserve-directives";
import { LibraryFormats, defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import noBundlePlugin from "vite-plugin-no-bundle";

const require = createRequire(import.meta.url);
const styleEnginePlugin = require("@telegraph/style-engine/postcss");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const buildTarget = env.BUILD_TARGET?.toLocaleLowerCase() ?? "cjs";
  const CJS = buildTarget.match("cjs");
  const formats: LibraryFormats[] = CJS ? ["cjs"] : ["es"];

  return {
    css: {
      postcss: {
        plugins: [styleEnginePlugin()],
      },
    },
    plugins: [
      react(),
      dts({
        outDir: "dist/types",
      }),
      preserveDirectives(),
      noBundlePlugin({ root: path.resolve(__dirname, "src") }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: "@knocklabs/react",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: {
          index: path.resolve(__dirname, "src"),
          next: path.resolve(__dirname, "src/next/index.ts"),
          tanstack: path.resolve(__dirname, "src/tanstack/index.ts"),
        },
        fileName: "[name]",
        formats,
        name: "react",
      },
      rollupOptions: {
        // External peer dependency packages that should not be bundled
        external: [ "react", "react-dom", "next", /^next\/.*/, "@tanstack/react-router" ],
        output: {
          // Rolldown defaults `strict` to "auto", which respects source-level
          // directives. TS/ESM sources never write one, so CJS output would
          // ship sloppy-mode. Rollup defaulted this to true.
          strict: true,
          globals: {
            react: "React",
          },
          assetFileNames: (assetInfo) => {
            // Rename styles to index.css. Rolldown names the stylesheet after
            // the lib entry rather than "style.css", so match on the extension.
            if (assetInfo.name?.endsWith(".css")) {
              return "index.css";
            }
            return assetInfo.name;
          },
          entryFileNames: (chunkInfo) => {
            // Chunks from `?inline` CSS imports carry the compiled style
            // string as code, so they must not be named like the empty .css
            // proxy chunks that get deleted and stripped below.
            if (chunkInfo.facadeModuleId?.endsWith("?inline")) {
              return `[name].inline.${CJS ? "js" : "mjs"}`;
            }
            return `[name].${CJS ? "js" : "mjs"}`;
          },
        },
        plugins: [
          {
            // Move index.css to root of dist. `assetFileNames` can't do this
            // itself, since rolldown rejects patterns that escape the outDir.
            name: "move-index-css-to-dist-root",
            writeBundle() {
              const from = path.resolve(__dirname, "dist/esm/index.css");
              const to = path.resolve(__dirname, "dist/index.css");
              if (fs.existsSync(from)) {
                fs.renameSync(from, to);
              }
            },
          },
          // Remove css imports
          {
            name: "remove-css-imports",
            generateBundle(_options, bundle) {
              for (const fileName in bundle) {
                const file = bundle[fileName];

                if (file?.type === "chunk") {
                  // Replace .css imports and requires
                  const pattern =
                    /(import ".*?\.css\..*?";)|(require\(['"][^()]+\.css(\.js)?['"]\);?)/g;
                  file.code = file.code.replace(pattern, "");
                }
              }
            },
          },
        ],
      },
    },
    test: {
      global: true,
      environment: "jsdom",
      setupFiles: "./setupTest.ts",
    },
  };
});
