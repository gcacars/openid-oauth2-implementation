import interactionRoutes from './ui';

/**
 * Configuração geral das rotas.
 *
 * @param {import('koa')} app
 */
const routes = (app) => {
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      let error = 'unknown_error';

      if (err.name === 'ValidationError') {
        error = 'validation_error';
        err.status = 422;
      }

      if (err.name === 'BulkWriteError' && err.code === 11000) {
        error = 'bulk_write_error';
        err.status = 422;
      }

      ctx.status = err.status || 500;

      ctx.body = {
        error,
        error_description: err.message,
      };
    }
  });

  app.use(interactionRoutes.routes());
  app.use(interactionRoutes.allowedMethods());
};

export default routes;
