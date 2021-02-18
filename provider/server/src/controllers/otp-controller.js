import QRCode from 'qrcode';
import assert from 'assert';
import Otp from '../app/Otp';

// Uma forma de criar variáveis privadas na classe
const dbRef = new WeakMap();
const providerRef = new WeakMap();
const accountRef = new WeakMap();

/**
 * Controller da interação com acesso de dispositivos.
 *
 * @author Gabriel Anderson
 * @class OtpController
 */
class OtpController {
  /**
   * Creates an instance of OtpController.
   * @author Gabriel Anderson
   * @param {import('oidc-provider').Provider} provider OpenID Provider
   * @param {object} db Instância do banco de dados
   * @memberof OtpController
   */
  constructor(provider, accountInstance, db) {
    dbRef.set(this, db);
    providerRef.set(this, provider);
    accountRef.set(this, accountInstance);
  }

  /**
   * Fornece os detalhes para a tela sobre cada `prompt`
   *
   * @author Gabriel Anderson
   * @param {import('../context/HttpContext').default} ctx Contexto da requisição
   * @return {object} Um objeto contendo a informação necessária
   * @memberof OtpController
   */
  async confirm(ctx) {
    /**
     * @type {import('oidc-provider').Provider}
     */
    const provider = providerRef.get(this);

    try {
      const itx = await provider.interactionDetails(
        ctx.originalRequest, ctx.originalResponse,
      );

      const { prompt, session } = itx;

      if (prompt.name !== 'otp') {
        return {
          error: 'bad_request',
          error_description: 'Invalid original prompt',
        };
      }

      const { token } = ctx.context.body;
      if (!token || token.replace(/\D/g, '').length !== 6) {
        return {
          error: 'invalid_request',
          error_description: 'OTP token is not informed or the format is invalid.',
        };
      }

      const db = dbRef.get(this);
      const instance = new Otp(db);

      // Validar token
      const delta = instance.validateToken(prompt.details.tenantId, session.accountId, token);
      if (delta === null || Math.abs(delta) > 2) {
        return {
          error: 'bad_request',
          error_description: 'The token is not valid!',
        };
      }

      // Se for a primeira vez, salva que foi configurado com sucesso
      if (prompt.details.enrollment) {
        instance.setEnrollment(session.accountId, true);
      }

      const redirectTo = await provider.interactionResult(
        ctx.originalRequest, ctx.originalResponse, {
          otp: {
            validToken: true,
          },
          login: {
            amr: ['mfa', 'otp'],
            acr: 'owners_device',
          },
        }, {
          mergeWithLastSubmission: true,
        },
      );

      ctx.originalContext.redirect(redirectTo);
      return redirectTo;
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
   * @memberof OtpController
   */
  async details(ctx) {
    /**
     * @type {import('oidc-provider').Provider}
     */
    const provider = providerRef.get(this);

    try {
      const { prompt, session } = await provider.interactionDetails(
        ctx.originalRequest, ctx.originalResponse,
      );

      const qrCode = await QRCode.toDataURL(prompt.details.uri);

      /**
       * @type {import('../app/Account.js').default}
       */
      const Account = accountRef.get(this);

      // Obter dados da conta
      const account = await Account.getAccountById(session.accountId);

      return {
        details: {
          ...prompt.details,
          qrCode,
        },
        session: {
          uid: session.uid,
          email: account.email,
          username: account.email,
          given_name: account.firstName,
          picture: account.picture_url,
        },
      };
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
   * @memberof OtpController
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
    const redirectTo = await provider.interactionResult(
      ctx.originalRequest, ctx.originalResponse, result, { mergeWithLastSubmission: false },
    );

    return redirectTo;
  }

  /**
   * O usuário abortou uma interação.
   *
   * @author Gabriel Anderson
   * @param {import('../context/HttpContext').default} ctx Contexto da requisição
   * @memberof OtpController
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

export default OtpController;
