# Servidor de autenticação

Este documento apresenta minhas anotações sobre autenticação de usuários para criar um servidor provedor de autenticação baseado no OpenID e o protocolo OAuth 2.0 em [node.js](nodejs.org).  
Inspirado em como as grandes empresas, como Microsoft, Google, Facebook, Twitter realizam a autenticação de usuários e permitem que terceiros interajam com uma aplicação de forma autenticada.

## Porque Node.js?

Eu tinha somente a opção de escolher o uso das linguagens C# e JavaScript, com preferência para esse último.  
A biblioteca do JavaScript se mostrou muito melhor em termos de documentação, sem estar atrelada à telas prontas e ainda é o pacote mais certificado e com mais opções de uso, conforme abaixo.

### Diferença das implementações em C# e Node.js

|Conjunto|Perfil|Node.js (node oidc-provider)|C# (IdentityServer4)|
|---|---|---|---|
|[Servers](https://openid.net/developers/certified/#RPServices)|Basic OP|✅|✅|
|[Servers](https://openid.net/developers/certified/#RPServices)|Implicit OP|✅|✅|
|[Servers](https://openid.net/developers/certified/#RPServices)|Hybrid OP|✅|✅|
|[Servers](https://openid.net/developers/certified/#RPServices)|Config OP|✅|✅|
|[Servers](https://openid.net/developers/certified/#RPServices)|Dynamic OP|✅||
|[Servers](https://openid.net/developers/certified/#RPServices)|Form Post OP|✅||
|[Servers](https://openid.net/developers/certified/#RPServices)|3rd Party-Init OP|✅||
|[Logout](https://openid.net/developers/certified/#OPLogout)|RP-Initiated OP|✅||
|[Logout](https://openid.net/developers/certified/#OPLogout)|Session OP|✅||
|[Logout](https://openid.net/developers/certified/#OPLogout)|Front-Channel OP|✅||
|[Logout](https://openid.net/developers/certified/#OPLogout)|Back-Channel OP|✅||
|[FAPI](https://openid.net/developers/certified/#FAPIOP)|FAPI R/W OP w/ MTLS|✅||
|[FAPI](https://openid.net/developers/certified/#FAPIOP)|FAPI R/W OP w/ Private Key|✅||

Todas as outras linguagens, frameworks, serviços online e na nuvem não oferecem tantos perfis quanto o `node oidc-provider` que é a implementação mais completa.
Além disso, ele oferece somente a especificação, sem estar preso à um framework ou telas prontas.

## Sobre este documento

Este documento não é um guia oficial e possui uma linguagem mais direta e informal dos conceitos. É puramente anotações e interpretações minhas sobre a leitura de toda documentação e experiências profissionais.  
Além disso esse documento é um estudo para um projeto pessoal, e podem fazer referências à tecnologias utilizadas pelo projeto, não necessárias para o servidor de autenticação ou para entender o conceito.  

É focado principalmente na criação de um servidor de autenticação, porém as anotações são para interação com o servidor, não entrando em especificações de como um servidor OP deva funcionar, tornando por base que o `node oidc-provider` já tem em sua implementação as validações e regras no lado do servidor.

OBS: muitas vezes é usado a sigla **IdP** para referir-se ao servidor de autenticação (Authorization Server, Identity Provider ou IdP, OpenID Provider ou OP), ou seja, o lugar onde está sendo executado o node oidc-provider.

### Leia a documentação Oficial

- [OpenID Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [RFC6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [RFC6750 - Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- [RFC7515 - JWS](https://tools.ietf.org/html/draft-ietf-jose-json-web-signature-41)
- [node oidc-provider](https://github.com/panva/node-oidc-provider)
- [node openid-client](https://www.npmjs.com/package/openid-client)

# OpenID Connect

As anotações abaixo referenciam a especificação OpenID Connect Core 1.0.  
Esta é base principal do OpenID, dos fluxos de autenticação.

## Fluxos de autenticação (_flows_)

- **Authorization Code**  
    O fluxo mais comum. Uma aplicação percebe que não há sessão e redireciona o usuário para uma tela de login. Após informado usuário e senha, este redireciona para a aplicação de volta junto com um código temporário. No back-end, o código temporário serve para trocar o código por um token de acesso e de id.

    Vantagens:
    - Não expõe o token para o navegador (User Agent).  
    - O cliente recebe publicamente um código, e internamente troca por um token de acesso.

    ### Requisição da Autenticação

    ```http
    HTTP/1.1 302 Found
    Location: https://server.example.com/authorize?
        response_type=code
        &scope=openid%20profile%20email
        &client_id=s6BhdRkqt3
        &state=af0ifjsldkj
        &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
    ```

    |Parâmetro|Valor e descrição|
    |---|---|
    |response_type|`code`|
    |scope|`openid`|
    |client_id|_Código da aplicação requisitando um token._|
    |redirect_uri|_Deve ser `https`._<br>_Deve estar registrado no IdP._|
    |state|_Evita CSRF e XSRF._<br>_Pode ser o hash de um cookie do navegador no cliente._|
    |[nonce]|_Deve ser um hash relacionado à sessão (pode ser baseado em cookie HttpOnly com um valor aleatório._|
    |prompt|_Lista separada por espaço de como o IdP pergunta pro usuário sobre consentimento ou re-autenticação._<br>`none` não faz nada (usado pra checar se tem permissões e sessão)<br>`login` (só mostra tela de autenticação)<br>`consent` (só pede consentimento)<br>`select_account` (pede para o usuário escolher uma das contas ativas)|
    |max_age|Tempo máximo em segundos em que um usuário é considerado autenticado.<br>Quando esse tempo termina, uma requisição nova no endpoint de autorização, irá pedir que o usuário se autentique novamente).|
    |ui_locales|Lista separada por espaço e em ordem de preferência dos idiomas para a tela de login. Ex: `pt-BR pt en`
    |id_token_hint|Envia um token previamente emitido pelo IdP. Retorna sucesso quando já está autenticado, ou um erro caso contrário.<br>Deve ser usado quando o `prompt=none` é informado.<br>O próprio IdP tem que estar como audiência `aud` do token.|
    |login_hint|Informa um endereço de `e-mail` ou `telefone` que será preenchido automaticamente na tela de login.|

    ### Erros de Autenticação

    ```http
    HTTP/1.1 302 Found
    Location: https://client.example.org/cb?
        error=invalid_request
        &error_description=Unsupported%20response_type%20value
        &state=af0ifjsldkj
    ```

    |Error|Descrição|
    |---|---|
    |interaction_required|Quando `prompt=true` porém é preciso exibir uma tela.|
    |login_required|Quando `prompt=true` porém é preciso exibir a tela de login.|
    |account_selection_required|Quando `prompt=true` porém é preciso exibir a tela para selecionar a sessão.|
    |consent_required|Quando `prompt=true` porém é preciso exibir a tela de consentimento.|
    |invalid_request_uri|Quando `request_uri` está inválido.|
    |invalid_request_object|Algo na requisição é inválido.|
    |request_not_supported|Não suporta a requisição informada.|
    |request_uri_not_supported|Não suporta o `request_uri` informado.|
    |registration_not_supported|Não suporta o `	registration` informado.|

    ### Validação da resposta da Autenticação

    ```http
    HTTP/1.1 302 Found
    Location: https://client.example.org/cb?
        code=SplxlOBeZQQYbYS6WxSbIA
        &state=af0ifjsldkj
    ```

    |Item|Validação|
    |---|---|
    |code|Obrigatório.|
    |state|Obrigatório se foi informado na requisição.<br>Deve ser idêntico ao informado antes.|

    ### Requisição de Token

    ```http
    POST /token HTTP/1.1
    Host: server.example.com
    Content-Type: application/x-www-form-urlencoded
    Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

    grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
        &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
    ```

    |Parâmetro|Valor e descrição|
    |---|---|
    |grant_type|`authorization_code`|
    |code|O código recebido na requisição de Autenticação.|
    |redirect_uri|A URL que será redirecionado após o login.<br>Note que essa URL precisa ser idêntica a informada na requisição de Autenticação.|
    |client_id|O identificador do cliente (aplicação).|

    ### Erro na requisição do Token

    ```http
    HTTP/1.1 400 Bad Request
    Content-Type: application/json
    Cache-Control: no-store
    Pragma: no-cache

    {
        "error": "invalid_request"
    }
    ```

    ### Validação da resposta do Token

    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json;charset=UTF-8
    Cache-Control: no-store
    Pragma: no-cache

    {
        "access_token":"2YotnFZFEjr1zCsicMWpAA",
        "token_type":"example",
        "expires_in":3600,
        "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
        "example_parameter":"example_value"
    }
    ```

    |Item|Validação|
    |---|---|
    |access_token|Deve existir.|
    |token_type|Deve ser `Bearer`.|
    |id_token|Deve existir e validar conforme [descrito abaixo](#validacao-do-id-token).|
    |expires_in|Segundos em que o token irá expirar após a requisição.|
    |refresh_token|Token que pode ser usado para renovar o atual após a expiração.|
    |scope|Deve existir se foi informado na requisição, e deverá ser idêntico.|

## ID Token

### Validação do ID Token

|#|Item|Validação|
|-|---|---|
|1|_criptografado_|Se o cliente especificou uma criptografia no seu registro.<br>Se foi solicitado um token criptografado e veio um sem, deve ser rejeitado.|
|2|iss|O claim de emissor deve bater exatamente com o identificador do IdP, ou seja, a URL que foi chamada para autenticar, ou do serviço de descoberta.|
|3|aud|A claim de audiência deve conter o `client_id`, e na sua ausência deve ser rejeitado.<br>Se a lista de audiência conter outros destinos que o cliente não confia, também deve rejeitar.|
|4|azp|Deve existir se o token tem várias audiências/públicos.<br>Se existir deve verificar que seu `client_id` é um valor de Claim.|
|5|_TLS_|No fluxo de **Authorization Code** pode validar o TLS do servidor do IdP.|
|6|alg|O valor deve ser `RS256` ou o valor informado no registro pelo cliente em `id_token_signed_response_alg`.|
|7|exp|A data atual deve ser anterior à data de expiração do token.|
|8|iat|A data do claim `iat` pode ser usada para rejeitar tokens emitidos há muito tempo.|
|9|nonce|Se o valor do nonce foi enviado na requisição de Autenticação, então o valor deve ser exatamente o mesmo no token.|
|10|acr|Se o `acr` foi informado na requisição, deve-se checar se o valor é apropriado.|
|11|auth_time|Se o `auth_time` foi informado na requisição, ou o `max_age` então esta claim deve ser validada.<br>Deve ser solicitada uma nova autenticação se muito tempo se passou desde a última autenticação do usuário.|

## Claims

|Membro|Tipo|Descrição
|---|---|---|
|sub|texto|Identificador único (no emissor) do usuário.|
|name|texto|Nome completo do usuário.|
|given_name|texto|Primeiro nome do usuário.|
|family_name|texto|Sobrenome do usuário.|
|middle_name|texto|Nome do meio do usuário (se existir).|
|nickname|texto|Nome casual do usuário, ou como prefere ser chamado. _ex.: `Gabs`_|
|preferred_username|texto|Nome curto que representa o usuário, ou o "login". _ex.: `gcacars` ou `_g@ta.123`_|
|profile|texto|URL da página de perfil do usuário.|
|picture|texto|URL da imagem de perfil **do usuário** (não uma qualquer).|
|website|texto|URL do Blog, site ou página na organização do usuário.|
|email|texto|Endereço de e-mail preferido do usuário.|
|email_verified|booleano|`true` se foi adotada maneiras de garantir que este e-mail é controlado por este usuário.|
|gender|texto|`male`, `female` ou outro valor.|
|birthdate||Data de nascimento no formato `YYYY-MM-DD` ou `YYYY`.<br>Se o ano for `0000`, então o valor foi omitido.|
|zoneinfo||Fuso horário do usuário. _ex.: `America/Sao_Paulo`_ [Consultar lista](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)|
|locale||Localização ou idioma do usuário. _ex.: `pt-BR`_ [Consultar lista](https://gist.github.com/msikma/8912e62ed866778ff8cd)|
|phone_number||Número de telefone preferencial do usuário. _ex.: `+5511955552222`_|
|phone_number_verified|booleano|`true` quando foi adotado maneiras de garantir que esse telefone realmente pertence à este usuário.|
|address|objeto JSON|Endereço postal do usuário.|
|updated_at|número|_Timestamp_ da última  vez que as informações foram atualizadas.|

### Claims em vários idiomas

Para representar uma claim em vários idiomas, usa-se o formato `[claim]#[idioma][-[PAÍS]]?`, como por exemplo:

|Claim|Valor|
|-|-|
|`profile`|`https://exemplo.com.br/gabriel`|
|`profile#en-US`|`https://example.com.us/gabriel`|
|`profile#es`|`https://ejemplo.com.ar/gabriel`|

## UserInfo Endpoint

### Requisição

Deve ser acessado uma rota enviando o token de acesso no cabeçalho.

```http
GET /userinfo HTTP/1.1
  Host: server.example.com
  Authorization: Bearer SlAV32hkKG
```

### Resposta

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "sub": "248289761001",
    "name": "Fulano de Tal",
    "given_name": "Fulano",
    "family_name": "Tal",
    "preferred_username": "f.tal",
    "email": "fulanotal@exemplo.com.br",
    "picture": "http://exemplo.com.br/f.tal/eu.jpg"
}
```

### Erro

Retorna um cabeçalho de resposta para identificar o tipo de autenticação que deve ser usado para conseguir acesso ao recurso. [WWW-Authenticate](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/WWW-Authenticate)

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="openid",
  error="invalid_token",
  error_description="O token de acesso expirou!"
```

## Segurança

Algumas dicas e procedimentos para prevenir falhas de segurança e ataques maliciosos.

- Rotacionar o código secreto do cliente de tempos em tempos (3 meses?).
- Ao criar um token novo, salvar em algum lugar o `jti`, como uma instância Redis, que deve expirar assim que o token expira. Em toda requisição, validar se aquele `jti` ainda existe no Redis. Em caso de atividade suspeita, remover o `jti` do Redis, o que irá invalidar todas as requisições, mesmo com um token válido. _("Blacklist")_
- O servidor deve usar SSL/TLS no mínimo na versão 1.2. _[Gerador de configuração da Mozilla](https://ssl-config.mozilla.org/#server=nginx&version=1.17.7&config=intermediate&openssl=1.1.1d&guideline=5.6)_
- Detectar vazamentos de senhas e credenciais dos usuários em ferramentas como o [have i been pwned](https://haveibeenpwned.com/API/v3), inserindo todos os tokens na Blacklist, trocar a senha por outra aleatória, e enviar um e-mail de recuperação de senha.
- Também verificar vazamentos de contas do próprio serviço/produto.

## Fontes

Outras fontes de leitura (bibliografia):

- [Auth0 Docs](https://auth0.com/docs/get-started)
- [OpenID Blog - Financial-grade API (FAPI) Explained by an Implementer](https://fapi.openid.net/2020/02/26/guest-blog-financial-grade-api-fapi-explained-by-an-implementer/)