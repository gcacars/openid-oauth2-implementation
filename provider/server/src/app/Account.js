import assert from 'assert';

// Uma forma de criar variáveis privadas na classe
const dbClient = new WeakMap();

/**
 * @typedef {object} AuthenticationMethods
 * @property {boolean} password Se a conta tem uma senha configurada
 * @property {boolean} otp Se já ouve uma configuração de OTP
 * @property {boolean} fido Se o FIDO2 já foi configurado para esta conta
 */

/**
 * @typedef {object} AccountObject
 * @property {string} _id ID da conta
 * @property {string} firstName Primeiro nome da pessoa
 * @property {string} email E-mail principal
 * @property {string} email_verified Indica se o e-mail foi verificado
 * @property {string} picture_url Endereço da imagem de perfil
 * @property {string} tenantId ID do locatário que esta conta pertence
 * @property {AuthenticationMethods} authenticationMethods
 *   Métodos de autenticação ativos para essa conta
 */

/**
 * Manuseia contas de usuários.
 */
class Account {
  /**
   * Cria uma nova instância de Account
   * @param {import('lowdb').LowdbSync} dbInstance instância do banco de dados
   */
  constructor(dbInstance) {
    // Aqui é só um exemplo pra injetarmos a interface do banco de dados
    // que estamos utilizando.
    dbClient.set(this, dbInstance);
  }

  // Esse método é obrigatório por oidc-provider
  /**
   * Encontrar uma conta de acordo com o contexto e ID.
   * @param {import('koa').Context} ctx O contexto da requisição
   * @param {string} id O ID da conta para procurar
   * @returns {*}
   */
  async findAccount(ctx, id) {
    try {
      // Isso deve ser algo que simplesmente verifica se a conta existe
      /**
       * @type {import('lowdb').LowdbSync}
       */
      const db = dbClient.get(this);
      const account = db.get('users').find({ _id: id }).value();

      if (!account) {
        return undefined;
      }

      return {
        accountId: id,
        // e essas claims() deveria ser uma pesquisa para retornar as claims da conta
        async claims() {
          return {
            sub: id,
            given_name: account.firstName,
            picture: account.picture_url,
            email: account.email,
            email_verified: account.email_verified,
          };
        },
      };
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  /**
   * Obtém uma conta através de um login.
   * @param {string} login O login que representa a conta
   * @returns {AccountObject} a conta recuperada ou `undefined` caso não encontre.
   */
  async getAccountByLogin(login) {
    let account;

    try {
      // Isso deve ser algo que simplesmente verifica se a conta existe
      /**
       * @type {import('lowdb').LowdbSync}
       */
      const db = dbClient.get(this);
      account = db.get('users').find({ email: login }).value();
    } catch (err) {
      console.error(err);
    }

    return account;
  }

  /**
   * Retorna uma conta através de um ID.
   * @param {string} accountId O ID da conta
   * @returns {AccountObject} a conta recuperada ou `undefined` caso não encontre.
   */
  async getAccountById(accountId) {
    let account;

    try {
      // Isso deve ser algo que simplesmente verifica se a conta existe
      /**
       * @type {import('lowdb').LowdbSync}
       */
      const db = dbClient.get(this);
      account = db.get('users').find({ _id: accountId }).value();
    } catch (err) {
      console.error(err);
    }

    return account;
  }

  // Isso pode ser qualquer coisa que precisar para autenticar um usuário
  async authenticate(email, password) {
    try {
      const db = dbClient.get(this);
      assert(password, 'Senha deve ser informada');
      assert(email, 'E-mail deve ser informado');
      const lowerCased = String(email).toLowerCase();
      const account = db.get('users').find({ email: lowerCased }).value();
      assert(account, 'As credenciais informadas são inválidas');

      return account.id;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
}

export default Account;
