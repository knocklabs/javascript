module.exports = {
  trailingComma: "all",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@/(.*|\\/.)",
    "^(..)\\/.*",
    "^(.)\\/.*",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};
