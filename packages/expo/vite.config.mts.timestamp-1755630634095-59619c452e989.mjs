// vite.config.mts
import { codecovVitePlugin } from "file:///Users/connor/Dev/knock/javascript/node_modules/@codecov/vite-plugin/dist/index.mjs";
import react from "file:///Users/connor/Dev/knock/javascript/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///Users/connor/Dev/knock/javascript/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/connor/Dev/knock/javascript/node_modules/vite-plugin-dts/dist/index.mjs";
import noBundlePlugin from "file:///Users/connor/Dev/knock/javascript/node_modules/vite-plugin-no-bundle/dist/index.js";
var __vite_injected_original_dirname = "/Users/connor/Dev/knock/javascript/packages/expo";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const CJS = env.BUILD_TARGET?.toLocaleLowerCase()?.match("cjs");
  const formats = CJS ? ["cjs"] : ["es"];
  return {
    plugins: [
      dts({
        outDir: "dist/types"
      }),
      react(),
      noBundlePlugin({ copy: "**/*.css", root: "./src" }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== void 0,
        bundleName: "@knocklabs/expo",
        uploadToken: process.env.CODECOV_TOKEN
      })
    ],
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
        name: "expo",
        formats
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [
          "react",
          "react-native",
          "expo",
          "expo-constants",
          "expo-device",
          "expo-notifications"
        ],
        output: {
          interop: "compat",
          format: formats[0],
          globals: {
            react: "React"
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2Nvbm5vci9EZXYva25vY2svamF2YXNjcmlwdC9wYWNrYWdlcy9leHBvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY29ubm9yL0Rldi9rbm9jay9qYXZhc2NyaXB0L3BhY2thZ2VzL2V4cG8vdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9jb25ub3IvRGV2L2tub2NrL2phdmFzY3JpcHQvcGFja2FnZXMvZXhwby92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBjb2RlY292Vml0ZVBsdWdpbiB9IGZyb20gXCJAY29kZWNvdi92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBMaWJyYXJ5Rm9ybWF0cywgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuaW1wb3J0IG5vQnVuZGxlUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1uby1idW5kbGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuICBjb25zdCBDSlMgPSBlbnYuQlVJTERfVEFSR0VUPy50b0xvY2FsZUxvd2VyQ2FzZSgpPy5tYXRjaChcImNqc1wiKTtcbiAgY29uc3QgZm9ybWF0czogTGlicmFyeUZvcm1hdHNbXSA9IENKUyA/IFtcImNqc1wiXSA6IFtcImVzXCJdO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgZHRzKHtcbiAgICAgICAgb3V0RGlyOiBcImRpc3QvdHlwZXNcIixcbiAgICAgIH0pLFxuICAgICAgcmVhY3QoKSxcbiAgICAgIG5vQnVuZGxlUGx1Z2luKHsgY29weTogXCIqKi8qLmNzc1wiLCByb290OiBcIi4vc3JjXCIgfSksXG4gICAgICBjb2RlY292Vml0ZVBsdWdpbih7XG4gICAgICAgIGVuYWJsZUJ1bmRsZUFuYWx5c2lzOiBwcm9jZXNzLmVudi5DT0RFQ09WX1RPS0VOICE9PSB1bmRlZmluZWQsXG4gICAgICAgIGJ1bmRsZU5hbWU6IFwiQGtub2NrbGFicy9leHBvXCIsXG4gICAgICAgIHVwbG9hZFRva2VuOiBwcm9jZXNzLmVudi5DT0RFQ09WX1RPS0VOLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiBDSlMgPyBcImRpc3QvY2pzXCIgOiBcImRpc3QvZXNtXCIsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBsaWI6IHtcbiAgICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9pbmRleC50c1wiKSxcbiAgICAgICAgbmFtZTogXCJleHBvXCIsXG4gICAgICAgIGZvcm1hdHMsXG4gICAgICB9LFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAvLyBFeHRlcm5hbCBwYWNrYWdlcyB0aGF0IHNob3VsZCBub3QgYmUgYnVuZGxlZCBpbnRvIHlvdXIgbGlicmFyeS5cbiAgICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgICAgXCJyZWFjdC1uYXRpdmVcIixcbiAgICAgICAgICBcImV4cG9cIixcbiAgICAgICAgICBcImV4cG8tY29uc3RhbnRzXCIsXG4gICAgICAgICAgXCJleHBvLWRldmljZVwiLFxuICAgICAgICAgIFwiZXhwby1ub3RpZmljYXRpb25zXCIsXG4gICAgICAgIF0sXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGludGVyb3A6IFwiY29tcGF0XCIsXG4gICAgICAgICAgZm9ybWF0OiBmb3JtYXRzWzBdLFxuICAgICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIHJlYWN0OiBcIlJlYWN0XCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVSxTQUFTLHlCQUF5QjtBQUN0VyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQXlCLGNBQWMsZUFBZTtBQUN0RCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxvQkFBb0I7QUFMM0IsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sTUFBTSxJQUFJLGNBQWMsa0JBQWtCLEdBQUcsTUFBTSxLQUFLO0FBQzlELFFBQU0sVUFBNEIsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUk7QUFFdkQsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUFBLE1BQ0QsTUFBTTtBQUFBLE1BQ04sZUFBZSxFQUFFLE1BQU0sWUFBWSxNQUFNLFFBQVEsQ0FBQztBQUFBLE1BQ2xELGtCQUFrQjtBQUFBLFFBQ2hCLHNCQUFzQixRQUFRLElBQUksa0JBQWtCO0FBQUEsUUFDcEQsWUFBWTtBQUFBLFFBQ1osYUFBYSxRQUFRLElBQUk7QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUSxNQUFNLGFBQWE7QUFBQSxNQUMzQixXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsUUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLFFBQ3hDLE1BQU07QUFBQSxRQUNOO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBO0FBQUEsUUFFYixVQUFVO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sU0FBUztBQUFBLFVBQ1QsUUFBUSxRQUFRLENBQUM7QUFBQSxVQUNqQixTQUFTO0FBQUEsWUFDUCxPQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
