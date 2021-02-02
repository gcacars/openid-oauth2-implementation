# Dispositivo Exemplo _(Deviceflix)_

Este é um exemplo de dispositivo que irá requisitar um acesso ao servidor de autorização.
Note que apesar de termos dois subprojetos aqui, um `server` e um `client`, normalmente um dispositivo tem a tela e o "servidor" num projeto único.
Aqui foi separado apenas por simplicidade e para manter o padrão dos outros projetos.

Para utilidade, o dispositivo simula uma aplicação de _streaming_ de conteúdo, mostrando as RFCs estudadas e relacionadas à OAuth 2.0 como títulos de um catálogo, permitindo a leitura da especificação dentro do "dispositivo".

## Tecnologias e pacotes

Para desenvolvimento foi utilizado:

* Node 14.15.0
* [ESM](https://www.npmjs.com/package/esm) (necessário para simular os módulos ES6)
* [OpenID Client](https://github.com/panva/node-openid-client)
* [QR Code](https://www.npmjs.com/package/qrcode) (para implementar o `verification_uri_complete`)
* [Socket.io](https://socket.io) _(foi utilizado como uma outro forma ao invés de requisições HTTP, para um desenvolvimento futuro)_

> Note que alguns recursos estão em fase beta ou alpha e não são ainda indicados para ambientes produtivos.

## Fluxo de dispositivo

Este projeto foi feito para simular um dispositivo usando o _device flow_ do OAuth 2.0 [RFC 8628](https://tools.ietf.org/html/rfc8628).
Para consultar mais detalhes, consulte o [estudo do OpenID](../../OpenID.md) no diretório raíz.

O projeto implementa:

* A geração dos códigos de dispositivo e usuário.
* A exibição do código do usuário na tela e indicação do processo de autenticação.
* A implementação do `verification_uri_complete` através da geração de um QR Code.

## Front-end (tela)

Consulte o [leia-me](../client/README.md) do front-end da aplicação.

## Scripts do Node.js

* Iniciar a primeira vez

  ```console
  npm i
  ```

* Executar projeto

  ```console
  npm start
  ```

* Executar com depuração ativada

  ```console
  npm run debug
  ```

> Node que utilizamos o [nodemon](https://www.npmjs.com/package/nodemon) aqui, pois é um projeto de estudo e não pronto para produção.

## Telas

_Indicações para interação - "Login do dispositivo"_
![device login](../screens/device-login.png)

_Tela do Deviceflix após o fluxo de autenticação estar completo_
![deviceflix](../screens/deviceflix.png)
