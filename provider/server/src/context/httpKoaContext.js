import HttpContext from './HttpContext';
import PaginatedResult from './PaginatedResult';

/**
 * Criar um contexto HTTP e executa a controller informada.
 *
 * @author Gabriel Anderson
 * @param {Function} controller A controller que irá orquestrar essa requisição
 * @returns {Function} Retorna uma função para ser chamada com a requisição HTTP.
 */
function makeHttpContext(controller) {
  /**
   * Adapta um request do Express.js para um contexto da aplicação
   *
   * @author Gabriel Anderson
   * @param {import('koa').Context} ctx Requisição
   */
  async function context(ctx) {
    try {
      // Chamar a controladora com esse contexto
      const requestContext = new HttpContext({
        method: ctx.request.method,
        ip: ctx.request.ip,
        path: ctx.request.path,
        params: ctx.params,
        query: ctx.request.query,
        headers: ctx.request.headers,
        body: ctx.request.body,
      }, ctx.req, ctx.res);
      const result = await controller(requestContext);

      // Devolver
      if (result instanceof PaginatedResult) {
        // construir link para a próxima página
        const currentSearch = new URLSearchParams(ctx.request.querystring);
        currentSearch.set('startIndex', result.pagination.lastIndex);

        // resultados paginados
        ctx.body = {
          ok: true,
          data: result.data,
          pagination: {
            ...result.pagination,
            next: `${ctx.protocol}://${ctx.host}${ctx.path}?${currentSearch.toString()}`,
          },
        };
      } else {
        ctx.body = {
          ok: true,
          data: result,
        };
      }
    } catch (error) {
      // Erros acontecem
      ctx.status = 500;
      ctx.body = {
        ok: false,
        error: error.message,
        error_description: error.error_description,
        error_code: error.code || error.name,
        detail: error.stack,
      };
    }
  }

  return context;
}

export default makeHttpContext;
