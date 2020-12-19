import { Provider } from 'oidc-provider';
import { RedisAdapter } from './src/adapters/redis';
import Account from './src/app/Account';
import lowdb from './src/data/lowdb';
import jwks from './src/jwks.json';

const secureKeys = [
  '5xhuqknssevprev03qivap4d4se4dx5xardk95y6enz7uru7eo',
  '4pndhwz8dk57la2fqz0rdakseofsnzqbuz8a0vcwirjkpypcb7',
];

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
  adapter: RedisAdapter,

  // Contas
  findAccount: account.findAccount,

  // Vamos informar as claims suportadas
  claims: {
    openid: ['sub'],
    email: ['email', 'email_verified'],
  },

  // Configuração das funcionalidades
  features: {
    devInteractions: { enabled: true },
    introspection: { enabled: true },
    revocation: { enabled: true },
    encryption: { enabled: true },
  },
  formats: {
    AccessToken: 'jwt',
  },
  clients: [{
    client_id: 'app',
    client_secret: 'bem-secreto',
    redirect_uris: ['http://localhost:8080/cb'],
    // response_types: ['code', 'id_token token'],
    grant_types: ['authorization_code', 'implicit'],
    token_endpoint_auth_method: 'client_secret_basic',
    // + other client properties
  }],
  // ...
  jwks,
};

const oidc = new Provider('http://localhost:3000', configuration);

oidc.keys = secureKeys;

// just expose a server standalone, see /examples/standalone.js
const server = oidc.listen(3000, () => {
  console.log('oidc-provider está pronto, verifique http://localhost:3000/.well-known/openid-configuration');
  console.log('Inicie o login em: http://localhost:3000/auth?response_type=code&client_id=app&login_hint=manoel&redirect_uri=http://localhost:8080/cb')
});
