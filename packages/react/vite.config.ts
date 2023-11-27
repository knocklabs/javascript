import { defineConfig, LibraryFormats, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import noBundlePlugin from "vite-plugin-no-bundle";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const CJS = env.NX_TASK_TARGET_TARGET?.toLocaleLowerCase()?.match("cjs");
  // const ESM = !CJS;
  let formats: LibraryFormats[] = ["es"];
  if (CJS) formats = ["cjs"];

  return {
    plugins: [dts(), react(), noBundlePlugin({ root: "./src" })],
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "react",
        formats,
      },
      rollupOptions: {
        dynamicImportInCjs: false,
        output: {
          interop: "compat",
          format: formats[0],
          assetFileNames: (assetInfo) => {
            // Rename styles to index.css
            if (assetInfo.name === "style.css") return "index.css";
            return assetInfo.name;
          },
        },
        // External packages that should not be bundled
        external: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "@knocklabs/client",
          "date-fns",
          "react",
          "zustand",
        ],
      },
    },
  };
});
