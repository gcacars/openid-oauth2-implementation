const messages = {
  init: {
    initialization: 'Iniciando...',
    'sr-loading': 'Carregando...',
    authenticating: 'Autenticando...',
    authorizing: 'Autorizando...',
    disconnected: 'Desconectado',
    url_instructions: 'Por favor, acesse a URL abaixo no seu navegador:',
    code_instructions: 'e digite este código no campo para continuar:',
    qrcode_instructions: 'Você também pode apontar a câmera do seu celular para esse QR Code:',
    error: 'Ops, o tempo expirou ou ocorreu um erro para autenticar.',
    try_again: 'Tentar novamente',
  },
  layout: {
    nav_instructions: 'Navegue com as setas do teclado e aperte Enter para ler.',
    logoff: 'Sair',
  },
  catalog: {
    oauth: 'OAuth - especificações gerais',
    'oauth-flows': 'Fluxos de autenticação',
    token: 'Especificações do Token',
    security: 'Especificações relacionadas à segurança',
    specs: {
      rfc6749: 'OAuth 2.0 Framework de Autorização', // The OAuth 2.0 Authorization Framework
      rfc6750: 'OAuth 2.0 Framework de Autorização: Uso do Token do Portador', // The OAuth 2.0 Authorization Framework: Bearer Token Usage
      rfc6819: 'OAuth 2.0 Modelo de Ameaça e Considerações de Segurança', // OAuth 2.0 Threat Model and Security Considerations
      rfc7009: 'OAuth 2.0 Revogação de Token', // OAuth 2.0 Token Revocation
      rfc7515: 'JWS - Assinatura JSON Web', // JSON Web Signature (JWS)
      rfc7517: 'JWK - Chave JSON Web', // JSON Web Key (JWK)
      rfc7519: 'JWT - Token JSON Web', // JSON Web Token (JWT)
      rfc7521: 'Estrutura de asserção para concessões de autenticação e autorização de cliente OAuth 2.0', // Assertion Framework for OAuth 2.0 Client Authentication and Authorization Grants
      rfc7522: 'Perfil de SAML (Security Assertion Markup Language) 2.0 para Autenticação de Cliente OAuth 2.0 e Concessões de Autorização', // Security Assertion Markup Language (SAML) 2.0 Profile for OAuth 2.0 Client Authentication and Authorization Grants
      rfc7523: 'Perfil JSON Web Token (JWT) para Autenticação de Cliente OAuth 2.0 e Concessões de Autorização', // JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and Authorization Grants
      rfc7591: 'OAuth 2.0 Protocolo de Registro Dinâmico de Cliente', // OAuth 2.0 Dynamic Client Registration Protocol
      rfc7592: 'OAuth 2.0 Protocolo de gerenciamento de registro dinâmico de cliente ', // OAuth 2.0 Dynamic Client Registration Management Protocol
      rfc7628: 'Um conjunto de mecanismos de camada de autenticação e segurança simples (SASL) para OAuth', // A Set of Simple Authentication and Security Layer (SASL) Mechanisms for OAuth
      rfc7636: 'PKCE - have de prova para troca de código por clientes públicos OAuth', // Proof Key for Code Exchange by OAuth Public Clients
      rfc7662: 'OAuth 2.0 Introspecção de Token', // OAuth 2.0 Token Introspection
      rfc8252: 'OAuth 2.0 para Aplicações Nativas', // OAuth 2.0 for Native Apps
      rfc8414: 'OAuth 2.0 Metadados do Servidor de Autorização', // OAuth 2.0 Authorization Server Metadata
      rfc8628: 'OAuth 2.0 Concessão de Autorização de Dispositivo', // OAuth 2.0 Device Authorization Grant
      rfc8693: 'OAuth 2.0 Troca de Token', // OAuth 2.0 Token Exchange
      rfc8705: 'OAuth 2.0 Autenticação de Cliente com TLS-Mútuo e Token de Acesso com Certificado Vinculado', // OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens
      rfc8707: 'OAuth 2.0 Indicadores de Recurso', // Resource Indicators for OAuth 2.0
    },
  },
  back_instruction: 'Pressione Backspace para voltar para o catálogo.',
};

export default messages;
