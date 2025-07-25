/// <reference types="vitest" />
import { codecovVitePlugin } from "@codecov/vite-plugin";
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
      noBundlePlugin({ root: "./src" }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: "@knocklabs/client",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
    define: {
      "process.env.CLIENT_PACKAGE_VERSION": JSON.stringify(
        // TS doesn't like regular imports from package.json with NodeNext,
        // so we'll just use require() and ignore the type error.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("./package.json").version,
      ),
    },
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src"),
        fileName: `[name]`,
        name: "client",
        formats,
      },
      rollupOptions: {
        output: {
          interop: "compat",
          entryFileNames: () => {
            return `[name].${CJS ? "js" : "mjs"}`;
          },
          // Override to allow named and default exports in the same file
          exports: "named",
        },
      },
    },
  };
});
