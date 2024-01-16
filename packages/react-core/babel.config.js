// eslint-disable-next-line turbo/no-undeclared-env-vars
const BUILD_TARGET = process.env.BUILD_TARGET;
const isCommonJS = BUILD_TARGET !== undefined && BUILD_TARGET === "cjs";
const isESM = BUILD_TARGET !== undefined && BUILD_TARGET === "esm";

console.log('\n\n🚧 Babel config!!!')
console.log({ BUILD_TARGET, isCommonJS, isESM })

module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/env",
      {
        loose: false,
        modules: isCommonJS ? "commonjs" : false,
        targets: {
          esmodules: isESM ? true : undefined,
        },
      },
    ],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ];

  let plugins = [
    "babel-plugin-date-fns",
  ];

  return {
    presets,
    plugins,
  };
};
