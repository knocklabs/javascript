/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@knocklabs/eslint-config/library.js",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/strict",
  ],
  parserOptions: {
    projects: ["tsconfig.json", "tsconfig.node.json"],
  },
  settings: {
    "jsx-a11y": {
      polymorphicPropName: "as",
    },
  },
};
