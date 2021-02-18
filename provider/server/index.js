/* eslint-disable no-param-reassign */
import crypto from 'crypto';
import Koa from 'koa';
import KoaCors from '@koa/cors';
import KoaHelmet from 'koa-helmet';
import KoaMount from 'koa-mount';
import { Provider, errors, interactionPolicy } from 'oidc-provider';
import { nanoid } from 'nanoid';
import base64url from 'base64url';
// import { RedisAdapter } from './src/adapters/redis';
// import ConsoleAdapter from './src/adapters/console';
import Account from './src/app/Account';
import lowdb from './src/data/lowdb';
import jwks from './src/jwks.json';
import Routes from './src/routes';
import Otp from './src/app/Otp';

// Gerar uma chave aleatória para proteger os JWTs
const secureKeys = [
  '5xhuqknssevprev03qivap4d4se4dx5xardk95y6enz7uru7eo',
  '4pndhwz8dk57la2fqz0rdakseofsnzqbuz8a0vcwirjkpypcb7',
];

// CORS
const allowedHosts = ['https://provider.dev.br', 'https://apprp.dev.br', 'https://admin-op.dev.br'];

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
  // adapter: ConsoleAdapter,

  // Contas
  findAccount: account.findAccount.bind(account),

  // Vamos informar as claims suportadas para cada escopo
  claims: {
    openid: ['sub', 'given_name', 'picture'],
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
    backchannelLogout: { enabled: true, ack: 'draft-06' },
    frontchannelLogout: { enabled: true, ack: 'draft-04' },
    deviceFlow: {
      charset: 'base-20',
      enabled: true,
      deviceInfo(ctx) {
        return {
          ip: ctx.ip,
          ua: ctx.get('user-agent'),
        };
      },
      mask: '****-****',
      /**
       * 
       * @param {Koa.Context} ctx 
       * @param {string} form 
       * @param {import('oidc-provider').ClientMetadata} client 
       * @param {import('oidc-provider').ErrorOut} deviceInfo 
       * @param {import('oidc-provider').errors.OIDCProviderError} userCode 
       */
      userCodeInputSource(ctx, form, client, deviceInfo, userCode) {
        const url = new URL('https://provider.dev.br/device');
        const qs = url.searchParams;
        qs.set('x', form.match(/xsrf.*value="(.+)"/)[1]);
        if (ctx.query.user_code) qs.set('user_code', ctx.query.user_code);
        if (deviceInfo && 'error' in deviceInfo) qs.set('error', deviceInfo.error);
        ctx.redirect(url.toString());
      },
      userCodeConfirmSource(ctx, form, client, deviceInfo, userCode) {
        ctx.body = {
          ok: true,
          data: {
            xsrf: form.match(/xsrf.*value="(.+)"/)[1],
            client: {
              applicationType: client.applicationType,
              clientName: client.clientName,
              logoUri: client.logoUri,
              clientUri: client.clientUri,
              policyUri: client.policyUri,
              tosUri: client.tosUri,
              subjectType: client.subjectType,
            },
            deviceInfo,
            userCode,
          },
        };
      },
      successSource(ctx) {
        ctx.redirect('https://provider.dev.br/device/conclusion');
      },
    },
    jwtUserinfo: { enabled: true },
    pushedAuthorizationRequests: {
      enabled: false,
      requirePushedAuthorizationRequests: false,
    },
    registration: {
      enabled: true,
      idFactory: () => nanoid(), // como gerar um ID para um software novo
      initialAccessToken: 'token-inicial', // ou uma string simulando um token
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
      enabled: true,
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
      ack: 'draft-30',
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
    encryption: { enabled: false },
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
  acrValues: ['0'],
  audiences(ctx, sub, token, use) {
    // Configurar a audiência/público do token
    return undefined;
  },

  // Validar o CORS de uma requisição de um cliente
  clientBasedCORS(ctx, origin, client) {
    return allowedHosts.includes(origin);
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
    properties: ['web_app_type', 'usoInterno', 'terceiro', 'tenantId', 'nx_type'],

    // Validação das propriedades
    validator(chave, valor, metadado) {
      switch (chave) {
        case 'web_app_type':
          if (valor && !['spa'].includes(valor)) {
            throw new Error('Tipo de aplicação Web inválido');
          }
          break;

        case 'usoInterno':
          metadado.client_name = `[Interno] ${metadado.client_name}`;
          break;

        case 'terceiro':
          // Aplicações de terceiros devem usar pairwise
          metadado.subject_type = 'pairwise';
          break;

        case 'tenantId':
          // Deve ter um ID de locatário
          if (!metadado.tenantId && metadado.nx_type === 'business') throw new Error('Clientes devem ter um ID de locatário');
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
    const opts = {
      ...options,
      encoding: 'utf8',
      timeout: {
        lookup: 0.5 * 1000,
        connect: 0.5 * 1000,
        secureConnect: 0.5 * 1000,
        socket: 1 * 1000,
        response: 10 * 60 * 1000,
        send: 1 * 60 * 1000,
      },
      retry: 0,
      followRedirect: false,
      cache: false,
      throwHttpErrors: true,
    };
    // eslint-disable-next-line no-template-curly-in-string
    opts.headers['User-Agent'] = 'oidc-provider/${VERSION} (${ISSUER_IDENTIFIER})';
    return opts;
  },

  // Interface UI
  interactions: {
    url(ctx, itx) {
      const url = new URL('https://provider.dev.br');

      switch (itx.prompt.name) {
        case 'login': {
          url.pathname = '/login';
          if (itx.params.login_hint) url.searchParams.set('login_hint', itx.params.login_hint);
          break;
        }

        case 'consent': {
          url.pathname = '/consent';
          url.searchParams.set('uid', itx.uid);
          break;
        }

        case 'otp': {
          if (itx.prompt.reasons.includes('otp_not_configured')) {
            url.pathname = itx.prompt.details.required ? '/otp-enroll' : '/mfa';
          } else {
            url.pathname = '/otp';
          }
          break;
        }

        default:
          url.pathname = `/${itx.prompt.name}`;
          break;
      }

      return url.toString();
    },

    policy: [
      ...interactionPolicy.base(),
      {
        name: 'otp',
        requestable: true,
        details: async (ctx) => {
          try {
            const { oidc } = ctx;
            const otpInstance = new Otp(lowdb);
            const accountObj = await account.getAccountById(oidc.account.accountId);
            const daysToRequired = 3 * 24 * 60 * 60 * 1000; // 3 dias
            const required = Date.now() >= accountObj.created + daysToRequired;

            if (!accountObj.authenticationMethods.otp) {
              const uri = otpInstance.getAuthenticationUri(
                accountObj.tenantId, oidc.account.accountId,
              );

              return {
                tenantId: accountObj.tenantId,
                required,
                enrollment: true,
                token: true,
                uri,
              };
            }

            return {
              tenantId: accountObj.tenantId,
              required,
              enrollment: false,
              token: true,
            };
          } catch (error) {
            console.error(error);
          }
          return {};
        },
        checks: [
          {
            reason: 'otp_prompt',
            description: 'OTP prompt was not resolved',
            error: 'interaction_required',
            details: () => {},
            check: (ctx) => {
              try {
                const requiredAmr = [];
                // eslint-disable-next-line camelcase
                const { oidc: { claims: { id_token } } } = ctx;

                if (!id_token.acr || id_token.acr.values.length === 0) return false;
                if (Array.isArray(id_token.acr.values) && !Array.isArray(id_token.amr)) {
                  return true;
                }

                id_token.acr.values.forEach((acr) => {
                  switch (acr) {
                    case 'owners_device':
                      requiredAmr.push('otp');
                      break;

                    default:
                      break;
                  }
                });

                return id_token.amr.values.filter((amr) => !requiredAmr.includes(amr)).length > 0;
              } catch (error) {
                console.error(error);
                return false;
              }
            },
          },
          {
            reason: 'otp_not_configured',
            description: 'client not authorized for End-User session yet',
            error: 'otp_enrollment_required',
            details: () => {},
            check: async (ctx) => {
              const { oidc } = ctx;
              const accountObj = await account.getAccountById(oidc.account.accountId);
              return !accountObj.authenticationMethods.otp;
            },
          },
        ],
      },
    ],
  },

  // Função para determinar se um token de atualização pode ser emitido
  async issueRefreshToken(ctx, client, code) {
    console.log('Checando se um refresh token pode ser emitido');
    // return client.grantTypeAllowed('refresh_token') && code.scopes.has('offline_access');
    return true;
  },

  // ...
  jwks,

  // Função para calcular um id genérico para o usuário, quando usado o `pairwise`
  // Deve ser rápido!
  async pairwiseIdentifier(ctx, accountId, client) {
    if (client.clientId === 'app') return accountId;
    const cacheKey = `${accountId}-${client.clientId}`;

    // Retorna o do cache se já foi calculado
    if (cachePairwise[cacheKey]) return cachePairwise[cacheKey];

    return crypto.createHash('sha256')
      .update(client.sectorIdentifier)
      .update(accountId)
      // .update(client.tenantId?.toString() || '') // personalizado
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
    if (!refreshToken) return false;

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
  tokenEndpointAuthMethods: ['client_secret_basic', 'client_secret_jwt', 'private_key_jwt', 'none'],

  // Tempos de expiração para cada token
  ttl: {
    // Dá pra usar funções para calcular, ou deixar estático ("chumbado")
    AccessToken(ctx, token, client) {
      return client.clientId === 'app' ? 20 * 60 : 1 * 60 * 60; // 1 hr
    },
    AuthorizationCode: 10, // 10 s
    ClientCredentials: 10 * 60, // 10 min
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
      'none',
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
      'none',
      'HS256', // 'HS384', 'HS512',
      'RS256', // 'RS384', 'RS512',
      'PS256', // 'PS384', 'PS512',
      'ES256', // 'ES256K', 'ES384', 'ES512',
      'EdDSA', // (nota: EdDSA só é suportado no node >= 12.0.0)
    ],
  },

  // PKCE para autenticação de clientes públicos que requerem `code`
  pkceMethods: ['S256'],
  pkce: {
    methods: ['S256'],
    // eslint-disable-next-line arrow-body-style
    required: (ctx, client) => {
      return client.tokenEndpointAuthMethod === 'none' && client.applicationType === 'web';
    },
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

  clients: [
    {
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
        'https://apprp.dev.br/auth',
        'https://apprp.dev.br/authp',
        'https://apprp.dev.br/s.html',
        'https://apprp.dev.br/logout',
        'https://apprp.dev.br/pre-tela',
      ],
      // initiate_login_uri: 'https://apprp.dev.br/pre-tela',
      post_logout_redirect_uris: [
        'https://apprp.dev.br/logout',
      ],
      sector_identifier_uri: 'https://apprp.dev.br/',
      subject_type: 'public',

      // Configurações do OpenID ou OAuth
      response_types: ['code', 'code id_token', 'id_token', 'code id_token token'],
      grant_types: ['authorization_code', 'implicit'],
      scope: 'openid email phone profile',
      token_endpoint_auth_method: 'none',
      revocation_endpoint_auth_method: 'client_secret_jwt',

      // Configurações do token
      default_max_age: 3600,
      require_auth_time: false,

      // Segurança
      // jwks_uri: '',
      default_acr_values: [],
      id_token_signed_response_alg: 'RS256',
      userinfo_signed_response_alg: 'RS256',

      // Administrativo
      contacts: ['admin-aplicativo@exemplo.com.br'],
      web_app_type: 'spa',
      nx_type: 'business',
      tenantId: 123,
    },
    {
      // Apresentação
      client_name: 'Painel administrativo',
      logo_uri: 'https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo3.png',
      policy_uri: 'https://admin-op.dev.br/politica-privacidade',
      tos_uri: 'https://admin-op.dev.br/termos-servico',

      // Configurações do cliente
      application_type: 'web',
      client_id: 'admin',
      client_secret: 'bem-secreto2',
      client_uri: 'https://admin-op.dev.br/',
      redirect_uris: [
        'https://admin-op.dev.br/',
        'https://admin-op.dev.br/cb',
        'https://admin-op.dev.br/auth',
        'https://admin-op.dev.br/authp',
        'https://admin-op.dev.br/s.html',
        'https://admin-op.dev.br/logout',
        'https://admin-op.dev.br/pre-tela',
      ],
      // initiate_login_uri: 'https://admin-op.dev.br/pre-tela',
      post_logout_redirect_uris: [
        'https://admin-op.dev.br/logout',
      ],
      sector_identifier_uri: 'https://admin-op.dev.br/',
      subject_type: 'public',

      // Configurações do OpenID ou OAuth
      response_types: ['code', 'code id_token', 'id_token', 'code id_token token'],
      grant_types: ['authorization_code', 'implicit', 'refresh_token'],
      scope: 'openid email phone profile',
      token_endpoint_auth_method: 'none',
      revocation_endpoint_auth_method: 'client_secret_jwt',
      introspection_endpoint_auth_method: 'tls_client_auth',

      // Configurações do token
      default_max_age: 3600,
      require_auth_time: false,

      // Segurança
      // jwks_uri: '',
      id_token_signed_response_alg: 'RS256',
      userinfo_signed_response_alg: 'RS256',

      // Administrativo
      contacts: ['admin-aplicativo@exemplo.com.br'],
      web_app_type: 'spa',
    },
    {
      // Apresentação
      client_name: 'Deviceflix',
      logo_uri: 'https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo3.png',
      policy_uri: 'https://device.dev.br/politica-privacidade',
      tos_uri: 'https://device.dev.br/termos-servico',

      // Configurações do cliente
      client_id: 'device',
      client_secret: 'dispositivo',
      client_uri: 'https://device.dev.br/',
      sector_identifier_uri: 'https://api.device.dev.br/',
      redirect_uris: ['https://api.device.dev.br'],
      subject_type: 'public',

      // Configurações do OpenID ou OAuth
      // response_types: ['code', 'code id_token', 'id_token', 'code id_token token'],
      grant_types: [
        'authorization_code', 'refresh_token', 'urn:ietf:params:oauth:grant-type:device_code',
      ],
      // scope: 'openid email phone profile',
      // token_endpoint_auth_method: 'none',
      revocation_endpoint_auth_method: 'client_secret_jwt',
      introspection_endpoint_auth_method: 'tls_client_auth',
    },
  ],
};

// Segurança
function handleClientAuthErrors({ headers: { authorization }, oidc: { body, client } }, err) {
  if (err.statusCode === 401 && err.message === 'invalid_client') {
    console.log(err, 'client');
    // save error details out-of-bands for the client developers, `authorization`, `body`, `client`
    // are just some details available, you can dig in ctx object for more.
  } else if (err.error !== 'authorization_pending') {
    console.error(err);
  }
}

const provider = new Provider('https://api.provider.dev.br', configuration);

provider.keys = secureKeys;
provider.proxy = true;

provider.use(async (ctx, next) => {
  /** pre-processing
   * you may target a specific action here by matching `ctx.path`
   */
  if (ctx.path !== '/token') console.log('pre middleware', ctx.method, ctx.path);

  await next();

  console.log('post middleware', ctx.method, ctx.oidc && ctx.oidc.route);

  if (ctx.status === 302 && ctx.headers.accept === 'application/json') {
    ctx.status = 202;
    ctx.body = {
      ok: true,
      redirect: {
        location: ctx.response.headers.location,
      },
    };
    ctx.response.headers.location = undefined;
  }
});

// Helmet
provider.use(KoaHelmet.contentSecurityPolicy());
provider.use(KoaHelmet.dnsPrefetchControl({
  allow: true,
}));
// provider.use(KoaHelmet.expectCt());
provider.use(KoaHelmet.frameguard());
provider.use(KoaHelmet.hidePoweredBy());
// provider.use(KoaHelmet.hsts());
provider.use(KoaHelmet.ieNoOpen());
provider.use(KoaHelmet.noSniff());
provider.use(KoaHelmet.permittedCrossDomainPolicies());
provider.use(KoaHelmet.referrerPolicy());
provider.use(KoaHelmet.xssFilter());

provider.on('introspection.error', handleClientAuthErrors);
provider.on('revocation.error', handleClientAuthErrors);
provider.on('authorization.error', handleClientAuthErrors);
provider.on('jwks.error', handleClientAuthErrors);
provider.on('check_session_origin.error', handleClientAuthErrors);
provider.on('check_session.error', handleClientAuthErrors);
provider.on('discovery.error', handleClientAuthErrors);
provider.on('end_session.error', handleClientAuthErrors);
provider.on('grant.error', handleClientAuthErrors);
provider.on('registration_create.error', handleClientAuthErrors);
provider.on('registration_read.error', handleClientAuthErrors);
provider.on('server_error', handleClientAuthErrors);
provider.on('userinfo.error', handleClientAuthErrors);

provider.on('backchannel.error', (ctx, err, client, accountId, sid) => {
  console.error(err);
});

provider.on('backchannel.success', (ctx, client, accountId, sid) => {
  console.info(`${accountId} is logged now`);
});

provider.on('authorization.accepted', (ctx) => {
  const { client, params } = ctx.oidc;

  if (client.applicationType === 'web' && client.web_app_type === 'spa'
      && !params.code_challenge && !params.code_challenge_method) {
    throw new errors.InvalidRequest('Should use PKCE authentication.', 99);
  }
});

provider.on('interaction.started', (ctx, prompt) => {
  const { client, params } = ctx.oidc;
});

provider.on('interaction.saved', (interaction) => {
  console.info('Interaction saved!');
});

provider.on('interaction.destroyed', (interaction) => {
  console.info('Interaction destroyed!');
});

function handleContextEvent(ctx) {
  const { client, params } = ctx.oidc;
  const event = this.event;
}

provider.on('authorization.success', handleContextEvent);
provider.on('end_session.success', handleContextEvent);
provider.on('grant.success', handleContextEvent);
provider.on('interaction.ended', handleContextEvent);

function handleTokenOrCodeEvent(tokenCode) {
  const event = this.event;
}

provider.on('access_token.destroyed', handleTokenOrCodeEvent.bind({ event: 'access_token.destroyed' }));
provider.on('access_token.saved', handleTokenOrCodeEvent.bind({ event: 'access_token.saved' }));
provider.on('authorization_code.consumed', handleTokenOrCodeEvent.bind({ event: 'authorization_code.consumed' }));
provider.on('authorization_code.destroyed', handleTokenOrCodeEvent.bind({ event: 'authorization_code.destroyed' }));
provider.on('authorization_code.saved', handleTokenOrCodeEvent.bind({ event: 'authorization_code.saved' }));
provider.on('client_credentials.destroyed', handleTokenOrCodeEvent.bind({ event: 'client_credentials.destroyed' }));
provider.on('client_credentials.saved', handleTokenOrCodeEvent.bind({ event: 'client_credentials.saved' }));
provider.on('device_code.consumed', handleTokenOrCodeEvent.bind({ event: 'device_code.consumed' }));
provider.on('device_code.destroyed', handleTokenOrCodeEvent.bind({ event: 'device_code.destroyed' }));
provider.on('device_code.saved', handleTokenOrCodeEvent.bind({ event: 'device_code.saved' }));
provider.on('initial_access_token.destroyed', handleTokenOrCodeEvent.bind({ event: 'initial_access_token.destroyed' }));
provider.on('initial_access_token.saved', handleTokenOrCodeEvent.bind({ event: 'initial_access_token.saved' }));
provider.on('replay_detection.destroyed', handleTokenOrCodeEvent.bind({ event: 'replay_detection.destroyed' }));
provider.on('replay_detection.saved', handleTokenOrCodeEvent.bind({ event: 'replay_detection.saved' }));
provider.on('pushed_authorization_request.destroyed', handleTokenOrCodeEvent.bind({ event: 'pushed_authorization_request.destroyed' }));
provider.on('pushed_authorization_request.saved', handleTokenOrCodeEvent.bind({ event: 'pushed_authorization_request.saved' }));
provider.on('refresh_token.consumed', handleTokenOrCodeEvent.bind({ event: 'refresh_token.consumed' }));
provider.on('refresh_token.destroyed', handleTokenOrCodeEvent.bind({ event: 'refresh_token.destroyed' }));
provider.on('refresh_token.saved', handleTokenOrCodeEvent.bind({ event: 'refresh_token.saved' }));
provider.on('registration_access_token.destroyed', handleTokenOrCodeEvent.bind({ event: 'registration_access_token.destroyed' }));
provider.on('registration_access_token.saved', handleTokenOrCodeEvent.bind({ event: 'registration_access_token.saved' }));
provider.on('access_token.destroyed', handleTokenOrCodeEvent.bind({ event: 'access_token.destroyed' }));

provider.on('grant.revoked', (ctx, grantId) => {
  console.info(`Grant ID ${grantId} was revoked!`);
});

function handleClientEvent(ctx, client) {
  console.info(`Handle client ${client.client_id} event`);
}

provider.on('pushed_authorization_request.success', handleClientEvent);
provider.on('registration_create.success', handleClientEvent);
provider.on('registration_delete.success', handleClientEvent);
provider.on('registration_update.success', handleClientEvent);

// Configurar o Koa
const app = new Koa();
app.proxy = true;
// app.use(helmet);
app.use(KoaCors({
  // eslint-disable-next-line arrow-body-style
  origin: (ctx) => {
    return allowedHosts.includes(ctx.header.origin) ? ctx.header.origin : '';
  },
  credentials: true,
  exposeHeaders: ['WWW-Authenticate'],
  allowHeaders: ['Authorization', 'X-BuildID'],
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
new Routes(app, provider, lowdb);
app.use(KoaMount(provider.app));

// Iniciar servidor
const server = app.listen(3000, () => {
  console.log('oidc-provider está pronto, verifique https://api.provider.dev.br/.well-known/openid-configuration');
  console.log('Inicie o login em: https://apprp.dev.br/ com o manoel@exemplo.com.br');
});
