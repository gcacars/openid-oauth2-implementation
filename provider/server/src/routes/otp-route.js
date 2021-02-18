import Router from 'koa-router';
import Account from '../app/Account';
import httpKoaContext from '../context/httpKoaContext';
import { OtpController } from '../controllers';

// Variáveis privativas
const controllerRef = new WeakMap();

/**
 * Rotas da interface do usuário.
 *
 * @author Gabriel Anderson
 * @class OtpRouter
 * @extends {Router}
 */
class OtpRouter extends Router {
  /**
   * Creates an instance of OtpRouter.
   * @author Gabriel Anderson
   * @param {import('oidc-provider').Provider} provider Provedor OpenID
   * @param {Router.IRouterOptions} options Opções do roteador
   * @param {object} db Instância do banco de dados
   * @memberof OtpRouter
   */
  constructor(provider, opts, db) {
    super(opts);
    const account = new Account(db);
    const controller = new OtpController(provider, account, db);
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

function makeRoutes(provider, db, bodyParser) {
  const router = new OtpRouter(provider, { prefix: '/otp' }, db);
  router.get('/', router.details());
  router.post('/', bodyParser, router.confirm());
  return router;
}

export default makeRoutes;
