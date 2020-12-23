module.exports = {
  // publicPath: '/',
  devServer: {
    port: 8080,
    https: false,
    public: 'https://provider.dev.br',
    disableHostCheck: true,
    clientLogLevel: 'warning',
  },
  configureWebpack: {
    devServer: {
      historyApiFallback: true,
    },
  },
};
