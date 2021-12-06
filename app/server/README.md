# API de Exemplo

Este é um exemplo de API que consome um _access token_ JWT e valida-o.
Além disso a API se autentica como um cliente do provedor OpenID enviando um certificado de cliente, usando a autenticação mútua de TLS.

## Tecnologias e pacotes

Para desenvolvimento foi utilizado:

* Node 14.15.0
* [OpenID Client 4.2](https://www.npmjs.com/package/openid-client)
* [Koa.js](https://koajs.com/)
  * [Koa-Router](https://github.com/koajs/router)
  * [Koa-Cors](https://github.com/koajs/cors)

### Gerar token com certificado

```js
if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
    cert = getCertificate(ctx);
```
