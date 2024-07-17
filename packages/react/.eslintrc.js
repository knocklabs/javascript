/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@knocklabs/eslint-config/library.js",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    projects: ["tsconfig.json", "tsconfig.node.json"],
  },
};
