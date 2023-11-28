/// <reference types="vitest" />
import { LibraryFormats, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import dts from "vite-plugin-dts";
import * as path from "path";
import noBundlePlugin from "vite-plugin-no-bundle";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  const CJS = env.NX_TASK_TARGET_TARGET?.toLocaleLowerCase()?.match("cjs");
  const ESM = !CJS;
  let formats: LibraryFormats[] = ["es"];
  if (CJS) formats = ["cjs"];

  return {
    cacheDir: "../../node_modules/.vite/react-headless",

    plugins: [
      dts({
        entryRoot: "src",
        tsConfigFilePath: path.join(__dirname, "tsconfig.lib.json"),
        skipDiagnostics: true,
        outputDir: path.join(
          __dirname,
          "../../dist/packages/react-headless/dist/types",
        ),
      }),
      react(),
      nxViteTsPaths(),
      noBundlePlugin({ copy: "**/*.css", root: "./src" }),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: "src/index.ts",
        name: "react-headless",
        fileName: "index",
        // Change this to the formats you want to support.
        // Don't forget to update your package.json as well.
        formats,
      },
      rollupOptions: {
        output: {
          interop: "compat",
          format: formats[0],
        },
        // External packages that should not be bundled into your library.
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

    test: {
      globals: true,
      cache: {
        dir: "../../node_modules/.vitest",
      },
      environment: "jsdom",
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
  };
});
