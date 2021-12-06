import fs from 'fs';
import Koa from 'koa';
import KoaCors from 'koa-cors';
import Router from '@koa/router';
import { Issuer, TokenSet, custom } from 'openid-client';

// Rotas
const router = new Router();

router.get('/', async (ctx, next) => {
  if (!ctx.openIdClient) {
    return next('Cliente não iniciado!');
  }

  /**
   * @type {import('openid-client').Client}
   */
  const client = ctx.openIdClient;

  try {
    const token = await client.introspect(ctx.accessToken);

    if (!token.active) {
      ctx.response.status = 403;
      ctx.body = {
        error: 'expired_token',
        error_description: 'Token expirado!',
      };

      return next();
    }

    if (!token.aud
        || (Array.isArray(token.aud) && !token.aud.includes('https://api.app-rp.dev.br'))
        || (!Array.isArray(token.aud) && token.aud !== 'https://api.app-rp.dev.br')) {
      ctx.response.status = 401;
      ctx.body = {
        error: 'invalid_audience',
        error_description: 'O público do token não contém esta API!',
      };

      return next();
    }

    if (!token.azp || token.azp !== 'app-rp.dev.br') {
      ctx.response.status = 401;
      ctx.body = {
        error: 'azp_invalid',
        error_description: 'Token com origem duvidosa!',
      };

      return next();
    }

    ctx.body = {
      ok: true,
    };
  } catch (error) {
    ctx.body = error;
  }

  return next();
});

router.get('/status', async (ctx, next) => {
  if (!ctx.openIdClient) {
    return next('Cliente não iniciado!');
  }

  /**
   * @type {import('openid-client').Client}
   */
  const client = ctx.openIdClient;

  try {
    const res = await client.introspect(ctx.accessToken);
    ctx.body = res;
  } catch (error) {
    ctx.body = error;
  }

  return next();
});

// Pegar o certificado de cliente para usar no mTLS
if (!fs.existsSync('../../nginx/ssl/api.app-rp.dev.br.client.key')
    || !fs.existsSync('../../nginx/ssl/api.app-rp.dev.br.client.crt')) {
  // eslint-disable-next-line no-console
  console.error('Crie uma nova chave e certificado conforme descrito no README.md');
  process.exit(-1);
}

const ca = fs.readFileSync('../../nginx/ssl/rootCA.pem');
const key = fs.readFileSync('../../nginx/ssl/api.app-rp.dev.br.client.key');
const cert = fs.readFileSync('../../nginx/ssl/api.app-rp.dev.br.client.crt');

// Iniciar OpenID
async function main() {
  const issuer = await Issuer.discover('http://localhost:3000'); // 'https://op.provider.dev.br'
  const client = new issuer.Client({
    client_id: 'api',
    response_types: ['code'],
    grant_types: ['authorization_code', 'implicit'],
    // application_type: 'native',
    token_endpoint_auth_method: 'tls_client_auth',
    introspection_endpoint_auth_method: 'tls_client_auth',
  });

  // Configurar mTLS
  client[custom.http_options] = function httpOptions(options) {
    const opts = {
      ...options,
      timeout: 50000,

      // veja mais em https://github.com/sindresorhus/got/tree/v11.8.0#advanced-https-api
      https: {
        ...options.https,
        certificate: cert,
        key,
        // CA - Certificadora Autorizada personalizada
        ca,

        // usar com arquivos .p12/.pfx
        // pfx,
        // passphrase: 'senha',
      },

      // uso com Proxy
      // https://github.com/sindresorhus/got/tree/v11.8.0#agent
      // agent,
    };

    return opts;
  };

  /*
  const grantResponse = await client.grant({
    grant_type: 'client_credentials',
    scope: 'openid profile',
  });
  */

  // Koa
  const app = new Koa();

  // Endpoints
  app.use(async (ctx, next) => {
    ctx.openIdClient = client;

    // Autenticação
    const token = ctx.get('authorization');

    if (!token) {
      ctx.response.status = 401;
      return next('Not authorized!');
    }

    ctx.accessToken = token.replace(/Bearer\s/ig, '');

    await next();
  });
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(KoaCors());

  // Iniciar
  app.listen(7000);
  // eslint-disable-next-line no-console
  console.log('API está pronta em: https://api.app-rp.dev.br');
}

main();

/*
// Iniciar servidor com HTTPS
https.createServer({
  key,
  cert,
}, (req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  const qs = new URLSearchParams(req.url.split('?')[1]);

  if (qs.get('error')) {
    res.write(`<h1>Erro: ${qs.get('error')}</h1><p>${qs.get('error_description')}</p>`);
  } else {
    res.write('O aplicativo está funcionando! :)');
  }

  const state = nanoid();

  res.end(`<br><br>
    <a href="http://op.provider.dev.br/auth?response_type=code&scope=openid%20email&client_id=app&login_hint=manoel@exemplo.com.br&redirect_uri=https://app-rp.dev.br/cb&state=${state}">
      Fazer login
    </a><br>
    <a href="http://op.provider.dev.br/session/end">Fazer logout</a>
  `);
}).listen(7000);
*/
