/// <reference types="vitest" />
import { defineConfig, LibraryFormats, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import noBundlePlugin from "vite-plugin-no-bundle";
import dts from "vite-plugin-dts";
import execute from "rollup-plugin-execute";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env?.BUILD_TARGET?.toLowerCase() as LibraryFormats;

  return {
    plugins: [
      dts({
        outDir: "dist/types",
      }),
      react(),
      noBundlePlugin({ root: resolve(__dirname, "src") }),
    ],
    build: {
      outDir: target === "cjs" ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        fileName: "[name]",
        formats: [target],
        name: "react",
      },
      rollupOptions: {
        external: ["react"],
        output: {
          interop: "compat",
          globals: {
            react: "React",
          },
          // External packages that should not be bundled
          assetFileNames: (assetInfo) => {
            // Rename styles to index.css
            if (assetInfo.name === "style.css") {
              return "index.css";
            }
            return assetInfo.name;
          },
        },
        plugins: [
          execute([
            // Move index.css to root of dist
            `mv dist/esm/index.css dist/index.css`,
            // Delete extra .css.js files
            `find ./dist -name "*.css.js" -delete`,
            `find ./dist -name "*.css.js.map" -delete`,
            `find ./dist -name "*.css.esm.js" -delete`,
            `find ./dist -name "*.css.esm.js.map" -delete`,
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
