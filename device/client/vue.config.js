const CONFIG = require('../../globalConfig.js');

module.exports = {
  lintOnSave: false,
  devServer: {
    port: CONFIG.device.client.port,
    https: false,
    public: CONFIG.device.client.dns,
    disableHostCheck: true,
    clientLogLevel: 'warning',
  },
  configureWebpack: {
    devServer: {
      historyApiFallback: true,
    },
  },
};
