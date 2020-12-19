import { Provider } from 'oidc-provider';

const configuration = {
  // ... see the available options in Configuration options section
  features: {
    introspection: { enabled: true },
    revocation: { enabled: true },
  },
  formats: {
    AccessToken: 'jwt',
  },
  clients: [{
    client_id: 'app',
    client_secret: 'bem-secreto',
    redirect_uris: ['http://localhost:8080/cb'],
    // + other client properties
  }],
  // ...
  async findAccount(ctx, id) {
    console.log(id, ctx);
    return {
      accountId: id,
      async claims(use, scope) {
        return { sub: id };
      },
    };
  },
};

const oidc = new Provider('http://localhost:3000', configuration);

// just expose a server standalone, see /examples/standalone.js
const server = oidc.listen(3000, () => {
  console.log('oidc-provider está pronto, verifique http://localhost:3000/.well-known/openid-configuration');
  console.log('Inicie o login em: http://localhost:3000/auth?response_type=code&client_id=app&login_hint=manoel&redirect_uri=http://localhost:8080/cb')
});