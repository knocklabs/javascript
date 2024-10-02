/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const fs = require("fs/promises");

(async () => {
  // 1. Update Telegraph tokens
  const tokensFile = path.resolve(
    __dirname,
    "../../../node_modules/@telegraph/tokens/dist/css/default.css",
  );

  let tokensCss = await fs.readFile(tokensFile, "utf-8");
  // a. Use --knock css variable prefix
  tokensCss = tokensCss.replace(/--tgph/g, "--knock");
  // b. Update color mode selector
  tokensCss = tokensCss.replace(
    /data-tgph-appearance/g,
    "data-knock-color-mode",
  );
  // c. Rename `accent` color to `orange`
  tokensCss = tokensCss.replace(/--knock-accent/g, "--knock-orange");

  // 2. Add to theme.css file
  const themeCssPath = path.resolve(__dirname, "../src/theme.css");
  let themeCss = await fs.readFile(themeCssPath, "utf-8");
  themeCss = tokensCss + themeCss;

  // 3. Update theme.css
  await fs.writeFile(themeCssPath, themeCss);
})();
