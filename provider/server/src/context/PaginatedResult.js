/**
 * Entidade com a estrutura de dados paginados
 *
 * @author Gabriel Anderson
 * @class PaginatedResult
 */
class PaginatedResult {
  /**
   * Creates an instance of PaginatedResult.
   * @author Gabriel Anderson
   * @param {*} data Os dados
   * @param {number|null} [page=null] Página atual
   * @param {number|null} [size=null] Tamanho da página
   * @param {number|null} [limit=null] Limite máximo de registros
   * @param {string|null} [lastIndex=null] O ID que deverá ser usado para iniciar a próxima página
   * @param {string|null} [startedIndex=null] O ID usado para começar a página atual
   * @memberof PaginatedResult
   */
  constructor(data, page = null, size = null, limit = null, lastIndex = null, startedIndex = null) {
    this.result = {
      data,
      pagination: {
        page,
        size,
        limit,
        lastIndex,
        startedIndex,
      },
    };
  }

  /**
   * Obtém os dados do resultado.
   *
   * @readonly
   * @memberof PaginatedResult
   */
  get data() {
    return this.result.data;
  }

  /**
   * Obtem a informação de paginação dos dados.
   *
   * @readonly
   * @memberof PaginatedResult
   */
  get pagination() {
    return this.result.pagination;
  }
}

export default PaginatedResult;
