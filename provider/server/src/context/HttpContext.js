/**
 * Cria um contexto HTTP normalizado para ser enviado para as controllers.
 *
 * @author Gabriel Anderson
 * @class HttpContext
 */
class HttpContext {
  /**
   * @typedef {Object} Request
   * @property {String} method Método HTTP da requisição
   * @property {String} ip Endereço IP do cliente (solicitante da operação)
   * @property {Object} path O caminho relativo da rota
   * @property {Object} query Query Strings presentes na requisição (ex: `?qsA=1,qsB=2`)
   * @property {Object} params Glossário de parâmetros definidos no caminho da rota (ex: `user/:id`)
   * @property {Object} headers Método HTTP da requisição
   * @property {Object} body Dados do corpo da requisição
   */

  /**
   * Creates an instance of HttpContext.
   * @author Gabriel Anderson
   * @param {Request} request A requisição HTTP
   * @param {import('koa').Context} ctx O contexto da requisição original
   * @memberof HttpContext
   */
  constructor({
    method, ip, path, query, params, headers, body,
  }, ctx) {
    this.request = {
      method,
      ip,
      path,
      query,
      params,
      headers,
      body,
    };
    this.originalContext = ctx;
    this.originalRequest = ctx.req;
    this.originalResponse = ctx.res;
  }

  /**
   * Retorna o contexto atual
   *
   * @readonly
   * @memberof HttpContext
   */
  get context() {
    return Object.freeze(this.request);
  }
}

export default HttpContext;
