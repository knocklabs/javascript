import { defineConfig, LibraryFormats, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import noBundlePlugin from "vite-plugin-no-bundle";
import dts from "vite-plugin-dts";
import del from "rollup-plugin-delete";
import execute from "rollup-plugin-execute";

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
      react(),
      noBundlePlugin({ root: "./src" }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "react",
        formats,
      },
      rollupOptions: {
        output: {
          interop: "compat",
          format: formats[0],
          assetFileNames: (assetInfo) => {
            // Rename styles to index.css
            if (assetInfo.name === "style.css") {
              return "index.css";
            }
            return assetInfo.name;
          },
        },
        // External packages that should not be bundled
        external: ["react", "react-dom"],
        plugins: [
          // Remove css imports
          // TODO
          // Delete extra .css.js files
          del({ targets: "dist/**/*.css.*" }),
          // Move index.css to root of dist
          execute(["mv dist/esm/index.css dist/index.css"]),
        ],
      },
    },
  };
});
