# [Rascunho] Servidor de autenticação OpenID

Estudos sobre a criação de um servidor de autenticação usando OpenID Connect 1.0 sobre OAuth 2.0.

[Leia mais sobre o estudo aqui.](OpenID.md)

## Tecnologias

- node.js (servidor)
  - node oidc-provider
  - OpenID Connect:
    - Core
    - Discovery
    - Front-Channel Logout
    - Back-Channel Logout
    - Session Management
    - FAPI (Operações financeiras e Open banking)
- Vue.js (telas)

## Arquitetura

### Projetos

Esta solução tem 3 projetos:

- Servidor de autorização (OP/IdP)
- Painel administrativo
- Aplicação de exemplo

### Design

Cada projeto, tem mais dois subprojetos:

- Server: um back-end que expõe uma API em node.js
- Client: telas que consomem a API em SPA (Single Page Application) com Vue.js

#### Estrutura de pastas

|Caminho|Projeto|Descrição|Porta|
|---|---|---|---|
|./server|Servidor de autorização|O servidor da API do OpenID com OAuth 2.0|3000|
|./client|Servidor de autorização|As telas do servidor de autenticação, como login, troca de sessão...|8080|
|./admin/server|Painel administrativo|A API de configuração do servidor de autorização, para registro de clientes e ajuste de funcionalidades e segurança.|1000|
|./admin/client|Painel administrativo|As telas do painel de controle, com _feature toggle_ e relatórios.|1010|
|./app/server|Aplicação Exemplo|A API da aplicação de exemplo que usará os serviços de identidade do servidor de autenticação.|7000|
|./app/client|Aplicação Exemplo|As telas simples da aplicação de exemplo.|7070|

Dessa forma obtemos um menor custo e com recursos totalmente gerenciados pela cloud.

### Distribuição

Os projetos são pensados numa implantação através de CI/CD em uma nuvem pública (Azure, AWS, GCP), utilizando-se de:

- **Functions**: para o back-end ("Lambda" na _AWS_)
- **Storage** para o front-end (não há processamento, apenas distribuição dos arquivos) _- conhecido como S3 na AWS_

## Padrões

### Código

O código segue o estilo de codificação do AirBnb com regras de validação usando o `ESLint`.

É escrito com sintaxe usando as possibilidade do ES6 e com módulos JavaScript (`import/export`) ao invés de módulos CommonJS.

Para poder usar as funcionalidades mais recentes, é utilizado o pacote `esm` para executar o código.

## Aviso

Este é um repositório de um **estudo** sobre servidor de autenticação usando o OpenID.

> Por favor não pegue o projeto e use em produção, pode haver falhas graves de segurança. Use apenas como uma base para algo maior, e saiba o que está fazendo - leia as especificações e documentações oficiais!

Note que o código oferecido aqui é oferecido do jeito que está. Não há intenção de suportar outras tecnologias, ou mesmo mantê-lo atualizado e sem brechas de segurança. Use por sua conta e risco.
