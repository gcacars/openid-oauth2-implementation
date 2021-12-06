# OAuth 2.0 Token Exchange ([RFC8693](https://www.rfc-editor.org/rfc/rfc8693))

## Troca de tokens

Esta RFC especifica uma extensão do protocolo OAuth 2.0, definindo um protocolo para obter tokens seguros de um Serviço de Tokens Seguros (STS - Security Token Service) porém baseado em JSON, que facilita o compartilhamento de identidade e informação de segurança através de domínios.

## Semântica de delegação vs. representação

Um uso comum para um STS é permitir que um servidor de recursos A faça chamadas para um serviço C no backend em nome do usuário requerente B.

### Delegação

Dependendo da infra-estrutura e das políticas adotadas, é desejável que A use suas próprias credenciais para chamar C com uma anotação de alguma forma que A está atuando em nome de B.

Algo como: _Ei C! Sou eu o B, mas estou falando através do A contigo, passa meus registros para ele?_

PS: sabe quando você pega o telefone de outra pessoa para ligar para algum parente seu?

Quando A está atuando em nome de B, ele mantém suas próprias credenciais (que são diferentes de B), e que apesar de B ter delegado alguns direitos à A, qualquer ação executada ainda é feita por A em nome de B, ou seja, o A é um agente de B.

O token da semântica de delegação inclui tanto a informação do sujeito primário (`subject_token`) quanto do ator (`actor_token`) - o qual o sujeito delegou alguns direitos. Pode ser reconhecido como um token composto, visto que tem a informação de vários sujeitos.

O parâmetro de requisição `actor_token` provê informação sobre o ator desejado, e a claim `act` do JWT é mais relacionada a prover uma representação da cadeia de delegação.

### Personificação (_Impersonation_)

Ou, em outros casos, o A recebe uma credencial de acesso limitado à C, mas continua indicando B como entidade autorizada.

Algo como: _Ei C! Sou eu, o A estou trabalhando para o B, você pode me passar os registros dele?_

PS: sabe quando estão entregando documentos e você pegar o do seu amigo também?

Quando A personifica B, A ganha todos os direitos que B tem, e no contexto ele é indistinguível de B. Quando algum recurso recebe esse token, é como se estive lidando diretamente com B, ou seja, quando se comunicando, A é sempre B na representação.

> Note que alguns recursos podem ter a consciência de que uma personificação está acontecendo.

### Conclusão

Na delegação um recurso usa suas próprias credenciais quando chama outros recursos em nome de um usuário, enquanto na Personificação, as credenciais do próprio usuário são usadas, mas com uma indicação que é um recurso que está chamando.

Ambas não são inclusivas, e nos fluxos padrões do OAuth, naquele momento elas não estão sendo utilizadas.

## Requisição de troca de token

O cliente pode trocar um token fazendo uma requisição normal para o ponto de acesso "Token", conforme os fluxos normais do OAuth 2.

> Note que de alguma forma o cliente deve ser autenticado ao fazer a requisição, como usando uma credencial de cliente ([RFC7523](https://datatracker.ietf.org/doc/html/rfc7523)), caso contrário qualquer recurso poderá se passar por alguém trocando um token.

Para essa requisição são usados os parâmetros abaixo em `application/x-www-form-urlencoded`.

|Parâmetro|Descrição|Obrigatório|Tipo|
|---|---|---|---|
|`grant_type`|O valor fixo: `urn:ietf:params:oauth:grant-type:token-exchange`.|Sim|Texto|
|`subject_token`|O token que identifica o sujeito em nome do qual a requisição está sendo solicitada. Normalmente o sujeito aqui informado, será o sujeito do token retornado.|Sim|Token|
|`subject_token_type`|Identifica o tipo do token informado em `subject_token`.|Sim|[Tipo de token](#identificadores-de-tipo-de-token)|
|`actor_token`|O token que representa o terceiro que será autorizado a agir em nome do sujeito.|Opcional|Token|
|`actor_token_type`|Identifica o tipo do token informado em `actor_token`.|Sim se `actor_token` for informado.|[Tipo de token](#identificadores-de-tipo-de-token)|
|`resource`|Uma URI absoluta do recurso de destino, conforme descrito na [RFC8707](https://datatracker.ietf.org/doc/html/rfc8707).|Opcional|URI|
|`audience`|Um nome lógico do serviço alvo. É similar com o parâmetro `resource`, porém usando um nome conhecido entre o cliente o servidor de autorização.<br>Pode ser um `iss` (OIDC), um identificador SAML (OASIS) ou o identificador do cliente (OAuth).<br>Pode ser usado junto com o parâmetro `resource`.|Opcional|Lista ou texto|
|`scope`|O escopo desejado do token de segurança no contexto do recurso alvo.|Opcional|Texto delimitado por espaços.|
|`requested_token_type`|O tipo do token esperado. Se não for informado, o Servidor de Autorização pode tentar "adivinhar" o tipo esperado pelo recurso (`resource`) ou o público (`audience`) informados.|Opcional|[Tipo de token](#identificadores-de-tipo-de-token)|

> Note que quando o Servidor de Autorização receber esta requisição, deve validar todos os tokens informados de acordo com o tipo. E apesar de o token gerado depender da data de expiração do token original (o do sujeito), o SA não deve fazer nenhuma alteração no token original ou criar alguma relação entre os dois tokens. Ainda, um evento de revogação de token pode ser propagado, mas não é definido pela especificação.

Imaginando que um token já foi emitido para um usuário e ele foi usado numa requisição...

```http
GET /resource HTTP/1.1
Host: frontend.example.com
Authorization: Bearer accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC
```

...e este recurso quer trocar o token:

```http
POST /token HTTP/1.1
Host: as.example.com
Authorization: Basic cnMwODpsb25nLXNlY3VyZS1yYW5kb20tc2VjcmV0
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&resource=https://backend.example.com/api
&subject_token=accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
```

> Note que os exemplos tem quebras de linhas adicionais e não estão codificados corretamente, afim de facilitar a leitura.

### Sobre recursos, públicos e escopos

Ao solicitar a troca de um token, pode ser informado o recurso (`resource`) e/ou o público (`audience`) desejados como alvo, e o recurso pode ter os seus próprios escopos. Esses escopos solicitados já devem ter sido consentidos pelo sujeito antes, normalmente na autenticação.

Como exemplo, imagina que temos o recurso A - API de clientes, que tem os escopos: `clientes:listar` e `clientes:editar`, e um recurso B - API de pagamentos que tem os escopos `pag:efetuar` e `pag:relatórios`. Quando o João fizer sua autenticação, deve ser solicitado um plano cartesiano de todos os escopos que poderão ser necessários, ou seja `scope=clientes:listar clientes:editar pag:efetuar pag:relatórios`.

Desta forma quando o sistema for trocar o token do João para acesso à API de clientes, será informado o parâmetro `scope=clientes:listar clientes:editar` com apenas o que é necessário para aquele recurso, porém João já deve ter consentido esses escopos antes.

## Resposta da troca de token

|Parâmetro|Descrição|Obrigatório|
|---|---|---|
|`access_token`|O token de segurança trocado. Note que este é o nome usado por compatibilidade e o token recebido não necessariamente será realmente um token de acesso.|Sim|
|`issued_token_type`|Qual o tipo do token emitido: um token de acesso, de identificação... (veja mais abaixo)|Sim|
|`token_type`|Indica o uso deste token conforme o padrão do OAuth. `Bearer` por exemplo.|Sim|
|`expires_in`|O tempo em segundos que o token irá expirar.|Recomendado|
|`scope`|O escopo do token emitido.|Sim caso seja diferente do requisitado|
|`refresh_token`|Não faz muito sentido retornar um token de atualização visto que os tokens de segurança devem ser credenciais temporárias. Porém pode haver casos onde o cliente deve ter uma forma de renovar o token, ou ainda casos onde o usuário não está mais presente (offline).|Opcional|

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-cache, no-store

{
  "access_token":"eyJhbGciOiJFUzI1NiIsImtpZCI6IjllciJ9.eyJhdWQiOiJo
    dHRwczovL2JhY2tlbmQuZXhhbXBsZS5jb20iLCJpc3MiOiJodHRwczovL2FzLmV
    4YW1wbGUuY29tIiwiZXhwIjoxNDQxOTE3NTkzLCJpYXQiOjE0NDE5MTc1MzMsIn
    N1YiI6ImJkY0BleGFtcGxlLmNvbSIsInNjb3BlIjoiYXBpIn0.40y3ZgQedw6rx
    f59WlwHDD9jryFOr0_Wh3CGozQBihNBhnXEQgU85AI9x3KmsPottVMLPIWvmDCM
    y5-kdXjwhw",
  "issued_token_type": "urn:ietf:params:oauth:token-type:access_token",
  "token_type":"Bearer",
  "expires_in":60
}
```

Exemplo do payload do token gerado:

```json
{
  "aud": "https://backend.example.com",
  "iss": "https://as.example.com",
  "exp": 1441917593,
  "iat": 1441917533,
  "sub": "bdc@example.com",
  "scope": "api"
}
```

### Requisitando um token de personificação

Um cliente (`https://original-issuer.example.net`) solicita para o servidor de autenticação (`https://as.example.com`) um token para ser usado no serviço com o nome lógico `urn:example:cooperation-context`:

```http
POST /token HTTP/1.1
Host: as.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange
&audience=urn%3Aexample%3Acooperation-context
&subject_token=eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwc
  zovL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXI
  uZXhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTA2MDAsIm5iZiI6MTQ0MTkwOTAwMCwic
  3ViIjoiYmRjQGV4YW1wbGUubmV0Iiwic2NvcGUiOiJvcmRlcnMgcHJvZmlsZSBoaXN
  0b3J5In0.PRBg-jXn4cJuj1gmYXFiGkZzRuzbXZ_sDxdE98ddW44ufsbWLKd3JJ1VZ
  hF64pbTtfjy4VXFVBDaQpKjn5JzAw
&subject_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Ajwt
```

Payload do token do sujeito:

```json
{
  "aud": "https://as.example.com",
  "iss": "https://original-issuer.example.net",
  "exp": 1441910600,
  "nbf": 1441909000,
  "sub": "bdc@example.net",
  "scope": "orders profile history"
}
```

Visto que só foi informado um `subject_token` e não um `actor_token` uma personificação irá acontecer.

#### Resposta com o token personificado

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-cache, no-store

{
  "access_token": "eyJhbGciOiJFUzI1NiIsImtpZCI6IjcyIn0.eyJhdWQiOiJ1cm4
    6ZXhhbXBsZTpjb29wZXJhdGlvbi1jb250ZXh0IiwiaXNzIjoiaHR0cHM6Ly9hcy5l
    eGFtcGxlLmNvbSIsImV4cCI6MTQ0MTkxMzYxMCwic3ViIjoiYmRjQGV4YW1wbGUub
    mV0Iiwic2NvcGUiOiJvcmRlcnMgcHJvZmlsZSBoaXN0b3J5In0.rMdWpSGNACTvnF
    uOL74sYZ6MVuld2Z2WkGLmQeR9ztj6w2OXraQlkJmGjyiCq24kcB7AI2VqVxl3wSW
    nVKh85A",
  "issued_token_type": "urn:ietf:params:oauth:token-type:access_token",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Claims do token gerado:

```json
{
  "aud": "urn:example:cooperation-context",
  "iss": "https://as.example.com",
  "exp": 1441913610,
  "sub": "bdc@example.net",
  "scope": "orders profile history"
}
```

### Requisitando um token delegado

Nesta requisição o cliente (`https://original-issuer.example.net`) solicita um token para o recurso lógico `urn:example:cooperation-context` e informa o sujeito (`user@example.net`) e ator (`admin@example.net`):

```http
POST /token HTTP/1.1
Host: as.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange
&audience=urn%3Aexample%3Acooperation-context
&subject_token=eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwc
  zovL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXI
  uZXhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTAwNjAsInNjb3BlIjoic3RhdHVzIGZlZ
  WQiLCJzdWIiOiJ1c2VyQGV4YW1wbGUubmV0IiwibWF5X2FjdCI6eyJzdWIiOiJhZG1
  pbkBleGFtcGxlLm5ldCJ9fQ.4rPRSWihQbpMIgAmAoqaJojAxj-p2X8_fAtAGTXrvM
  xU-eEZHnXqY0_AOZgLdxw5DyLzua8H_I10MCcckF-Q_g
&subject_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Ajwt
&actor_token=eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwczo
  vL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXIuZ
  XhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTAwNjAsInN1YiI6ImFkbWluQGV4YW1wbGU
  ubmV0In0.7YQ-3zPfhUvzje5oqw8COCvN5uP6NsKik9CVV6cAOf4QKgM-tKfiOwcgZ
  oUuDL2tEs6tqPlcBlMjiSzEjm3yBg
&actor_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Ajwt
```

Payload do token do sujeito (as ações serão feitas em nome deste):

```json
{
  "aud": "https://as.example.com",
  "iss": "https://original-issuer.example.net",
  "exp": 1441910060,
  "scope": "status feed",
  "sub": "user@example.net",
  "may_act": {
    "sub": "admin@example.net"
  }
}
```

Payload do token de ator (quem executará as ações - agente):

```json
{
  "aud": "https://as.example.com",
  "iss": "https://original-issuer.example.net",
  "exp": 1441910060,
  "sub": "admin@example.net"
}
```

#### Resposta com o token delegado

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-cache, no-store

{
  "access_token":"eyJhbGciOiJFUzI1NiIsImtpZCI6IjcyIn0.eyJhdWQiOiJ1cm4
    6ZXhhbXBsZTpjb29wZXJhdGlvbi1jb250ZXh0IiwiaXNzIjoiaHR0cHM6Ly9hcy5l
    eGFtcGxlLmNvbSIsImV4cCI6MTQ0MTkxMzYxMCwic2NvcGUiOiJzdGF0dXMgZmVlZ
    CIsInN1YiI6InVzZXJAZXhhbXBsZS5uZXQiLCJhY3QiOnsic3ViIjoiYWRtaW5AZX
    hhbXBsZS5uZXQifX0.3paKl9UySKYB5ng6_cUtQ2qlO8Rc_y7Mea7IwEXTcYbNdwG
    9-G1EKCFe5fW3H0hwX-MSZ49Wpcb1SiAZaOQBtw",
  "issued_token_type": "urn:ietf:params:oauth:token-type:jwt",
  "token_type": "N_A",
  "expires_in": 3600
}
```

A resposta indica que é um token JWT que expira em 1 hora porém o uso do token (`token_type`) não é aplicável, visto que este não é um token de acesso.

Claims do token gerado:

```json
{
  "aud": "urn:example:cooperation-context",
  "iss": "https://as.example.com",
  "exp": 1441913610,
  "scope": "status feed",
  "sub": "user@example.net",
  "act": {
    "sub":"admin@example.net"
  }
}
```

Aqui o token indica que deverá ser utilizado em `urn:example:cooperation-context` e o sujeito (`sub`) deste token é exatamente o mesmo de `subject_token` informado anteriormente e o ator (`act`) aqui é o mesmo sujeito informado em `actor_token`, indicando assim uma delegação onde `admin@example.net` age em nome de `user@example.net`.

### Erros

O Servidor de Autorização pode retornar alguns erros seguindo o padrão do OAuth 2:

|Erro|Descrição|
|---|---|
|`invalid_request`|Quando a requisição não é válida ou ambos `subject_token` e `actor_token` não são válidos por algum motivo.|
|`invalid_target`|Quando por algum motivo não pode ser emitido um token para o recurso ou público informados.|

## Identificadores de tipo de token

Em alguns parâmetros é indicado o tipo do token, que deve ser um dos tipos:

* `urn:ietf:params:oauth:token-type:access_token` (OAuth 2 Access Token)
* `urn:ietf:params:oauth:token-type:refresh_token` (OAuth 2 Refresh Token)
* `urn:ietf:params:oauth:token-type:id_token` (OpenID Connect ID Token)
* `urn:ietf:params:oauth:token-type:saml1` (OASIS SAML Core 1)
* `urn:ietf:params:oauth:token-type:saml2` (OASIS SAML Core 2)
* `urn:ietf:params:oauth:token-type:jwt` (Token JWT genérico)

> No que apesar de existir o tipo `jwt`, os outros tipos devem ser utilizados quando fizer mais sentido. Por exemplo: o tipo `access_token` deve ser utilizado quando se trata de tokens de acesso, mesmo que o **formato** dele seja um JWT.

## Introspecção

A especificação define alguns complementos para o ponto de acesso de introspecção de token ([RFC7662](https://datatracker.ietf.org/doc/html/rfc7662)).

### Claim `act`

Esta claim de ator provê um significado no JWT de que uma delegação ocorreu e identifica o terceiro para quem foi concedido.

```json
{
  "aud":"https://consumer.example.com",
  "iss":"https://issuer.example.com",
  "exp":1443904177,
  "nbf":1443904077,
  "sub":"user@example.com",
  "act": {
    "sub":"admin@example.com"
  }
}
```

#### Delegação em cadeia

Uma delegação em cadeia pode ser expressada por um `act` dentro do outro. O `act` que estiver mais para fora (nível raíz) representa o ator atual, e o mais para "dentro" os anteriores.

> Apenas o ator atual deve ser considerado para tomar uma decisão de controle de acesso, os outros atores funcionam como um histórico e devem ser ignorado nas validações.

O token abaixo ilustra um caso onde o serviço 77 trocou um token para chamar o serviço 16 e este trocou por outro para chamar o serviço 26:

```json
{
  "aud":"https://service26.example.com",
  "iss":"https://issuer.example.com",
  "exp":1443904100,
  "nbf":1443904000,
  "sub":"user@example.com",
  "act": {
    "sub":"https://service16.example.com",
    "act": {
      "sub":"https://service77.example.com"
    }
  }
}
```

### Claim `may_act`

Indica sujeitos que podem atuar como se fosse o sujeito indicado (por delegação ou personificação).

Pode ser usada, por exemplo, ao trocar um token do sujeito e `may_act` indica quais outros sujeitos podem se passar pelo sujeito, tornando possível o Servidor de Autorização verificar se aquela requisição é válida.

A claim representa um objeto JSON que deve conter o `sub` e pode conter o `iss` para garantir uma identificação única, além de `email` (opcional) para prover informação adicional.

### Outras claims

Outras claims padrão já definidas para o ponto de acesso de introspecção continuam existindo, como: `scope`, `client_id`, `iss`, `exp`, ...
