import assert from 'assert';

// Uma forma de criar variáveis privadas na classe
const providerRef = new WeakMap();
const accountRef = new WeakMap();

/**
 * Controller da interface com o usuário.
 *
 * @author Gabriel Anderson
 * @class UIController
 */
class UIController {
  /**
   * Creates an instance of UIController.
   * @author Gabriel Anderson
   * @param {import('oidc-provider').Provider} provider OpenID Provider
   * @memberof UIController
   */
  constructor(provider, accountInstance) {
    providerRef.set(this, provider);
    accountRef.set(this, accountInstance);
  }

  /**
   * Efetuar o acesso de um usuário.
   *
   * @author Gabriel Anderson
   * @param {import('../context/HttpContext').default} ctx Contexto da requisição
   * @memberof UIController
   */
  async login(ctx) {
    let result;

    /**
     * @type {import('oidc-provider').Provider}
     */
    const provider = providerRef.get(this);

    try {
      // Obter detalhes e checar prompt
      const details = await provider.interactionDetails(ctx.originalRequest, ctx.originalResponse);
      assert.equal(details.prompt.name, 'login');

      /**
       * @type {import('../app/Account.js').default}
       */
      const Account = accountRef.get(this);
      // Obter dados da conta
      const account = await Account.getAccountByLogin(ctx.request.body.login);

      // Construir resultado
      if (account) {
        /**
         * @type {import('oidc-provider').InteractionResults}
         */
        result = {
          select_account: {}, // tenha certeza que isso será pulado pelas políticas de interação
          login: {
            // eslint-disable-next-line no-underscore-dangle
            account: account._id,
            acr: '',
            remember: ctx.request.body.remember === '1',
            ts: Date.now(),
          },
          meta: {
            tenantId: account.tenantId,
          },
        };
      } else {
        result = {
          error: 'not_found',
          error_description: 'Conta não encontrada.',
        };
      }
    } catch (error) {
      result = {
        error: 'unknown_error',
        error_description: error.message,
      };
    }

    // Informar provedor
    return provider.interactionFinished(ctx.originalRequest, ctx.originalResponse, result, {
      mergeWithLastSubmission: false,
    });
  }

  /**
   * O usuário abortou uma interação.
   *
   * @author Gabriel Anderson
   * @param {import('../context/HttpContext').default} ctx Contexto da requisição
   * @memberof UIController
   */
  async abort(ctx) {
    const provider = providerRef.get(this);

    return provider.interactionFinished(ctx.originalRequest, ctx.originalResponse, {
      error: 'access_denied',
      error_description: 'End-User aborted interaction',
    }, {
      mergeWithLastSubmission: false,
    });
  }
}

export default UIController;
