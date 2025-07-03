import { codecovVitePlugin } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { LibraryFormats, defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import noBundlePlugin from "vite-plugin-no-bundle";

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
      noBundlePlugin({ copy: "**/*.css", root: "./src" }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: "@knocklabs/expo",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "expo",
        formats,
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [
          "react",
          "react-native",
          "expo",
          "expo-constants",
          "expo-device",
          "expo-notifications",
        ],
        output: {
          interop: "compat",
          format: formats[0],
          globals: {
            react: "React",
          },
        },
      },
    },
  };
});
