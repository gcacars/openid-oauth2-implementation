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
   * Adapta um request de Azure Function para um contexto da aplicação
   *
   * @author Gabriel Anderson
   * @param {import('@azure/functions').Context} ctx Requisição
   */
  async function context(ctx) {
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      // Chamar a controladora com esse contexto
      const requestContext = new HttpContext({
        method: ctx.req.method,
        ip: ctx.req.ip,
        path: ctx.req.path,
        params: ctx.req.params,
        query: ctx.req.query,
        headers: ctx.req.headers,
      });
      const result = await controller(requestContext);

      // Devolver
      if (result instanceof PaginatedResult) {
        // construir link para a próxima página
        const currentSearch = new URLSearchParams(ctx.req.querystring);
        currentSearch.set('startIndex', result.pagination.lastIndex);

        // resultados paginados
        ctx.res = {
          status: 200,
          headers,
          body: {
            ok: true,
            data: result.data,
            pagination: {
              ...result.pagination,
              next: `${ctx.protocol}://${ctx.host}${ctx.path}?${currentSearch.toString()}`,
            },
          },
        };
      } else {
        ctx.res = {
          status: 200,
          headers,
          body: {
            ok: true,
            data: result,
          },
        };
      }
    } catch (error) {
      // Erros acontecem
      ctx.res = {
        status: 500,
        headers,
        body: {
          ok: false,
          error: error.message,
          detail: error.stack,
        },
      };
    }
  }

  return context;
}

export default makeHttpContext;
