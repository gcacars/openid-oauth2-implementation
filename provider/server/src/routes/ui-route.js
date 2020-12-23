import Router from 'koa-router';
import Account from '../app/Account';
import httpKoaContext from '../context/httpKoaContext';
import { UIController } from '../controllers';

// Variáveis privativas
const controllerRef = new WeakMap();

/**
 * Rotas da interface do usuário.
 *
 * @author Gabriel Anderson
 * @class UIRouter
 * @extends {Router}
 */
class UIRouter extends Router {
  /**
   * Creates an instance of UIRouter.
   * @author Gabriel Anderson
   * @param {import('oidc-provider').Provider} provider Provedor OpenID
   * @param {Router.IRouterOptions} options Opções do roteador
   * @param {object} db Instância do banco de dados
   * @memberof UIRouter
   */
  constructor(provider, opts, db) {
    super(opts);
    const account = new Account(db);
    const controller = new UIController(provider, account);
    controllerRef.set(this, controller);
  }

  login() {
    const controller = controllerRef.get(this);
    return httpKoaContext(controller.login.bind(controller));
  }

  abort() {
    const controller = controllerRef.get(this);
    return httpKoaContext(controller.abort);
  }
}

export default UIRouter;
