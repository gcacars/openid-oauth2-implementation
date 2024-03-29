# [Rascunho] Servidor de autenticação OpenID

Estudos sobre a criação de um servidor de autenticação usando OpenID Connect 1.0 sobre OAuth 2.0.

[Leia mais sobre o estudo aqui.](OpenID.md)

## Detalhes técnicos

### Tecnologias

- node.js 14+ (servidor)
  - node oidc-provider
  - Koa
  - OpenID Connect:
    - Core
    - Discovery
    - Front-Channel Logout
    - Back-Channel Logout
    - Session Management
    - FAPI (Operações financeiras e Open banking)
- Vue.js 3 Preview (telas)
  - Babel
  - Bootstrap 5
  - Vue Router
  
### Montando ambiente de desenvolvimento

1. É preciso instalar o [nginx](http://nginx.org/en/download.html)
2. Executar o `npm install` em todos os projetos.
3. Gerar todos os certificados para os domínios com SSL.

    ```console
    ./nginx/ssl/GerarCertificados.ps1 #Windows (sem suporte ao mTLS)
    ./nginx/ssl/GerarCertificados.sh #Linux ou WSL (Windows)
    ```

4. Isso irá gerar vários certificados na pasta `ssl`. Copie esta pasta e o arquivo de configuração `nginx.conf` para a pasta `/conf` da instalação do nginx.

5. Altere o arquivo de hosts da sua máquina. (Windows: `C:\System32\drivers\etc\hosts`) e adicione o conteúdo:

    ```hosts
    127.0.0.5     provider.dev.br
    127.0.0.6     op.provider.dev.br
    127.0.0.10    app-rp.dev.br
    127.0.0.11    api.app-rp.dev.br
    127.0.0.15    admin-op.dev.br
    127.0.0.16    api.admin-op.dev.br
    127.0.0.20    account-admin.dev.br
    127.0.0.21    api.account-admin.dev.br
    127.0.0.25    device.dev.br
    127.0.0.26    be.device.dev.br
    ```
  
    > Cada DNS precisa de um IP diferente na zona de loopback, para que a troca de certificados funcione. Caso contrário o `nginx` iria sempre oferecer o primeiro certificado. [Saiba mais]()

6. Executar o nginx: `./nginx.exe`.

## Arquitetura

### Projetos

Esta solução tem 5 projetos:

- Servidor de autorização (Authorization Server / OpenID Provider)
- Provedor de identidade (Identity Provider - IdP)
- Painel administrativo
- Aplicação de exemplo
- Dispositivo de exemplo

### Design

Cada projeto, pode ter dois subprojetos:

- Server: um back-end (clean code e clean architecture) que expõe uma API em node.js
- Client: telas que consomem a API em SPA (Single Page Application) com Vue.js

#### Estrutura de pastas

|Caminho|Projeto|Descrição|Porta|
|---|---|---|---|
|`./provider/server`|Servidor de autorização|O servidor da API do provedor OpenID com OAuth 2.0|3000|
|`./provider/client`|Servidor de autorização|As telas do servidor de autenticação, como login, troca de sessão...|8080|
|`./admin/server`|Painel administrativo|A API de configuração do servidor de autorização, para registro de clientes e ajuste de funcionalidades e segurança.|1000|
|`./admin/client`|Painel administrativo|As telas do painel de controle, com _feature toggle_ e relatórios.|1010|
|`./account/server`|Provedor de identidade|API para recuperar contas, usuários, fotos, e outros dados.|6000|
|`./account/client`|Provedor de identidade|Telas do painel administrativo para gerenciar as contas, cadastros, dados...|6060|
|`./app/server`|Aplicação Exemplo|A API da aplicação de exemplo que usará os serviços de identidade do servidor de autenticação.|7000|
|`./app/client`|Aplicação Exemplo|As telas simples da aplicação de exemplo.|7070|
|`./device/server`|Dispositivo Exemplo|A API do dispositivo de exemplo que usará os serviços de identidade do servidor de autenticação.|9000|
|`./device/client`|Dispositivo Exemplo|As telas simples do dispositivo de exemplo.|9090|

Dessa forma obtemos um menor custo e com recursos totalmente gerenciados pela cloud.

Repare que para rodar o Painel administrativo e a Aplicação Exemplo, o Servidor de autorização precisa estar rodando ao mesmo tempo.

### Distribuição

Os projetos são pensados numa implantação através de CI/CD em uma nuvem pública (Azure, AWS, GCP), utilizando-se de:

- **Functions**: para o back-end ("Lambda" na _AWS_)
- **Storage** para o front-end (não há processamento, apenas distribuição dos arquivos) _- conhecido como S3 na AWS_

## Padrões

### Código

O código segue o estilo de codificação do AirBnb com regras de validação usando o `ESLint`.

É escrito de forma declarativa com sintaxe usando as possibilidades do ES6 e com módulos JavaScript (`import/export`) ao invés de módulos CommonJS.

Para poder usar as funcionalidades mais recentes, é utilizado o pacote `esm` para executar o código.

## Aviso

Este é um repositório de um **estudo** sobre servidor de autenticação usando o OpenID.

> Por favor não pegue o projeto e use em produção, pode haver falhas graves de segurança. Use apenas como uma base para algo maior, e saiba o que está fazendo - leia as especificações e documentações oficiais!

Note que o código oferecido aqui é oferecido do jeito que está. Não há intenção de suportar outras tecnologias e sem brechas de segurança. Use por sua conta e risco. A atualização pode ser feita ocasionalmente e sem aviso prévio.

[Leia as notas de versão para saber mais](CHANGELOG.md)

E sempre que notar algum ponto desatualizado, faça um Pull Request e contribua para a comunidade!
[Leia mais sobre como Contribuir](CONTRIBUTE.md)
