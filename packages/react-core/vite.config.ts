/// <reference types="vitest" />
import { defineConfig, LibraryFormats, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import noBundlePlugin from "vite-plugin-no-bundle";
import dts from "vite-plugin-dts";

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
        babel: {
          plugins: ["babel-plugin-date-fns"],
        },
      }),
      noBundlePlugin({ root: "./src" }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "react-core",
        formats,
      },
      rollupOptions: {
        // External packages that should not be bundled
        external: ["react"],
        output: {
          interop: "compat",
          format: formats[0],
          globals: {
            react: "React",
          },
          entryFileNames: () => {
            return "[name].js";
          },
        },
      },
    },
    test: {},
  };
});
