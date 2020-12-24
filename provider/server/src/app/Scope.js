/* eslint-disable no-underscore-dangle */

// Uma forma de criar variáveis privadas na classe
const dbClient = new WeakMap();

/**
 * Trata os escopos de acesso do OpenID.
 *
 * @author Gabriel Anderson
 * @class Scope
 */
class Scope {
  /**
   * Creates an instance of Scope.
   * @author Gabriel Anderson
   * @param {import('lowdb').LowdbSync} dbInstance instância do banco de dados
   * @memberof Scope
   */
  constructor(dbInstance) {
    // Aqui é só um exemplo pra injetarmos a interface do banco de dados
    // que estamos utilizando.
    dbClient.set(this, dbInstance);
  }

  async getScopes(ids) {
    try {
      // Isso deve ser algo que simplesmente verifica se a conta existe
      /**
       * @type {import('lowdb').LowdbSync}
       */
      const db = dbClient.get(this);
      const scopes = ids.map((id) => db.get('scopes').find({ _id: id }).value());
      return scopes || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

export default Scope;
