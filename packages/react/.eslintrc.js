/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@knocklabs/eslint-config/library.js",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    projects: ["tsconfig.json", "tsconfig.node.json"],
  },
};
