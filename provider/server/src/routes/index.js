import KoaBodyParser from 'koa-body';
import UIRouter from './ui-route';

// Variáveis privadas
const providerRef = new WeakMap();
const bodyParser = new KoaBodyParser({
  text: false, json: false, patchNode: true, patchKoa: true,
});

/**
 * Configuração geral das rotas.
 */
class Routes {
  /**
   * Creates an instance of Routes.
   * @author Gabriel Anderson
   * @param {import('koa')} app Aplicação
   * @param {import('oidc-provider').Provider} provider Provedor OpenID
   * @param {object} db Instância do banco de dados
   * @memberof Routes
   */
  constructor(app, provider, db) {
    providerRef.set(this, provider);

    // UI
    const interaction = this.configureUserInterface(db);
    app.use(interaction.routes());
    app.use(interaction.allowedMethods());
  }

  configureUserInterface(db) {
    const provider = providerRef.get(this);
    const router = new UIRouter(provider, { prefix: '/ui' }, db);
    router.get('/:uid', router.details());
    router.get('/cb/google');
    router.post('/:uid/login', bodyParser, router.login());
    router.post('/:uid/federated');
    router.post('/:uid/continue');
    router.post('/:uid/confirm', bodyParser, router.confirm());
    router.post('/:uid/abort', router.abort());
    router.post('/:uid/logout');
    return router;
  }

  /**
   * Manuseia e normaliza os erros que podem acontecer nas controllers.
   *
   * @author Gabriel Anderson
   * @static
   * @param {import('koa').Context} ctx
   * @param {function} next
   * @memberof Routes
   */
  static async handleErrors(ctx, next) {
    try {
      // Tenta executar a rota/controller
      await next();
    } catch (err) {
      // Se acontecer erro
      let error = 'unknown_error';

      if (err.name === 'ValidationError') {
        error = 'validation_error';
        err.status = 422; // Unprocessable Entity
      }

      if (err.name === 'BulkWriteError' && err.code === 11000) {
        error = 'bulk_write_error';
        err.status = 422; // Unprocessable Entity
      }

      ctx.status = err.status || 500; // Internal Server Error

      ctx.body = {
        error,
        error_description: err.message,
      };
    }
  }
}

export default Routes;
