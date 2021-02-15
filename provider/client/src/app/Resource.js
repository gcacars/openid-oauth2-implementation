import fetchConfig from '../config/fetch';

class Resource {
  /**
   * Faz uma requisição para o servidor de autorização.
   *
   * @author Gabriel Anderson
   * @static
   * @param {string} path Caminho relativo
   * @param {RequestInit} options Parâmetros da requisição
   * @memberof Resource
   */
  static async fetchAuthServer(path, options = {}) {
    try {
      const res = await fetch(
        `${process.env.VUE_APP_PROVIDER_URL}${path}`, {
          ...fetchConfig,
          ...options,
        },
      );

      // Aconteceu algum erro HTTP
      if (!res.ok) {
        return {
          ok: false,
          error: res.statusText,
          error_description: await res.text(),
        };
      }

      // Respostas diferentes de JSON
      if (!res.headers.get('content-type').includes('application/json')) {
        return {
          ok: true,
          data: await res.text(),
        };
      }

      const json = await res.json();

      // Redirecionamentos para o próprio servidor
      if ('redirect' in json) {
        const url = ('location' in json.redirect) ? json.redirect.location : json.redirect;

        // URLs que redirecionam para outro endpoint no servidor
        if (url.startsWith(process.env.VUE_APP_PROVIDER_URL)) {
          return Resource.fetchAuthServer(url.replace(process.env.VUE_APP_PROVIDER_URL, ''));
        }
      }

      // Volta a resposta
      return json;
    } catch (error) {
      return {
        ok: false,
        error: 'unknown_error',
        error_description: error.message,
      };
    }
  }

  /**
   * Verifica se há um redirecionamento na resposta e redireciona para lá
   *
   * @author Gabriel Anderson
   * @static
   * @param {object} json Um objeto para ser validado
   * @param {import('vue-router').Router} $router Instância do roteador do Vue
   * @return {*}  {boolean}
   * @memberof Resource
   */
  static handleRedirect(json, $router) {
    // Verificar por redirecionamentos
    if ('redirect' in json) {
      const url = ('location' in json.redirect) ? json.redirect.location : json.redirect;

      // URLs que redirecionam para o próprio app
      if (url.startsWith(process.env.VUE_APP_URL)) {
        const route = url.replace(process.env.VUE_APP_URL, '');
        if ($router) $router.push(route);
        return true;
      }
    }

    return false;
  }
}

export default Resource;
