import { UserManager, UserManagerSettings, User } from 'oidc-client';

const um = new UserManager({
  authority: process.env.VUE_APP_PROVIDER_URL,
  client_id: 'app',
  redirect_uri: process.env.VUE_APP_URL,
  response_type: 'code',
  scope: 'openid email',
  ui_locales: ['pt-BR'],
  post_logout_redirect_uri: `${process.env.VUE_APP_URL}/logout`,
  filterProtocolClaims: true, // remove: nbf, iss, at_hash, nonce
  loadUserInfo: false,
});

/*
import { createOidcAuth, SignInType, LogLevel } from 'vue-oidc-client';

const loco = window.location;
const appRootUrl = `${loco.protocol}//${loco.host}${process.env.BASE_URL}`;

const mainOidc = createOidcAuth(
  'op',
  SignInType.Window,
  appRootUrl,
  {
    authority: `${process.env.VUE_APP_PROVIDER_URL}/`,
    client_id: 'app',
    response_type: 'id_token token',
    scope: 'openid profile email api',
    prompt: 'login',
    login_hint: 'manoel@exemplo.com.br',
  },
  console,
  LogLevel.Debug,
);

Vue.prototype.$oidc = mainOidc;

export default mainOidc;
*/
