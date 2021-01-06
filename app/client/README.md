# Aplicação Exemplo - Cliente

Esta é uma aplicação web de exemplo de integração com um servidor de autenticação OpenID.

Este projeto faz parte de uma solução maior, se chegou diretamente, [leia o documento principal](../../README.md).

## Tecnologias e pacotes

Para desenvolvimento foi utilizado:

* Node 14.15.0
* [Vue CLI 4.5.9](https://next.cli.vuejs.org/)
  * [Vue.js 3](v3.vuejs.org/)
  * [Vuex 4](next.vuex.vuejs.org/)
  * [Vue Router 4](next.router.vuejs.org/)
  * [Bootstrap Icons Vue](https://www.npmjs.com/package/bootstrap-icons-vue)
  * [Vuex OIDC](https://github.com/perarnborg/vuex-oidc/wiki) _(para sincronizar o estado de autenticação com o Vuex)_
  * [Vue Test Utils 2 (beta)](https://vue-test-utils.vuejs.org/v2/guide/introduction.html)
* [OIDC Client](https://github.com/IdentityModel/oidc-client-js) _(cliente certificado OpenID Connect para navegadores)_
* [Bootstrap 5 (beta 1)](https://getbootstrap.com/docs/5.0/)
  * Popper.js
  * [Bootstrap Icons](https://icons.getbootstrap.com/)
* [Marked](https://marked.js.org/) _(para renderizar os arquivos Markdown)_
* Cypress _(testes ponta a ponta)_

> Note que alguns recursos estão em fase beta ou alpha e não são ainda indicados para ambientes produtivos.

## Conectividade com OpenID

Para se conectar no servidor de autorização (ou provedor OpenID), foi utilizada a biblioteca OIDC Client através do pacote Vuex OIDC, baseado quase integralmente no repositório de exemplo da própria biblioteca: [vuex-oidc-example](https://github.com/perarnborg/vuex-oidc-example).

### Authorization Code e SPAs

Nesse projeto não foi utilizado o fluxo implícito do OAuth 2.0, e sim o fluxo de código de autorização, que normalmente só é utilizado em aplicações com back-end (o que não é este caso) para maior segurança e não expor o `access_token` recebido diretamente na URL e que pode ser mantida no histórico do navegador.

Isso é possível através do uso do PKCE na autenticação com a extremidade de requisição de token. Para saber mais, leia os artigos (em inglês):

[Securing a Vue.js app using OpenID Connect Code Flow with PKCE and IdentityServer4](https://damienbod.com/2019/01/29/securing-a-vue-js-app-using-openid-connect-code-flow-with-pkce-and-identityserver4/)
[Migrating oidc-client-js to use the OpenID Connect Authorization Code Flow and PKCE](https://www.scottbrady91.com/Angular/Migrating-oidc-client-js-to-use-the-OpenID-Connect-Authorization-Code-Flow-and-PKCE)
[Improved OAuth public client support and PKCE availability in Connect2id server 3.9](https://connect2id.com/blog/connect2id-server-3-9)

> É possível usar o fluxo implícito normalmente com este projeto, alterando o tipo de resposta nas configurações do OIDC.

#### Configuração da aplicação (cliente)

Para que o PKCE seja utilizado, foi alterado apenas o tipo de resposta na requisição de autenticação:

```js
response_type: 'code',
```

#### Configuração do servidor de autenticação (provedor OpenID)

Já para ativar no servidor `node oidc-provider`, as configurações foram essas:

```js
const configuration = {
  // ...
  responseTypes: ['code'],
  
  // Metadados adicionais que um cliente pode ter
  extraClientMetadata: {
    // Lista de propriedades adicionais
    properties: ['web_app_type'],
    
    // Validação das propriedades
    validator(chave, valor, metadado) {
      switch (chave) {
        case 'web_app_type':
          if (valor && !['spa'].includes(valor)) {
            throw new Error('Tipo de aplicação Web inválido');
          }
          break;

        default:
          break;
      }
    },
  },

  // PKCE para autenticação de clientes públicos que requerem `code`
  pkceMethods: ['S256'],
  pkce: {
    methods: ['S256'],
    required: (ctx, client) => client.tokenEndpointAuthMethod === 'none' && client.applicationType === 'web',
  },
  
  clients: [{
    application_type: 'web', // Importante
    client_id: 'app',
    client_secret: 'bem-secreto',
    client_uri: 'https://apprp.dev.br/',
    redirect_uris: [
      'https://apprp.dev.br/',
      'https://apprp.dev.br/auth', // Importante - callback
      'https://apprp.dev.br/authp', // Importante - callback do popup
      'https://apprp.dev.br/s.html', // Importante - renovação silenciosa
      'https://apprp.dev.br/logout',
    ],
    post_logout_redirect_uris: [
      'https://apprp.dev.br/logout',
    ],
    
    response_types: ['code'], // Importante
    grant_types: ['authorization_code'], // Importante
    scope: 'openid email phone profile',
    token_endpoint_auth_method: 'none', // Importante
    
    id_token_signed_response_alg: 'RS256',
    userinfo_signed_response_alg: 'RS256',
    
    web_app_type: 'spa', // Importante
  }],
}
```

##### Forçar o uso de PKCE

A configuração `token_endpoint_auth_method: 'none',` pode abrir uma brecha de segurança, visto que não é necessário se autenticar para trocar um `code`. Como a especificação do protocolo não tem ainda um valor para PKCE, então devemos checar toda requisição que for sem autenticação, se está fornecendo um desafio PKCE. Isto é feito verificando se o tipo do cliente é um SPA `web_app_type: 'spa'` e ouvindo os eventos do provedor:

```js
const oidc = new Provider('https://api.provider.dev.br', configuration);

// ...

oidc.on('authorization.accepted', (ctx) => {
  const { client, params } = ctx.oidc;

  if (client.applicationType === 'web' && client.web_app_type === 'spa'
      && !params.code_challenge && !params.code_challenge_method) {
    throw new errors.InvalidRequest('Should use PKCE authentication.', 99);
  }
});
```

### Renovação silenciosa do token

Durante o uso da aplicação o token expira várias vezes e ele precisa ser renovado. Isso acontece inserindo um iframe invisível na tela, e que fica verificando a sessão e tentando renovar o token.

Para que isso aconteça é preciso indicar nas configurações do `oidc-client`:

```js
automaticSilentRenew: true,
automaticSilentSignin: false,
silentRedirectUri: `${process.env.VUE_APP_URL}/s.html`,
```

Repare que a indicação da URL do iframe aponta para um arquivo `s.html` na URL da aplicação, que foi configurada no arquivo `.env`.

Este arquivo realmente tem outro nome no repositório: `public/silent.html` e contém uma estrutura básica HTML para o WebPack inserir os arquivos "compilados", da mesma forma que o `index.html` ali funciona para o Vue.

Além disso, a lógica para renovação do token está no arquivo `src/silent.js`, que é o código inserido no `silent.html` após o WebPack ser executado.

Para que o Vue.js inteiro não seja carregado nessa página, e tenha outros recursos inúteis para um iframe oculto, configuramos o dois projetos separados na configuração do WebPack no arquivo `vue.config.js` conforme a [documentação oficial](https://cli.vuejs.org/config/#pages).

<details>
  <summary>Clique para expandir</summary>
  
  ```js
  pages: {
    app: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Aplicação Exemplo',
      scriptLoading: 'defer',
      chunks: ['app', 'chunk-app-vendors', 'chunk-common', 'chunk-vendors'],
      excludeChunks: ['chunk-silent-renew-oidc-vendors', 'silent-renew-oidc'],
      base: process.env.VUE_APP_URL,
    },
    // Preparar a página de renovação silenciosa fora do Vue
    'silent-renew-oidc': {
      entry: 'src/silent.js',
      template: 'public/silent.html',
      filename: 's.html',
      scriptLoading: 'defer',
      chunks: ['vuex-oidc-s', 'chunk-silent-renew-oidc-vendors', 'silent-renew-oidc'],
    },
  },
  
  chainWebpack: (config) => {
    // Remove o preload e prefetch do silent
    config.plugins.delete('prefetch-silent-renew-oidc');

    const options = module.exports;
    const {
      pages,
    } = options;
    const pageKeys = Object.keys(pages);
    
    const IS_VENDOR = /[\\/]node_modules[\\/]/;

    config.optimization
      .splitChunks({
        cacheGroups: {
          vendors: {
            name: 'chunk-vendors',
            priority: -10,
            chunks: 'initial',
            minChunks: 1,
            test: IS_VENDOR,
            reuseExistingChunk: false,
            enforce: true,
          },
          ...pageKeys.map((key) => ({
            name: `chunk-${key}-vendors`,
            priority: -1,
            chunks: (chunk) => chunk.name === key,
            minChunks: 1,
            test: IS_VENDOR,
            reuseExistingChunk: false,
            enforce: true,
          })),
          common: {
            name: 'chunk-common',
            priority: -20,
            chunks: 'initial',
            minChunks: 2,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      });
  },
  ```
  
  _Acompanhe a discussão no [Fórum do Vue CLI](https://github.com/vuejs/vue-cli/issues/2381)_
</details>

### Interação

Como é um SPA _(Single Page Application)_, para não carregar todo a aplicação novamente, o login é feito via popup e o logout silenciosamente, removendo o usuário da sessão local e solicitando para o servidor de autorização encerrar lá.

O fluxo comum é esse:

1. O usuário acessa a rota principal `/`, porém é detectado que não há sessão ativa.
2. Então é redirecionado para a rota `/public` que é uma rota pública que mostra uma mensagem amigável para entrar.
3. O usuário clica no botão `Entrar`, então uma janela popup se abre encaminhando para o servidor de autorização, solicitando usuário e senha e o consentimento do usuário.
4. Após o usuário encerrar o fluxo, a janela se fecha, a foto e nome são exibidos no menu superior indicando que a sessão atual (no Vuex) foi atualizada.
5. Usuário abre o menu do perfil clicando no nome, e então em "Sair e ficar", fazendo a aplicação encerrar a sessão, então automaticamente volta para a rota `/public`.

> No menu do perfil temos a opção "Sair" que irá redirecionar o usuário para a tela de logout do provedor OpenID.

## Vue.js

* Iniciar a primeira vez

  ```console
  npm i
  ```

* Compilar e atualizar automaticamente em desenvolvimento

  ```console
  npm run serve
  ```

* Compilar e minificar para produção

  ```console
  npm run build
  ```

* Rodar testes unitários

  ```console
  npm run test:unit
  ```

* Rodar testes ponta a ponta (E2E)

  ```console
  npm run test:e2e
  ```

* Validar código e arrumar arquivos

  ```console
  npm run lint
  ```

### Personalizar a configuração

Veja a [Referência de Configuração](https://cli.vuejs.org/config/).
