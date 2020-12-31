module.exports = {
  lintOnSave: false,
  devServer: {
    port: 7070,
    https: false,
    public: 'https://apprp.dev.br',
    disableHostCheck: true,
    clientLogLevel: 'warning',
  },
  configureWebpack: {
    devServer: {
      historyApiFallback: true,
    },
  },
  pages: {
    app: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Aplicação Exemplo',
      scriptLoading: 'defer',
      chunks: ['app', 'chunk-app-vendors', 'chunk-common', 'chunk-vendors'],
      excludeChunks: ['chunk-silent-renew-oidc-vendors', 'silent-renew-oidc'],
      base: process.env.VUE_APP_URL,
    },
    // Preparar a página de renovação silenciosa fora do Vue
    'silent-renew-oidc': {
      entry: 'src/silent.js',
      template: 'public/silent.html',
      filename: 's.html',
      scriptLoading: 'defer',
      chunks: ['vuex-oidc-s', 'chunk-silent-renew-oidc-vendors', 'silent-renew-oidc'],
    },
  },
  chainWebpack: (config) => {
    // Remove o preload e prefetch do silent
    config.plugins.delete('prefetch-silent-renew-oidc');

    const options = module.exports;
    const {
      pages,
    } = options;
    const pageKeys = Object.keys(pages);

    // Long-term caching

    const IS_VENDOR = /[\\/]node_modules[\\/]/;

    config.optimization
      .splitChunks({
        cacheGroups: {
          vendors: {
            name: 'chunk-vendors',
            priority: -10,
            chunks: 'initial',
            minChunks: 1,
            test: IS_VENDOR,
            reuseExistingChunk: false,
            enforce: true,
          },
          ...pageKeys.map((key) => ({
            name: `chunk-${key}-vendors`,
            priority: -1,
            chunks: (chunk) => chunk.name === key,
            minChunks: 1,
            test: IS_VENDOR,
            reuseExistingChunk: false,
            enforce: true,
          })),
          common: {
            name: 'chunk-common',
            priority: -20,
            chunks: 'initial',
            minChunks: 2,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      });
  },
};
