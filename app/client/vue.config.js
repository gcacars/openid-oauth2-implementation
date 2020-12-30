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
  chainWebpack: (config) => {
    // Remove o preload e prefetch do silent
    config.plugins.delete('prefetch-silentrenewoidc');
  },
  pages: {
    app: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Aplicação Exemplo',
      excludeChunks: ['silent-renew-oidc'],
    },
    // Preparar a página de renovação silenciosa fora do Vue
    silentrenewoidc: {
      entry: 'src/silent.js',
      template: 'public/silent.html',
      filename: 's.html',
      excludeChunks: ['app'],
    },
  },
};
