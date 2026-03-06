// vite.config.mts
import { codecovVitePlugin } from "file:///Users/tsyy/work/javascript/node_modules/@codecov/vite-plugin/dist/index.mjs";
import react from "file:///Users/tsyy/work/javascript/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import execute from "file:///Users/tsyy/work/javascript/node_modules/rollup-plugin-execute/index.js";
import preserveDirectives from "file:///Users/tsyy/work/javascript/node_modules/rollup-preserve-directives/dist/es/index.mjs";
import { defineConfig, loadEnv } from "file:///Users/tsyy/work/javascript/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/tsyy/work/javascript/node_modules/vite-plugin-dts/dist/index.mjs";
import noBundlePlugin from "file:///Users/tsyy/work/javascript/node_modules/vite-plugin-no-bundle/dist/index.js";
var __vite_injected_original_dirname = "/Users/tsyy/work/javascript/packages/react";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const buildTarget = env.BUILD_TARGET?.toLocaleLowerCase() ?? "cjs";
  const CJS = buildTarget.match("cjs");
  const formats = CJS ? ["cjs"] : ["es"];
  return {
    plugins: [
      react({
        jsxRuntime: "classic",
        babel: {
          plugins: ["react-require"]
        }
      }),
      dts({
        outDir: "dist/types"
      }),
      preserveDirectives(),
      noBundlePlugin({ root: path.resolve(__vite_injected_original_dirname, "src") }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== void 0,
        bundleName: "@knocklabs/react",
        uploadToken: process.env.CODECOV_TOKEN
      })
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: {
          index: path.resolve(__vite_injected_original_dirname, "src"),
          next: path.resolve(__vite_injected_original_dirname, "src/next/index.ts"),
          tanstack: path.resolve(__vite_injected_original_dirname, "src/tanstack/index.ts")
        },
        fileName: "[name]",
        formats,
        name: "react"
      },
      rollupOptions: {
        // External peer dependency packages that should not be bundled
        external: ["react", "react-dom", "next", /^next\/.*/, "@tanstack/react-router"],
        output: {
          interop: "compat",
          globals: {
            react: "React"
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === "style.css") {
              return "index.css";
            }
            return assetInfo.name;
          },
          entryFileNames: () => {
            return `[name].${CJS ? "js" : "mjs"}`;
          }
        },
        plugins: [
          execute([
            // Move index.css to root of dist
            `mv dist/esm/index.css dist/index.css`,
            // Delete extra .css.js files
            `find ./dist -name "*.css.js" -delete`,
            `find ./dist -name "*.css.js.map" -delete`,
            `find ./dist -name "*.css.mjs" -delete`,
            `find ./dist -name "*.css.mjs.map" -delete`
          ]),
          // Remove css imports
          {
            name: "remove-css-imports",
            generateBundle(_options, bundle) {
              for (const fileName in bundle) {
                const file = bundle[fileName];
                if (file?.type === "chunk") {
                  const pattern = /(import ".*?\.css\..*?";)|(require\(['"][^()]+\.css(\.js)?['"]\);?)/g;
                  file.code = file.code.replace(pattern, "");
                }
              }
            }
          }
        ]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3RzeXkvd29yay9qYXZhc2NyaXB0L3BhY2thZ2VzL3JlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvdHN5eS93b3JrL2phdmFzY3JpcHQvcGFja2FnZXMvcmVhY3Qvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy90c3l5L3dvcmsvamF2YXNjcmlwdC9wYWNrYWdlcy9yZWFjdC92aXRlLmNvbmZpZy5tdHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBjb2RlY292Vml0ZVBsdWdpbiB9IGZyb20gXCJAY29kZWNvdi92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBleGVjdXRlIGZyb20gXCJyb2xsdXAtcGx1Z2luLWV4ZWN1dGVcIjtcbmltcG9ydCBwcmVzZXJ2ZURpcmVjdGl2ZXMgZnJvbSBcInJvbGx1cC1wcmVzZXJ2ZS1kaXJlY3RpdmVzXCI7XG5pbXBvcnQgeyBMaWJyYXJ5Rm9ybWF0cywgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuaW1wb3J0IG5vQnVuZGxlUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1uby1idW5kbGVcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcbiAgY29uc3QgYnVpbGRUYXJnZXQgPSBlbnYuQlVJTERfVEFSR0VUPy50b0xvY2FsZUxvd2VyQ2FzZSgpID8/IFwiY2pzXCI7XG4gIGNvbnN0IENKUyA9IGJ1aWxkVGFyZ2V0Lm1hdGNoKFwiY2pzXCIpO1xuICBjb25zdCBmb3JtYXRzOiBMaWJyYXJ5Rm9ybWF0c1tdID0gQ0pTID8gW1wiY2pzXCJdIDogW1wiZXNcIl07XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCh7XG4gICAgICAgIGpzeFJ1bnRpbWU6IFwiY2xhc3NpY1wiLFxuICAgICAgICBiYWJlbDoge1xuICAgICAgICAgIHBsdWdpbnM6IFtcInJlYWN0LXJlcXVpcmVcIl0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIGR0cyh7XG4gICAgICAgIG91dERpcjogXCJkaXN0L3R5cGVzXCIsXG4gICAgICB9KSxcbiAgICAgIHByZXNlcnZlRGlyZWN0aXZlcygpLFxuICAgICAgbm9CdW5kbGVQbHVnaW4oeyByb290OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSB9KSxcbiAgICAgIGNvZGVjb3ZWaXRlUGx1Z2luKHtcbiAgICAgICAgZW5hYmxlQnVuZGxlQW5hbHlzaXM6IHByb2Nlc3MuZW52LkNPREVDT1ZfVE9LRU4gIT09IHVuZGVmaW5lZCxcbiAgICAgICAgYnVuZGxlTmFtZTogXCJAa25vY2tsYWJzL3JlYWN0XCIsXG4gICAgICAgIHVwbG9hZFRva2VuOiBwcm9jZXNzLmVudi5DT0RFQ09WX1RPS0VOLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiBDSlMgPyBcImRpc3QvY2pzXCIgOiBcImRpc3QvZXNtXCIsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBsaWI6IHtcbiAgICAgICAgZW50cnk6IHtcbiAgICAgICAgICBpbmRleDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIiksXG4gICAgICAgICAgbmV4dDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvbmV4dC9pbmRleC50c1wiKSxcbiAgICAgICAgICB0YW5zdGFjazogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvdGFuc3RhY2svaW5kZXgudHNcIiksXG4gICAgICAgIH0sXG4gICAgICAgIGZpbGVOYW1lOiBcIltuYW1lXVwiLFxuICAgICAgICBmb3JtYXRzLFxuICAgICAgICBuYW1lOiBcInJlYWN0XCIsXG4gICAgICB9LFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAvLyBFeHRlcm5hbCBwZWVyIGRlcGVuZGVuY3kgcGFja2FnZXMgdGhhdCBzaG91bGQgbm90IGJlIGJ1bmRsZWRcbiAgICAgICAgZXh0ZXJuYWw6IFsgXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcIm5leHRcIiwgL15uZXh0XFwvLiovLCBcIkB0YW5zdGFjay9yZWFjdC1yb3V0ZXJcIiBdLFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBpbnRlcm9wOiBcImNvbXBhdFwiLFxuICAgICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIHJlYWN0OiBcIlJlYWN0XCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgICAgLy8gUmVuYW1lIHN0eWxlcyB0byBpbmRleC5jc3NcbiAgICAgICAgICAgIGlmIChhc3NldEluZm8ubmFtZSA9PT0gXCJzdHlsZS5jc3NcIikge1xuICAgICAgICAgICAgICByZXR1cm4gXCJpbmRleC5jc3NcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhc3NldEluZm8ubmFtZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYFtuYW1lXS4ke0NKUyA/IFwianNcIiA6IFwibWpzXCJ9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgZXhlY3V0ZShbXG4gICAgICAgICAgICAvLyBNb3ZlIGluZGV4LmNzcyB0byByb290IG9mIGRpc3RcbiAgICAgICAgICAgIGBtdiBkaXN0L2VzbS9pbmRleC5jc3MgZGlzdC9pbmRleC5jc3NgLFxuICAgICAgICAgICAgLy8gRGVsZXRlIGV4dHJhIC5jc3MuanMgZmlsZXNcbiAgICAgICAgICAgIGBmaW5kIC4vZGlzdCAtbmFtZSBcIiouY3NzLmpzXCIgLWRlbGV0ZWAsXG4gICAgICAgICAgICBgZmluZCAuL2Rpc3QgLW5hbWUgXCIqLmNzcy5qcy5tYXBcIiAtZGVsZXRlYCxcbiAgICAgICAgICAgIGBmaW5kIC4vZGlzdCAtbmFtZSBcIiouY3NzLm1qc1wiIC1kZWxldGVgLFxuICAgICAgICAgICAgYGZpbmQgLi9kaXN0IC1uYW1lIFwiKi5jc3MubWpzLm1hcFwiIC1kZWxldGVgLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIC8vIFJlbW92ZSBjc3MgaW1wb3J0c1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwicmVtb3ZlLWNzcy1pbXBvcnRzXCIsXG4gICAgICAgICAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZU5hbWUgaW4gYnVuZGxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGJ1bmRsZVtmaWxlTmFtZV07XG5cbiAgICAgICAgICAgICAgICBpZiAoZmlsZT8udHlwZSA9PT0gXCJjaHVua1wiKSB7XG4gICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIC5jc3MgaW1wb3J0cyBhbmQgcmVxdWlyZXNcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPVxuICAgICAgICAgICAgICAgICAgICAvKGltcG9ydCBcIi4qP1xcLmNzc1xcLi4qP1wiOyl8KHJlcXVpcmVcXChbJ1wiXVteKCldK1xcLmNzcyhcXC5qcyk/WydcIl1cXCk7PykvZztcbiAgICAgICAgICAgICAgICAgIGZpbGUuY29kZSA9IGZpbGUuY29kZS5yZXBsYWNlKHBhdHRlcm4sIFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHRlc3Q6IHtcbiAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgICBzZXR1cEZpbGVzOiBcIi4vc2V0dXBUZXN0LnRzXCIsXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMseUJBQXlCO0FBQ2xDLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sd0JBQXdCO0FBQy9CLFNBQXlCLGNBQWMsZUFBZTtBQUN0RCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxvQkFBb0I7QUFSM0IsSUFBTSxtQ0FBbUM7QUFXekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sY0FBYyxJQUFJLGNBQWMsa0JBQWtCLEtBQUs7QUFDN0QsUUFBTSxNQUFNLFlBQVksTUFBTSxLQUFLO0FBQ25DLFFBQU0sVUFBNEIsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUk7QUFFdkQsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osWUFBWTtBQUFBLFFBQ1osT0FBTztBQUFBLFVBQ0wsU0FBUyxDQUFDLGVBQWU7QUFBQSxRQUMzQjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUFBLE1BQ0QsbUJBQW1CO0FBQUEsTUFDbkIsZUFBZSxFQUFFLE1BQU0sS0FBSyxRQUFRLGtDQUFXLEtBQUssRUFBRSxDQUFDO0FBQUEsTUFDdkQsa0JBQWtCO0FBQUEsUUFDaEIsc0JBQXNCLFFBQVEsSUFBSSxrQkFBa0I7QUFBQSxRQUNwRCxZQUFZO0FBQUEsUUFDWixhQUFhLFFBQVEsSUFBSTtBQUFBLE1BQzNCLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRLE1BQU0sYUFBYTtBQUFBLE1BQzNCLFdBQVc7QUFBQSxNQUNYLEtBQUs7QUFBQSxRQUNILE9BQU87QUFBQSxVQUNMLE9BQU8sS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxVQUNwQyxNQUFNLEtBQUssUUFBUSxrQ0FBVyxtQkFBbUI7QUFBQSxVQUNqRCxVQUFVLEtBQUssUUFBUSxrQ0FBVyx1QkFBdUI7QUFBQSxRQUMzRDtBQUFBLFFBQ0EsVUFBVTtBQUFBLFFBQ1Y7QUFBQSxRQUNBLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQSxlQUFlO0FBQUE7QUFBQSxRQUViLFVBQVUsQ0FBRSxTQUFTLGFBQWEsUUFBUSxhQUFhLHdCQUF5QjtBQUFBLFFBQ2hGLFFBQVE7QUFBQSxVQUNOLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxZQUNQLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQSxnQkFBZ0IsQ0FBQyxjQUFjO0FBRTdCLGdCQUFJLFVBQVUsU0FBUyxhQUFhO0FBQ2xDLHFCQUFPO0FBQUEsWUFDVDtBQUNBLG1CQUFPLFVBQVU7QUFBQSxVQUNuQjtBQUFBLFVBQ0EsZ0JBQWdCLE1BQU07QUFDcEIsbUJBQU8sVUFBVSxNQUFNLE9BQU8sS0FBSztBQUFBLFVBQ3JDO0FBQUEsUUFDRjtBQUFBLFFBQ0EsU0FBUztBQUFBLFVBQ1AsUUFBUTtBQUFBO0FBQUEsWUFFTjtBQUFBO0FBQUEsWUFFQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0YsQ0FBQztBQUFBO0FBQUEsVUFFRDtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sZUFBZSxVQUFVLFFBQVE7QUFDL0IseUJBQVcsWUFBWSxRQUFRO0FBQzdCLHNCQUFNLE9BQU8sT0FBTyxRQUFRO0FBRTVCLG9CQUFJLE1BQU0sU0FBUyxTQUFTO0FBRTFCLHdCQUFNLFVBQ0o7QUFDRix1QkFBSyxPQUFPLEtBQUssS0FBSyxRQUFRLFNBQVMsRUFBRTtBQUFBLGdCQUMzQztBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLE1BQ1IsYUFBYTtBQUFBLE1BQ2IsWUFBWTtBQUFBLElBQ2Q7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
