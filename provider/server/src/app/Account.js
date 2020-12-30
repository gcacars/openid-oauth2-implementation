import assert from 'assert';

// Uma forma de criar variáveis privadas na classe
const dbClient = new WeakMap();

class Account {
  /**
   * 
   * @param {import('lowdb').LowdbSync} dbInstance instância do banco de dados
   */
  constructor(dbInstance) {
    // Aqui é só um exemplo pra injetarmos a interface do banco de dados
    // que estamos utilizando.
    dbClient.set(this, dbInstance);
  }

  // Esse método é obrigatório por oidc-provider
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
