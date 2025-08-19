var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      name: "@knocklabs/client",
      version: "0.16.5",
      description: "The clientside library for interacting with Knock",
      homepage: "https://github.com/knocklabs/javascript/tree/main/packages/client",
      author: "@knocklabs",
      license: "MIT",
      main: "dist/cjs/index.js",
      module: "dist/esm/index.mjs",
      types: "dist/types/index.d.ts",
      typings: "dist/types/index.d.ts",
      "react-native": "./src/index.ts",
      exports: {
        ".": {
          require: "./dist/cjs/index.js",
          import: "./dist/esm/index.mjs",
          types: "./dist/types/index.d.ts",
          "react-native": "./src/index.ts",
          default: "./dist/esm/index.mjs"
        }
      },
      files: [
        "dist",
        "src",
        "README.md"
      ],
      repository: {
        type: "git",
        url: "git+https://github.com/knocklabs/javascript.git"
      },
      bugs: {
        url: "https://github.com/knocklabs/javascript/issues"
      },
      scripts: {
        dev: "tsc && vite build --watch --emptyOutDir false",
        lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        format: 'prettier "src/**/*.{js,ts,tsx}" --write',
        "format:check": 'prettier "src/**/*.{js,ts,tsx}" --check',
        "type:check": "tsc --noEmit",
        coverage: "vitest run --coverage",
        clean: "rimraf dist",
        build: "yarn clean && yarn build:cjs && yarn build:esm",
        "build:esm": "BUILD_TARGET=esm;  vite build",
        "build:cjs": "BUILD_TARGET=cjs;  vite build",
        prepublishOnly: "npm run build"
      },
      devDependencies: {
        "@babel/cli": "^7.27.2",
        "@babel/core": "^7.28.0",
        "@babel/plugin-proposal-class-properties": "^7.16.7",
        "@babel/plugin-proposal-object-rest-spread": "^7.16.7",
        "@babel/plugin-transform-runtime": "^7.28.0",
        "@babel/preset-env": "^7.28.3",
        "@babel/preset-typescript": "^7.27.0",
        "@codecov/vite-plugin": "^1.9.1",
        "@types/jsonwebtoken": "^9.0.10",
        "@typescript-eslint/eslint-plugin": "^8.32.0",
        "@typescript-eslint/parser": "^8.39.1",
        "cross-env": "^7.0.3",
        crypto: "^1.0.1",
        eslint: "^8.56.0",
        jsonwebtoken: "^9.0.2",
        prettier: "^3.5.3",
        rimraf: "^6.0.1",
        rollup: "^4.41.1",
        typescript: "^5.8.3",
        vite: "^5.4.19",
        vitest: "^3.1.1"
      },
      dependencies: {
        "@babel/runtime": "^7.27.1",
        "@knocklabs/types": "workspace:^",
        "@tanstack/store": "^0.7.2",
        "@types/phoenix": "^1.6.6",
        axios: "^1.11.0",
        "axios-retry": "^4.5.0",
        eventemitter2: "^6.4.5",
        "jwt-decode": "^4.0.0",
        nanoid: "^3.3.11",
        phoenix: "1.7.21",
        "urlpattern-polyfill": "^10.0.0"
      }
    };
  }
});

// vite.config.mts
import { codecovVitePlugin } from "file:///Users/connor/Dev/knock/javascript/node_modules/@codecov/vite-plugin/dist/index.mjs";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///Users/connor/Dev/knock/javascript/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/connor/Dev/knock/javascript/node_modules/vite-plugin-dts/dist/index.mjs";
import noBundlePlugin from "file:///Users/connor/Dev/knock/javascript/node_modules/vite-plugin-no-bundle/dist/index.js";
var __vite_injected_original_dirname = "/Users/connor/Dev/knock/javascript/packages/client";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const CJS = env.BUILD_TARGET?.toLocaleLowerCase()?.match("cjs");
  const formats = CJS ? ["cjs"] : ["es"];
  return {
    plugins: [
      dts({
        outDir: "dist/types"
      }),
      noBundlePlugin({ root: "./src" }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== void 0,
        bundleName: "@knocklabs/client",
        uploadToken: process.env.CODECOV_TOKEN
      })
    ],
    define: {
      "process.env.CLIENT_PACKAGE_VERSION": JSON.stringify(
        // TS doesn't like regular imports from package.json with NodeNext,
        // so we'll just use require() and ignore the type error.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require_package().version
      )
    },
    build: {
      outDir: CJS ? "dist/cjs" : "dist/esm",
      sourcemap: true,
      lib: {
        entry: resolve(__vite_injected_original_dirname, "src"),
        fileName: `[name]`,
        name: "client",
        formats
      },
      rollupOptions: {
        output: {
          interop: "compat",
          entryFileNames: () => {
            return `[name].${CJS ? "js" : "mjs"}`;
          },
          // Override to allow named and default exports in the same file
          exports: "named"
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZS5qc29uIiwgInZpdGUuY29uZmlnLm10cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsie1xuICBcIm5hbWVcIjogXCJAa25vY2tsYWJzL2NsaWVudFwiLFxuICBcInZlcnNpb25cIjogXCIwLjE2LjVcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSBjbGllbnRzaWRlIGxpYnJhcnkgZm9yIGludGVyYWN0aW5nIHdpdGggS25vY2tcIixcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9rbm9ja2xhYnMvamF2YXNjcmlwdC90cmVlL21haW4vcGFja2FnZXMvY2xpZW50XCIsXG4gIFwiYXV0aG9yXCI6IFwiQGtub2NrbGFic1wiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJtYWluXCI6IFwiZGlzdC9janMvaW5kZXguanNcIixcbiAgXCJtb2R1bGVcIjogXCJkaXN0L2VzbS9pbmRleC5tanNcIixcbiAgXCJ0eXBlc1wiOiBcImRpc3QvdHlwZXMvaW5kZXguZC50c1wiLFxuICBcInR5cGluZ3NcIjogXCJkaXN0L3R5cGVzL2luZGV4LmQudHNcIixcbiAgXCJyZWFjdC1uYXRpdmVcIjogXCIuL3NyYy9pbmRleC50c1wiLFxuICBcImV4cG9ydHNcIjoge1xuICAgIFwiLlwiOiB7XG4gICAgICBcInJlcXVpcmVcIjogXCIuL2Rpc3QvY2pzL2luZGV4LmpzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9lc20vaW5kZXgubWpzXCIsXG4gICAgICBcInR5cGVzXCI6IFwiLi9kaXN0L3R5cGVzL2luZGV4LmQudHNcIixcbiAgICAgIFwicmVhY3QtbmF0aXZlXCI6IFwiLi9zcmMvaW5kZXgudHNcIixcbiAgICAgIFwiZGVmYXVsdFwiOiBcIi4vZGlzdC9lc20vaW5kZXgubWpzXCJcbiAgICB9XG4gIH0sXG4gIFwiZmlsZXNcIjogW1xuICAgIFwiZGlzdFwiLFxuICAgIFwic3JjXCIsXG4gICAgXCJSRUFETUUubWRcIlxuICBdLFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS9rbm9ja2xhYnMvamF2YXNjcmlwdC5naXRcIlxuICB9LFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2tub2NrbGFicy9qYXZhc2NyaXB0L2lzc3Vlc1wiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ0c2MgJiYgdml0ZSBidWlsZCAtLXdhdGNoIC0tZW1wdHlPdXREaXIgZmFsc2VcIixcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLiAtLWV4dCB0cyx0c3ggLS1yZXBvcnQtdW51c2VkLWRpc2FibGUtZGlyZWN0aXZlcyAtLW1heC13YXJuaW5ncyAwXCIsXG4gICAgXCJmb3JtYXRcIjogXCJwcmV0dGllciBcXFwic3JjLyoqLyoue2pzLHRzLHRzeH1cXFwiIC0td3JpdGVcIixcbiAgICBcImZvcm1hdDpjaGVja1wiOiBcInByZXR0aWVyIFxcXCJzcmMvKiovKi57anMsdHMsdHN4fVxcXCIgLS1jaGVja1wiLFxuICAgIFwidHlwZTpjaGVja1wiOiBcInRzYyAtLW5vRW1pdFwiLFxuICAgIFwiY292ZXJhZ2VcIjogXCJ2aXRlc3QgcnVuIC0tY292ZXJhZ2VcIixcbiAgICBcImNsZWFuXCI6IFwicmltcmFmIGRpc3RcIixcbiAgICBcImJ1aWxkXCI6IFwieWFybiBjbGVhbiAmJiB5YXJuIGJ1aWxkOmNqcyAmJiB5YXJuIGJ1aWxkOmVzbVwiLFxuICAgIFwiYnVpbGQ6ZXNtXCI6IFwiQlVJTERfVEFSR0VUPWVzbTsgIHZpdGUgYnVpbGRcIixcbiAgICBcImJ1aWxkOmNqc1wiOiBcIkJVSUxEX1RBUkdFVD1janM7ICB2aXRlIGJ1aWxkXCIsXG4gICAgXCJwcmVwdWJsaXNoT25seVwiOiBcIm5wbSBydW4gYnVpbGRcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAYmFiZWwvY2xpXCI6IFwiXjcuMjcuMlwiLFxuICAgIFwiQGJhYmVsL2NvcmVcIjogXCJeNy4yOC4wXCIsXG4gICAgXCJAYmFiZWwvcGx1Z2luLXByb3Bvc2FsLWNsYXNzLXByb3BlcnRpZXNcIjogXCJeNy4xNi43XCIsXG4gICAgXCJAYmFiZWwvcGx1Z2luLXByb3Bvc2FsLW9iamVjdC1yZXN0LXNwcmVhZFwiOiBcIl43LjE2LjdcIixcbiAgICBcIkBiYWJlbC9wbHVnaW4tdHJhbnNmb3JtLXJ1bnRpbWVcIjogXCJeNy4yOC4wXCIsXG4gICAgXCJAYmFiZWwvcHJlc2V0LWVudlwiOiBcIl43LjI4LjNcIixcbiAgICBcIkBiYWJlbC9wcmVzZXQtdHlwZXNjcmlwdFwiOiBcIl43LjI3LjBcIixcbiAgICBcIkBjb2RlY292L3ZpdGUtcGx1Z2luXCI6IFwiXjEuOS4xXCIsXG4gICAgXCJAdHlwZXMvanNvbndlYnRva2VuXCI6IFwiXjkuMC4xMFwiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L2VzbGludC1wbHVnaW5cIjogXCJeOC4zMi4wXCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvcGFyc2VyXCI6IFwiXjguMzkuMVwiLFxuICAgIFwiY3Jvc3MtZW52XCI6IFwiXjcuMC4zXCIsXG4gICAgXCJjcnlwdG9cIjogXCJeMS4wLjFcIixcbiAgICBcImVzbGludFwiOiBcIl44LjU2LjBcIixcbiAgICBcImpzb253ZWJ0b2tlblwiOiBcIl45LjAuMlwiLFxuICAgIFwicHJldHRpZXJcIjogXCJeMy41LjNcIixcbiAgICBcInJpbXJhZlwiOiBcIl42LjAuMVwiLFxuICAgIFwicm9sbHVwXCI6IFwiXjQuNDEuMVwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjguM1wiLFxuICAgIFwidml0ZVwiOiBcIl41LjQuMTlcIixcbiAgICBcInZpdGVzdFwiOiBcIl4zLjEuMVwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBiYWJlbC9ydW50aW1lXCI6IFwiXjcuMjcuMVwiLFxuICAgIFwiQGtub2NrbGFicy90eXBlc1wiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAdGFuc3RhY2svc3RvcmVcIjogXCJeMC43LjJcIixcbiAgICBcIkB0eXBlcy9waG9lbml4XCI6IFwiXjEuNi42XCIsXG4gICAgXCJheGlvc1wiOiBcIl4xLjExLjBcIixcbiAgICBcImF4aW9zLXJldHJ5XCI6IFwiXjQuNS4wXCIsXG4gICAgXCJldmVudGVtaXR0ZXIyXCI6IFwiXjYuNC41XCIsXG4gICAgXCJqd3QtZGVjb2RlXCI6IFwiXjQuMC4wXCIsXG4gICAgXCJuYW5vaWRcIjogXCJeMy4zLjExXCIsXG4gICAgXCJwaG9lbml4XCI6IFwiMS43LjIxXCIsXG4gICAgXCJ1cmxwYXR0ZXJuLXBvbHlmaWxsXCI6IFwiXjEwLjAuMFwiXG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2Nvbm5vci9EZXYva25vY2svamF2YXNjcmlwdC9wYWNrYWdlcy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9jb25ub3IvRGV2L2tub2NrL2phdmFzY3JpcHQvcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvY29ubm9yL0Rldi9rbm9jay9qYXZhc2NyaXB0L3BhY2thZ2VzL2NsaWVudC92aXRlLmNvbmZpZy5tdHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBjb2RlY292Vml0ZVBsdWdpbiB9IGZyb20gXCJAY29kZWNvdi92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBMaWJyYXJ5Rm9ybWF0cywgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuaW1wb3J0IG5vQnVuZGxlUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1uby1idW5kbGVcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcbiAgY29uc3QgQ0pTID0gZW52LkJVSUxEX1RBUkdFVD8udG9Mb2NhbGVMb3dlckNhc2UoKT8ubWF0Y2goXCJjanNcIik7XG4gIGNvbnN0IGZvcm1hdHM6IExpYnJhcnlGb3JtYXRzW10gPSBDSlMgPyBbXCJjanNcIl0gOiBbXCJlc1wiXTtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIGR0cyh7XG4gICAgICAgIG91dERpcjogXCJkaXN0L3R5cGVzXCIsXG4gICAgICB9KSxcbiAgICAgIG5vQnVuZGxlUGx1Z2luKHsgcm9vdDogXCIuL3NyY1wiIH0pLFxuICAgICAgY29kZWNvdlZpdGVQbHVnaW4oe1xuICAgICAgICBlbmFibGVCdW5kbGVBbmFseXNpczogcHJvY2Vzcy5lbnYuQ09ERUNPVl9UT0tFTiAhPT0gdW5kZWZpbmVkLFxuICAgICAgICBidW5kbGVOYW1lOiBcIkBrbm9ja2xhYnMvY2xpZW50XCIsXG4gICAgICAgIHVwbG9hZFRva2VuOiBwcm9jZXNzLmVudi5DT0RFQ09WX1RPS0VOLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIFwicHJvY2Vzcy5lbnYuQ0xJRU5UX1BBQ0tBR0VfVkVSU0lPTlwiOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgLy8gVFMgZG9lc24ndCBsaWtlIHJlZ3VsYXIgaW1wb3J0cyBmcm9tIHBhY2thZ2UuanNvbiB3aXRoIE5vZGVOZXh0LFxuICAgICAgICAvLyBzbyB3ZSdsbCBqdXN0IHVzZSByZXF1aXJlKCkgYW5kIGlnbm9yZSB0aGUgdHlwZSBlcnJvci5cbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgICAgICAgcmVxdWlyZShcIi4vcGFja2FnZS5qc29uXCIpLnZlcnNpb24sXG4gICAgICApLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogQ0pTID8gXCJkaXN0L2Nqc1wiIDogXCJkaXN0L2VzbVwiLFxuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgbGliOiB7XG4gICAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIiksXG4gICAgICAgIGZpbGVOYW1lOiBgW25hbWVdYCxcbiAgICAgICAgbmFtZTogXCJjbGllbnRcIixcbiAgICAgICAgZm9ybWF0cyxcbiAgICAgIH0sXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGludGVyb3A6IFwiY29tcGF0XCIsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgW25hbWVdLiR7Q0pTID8gXCJqc1wiIDogXCJtanNcIn1gO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gT3ZlcnJpZGUgdG8gYWxsb3cgbmFtZWQgYW5kIGRlZmF1bHQgZXhwb3J0cyBpbiB0aGUgc2FtZSBmaWxlXG4gICAgICAgICAgZXhwb3J0czogXCJuYW1lZFwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUNFLE1BQVE7QUFBQSxNQUNSLFNBQVc7QUFBQSxNQUNYLGFBQWU7QUFBQSxNQUNmLFVBQVk7QUFBQSxNQUNaLFFBQVU7QUFBQSxNQUNWLFNBQVc7QUFBQSxNQUNYLE1BQVE7QUFBQSxNQUNSLFFBQVU7QUFBQSxNQUNW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
