/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { resolve } from "path";
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
      dts({
        outDir: "dist/types",
      }),
      react({
        jsxRuntime: "classic",
        babel: {
          plugins: ["react-require"],
        },
      }),
      noBundlePlugin({ root: "./src" }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src"),
        fileName: `[name]`,
        name: "react-core",
        formats,
      },
      rollupOptions: {
        // External packages that should not be bundled
        external: ["react"],
        output: {
          interop: "compat",
          globals: {
            react: "React",
          },
          entryFileNames: () => {
            return `[name].${CJS ? "js" : "mjs"}`;
          },
        },
      },
    },
    test: {
      global: true,
      environment: "jsdom",
      setupFiles: "./setupTest.ts",
    },
  };
});
