/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import execute from "rollup-plugin-execute";
import { LibraryFormats, defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import noBundlePlugin from "vite-plugin-no-bundle";

import fs from "fs/promises";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const buildTarget = env.BUILD_TARGET?.toLocaleLowerCase() ?? "cjs";
  const CJS = buildTarget.match("cjs");
  const formats: LibraryFormats[] = CJS ? ["cjs"] : ["es"];

  return {
    plugins: [
      react({
        jsxRuntime: "classic",
        babel: {
          plugins: ["react-require"],
        },
      }),
      dts({
        outDir: "dist/types",
      }),
      noBundlePlugin({ root: path.resolve(__dirname, "src") }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, "src"),
        fileName: "[name]",
        formats,
        name: "react",
      },
      rollupOptions: {
        // External packages that should not be bundled
        external: ["react", "react-dom"],
        output: {
          interop: "compat",
          globals: {
            react: "React",
          },
          assetFileNames: (assetInfo) => {
            // Rename styles to index.css
            if (assetInfo.name === "style.css") {
              return "index.css";
            }
            return assetInfo.name;
          },
          entryFileNames: () => {
            return `[name].${CJS ? "js" : "mjs"}`;
          },
        },
        plugins: [
          execute([
            // Delete extra .css.js files
            `find ./dist -name "*.css.js" -delete`,
            `find ./dist -name "*.css.js.map" -delete`,
            `find ./dist -name "*.css.mjs" -delete`,
            `find ./dist -name "*.css.mjs.map" -delete`,
          ]),
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
          {
            name: "generate-css-tokens",
            enforce: "post",
            closeBundle: async () => {
              try {
                // 1. Update Telegraph tokens to use `knock` prefix instead of tgph
                const tokensFile = path.resolve(
                  __dirname,
                  "../../node_modules/@telegraph/tokens/dist/css/default.css",
                );

                let tokensCss = await fs.readFile(tokensFile, "utf-8");
                tokensCss = tokensCss.replace(/--tgph/g, "--knock");
                tokensCss = tokensCss.replace(
                  /data-tgph-appearance/g,
                  "data-knock-color-mode",
                );

                // 2. Add to index.css file
                let indexCss = await fs.readFile(
                  path.resolve(__dirname, `dist/${buildTarget}/index.css`),
                  "utf-8",
                );
                indexCss = tokensCss + indexCss;

                // 3. Write index.css to root of dist
                await fs.writeFile(
                  path.resolve(__dirname, "dist/index.css"),
                  indexCss,
                );

                // 4. Delete build target index.css
                await fs.rm(
                  path.resolve(__dirname, `dist/${buildTarget}/index.css`),
                );
              } catch (error) {
                console.error("Error processing CSS:", error);
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
