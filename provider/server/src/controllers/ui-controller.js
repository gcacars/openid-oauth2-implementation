import assert from 'assert';
import Scope from '../app/Scope';

// Uma forma de criar variáveis privadas na classe
const dbRef = new WeakMap();
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
   * @param {object} db Instância do banco de dados
   * @memberof UIController
   */
  constructor(provider, accountInstance, db) {
    dbRef.set(this, db);
    providerRef.set(this, provider);
    accountRef.set(this, accountInstance);
  }

  /**
   * Verifica na primeira tela se o usuário tem uma conta e quais as formas de verificação
   * desta conta, como uso de senhas, tokens, OTP, FIDO...
   *
   * @author Gabriel Anderson
   * @param {import('../context/HttpContext').default} ctx Contexto da requisição
   * @return {object} Um objeto contendo a informação necessária
   * @memberof UIController
   */
  async lookup(ctx) {
    try {
      /**
       * @type {import('oidc-provider').Provider}
       */
      const provider = providerRef.get(this);

      /**
       * @type {import('../app/Account.js').default}
       */
      const Account = accountRef.get(this);

      // Obter dados da conta
      const account = await Account.getAccountByLogin(ctx.request.body.login);

      if (account) {
        const session = await provider.setProviderSession(
          ctx.originalRequest,
          ctx.originalResponse,
          {
            // eslint-disable-next-line no-underscore-dangle
            account: account._id,
          },
        );

        return {
          session: {
            uid: session.uid,
            email: account.email,
            username: account.email,
            given_name: account.firstName,
            picture: account.picture_url,
          },
          country: 'BR',
          password: true,
          otp: false,
          fido: false,
        };
      }

      return {
        error: 'not_found',
        error_description: 'Conta não encontrada.',
      };
    } catch (error) {
      return {
        error: 'unknown_error',
        error_description: error.message,
      };
    }
  }

  /**
   * Fornece os detalhes para a tela sobre cada `prompt`
   *
   * @author Gabriel Anderson
   * @param {import('../context/HttpContext').default} ctx Contexto da requisição
   * @return {object} Um objeto contendo a informação necessária
   * @memberof UIController
   */
  async details(ctx) {
    /**
     * @type {import('oidc-provider').Provider}
     */
    const provider = providerRef.get(this);

    try {
      const {
        uid, prompt, params, session,
      } = await provider.interactionDetails(ctx.originalRequest, ctx.originalResponse);
      const client = await provider.Client.find(params.client_id);

      switch (prompt.name) {
        case 'select_account': {
          if (!session) {
            return provider.interactionFinished(ctx.originalRequest, ctx.originalResponse, {
              select_account: {},
            }, { mergeWithLastSubmission: false });
          }

          const account = await provider.Account.findAccount(ctx, session.accountId);
          const { email } = await account.claims('prompt', 'email', { email: null }, []);

          return {
            client,
            uid,
            email,
            details: prompt.details,
            params,
            title: 'Sign-in',
            session,
            dbg: {
              params,
              prompt,
            },
          };
        }
        case 'login': {
          return {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Sign-in',
            google: ctx.google,
            session,
            dbg: {
              params,
              prompt,
            },
          };
        }
        case 'consent': {
          const db = dbRef.get(this);
          const account = await provider.Account.findAccount(ctx, session.accountId);
          const { email, picture } = await account.claims('prompt', 'email', { email: null }, []);
          const {
            applicationType, clientName, logoUri, clientUri, policyUri, tosUri, subjectType,
          } = client;

          const scopeInstance = new Scope(db);
          const details = {
            claims: {
              accepted: await scopeInstance.getScopes(prompt.details.claims.accepted),
              new: await scopeInstance.getScopes(prompt.details.claims.new),
              rejected: await scopeInstance.getScopes(prompt.details.claims.rejected),
            },
            scopes: {
              accepted: await scopeInstance.getScopes(prompt.details.scopes.accepted),
              new: await scopeInstance.getScopes(prompt.details.scopes.new),
              rejected: await scopeInstance.getScopes(prompt.details.scopes.rejected),
            },
          };

          return {
            client: {
              applicationType, clientName, logoUri, clientUri, policyUri, tosUri, subjectType,
            },
            details,
            session: {
              email,
              picture,
              ...session,
            },
          };
        }
        default:
          return null;
      }
    } catch (error) {
      console.log(error);
    }

    return null;
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
          // select_account: {}, // tenha certeza que isso será pulado pelas políticas de interação
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
    const redirectTo = await provider.interactionResult(
      ctx.originalRequest, ctx.originalResponse, result, { mergeWithLastSubmission: false },
    );

    ctx.originalContext.redirect(redirectTo);
    return redirectTo;
  }

  /**
   * Confirma as concessões de permissão dadas (ou não).
   *
   * @author Gabriel Anderson
   * @param {import('../context/HttpContext').default} ctx Contexto da requisição
   * @return {*}
   * @memberof UIController
   */
  async confirm(ctx) {
    // Pegar detalhes
    /**
     * @type {import('oidc-provider').Provider}
     */
    const provider = providerRef.get(this);
    const { prompt: { name, details } } = await provider.interactionDetails(
      ctx.originalRequest, ctx.originalResponse,
    );
    assert.equal(name, 'consent');

    // Obter o que o usuário aceitou
    let aceitos = ctx.request.body.accepted;

    // Quando só há um selecionado, não é interpretado como lista
    if (!Array.isArray(aceitos)) aceitos = [aceitos];

    // Pegar os escopos que já foram rejeitados e continuam sendo rejeitados:
    let rejectedScopes = details.scopes.rejected.filter((r) => !aceitos.includes(r));
    // Acrescentamos aos rejeitados, os escopos novos e que não foram aceitos
    rejectedScopes = rejectedScopes.concat(details.scopes.new.filter((n) => !aceitos.includes(n)));

    // Vamos montar o objeto de concessão
    const consent = {
      // escopos rejeitados (exceto openid)
      rejectedScopes: rejectedScopes.filter((r) => r !== 'openid'),
      // claims rejeitadas (a tela não manipula isso)
      rejectedClaims: [],
      // escopos rejeitados anteriormente debem ser substituídos pelos que foram aceitos agora
      replace: true,
    };

    // Finalizar interação
    const result = { consent };
    const redirectTo = await provider.interactionResult(
      ctx.originalRequest, ctx.originalResponse, result, { mergeWithLastSubmission: true },
    );

    ctx.originalContext.redirect(redirectTo);
    return redirectTo;
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
