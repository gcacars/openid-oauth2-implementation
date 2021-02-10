import Router from 'koa-router';
import Account from '../app/Account';
import httpKoaContext from '../context/httpKoaContext';
import { DeviceController } from '../controllers';

// Variáveis privativas
const controllerRef = new WeakMap();

/**
 * Rotas da interface do usuário.
 *
 * @author Gabriel Anderson
 * @class DeviceRouter
 * @extends {Router}
 */
class DeviceRouter extends Router {
  /**
   * Creates an instance of DeviceRouter.
   * @author Gabriel Anderson
   * @param {import('oidc-provider').Provider} provider Provedor OpenID
   * @param {Router.IRouterOptions} options Opções do roteador
   * @param {object} db Instância do banco de dados
   * @memberof DeviceRouter
   */
  constructor(provider, opts, db) {
    super(opts);
    const account = new Account(db);
    const controller = new DeviceController(provider, account, db);
    controllerRef.set(this, controller);
  }

  details() {
    const controller = controllerRef.get(this);
    return httpKoaContext(controller.details.bind(controller));
  }

  login() {
    const controller = controllerRef.get(this);
    return httpKoaContext(controller.login.bind(controller));
  }

  confirm() {
    const controller = controllerRef.get(this);
    return httpKoaContext(controller.confirm.bind(controller));
  }

  abort() {
    const controller = controllerRef.get(this);
    return httpKoaContext(controller.abort.bind(controller));
  }
}

function makeRoutes(provider, db) {
  const router = new DeviceRouter(provider, { prefix: '/device' }, db);
  router.get('/:userCode', router.details());
  return router;
}

export default makeRoutes;
