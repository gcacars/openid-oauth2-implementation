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
};
