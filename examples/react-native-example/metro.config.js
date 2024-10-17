const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve(__dirname, "../../node_modules"),
    path.resolve(__dirname, "../../packages/react-native/"),
    path.resolve(__dirname, "../../packages/react-core/"),
    path.resolve(__dirname, "../../packages/client/"),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
