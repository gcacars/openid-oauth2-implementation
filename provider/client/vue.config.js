module.exports = {
  // publicPath: '/',
  devServer: {
    // host: '127.0.0.5',
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
