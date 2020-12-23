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
   * @param {import('koa').Request} req A requisição original
   * @param {import('koa').Response} res Referência da resposta para a requisição
   * @memberof HttpContext
   */
  constructor({
    method, ip, path, query, params, headers, body,
  }, req, res) {
    this.request = {
      method,
      ip,
      path,
      query,
      params,
      headers,
      body,
    };
    this.originalRequest = req;
    this.originalResponse = res;
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
