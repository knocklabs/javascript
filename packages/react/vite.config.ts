import { defineConfig, LibraryFormats, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import noBundlePlugin from "vite-plugin-no-bundle";
import dts from "vite-plugin-dts";
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
        // External packages that should not be bundled
        external: ["react", "react-dom"],
        output: {
          interop: "compat",
          format: formats[0],
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
        },
        plugins: [
          execute([
            // Move index.css to root of dist
            `mv dist/esm/index.css dist/index.css`,
            // Delete extra .css.js files
            `rm dist/**/*.css.*`,
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
                    /(import\s+['"].+\.css(\.mjs)?['"];?)|(require\(['"][^()]+\.css(\.js)?['"]\);?)/;
                  file.code = file.code.replace(pattern, "");
                }
              }
            },
          },
        ],
      },
    },
  };
});
