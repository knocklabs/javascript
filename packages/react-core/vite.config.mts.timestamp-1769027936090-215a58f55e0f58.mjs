// vite.config.mts
import { codecovVitePlugin } from "file:///Users/tsyy/work/javascript/node_modules/@codecov/vite-plugin/dist/index.mjs";
import react from "file:///Users/tsyy/work/javascript/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///Users/tsyy/work/javascript/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/tsyy/work/javascript/node_modules/vite-plugin-dts/dist/index.mjs";
import noBundlePlugin from "file:///Users/tsyy/work/javascript/node_modules/vite-plugin-no-bundle/dist/index.js";
var __vite_injected_original_dirname = "/Users/tsyy/work/javascript/packages/react-core";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const CJS = env.BUILD_TARGET?.toLocaleLowerCase()?.match("cjs");
  const formats = CJS ? ["cjs"] : ["es"];
  return {
    plugins: [
      dts({
        outDir: "dist/types"
      }),
      react({
        jsxRuntime: "classic",
        babel: {
          plugins: ["react-require"]
        }
      }),
      noBundlePlugin({ root: "./src" }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== void 0,
        bundleName: "@knocklabs/react-core",
        uploadToken: process.env.CODECOV_TOKEN
      })
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__vite_injected_original_dirname, "src"),
        fileName: `[name]`,
        name: "react-core",
        formats
      },
      rollupOptions: {
        // External packages that should not be bundled
        external: ["react"],
        output: {
          interop: "compat",
          globals: {
            react: "React"
          },
          entryFileNames: () => {
            return `[name].${CJS ? "js" : "mjs"}`;
          }
        }
      }
    },
    test: {
      global: true,
      environment: "jsdom",
      setupFiles: "./setupTest.ts"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3RzeXkvd29yay9qYXZhc2NyaXB0L3BhY2thZ2VzL3JlYWN0LWNvcmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy90c3l5L3dvcmsvamF2YXNjcmlwdC9wYWNrYWdlcy9yZWFjdC1jb3JlL3ZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvdHN5eS93b3JrL2phdmFzY3JpcHQvcGFja2FnZXMvcmVhY3QtY29yZS92aXRlLmNvbmZpZy5tdHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBjb2RlY292Vml0ZVBsdWdpbiB9IGZyb20gXCJAY29kZWNvdi92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBMaWJyYXJ5Rm9ybWF0cywgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuaW1wb3J0IG5vQnVuZGxlUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1uby1idW5kbGVcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcbiAgY29uc3QgQ0pTID0gZW52LkJVSUxEX1RBUkdFVD8udG9Mb2NhbGVMb3dlckNhc2UoKT8ubWF0Y2goXCJjanNcIik7XG4gIGNvbnN0IGZvcm1hdHM6IExpYnJhcnlGb3JtYXRzW10gPSBDSlMgPyBbXCJjanNcIl0gOiBbXCJlc1wiXTtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIGR0cyh7XG4gICAgICAgIG91dERpcjogXCJkaXN0L3R5cGVzXCIsXG4gICAgICB9KSxcbiAgICAgIHJlYWN0KHtcbiAgICAgICAganN4UnVudGltZTogXCJjbGFzc2ljXCIsXG4gICAgICAgIGJhYmVsOiB7XG4gICAgICAgICAgcGx1Z2luczogW1wicmVhY3QtcmVxdWlyZVwiXSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgbm9CdW5kbGVQbHVnaW4oeyByb290OiBcIi4vc3JjXCIgfSksXG4gICAgICBjb2RlY292Vml0ZVBsdWdpbih7XG4gICAgICAgIGVuYWJsZUJ1bmRsZUFuYWx5c2lzOiBwcm9jZXNzLmVudi5DT0RFQ09WX1RPS0VOICE9PSB1bmRlZmluZWQsXG4gICAgICAgIGJ1bmRsZU5hbWU6IFwiQGtub2NrbGFicy9yZWFjdC1jb3JlXCIsXG4gICAgICAgIHVwbG9hZFRva2VuOiBwcm9jZXNzLmVudi5DT0RFQ09WX1RPS0VOLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiBDSlMgPyBcImRpc3QvY2pzXCIgOiBcImRpc3QvZXNtXCIsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBsaWI6IHtcbiAgICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSxcbiAgICAgICAgZmlsZU5hbWU6IGBbbmFtZV1gLFxuICAgICAgICBuYW1lOiBcInJlYWN0LWNvcmVcIixcbiAgICAgICAgZm9ybWF0cyxcbiAgICAgIH0sXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIC8vIEV4dGVybmFsIHBhY2thZ2VzIHRoYXQgc2hvdWxkIG5vdCBiZSBidW5kbGVkXG4gICAgICAgIGV4dGVybmFsOiBbXCJyZWFjdFwiXSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgaW50ZXJvcDogXCJjb21wYXRcIixcbiAgICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICByZWFjdDogXCJSZWFjdFwiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgW25hbWVdLiR7Q0pTID8gXCJqc1wiIDogXCJtanNcIn1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgdGVzdDoge1xuICAgICAgZ2xvYmFsOiB0cnVlLFxuICAgICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcbiAgICAgIHNldHVwRmlsZXM6IFwiLi9zZXR1cFRlc3QudHNcIixcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyx5QkFBeUI7QUFDbEMsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUF5QixjQUFjLGVBQWU7QUFDdEQsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sb0JBQW9CO0FBTjNCLElBQU0sbUNBQW1DO0FBU3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxRQUFNLE1BQU0sSUFBSSxjQUFjLGtCQUFrQixHQUFHLE1BQU0sS0FBSztBQUM5RCxRQUFNLFVBQTRCLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJO0FBRXZELFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLElBQUk7QUFBQSxRQUNGLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxNQUNELE1BQU07QUFBQSxRQUNKLFlBQVk7QUFBQSxRQUNaLE9BQU87QUFBQSxVQUNMLFNBQVMsQ0FBQyxlQUFlO0FBQUEsUUFDM0I7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELGVBQWUsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUFBLE1BQ2hDLGtCQUFrQjtBQUFBLFFBQ2hCLHNCQUFzQixRQUFRLElBQUksa0JBQWtCO0FBQUEsUUFDcEQsWUFBWTtBQUFBLFFBQ1osYUFBYSxRQUFRLElBQUk7QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUSxNQUFNLGFBQWE7QUFBQSxNQUMzQixXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsUUFDSCxPQUFPLFFBQVEsa0NBQVcsS0FBSztBQUFBLFFBQy9CLFVBQVU7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBO0FBQUEsUUFFYixVQUFVLENBQUMsT0FBTztBQUFBLFFBQ2xCLFFBQVE7QUFBQSxVQUNOLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxZQUNQLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQSxnQkFBZ0IsTUFBTTtBQUNwQixtQkFBTyxVQUFVLE1BQU0sT0FBTyxLQUFLO0FBQUEsVUFDckM7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxNQUNKLFFBQVE7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
