class Configuration {
  constructor(conf) {
    this.conf = conf;
  }

  certificateBoundedTokens(client) {
    if (!client.tlsClientCertificateBoundAccessTokens) {
      console.log('O cliente precisa ter ativado o tlsClientCertificateBoundAccessTokens');
    }

    if (typeof this.conf.getCertificate !== 'function') {
      console.log('Não há função para obter o certificado para assinar o token');
    }
  }
}

export default Configuration;
