const config = {
  provider: {
    server: {
      port: 3000,
      dns: 'https://api.provider.dev.br',
    },
    client: {
      port: 8080,
      dns: 'https://provider.dev.br',
    },
  },
  device: {
    server: {
      port: 9000,
      dns: 'https://api.device.dev.br',
    },
    client: {
      port: 9090,
      dns: 'https://device.dev.br',
    },
  },
};

module.exports = config;
