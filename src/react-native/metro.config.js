// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    // 添加任何自定义解析器配置
    extraNodeModules: {
      // 确保核心模块可以被正确引用
      'core': require.resolve('../../src/core/index.ts')
    },
    assetExts: [...defaultConfig.resolver.assetExts],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'ts', 'tsx']
  },
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // 其他配置选项
};