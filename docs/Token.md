# Tokens

## SET Tokens [(RFC8417)](https://tools.ietf.org/html/rfc8417)

Os Tokens SET (Security Event Tokens ou Tokens de Eventos de Segurança) são tokens JWT, que podem ser assinados (JWS) e/ou criptografados (JWE), e representam um fato pelo ponto de vista do provedor sobre um sujeito (recurso web, endereço IP, token, ...).

Apesar de poderem ser utilizados para outras coisas, a especificação trata apenas de eventos de segurança e relacionados à identidade.

Note que os SETs descrevem um **fato** de um evento que ocorreu diretamente ou sobre um assunto de segurança, como por exemplo a declaração de uma revogação de token em nome de um usuário. O sujeito pode ser permanente (uma conta de usuário) ou temporário (uma sessão).

O recebimento de um SET pode implicar numa alteração de estado, por exemplo, o encerramento da sessão atual de um usuário. Porém não podemos assumir que os SETs são comandos ou requisições. O SET declara um fato ocorrido e cabe à quem recebe interpretar este fato de acordo com seu propósito e tomar as devidas providências (fazendo alguma ação ou simplesmente ignorando).

No token SET estão incluídos algumas claims, como "events" que é uma lista de nome/valor, onde o nome é uma URI e o valor um objeto JSON ("payload"). Quando múltiplos identificadores de evento estão presentes, eles representam múltiplos aspectos da mesma transição de estado. Um token SET **não deve** conter múltiplos eventos distintos sobre um sujeito.

### Exemplo

```json
{
    "iss": "https://idp.exemplo.com.br",
    "sub": "248289761001",
    "aud": "s6BhdRkqt3",
    "iat": 1471566154,
    "jti": "bWJq",
    "sid": "08a5019c-17e1-4977-8f42-65a12843ea02",
    "events": {
        "http://schemas.openid.net/event/backchannel-logout": {}
    }
}
```

No exemplo acima temos um evento de sessão encerrada (logout) para um sujeito. Esse evento é parte da especificação do [OpenID Back-Channel Logout](https://openid.net/specs/openid-connect-backchannel-1_0.html), que é usado nesta implementação do OpenID.

Repare que o evento apenas representa **o fato** de um encerramento de sessão que aconteceu no servidor de autorização. Quando não há nenhum valor para o evento, deve-se utilizar um objeto vazio `{}`, como no caso acima.

A interpretação deste evento se dá pelo receptor, que pode identificar qual a sessão `sid` e o sujeito (usuário) `sub` presentes no token SET e assim, redirecionar o usuário para uma tela de login, por exemplo.

### Outro exemplo

```json
{
    "iss": "https://medicina.exemplo.org",
    "iat": 1458496025,
    "jti": "fb4e75b5411e4e19b6c0fe87950f7749",
    "aud": [
        "https://app.exemplo.com.br"
    ],
    "events": {
        "https://openid.net/heart/specs/consent.html": {
            "iss": "https://idp.exemplo.com.br",
            "sub": "248289761001",
            "consentUri": [
                "https://termos.medicina.exemplo.org/labdisclosure.html#Agree"
            ]
        }
    }
}
```

Neste caso temos um evento onde um serviço médico coleta o consentimento para ações médicas. Esse evento é baseado na especificação [OpenID HEART](https://openid.net/wg/heart/) que descreve conjuntos de perfis de acesso relacionados à area de saúde. 

Note neste exemplo que:

|Campo|Observação|
|---|---|
|`iss`|O emissor agora é uma aplicação, ao invés de um provedor OpenID.|
|`events.[0].iss`|Este emissor no caso é o provedor referente ao sujeito `sub` e não o emissor do evento.|
|`events.[0].sub`|É o sujeito/pessoa à qual deve-se pedir o consentimento.|

### Claims do SET

Estas claims são padrão para o SET:

|Claim|Descrição|
|---|---|
|`iss`|O emissor **do evento**. Note que nem sempre o emissor do evento será o mesmo àquele associado ao sujeito.|
|`iat`|Obrigatório, indica quando o evento foi emitido.|
|`jti`|Obrigatório, é um valor único para identificar este token SET. Os receptores podem utilizar esse ID para saber se um evento já foi recebido.|
|`aud`|Recomendado, indica o público que deve receber este token (audiência).|
|`sub`|O sujeito do evento, normalmente a entidade que teve o seu "estado" alterado. _Pode representar: um IP que foi bloqueado, uma URI que representa um recurso, um token (jti), uma conta de usuário..._|
|`exp`|**Não recomendado**, indica quando o token expira e não deve mais ser utilizado, o que não faz sentido considerando que os tokens SET indicam um fato que ocorreu no passado.|
|`events`|Um conjunto de declaração de eventos relacionados que provê informação sobre um **único** evento ocorrido. O identificador de um evento não pode ser utilizado mais de uma vez, tampouco deve-se ter vários eventos não relacionados no mesmo token.<br>A chave deve ser algo estável (como uma URL permanente) e os valores um objeto JSON `{}`.|
|`txn`|Identificador de transação que representa uma única transação, que pode ter o mesmo valor em diferentes tokens SET, indicando que em uma transação ocorreu vários eventos diferentes.|
|`toe`|Opcional, indica o _timestamp_ que o evento ocorreu. (Note que esse valor pode ser aproximado).

> Por segurança, nunca use a claim `exp`, além de não ser necessária, quando ela está presente, pode ser confundida com um token de identificação (ID Token) pelo provedor OpenID, habilitando que pessoas maliciosas ganhem algum tipo de acesso, visto que com a presença do `exp` no token SET, todas as claims obrigatórias para o ID Token também estão presentes.

### Media-type

O SET especifica um novo media-type: `application/secevent+jwt` que pode estar presente na resposta HTTP, indicando que o corpo indica um token SET.

Além disso ele pode ser indicado na claim `typ` do cabeçalho do JWT, como:

```json
{
    "typ":"secevent+jwt",
    "alg":"none"
}
```

Exemplo de JWT (não assinado e não criptografado!).  
_Você pode visualizar em [jwt.io](https://jwt.io/))_

```text
eyJ0eXAiOiJzZWNldmVudCtqd3QiLCJhbGciOiJub25lIn0.eyJpc3MiOiJodHRwczovL3NjaW0uZXhhbXBsZS5jb20iLCJpYXQiOjE0NTg0OTY0MDQsImp0aSI6IjRkMzU1OWVjNjc1MDRhYWJhNjVkNDBiMDM2M2ZhYWQ4IiwiYXVkIjpbImh0dHBzOi8vc2NpbS5leGFtcGxlLmNvbS9GZWVkcy85OGQ1MjQ2MWZhNWJiYzg3OTU5M2I3NzU0IiwiaHR0cHM6Ly9zY2ltLmV4YW1wbGUuY29tL0ZlZWRzLzVkNzYwNDUxNmIxZDA4NjQxZDc2NzZlZTciXSwiZXZlbnRzIjp7InVybjppZXRmOnBhcmFtczpzY2ltOmV2ZW50OmNyZWF0ZSI6eyJyZWYiOiJodHRwczovL3NjaW0uZXhhbXBsZS5jb20vVXNlcnMvNDRmNjE0MmRmOTZiZDZhYjYxZTc1MjFkOSIsImF0dHJpYnV0ZXMiOlsiaWQiLCJuYW1lIiwidXNlck5hbWUiLCJwYXNzd29yZCIsImVtYWlscyJdfX19
```

### Notas sobre o desenho de soluções

A especificação não aborda alguns temas que podem ser importantes ao planejar implementações usando SETs:

- Confidencialidade e Integridade  
  Alguns tokens podem conter informação confidencial e ficar expostas se não utilizado o TLS, JWE e se os receptores não tem segurança suficiente.
- Sequenciamento
  Também não se fala de uma forma de entregar os tokens aos receptores de uma forma que eles cheguem na sequência em que os eventos ocorreram, o que pode ser importante em alguns casos (por exemplo: provisionamento, que um recurso não pode ser alterado enquanto nem foi criado).
- "Na hora errada"  
  Pode ocorrer problemas com o _timing_ dos eventos. Imagina que um usuário fez o logout e logo em seguida fez o login novamente. Um evento de logout pode chegar para o cliente logo após ele já ter entrado novamente, encerrando a sessão que acabou de ser criada. (Uma solução para isso pode ser verificar sempre o ID da sessão `sid` como no primeiro exemplo).
- Confusão com outros tipos de token JWT
  Como abordado no ponto de atenção da claim `exp`, um receptor pode interpretar um token SET como se fosse outro token (ID Token, Access Token, ...).
- Privacidade e LGPD  
  Um receptor malicioso pode juntar uma coleção de tokens SET e a partir do sujeito `sub` conseguir classificar os eventos, ordenando pela data do acontecimento e/ou relacionando com eventos da vida real, conseguindo assim identificar uma pessoa. Assim a informação trafegada nos eventos se torna um PII (personally identifiable information) - GDPR ou dado pessoal e sensível (LGPD).

### Entrega de tokens SET

Apesar de não abordado na RFC8417 uma forma de entrega (delivery) dos tokens, temos posteriormente duas opções:

#### Entrega empurrada [(RFC8935)](https://tools.ietf.org/html/rfc8935)

_Push-Based Security Event Token (SET) Delivery Using HTTP_ define uma forma onde os token são enviados para os receptores através de um endpoint HTTP que receberá uma requisição POST do transmissor de eventos com o token SET.

Este modo de entrega é indicado para cenários em que:

- O transmissor do SET é capaz de fazer requisições de saída HTTP;
- O recebedor é capaz de ter um _endpoint_ HTTP com TLS que é acessível pelo transmissor;

O recebedor quando recebe um token SET deve garantir que é válido:

- Ele consegue interpretar o token SET (assinado ou criptografado);
- O SET é autêntico (foi emitido pelo emissor indicado e, se assinado, foi assinado com uma chave pertencente ao emissor);
- O recebedor é indicado como um público daquele token SET (`aud`);
- O recebedor conhece o emissor e permite receber tokens dele;
- O TLS do transmissor é válido e reconhecido.

##### Transmitindo SETs

O transmissor envia uma requisição POST com o cabeçalho `Content-Type` com o valor `application/secevent+jwt` indicando que é um token SET, o `Accept` como `application/json` e o corpo com o token JWT:

```http
POST /Events HTTP/1.1
Host: notificacao.app.exemplo.com.br
Accept: application/json
Accept-Language: pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3
Content-Type: application/secevent+jwt

eyJ0eXAiOiJzZWNldmVudCtqd3QiLCJhbGciOiJIUzI1NiJ9Cg.eyJpc3MiOiJodHRwczovL2lkcC5leGFtcGxlLmNvbS8iLCJqdGkiOiI3NTZFNjk3MTc1NjUyMDY5NjQ2NTZFNzQ2OTY2Njk2NTcyIiwiaWF0IjoxNTA4MTg0ODQ1LCJhdWQiOiI2MzZDNjk2NTZFNzQ1RjY5NjQiLCJldmVudHMiOnsiaHR0cHM6Ly9zY2hlbWFzLm9wZW5pZC5uZXQvc2VjZXZlbnQvcmlzYy9ldmVudC10eXBlL2FjY291
bnQtZGlzYWJsZWQiOnsic3ViamVjdCI6eyJzdWJqZWN0X3R5cGUiOiJpc3Mtc3ViIiwiaXNzIjoiaHR0cHM6Ly9pZHAuZXhhbXBsZS5jb20vIiwic3ViIjoiNzM3NTYyNkE2NTYzNzQifSwicmVhc29uIjoiaGlqYWNraW5nIn19fQ.Y4rXxMD406P2edv00cr9Wf3_XwNtLjB9n-jTqN1_lLc
```

> Note que o cabeçalho (`Accept-Language`) indica quais idiomas ele suporta como resposta, nesse caso o português como prioridade, e depois o inglês.

E quando o endpoint recebe o token e consegue validar e interpretar, devolve uma resposta de sucesso (202 - Aceito) sem corpo algum:

```http
HTTP/1.1 202 Accepted
```

Ou, em caso de erro, devolve um erro HTTP com um JSON no corpo indicando qual a chave do erro e a descrição:

```http
HTTP/1.1 400 Bad Request
Content-Language: pt-BR
Content-Type: application/json

{
    "err": "invalid_issuer",
    "description": "O emissor https://iss.exemplo.com.br/ não está autorizado"
}
```

As chaves de erros são especificadas:

|Chave|Descrição|
|---|---|
|`invalid_request`|O corpo da requisição não pode ser interpretado como um SET, ou o _payload_ do evento não está conforme a definição do evento.|
|`invalid_key`|Uma ou mais chaves usadas para criptografar ou assinar o token SET é invalida ou não aceitável pelo recebedor.|
|`invalid_issuer`|O emissor do SET é inválido.|
|`invalid_audience`|O público alvo do token SET não inclui o recebedor.|
|`authentication_failed`|Não foi possível autenticar o transmissor do SET.|
|`access_denied`|O transmissor não é permitido à enviar tokens SET para esse recebedor.|

Quando respondido com erro o recebimento de um token SET, o transmissor pode tentar novamente enviá-lo, desde que faça sentido, como no caso do `invalid_request` o resultado sempre será o mesmo, independente de quantas vezes seja enviado.

> Como SETs não são comandos, um recebedor pode simplesmente ignorar seu recebimento.

### Entrega puxada ou por pesquisa [(RFC8936)](https://tools.ietf.org/html/rfc8936)

_Poll-Based Security Event Token (SET) Delivery Using HTTP_ define um _endpoint_ no transmissor no qual os recebedores podem frequentemente requisitar por novos SETs, recebendo uma lista de tokens e posteriormente indicando o reconhecimento sobre eles.

Este tipo de entrega é indicado para cenários em que:

- O recebedor é capaz de fazer requisições HTTP de saída;
- O transmissor tem um _endpoint_ com TLS acessível pelo recebedor;

> Em alguns casos tanto a entrega puxada como a empurrada podem ser usadas para o mesmo recebedor.

#### Requisitando SETs

```http
POST /Events HTTP/1.1
Host: notificacao.app.exemplo.com.br
Content-Type: application/json

{
    "ack": [
        "4d3559ec67504aaba65d40b0363faad8",
        "3d0c3cf797584bd193bd0fb1bd4e7d30"
    ],
    "setErrs": {
        "3d3559ec67504a00065d40b0363fafa1": {
            "err": "authentication_failed",
            "description": "The SET could not be authenticated"
        }
    },
    "returnImmediately": false
}
```

|Parâmetro de requisição|Descrição|
|---|---|
|`maxEvents`|Indica a quantidade máxima de tokens SET que deve ser retornado para o recebedor pelo transmissor.<br>O valor `0` indica que essa requisição é apenas de reconhecimento (`ack`), habilitando o recebedor a ter requisições separadas para reconhecimento e para recebimento.<br>Quando omitido indica que não há limite.|
|`returnImmediately`|Indica ao transmissor que ele deve retornar imediatamente, mesmo que não tenha nenhum evento novo `short polling`, ao invés de aguardar um evento acontecer `long polling`. O valor deve ser `true` ou `false`.|
|`ack`|Uma lista de _strings_ que representam o valor `jti` dos tokens SET que foram recebidos com sucesso na requisição anterior, indicando assim o reconhecimento sobre eles (_acknowledged_).|
|`setErrs`|Um objeto JSON onde as chaves são os `jti` dos tokens que não foram interpretados com sucesso, e os valores um objeto contendo o erro (`err`) e a descrição (`description`) do erro.|

> Os eventos devem ser retornados usando o FIFO (First In, First Out) ou PEPS em português (Primeiro que entra é o primeiro que sai), retornando os mais velhos primeiro ou alguma outra forma de priorização que faça mais sentido.

Quando um token é reconhecido, o transmissor não tem obrigação nenhuma de mantê-lo armazenado por mais tempo.

O transmissor então responderá a requisição com os campos:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "sets":
        {
            "4d3559ec67504aaba65d40b0363faad8": "eyJhbGciOiJub25lIn0.eyJqdGkiOiI0ZDM1NTllYzY3NTA0YWFiYTY1ZDQwYjAzNjNmYWFkOCIsImlhdCI6MTQ1ODQ5NjQwNCwiaXNzIjoiaHR0cHM6Ly9zY2ltLmV4YW1wbGUuY29tIiwiYXVkIjpbImh0dHBzOi8vc2NpbS5leGFtcGxlLmNvbS9GZWVkcy85OGQ1MjQ2MWZhNWJiYzg3OTU5M2I3NzU0IiwiaHR0cHM6Ly9zY2ltLmV4YW1wbGUuY29tL0ZlZWRzLzVkNzYwNDUxNmIxZDA4NjQxZDc2NzZlZTciXSwiZXZlbnRzIjp7InVybjppZXRmOnBhcmFtczpzY2ltOmV2ZW50OmNyZWF0ZSI6eyJyZWYiOiJodHRwczovL3NjaW0uZXhhbXBsZS5jb20vVXNlcnMvNDRmNjE0MmRmOTZiZDZhYjYxZTc1MjFkOSIsImF0dHJpYnV0ZXMiOlsiaWQiLCJuYW1lIiwidXNlck5hbWUiLCJwYXNzd29yZCIsImVtYWlscyJdfX19.",
            "3d0c3cf797584bd193bd0fb1bd4e7d30": "eyJhbGciOiJub25lIn0.eyJqdGkiOiIzZDBjM2NmNzk3NTg0YmQxOTNiZDBmYjFiZDRlN2QzMCIsImlhdCI6MTQ1ODQ5NjAyNSwiaXNzIjoiaHR0cHM6Ly9zY2ltLmV4YW1wbGUuY29tIiwiYXVkIjpbImh0dHBzOi8vamh1Yi5leGFtcGxlLmNvbS9GZWVkcy85OGQ1MjQ2MWZhNWJiYzg3OTU5M2I3NzU0IiwiaHR0cHM6Ly9qaHViLmV4YW1wbGUuY29tL0ZlZWRzLzVkNzYwNDUxNmIxZDA4NjQxZDc2NzZlZTciXSwic3ViIjoiaHR0cHM6Ly9zY2ltLmV4YW1wbGUuY29tL1VzZXJzLzQ0ZjYxNDJkZjk2YmQ2YWI2MWU3NTIxZDkiLCJldmVudHMiOnsidXJuOmlldGY6cGFyYW1zOnNjaW06ZXZlbnQ6cGFzc3dvcmRSZXNldCI6eyJpZCI6IjQ0ZjYxNDJkZjk2YmQ2YWI2MWU3NTIxZDkifSwiaHR0cHM6Ly9leGFtcGxlLmNvbS9zY2ltL2V2ZW50L3Bhc3N3b3JkUmVzZXRFeHQiOnsicmVzZXRBdHRlbXB0cyI6NX19fQ."
    }
}
```

|Parâmetro de reposta|Descrição|
|---|---|
|`sets`|Um objeto JSON onde as chaves são os `jti` dos tokens e o valor o token JWT do SET em si.<br>Pode ser um objeto vazio caso não haja mais nada.|
|`moreAvailable`|Indica se tem mais tokens SET sem reconhecimento disponíveis (`true`), ou se não há mais nada (`false` ou `undefined`).|

> Caso o recebedor receba um token que já foi processado, deve indicar que reconhece ele da mesma forma que se tivesse processado novamente.
