/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@knocklabs/eslint-config/library.js"],
  parserOptions: {
    projects: ["tsconfig.json", "tsconfig.node.json"],
  },
};
