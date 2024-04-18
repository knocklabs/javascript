/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import execute from "rollup-plugin-execute";
import { LibraryFormats, defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import noBundlePlugin from "vite-plugin-no-bundle";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const CJS = env.BUILD_TARGET?.toLocaleLowerCase()?.match("cjs");
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
      noBundlePlugin({ root: resolve(__dirname, "src") }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src"),
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
            // Move index.css to root of dist
            `mv dist/esm/index.css dist/index.css`,
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
