import { defineConfig, LibraryFormats, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const CJS = env.NX_TASK_TARGET_TARGET?.toLocaleLowerCase()?.match("cjs");
  const ESM = !CJS;
  let formats: LibraryFormats[] = ["es"];
  if (CJS) formats = ["cjs"];

  return {
    plugins: [
      // dts({
      //   entryRoot: "src",
      //   tsConfigFilePath: path.join(__dirname, "tsconfig.lib.json"),
      //   skipDiagnostics: true,
      //   outputDir: path.join(
      //     __dirname,
      //     "../../dist/packages/react-headless/dist/types",
      //   ),
      // }),
      react(),
      // noBundlePlugin({ copy: "**/*.css", root: "./src" }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "react",
        formats: ["es"],
      },
      rollupOptions: {
        dynamicImportInCjs: false,
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
  };
});
