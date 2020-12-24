/* eslint-disable no-param-reassign */
import crypto from 'crypto';
import Koa from 'koa';
import KoaCors from '@koa/cors';
import KoaHelmet from 'koa-helmet';
import KoaMount from 'koa-mount';
import { Provider } from 'oidc-provider';
import { nanoid } from 'nanoid';
import base64url from 'base64url';
// import { RedisAdapter } from './src/adapters/redis';
import Account from './src/app/Account';
import lowdb from './src/data/lowdb';
import jwks from './src/jwks.json';
import Routes from './src/routes';

// Gerar uma chave aleatória para proteger os JWTs
const secureKeys = [
  '5xhuqknssevprev03qivap4d4se4dx5xardk95y6enz7uru7eo',
  '4pndhwz8dk57la2fqz0rdakseofsnzqbuz8a0vcwirjkpypcb7',
];

// As execuções para calcular um hash pairwise devem ser rápidas.
// Aqui mantemos um cache do que já foi feito.
const cachePairwise = {};

// Criar instância de conta.
// Informamos uma instância de banco de dados.
// Aqui usamos um simples "emulador" de banco de dados.
const account = new Account(lowdb);

/**
 * @type import('oidc-provider').Configuration
 */
const configuration = {
  // Armazenamento persistente
  // (usando uma instância grátis de dev na cloud: https://redislabs.com/try-free/)
  // adapter: RedisAdapter,

  // Contas
  findAccount: account.findAccount.bind(account),

  // Vamos informar as claims suportadas para cada escopo
  claims: {
    openid: ['sub'],
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: ['birthdate', 'family_name', 'gender', 'given_name', 'locale', 'middle_name', 'name',
      'nickname', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo'],
  },

  // Escopos dinâmicos (regex)
  dynamicScopes: [/^api:write:[a-fA-F0-9]{2,}$/, /^api:read:[a-fA-F0-9]{2,}$/],

  // Configuração das funcionalidades
  features: {
    // Interação (telas)
    devInteractions: { enabled: false },
    // Funcionalidades
    backchannelLogout: { enabled: true },
    frontchannelLogout: { enabled: true },
    deviceFlow: { enabled: false },
    jwtUserinfo: { enabled: true },
    pushedAuthorizationRequests: {
      enabled: false,
      requirePushedAuthorizationRequests: false,
    },
    registration: {
      enabled: false,
      idFactory: () => nanoid(), // como gerar um ID para um cliente novo
      initialAccessToken: false, // ou uma string simulando um token
      policies: { // políticas para registro de um novo app
        /**
         * Exemplo de política
         * @param {import('@types/koa').Context} ctx contexto no koa da requisição
         * @param {import('oidc-provider').ClientMetadata} metadados
         *   as propriedades do cliente para serem validadas
         */
        'validar-cliente': (ctx, metadados) => {
          // Se o cliente não tem um nome, então rejeitamos
          if (!('client_name' in metadados)) {
            throw new Provider.errors.InvalidClientMetadata('O client_name deve ser informado.');
          }

          // Forçar um valor (por exemplo)
          metadados.userinfo_signed_response_alg = 'RS256';
        },
      },
      /**
       * Cria um novo segredo para o cliente que está se registrando.
       * @param {import('@types/koa').Context} ctx contexto no koa da requisição
       */
      secretFactory: (ctx) => base64url(Buffer.from(crypto.randomBytes(64), 'utf-8')),
    },
    registrationManagement: {
      enabled: false,
      /**
       * Retorna um booleano indicando que o access token de registro deve ou não ser renovado.
       * @param {import('@types/koa').Context} ctx contexto no koa da requisição
       */
      async rotateRegistrationAccessToken(ctx) {
        return new Date().getDate() > 25;
      },
    },
    sessionManagement: {
      enabled: true,
      keepHeaders: false,
      scriptNonce: (ctx) => undefined,
    },
    userinfo: { enabled: true },
    // Token
    claimsParameter: { enabled: true },
    introspection: { enabled: false },
    jwtIntrospection: { enabled: false },
    revocation: { enabled: true }, // Permite revogar um token dado
    // Segurança
    // dPoP: { enabled: true, iatTolerance: 60 },
    clientCredentials: { enabled: true },
    encryption: { enabled: true },
    fapiRW: { enabled: false },
    jwtResponseModes: { enabled: false }, // JARM
    requestObjects: {
      request: false, // por valor
      requestUri: true, // por referência
      // Os token de requisição devem estar sempre assinados:
      requireSignedRequestObject: false,
      // As URLs do token usadas na requisição devem estar presentes no registro do cliente:
      requireUriRegistration: true,
      // Estratégia adotada para juntar os parâmetros do JWT de requisição com os do padrão OAuth.
      mergingStrategy: {
        name: 'lax', // Para o FAPI deve usar o 'strict'
        whitelist: [ // Usado quando o `name` é 'whitelist'
          'code_challenge',
          'nonce',
          'state',
        ],
      },
    },
    resourceIndicators: {
      enabled: false,
    },
    mTLS: {
      enabled: false,
      certificateAuthorized: (ctx) => ctx.socket.authorized,
      certificateBoundAccessTokens: false,
      certificateSubjectMatches(ctx, property, expected) {
        switch (property) {
          case 'tls_client_auth_subject_dn':
            return ctx.get('x-ssl-client-s-dn') === expected;
          default:
            throw new Error(`${property} certificate subject matching not implemented`);
        }
      },
      getCertificate(ctx) {
        const peerCertificate = ctx.socket.getPeerCertificate();
        if (peerCertificate.raw) {
          return `-----BEGIN CERTIFICATE-----\n${peerCertificate.raw.toString('base64')}\n-----END CERTIFICATE-----`;
        }
        return null;
      },
      selfSignedTlsClientAuth: false,
      tlsClientAuth: false,
    },
  },

  // Configurações
  acceptQueryParamAccessTokens: false, // Não aceitar tokens enviados nos parâmetros da URL
  acrValues: [],
  audiences(ctx, sub, token, use) {
    // Configurar a audiência/público do token
    return undefined;
  },

  // Validar o CORS de uma requisição de um cliente
  clientBasedCORS(ctx, origin, client) {
    console.log(origin);
    return true;
  },

  // Segundos de tolerância para tokens, objetos de requisição e DPoP
  clockTolerance: 30,

  // Não permitir que o ID Token contenha dados/claims do usuário.
  conformIdTokenClaims: true,

  // Configurações de cookies
  // (demorei 12 horas para configurar, tenha certeza que sabe o que está fazendo!)
  cookies: {
    // Chaves de assinatura dos cookies para evitar adulteração. (deve ser rotacionado)
    keys: secureKeys,
    // Configurações de token de curto prazo
    short: {
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutos
      signed: true,
      sameSite: 'none',
      secure: true,
      domain: 'provider.dev.br',
      path: '/',
    },
    // Configurações de token de longo prazo
    long: {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 dias
      signed: true,
      sameSite: 'none',
      secure: true,
      domain: 'provider.dev.br',
      path: '/',
    },
    // Nomes dos cookies
    names: {
      interaction: '_itc',
      resume: '_rsm',
      session: '_ss',
      state: '_s',
    },
  },

  // Configurações do serviço de descoberta (OpenID Discovery)
  discovery: {
    claims_locales_supported: ['pt-BR', 'pt'],
    display_values_supported: undefined,
    op_policy_uri: '/privacy',
    op_tos_uri: '/tos',
    ui_locales_supported: ['pt-BR', 'pt'],
  },

  // Define se os tokens devem expirar junto com a sessão
  // ou seja, fechou o navegador terá que fazer login de novo
  expiresWithSession: async (ctx, token) => !token.scopes.has('offline_access'),

  // Define claims adicionais para serem retornadas quando um novo token de acesso é gerado
  extraAccessTokenClaims: (ctx, token) => ({ tenantId: nanoid() }),

  // Metadados adicionais que um cliente pode ter
  extraClientMetadata: {
    // Lista de propriedades adicionais
    properties: ['usoInterno', 'terceiro', 'tenantId'],

    // Validação das propriedades
    validator(chave, valor, metadado) {
      switch (chave) {
        case 'usoInterno':
          metadado.client_name = `[Interno] ${metadado.client_name}`;
          break;

        case 'terceiro':
          // Aplicações de terceiros devem usar pairwise
          metadado.subject_type = 'pairwise';
          break;

        case 'tenantId':
          // Deve ter um ID de locatário
          if (!metadado.tenantId) throw new Error('Clientes devem ter um ID de locatário');
          break;

        default:
          break;
      }
    },
  },

  // Parâmetros adicionais da URL que devem estar presentes no contexto (`ctx.oidc.params`)
  extraParams: [],

  // Configuração de como serializar um token
  // `opaque` - todas propriedades ficam na raíz
  // `jwt-ietf` - igual o opaque, porém com uma propriedade adicional `jwt-ietf`
  // `paseto` - igual o opaque, porém com uma propriedade adicional `paseto`
  // paseto só permite uma única audiência
  formats: {
    AccessToken: (ctx, token) => (token.aud ? 'jwt' : 'opaque'),
    ClientCredentials: 'opaque',
    // Funções para personalizar a estrutura de um token de acesso antes de assinar
    customizers: {
      async jwt(ctx, token, jwt) {
        jwt.payload.qualquerCoisa = 'outra-coisa';
      },
    },
  },

  // Configuração do cliente HTTP usado pelo provedor
  httpOptions(options) {
    options.retry = 0;
    options.followRedirect = false;
    options.timeout = 5000;
    // eslint-disable-next-line no-template-curly-in-string
    options.headers['User-Agent'] = 'oidc-provider/${VERSION} (${ISSUER_IDENTIFIER})';
    return options;
  },

  // Interface UI
  interactions: {
    url(ctx, itx) {
      switch (itx.prompt.name) {
        case 'login':
          return `https://provider.dev.br/login?uid=${itx.uid}&login_hint=${itx.params.login_hint}`;

        case 'consent':
          return `https://provider.dev.br/consent?uid=${itx.uid}`;

        default:
          return `https://provider.dev.br/${itx.prompt.name}`;
      }
    },
  },

  // Função para determinar se um token de atualização pode ser emitido
  async issueRefreshToken(ctx, client, code) {
    console.log('Checando se um refresh token pode ser emitido');
    return client.grantTypeAllowed('refresh_token') && code.scopes.has('offline_access');
  },

  // ...
  jwks,

  // Função para calcular um id genérico para o usuário, quando usado o `pairwise`
  // Deve ser rápido!
  async pairwiseIdentifier(ctx, accountId, client) {
    const cacheKey = `${accountId}-${client.clientId}`;

    // Retorna o do cache se já foi calculado
    if (cachePairwise[cacheKey]) return cachePairwise[cacheKey];

    return crypto.createHash('sha256')
      .update(client.sectorIdentifier)
      .update(accountId)
      .update(client.tenantId) // personalizado
      .digest('hex');
  },

  // Tipos de resposta suportados pelo servidor.
  // Por segurança foram removidos os que oferem o token diretamente na autorização
  responseTypes: ['code', 'code id_token', 'id_token', 'code id_token token', 'none'],

  // Tipos de autenticação do cliente para poder revogar um token
  revocationEndpointAuthMethods: ['client_secret_jwt', 'private_key_jwt'],

  // Indica se deve fazer a rotação de um token de atualização ou não
  rotateRefreshToken(ctx) {
    const { refreshToken, client } = ctx.oidc.entities;
    // Pega o máximo de tempo que um token pode ser rotacionado.
    // Nesse caso é 1 ano, depois ele vai expirar finalmente.
    if (refreshToken.totalLifetime() >= 365.25 * 24 * 60 * 60) {
      return false;
    }

    // Rotaciona token de clientes públicos quando não há autenticação na requisição de token.
    if (client.tokenEndpointAuthMethod === 'none' && !refreshToken.isSenderConstrained()) {
      return true;
    }

    // Rotaciona quando estiver próximo da expiração (mais que 70% do tempo de vida)
    return refreshToken.ttlPercentagePassed() >= 70;
  },

  // Configurações das rotas
  routes: {
    authorization: '/auth',
    check_session: '/session/check',
    code_verification: '/device',
    device_authorization: '/device/auth',
    end_session: '/session/end',
    introspection: '/token/introspection',
    jwks: '/jwks',
    pushed_authorization_request: '/request',
    registration: '/reg',
    revocation: '/token/revocation',
    token: '/token',
    userinfo: '/me',
  },

  // Lista de escopos que o servidor suporta
  scopes: ['openid', 'offline_access', 'email', 'profile'],

  // Tipos de sujeitos
  subjectTypes: ['pairwise', 'public'],

  // Modo de autenticação na requisição de token
  tokenEndpointAuthMethods: ['client_secret_basic', 'client_secret_jwt', 'private_key_jwt'],

  // Tempos de expiração para cada token
  ttl: {
    // Dá pra usar funções para calcular, ou deixar estático ("chumbado")
    AccessToken(ctx, token, client) {
      return client.clientId === 'app' ? 20 * 60 : 1 * 60 * 60; // 1 hr
    },
    AuthorizationCode: 10, // 10 s
    ClientCredentials: 600,
    DeviceCode: 10 * 60, // 10 min
    IdToken: 1 * 60 * 60, // 1 hr
    RefreshToken(ctx, token, client) {
      if (
        ctx && ctx.oidc.entities.RotatedRefreshToken
        && client.applicationType === 'web'
        && client.tokenEndpointAuthMethod === 'none'
        && !token.isSenderConstrained()
      ) {
        // Os token de atualização dos SPA sem restrição de remetente, não tem expiração infinita
        return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
      }

      return 14 * 24 * 60 * 60; // 14 dias
    },
  },

  // Configurações de algoritmo dos tokens (JWA)
  whitelistedJWA: {
    authorizationEncryptionAlgValues: [
      // assimétrico RSAES (nota: RSA-OAEP-* só é suportado no node >= 12.9.0)
      'RSA-OAEP', 'RSA-OAEP-256', 'RSA-OAEP-512', // 'RSA-OAEP-384', 'RSA1_5',
      // assimétrico ECDH-ES
      'ECDH-ES', 'ECDH-ES+A128KW', 'ECDH-ES+A256KW', // 'ECDH-ES+A192KW',
      // simétrico AES
      'A128KW', 'A256KW', // 'A192KW', 'A128GCMKW', 'A192GCMKW', 'A256GCMKW',
      // simétrico PBES2 + AES
      // 'PBES2-HS256+A128KW', 'PBES2-HS384+A192KW', 'PBES2-HS512+A256KW',
      // criptografia direta
      // 'dir',
    ],
    // Criptografia
    authorizationEncryptionEncValues: [
      'A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM', // 'A192CBC-HS384', 'A192GCM',
    ],
    // Assinatura
    authorizationSigningAlgValues: [
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    // DPoP
    dPoPSigningAlgValues: [
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    // ID Token
    idTokenEncryptionAlgValues: [
      // assimétrico RSAES (nota: RSA-OAEP-* só é suportado no node >= 12.9.0)
      'RSA-OAEP', // 'RSA-OAEP-256', 'RSA-OAEP-384', 'RSA-OAEP-512', 'RSA1_5',
      // assimétrico ECDH-ES
      'ECDH-ES', 'ECDH-ES+A128KW', 'ECDH-ES+A256KW', // 'ECDH-ES+A192KW',
      // simétrico AES
      'A128KW', 'A256KW', // 'A192KW', 'A128GCMKW', 'A192GCMKW', 'A256GCMKW',
      // simétrico PBES2 + AES
      // 'PBES2-HS256+A128KW', 'PBES2-HS384+A192KW', 'PBES2-HS512+A256KW',
      // criptografia direta
      // 'dir',
    ],
    idTokenEncryptionEncValues: [
      'A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM', // 'A192CBC-HS384', 'A192GCM',
    ],
    idTokenSigningAlgValues: [
      // 'none',
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    // Introspecção
    introspectionEncryptionAlgValues: [
      // assimétrico RSAES (nota: RSA-OAEP-* só é suportado no node >= 12.9.0)
      'RSA-OAEP', // 'RSA-OAEP-256', 'RSA-OAEP-384', 'RSA-OAEP-512', 'RSA1_5',
      // assimétrico ECDH-ES
      'ECDH-ES', 'ECDH-ES+A128KW', 'ECDH-ES+A256KW', // 'ECDH-ES+A192KW',
      // simétrico AES
      'A128KW', 'A256KW', // 'A192KW', 'A128GCMKW', 'A192GCMKW', 'A256GCMKW',
      // simétrico PBES2 + AES
      // 'PBES2-HS256+A128KW', 'PBES2-HS384+A192KW', 'PBES2-HS512+A256KW',
      // criptografia direta
      // 'dir',
    ],
    introspectionEncryptionEncValues: [
      'A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM', // 'A192CBC-HS384', 'A192GCM',
    ],
    introspectionEndpointAuthSigningAlgValues: [
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    introspectionSigningAlgValues: [
      // 'none',
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    // Objeto de requisição
    requestObjectEncryptionAlgValues: [
      // assimétrico RSAES (nota: RSA-OAEP-* só é suportado no node >= 12.9.0)
      'RSA-OAEP', // 'RSA-OAEP-256', 'RSA-OAEP-384', 'RSA-OAEP-512', 'RSA1_5',
      // assimétrico ECDH-ES
      'ECDH-ES', 'ECDH-ES+A128KW', 'ECDH-ES+A256KW', // 'ECDH-ES+A192KW',
      // simétrico AES
      'A128KW', 'A256KW', // 'A192KW', 'A128GCMKW', 'A192GCMKW', 'A256GCMKW',
      // simétrico PBES2 + AES
      // 'PBES2-HS256+A128KW', 'PBES2-HS384+A192KW', 'PBES2-HS512+A256KW',
      // criptografia direta
      // 'dir',
    ],
    requestObjectEncryptionEncValues: [
      'A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM', // 'A192CBC-HS384', 'A192GCM',
    ],
    requestObjectSigningAlgValues: [
      // 'none',
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    // Revogação
    revocationEndpointAuthSigningAlgValues: [
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    // Requisição de token
    tokenEndpointAuthSigningAlgValues: [
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
    // UserInfo
    userinfoEncryptionAlgValues: [
      // assimétrico RSAES (nota: RSA-OAEP-* só é suportado no node >= 12.9.0)
      'RSA-OAEP', // 'RSA-OAEP-256', 'RSA-OAEP-384', 'RSA-OAEP-512', 'RSA1_5',
      // assimétrico ECDH-ES
      'ECDH-ES', 'ECDH-ES+A128KW', 'ECDH-ES+A256KW', // 'ECDH-ES+A192KW',
      // simétrico AES
      'A128KW', 'A256KW', // 'A192KW', 'A128GCMKW', 'A192GCMKW', 'A256GCMKW',
      // simétrico PBES2 + AES
      // 'PBES2-HS256+A128KW', 'PBES2-HS384+A192KW', 'PBES2-HS512+A256KW',
      // criptografia direta
      // 'dir',
    ],
    userinfoEncryptionEncValues: [
      'A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM', // 'A192CBC-HS384', 'A192GCM',
    ],
    userinfoSigningAlgValues: [
      // 'none',
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
  },

  async renderError(ctx, out, error) {
    ctx.type = 'html';
    ctx.body = `<!DOCTYPE html>
      <head>
        <title>oops! something went wrong</title>
        <style>/* css and html classes omitted for brevity, see lib/helpers/defaults.js */</style>
      </head>
      <body>
        <div>
          <h1>oops! something went wrong</h1>
          <p>${error}</p>
          ${Object.entries(out).map(([key, value]) => `<pre><strong>${key}</strong>: ${value}</pre>`).join('')}
        </div>
      </body>
      </html>`;
  },

  // Padrão de configuração para novos clientes
  clientDefaults: {
    grant_types: ['authorization_code'],
    revocation_endpoint_auth_method: 'client_secret_jwt',
  },

  clients: [{
    // Apresentação
    client_name: 'Aplicação Exemplo',
    logo_uri: 'https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo3.png',
    policy_uri: 'https://apprp.dev.br/politica-privacidade',
    tos_uri: 'https://apprp.dev.br/termos-servico',

    // Configurações do cliente
    application_type: 'web',
    client_id: 'app',
    client_secret: 'bem-secreto',
    client_uri: 'https://apprp.dev.br/',
    redirect_uris: [
      'https://apprp.dev.br/',
      'https://apprp.dev.br/cb',
      'https://apprp.dev.br/pre-tela',
    ],
    // initiate_login_uri: 'https://apprp.dev.br/pre-tela',
    // post_logout_redirect_uris: [],
    sector_identifier_uri: 'https://apprp.dev.br/',
    // subject_type: 'public',

    // Configurações do OpenID ou OAuth
    response_types: ['code', 'code id_token', 'id_token'],
    grant_types: ['authorization_code', 'implicit'],
    token_endpoint_auth_method: 'client_secret_basic',
    scope: 'openid email',
    revocation_endpoint_auth_method: 'client_secret_jwt',

    // Configurações do token
    default_max_age: 3600,
    require_auth_time: false,

    // Segurança
    // jwks_uri: '',
    id_token_signed_response_alg: 'HS256',
    userinfo_signed_response_alg: 'HS256',

    // Administrativo
    contacts: ['admin-aplicativo@exemplo.com.br'],
    tenantId: 123,
  }],
};

// Segurança
const helmet = KoaHelmet();

function handleClientAuthErrors({ headers: { authorization }, oidc: { body, client } }, err) {
  if (err.statusCode === 401 && err.message === 'invalid_client') {
    console.log(err, 'client');
    // save error details out-of-bands for the client developers, `authorization`, `body`, `client`
    // are just some details available, you can dig in ctx object for more.
  }
}

const oidc = new Provider('https://api.provider.dev.br', configuration);

oidc.keys = secureKeys;
oidc.proxy = true;
// oidc.use(helmet);
oidc.on('grant.error', handleClientAuthErrors);
oidc.on('introspection.error', handleClientAuthErrors);
oidc.on('revocation.error', handleClientAuthErrors);

// Configurar o Koa
const app = new Koa();
app.proxy = true;
// app.use(helmet);
app.use(KoaCors({
  origin: 'https://provider.dev.br',
  credentials: true,
}));

if (process.env.NODE_ENV === 'production') {
  app.use(async (ctx, next) => {
    if (ctx.secure) {
      await next();
    } else if (ctx.method === 'GET' || ctx.method === 'HEAD') {
      ctx.redirect(ctx.href.replace(/^http:\/\//i, 'https://'));
    } else {
      ctx.body = {
        error: 'invalid_request',
        error_description: 'do yourself a favor and only use https',
      };
      ctx.status = 400;
    }
  });
}

// eslint-disable-next-line no-new
new Routes(app, oidc, lowdb);
app.use(KoaMount(oidc.app));

// Iniciar servidor
const server = app.listen(3000, () => {
  console.log('oidc-provider está pronto, verifique https://api.provider.dev.br/.well-known/openid-configuration');
  console.log('Inicie o login em: https://api.provider.dev.br/auth?response_type=code&scope=openid%20email&client_id=app&login_hint=manoel@exemplo.com.br&redirect_uri=https://apprp.dev.br/cb&state=af0ifjsldkj');
});
