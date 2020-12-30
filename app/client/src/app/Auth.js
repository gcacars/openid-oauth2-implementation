import { UserManager, UserManagerSettings, User, Log } from 'oidc-client';

const userRef = new WeakMap();
const manager = new UserManager({
  authority: process.env.VUE_APP_PROVIDER_URL,
  client_id: 'app',
  redirect_uri: `${process.env.VUE_APP_URL}/cb`,
  response_type: 'code',
  scope: 'openid email',
  ui_locales: ['pt-BR'],
  post_logout_redirect_uri: `${process.env.VUE_APP_URL}/logout`,
  login_hint: 'manoel@exemplo.com.br',
  filterProtocolClaims: true, // remove: nbf, iss, at_hash, nonce
  loadUserInfo: false,
  clockSkew: 60,
  automaticSilentRenew: true,
  revokeAccessTokenOnSignout: true,
  extraQueryParams: {},
});

Log.logger = console;
Log.level = Log.INFO;

class Auth {
  static get loggedIn() {
    const user = userRef.has(this) ? userRef.get(this) : null;
    return user !== null && !user.expired;
  }

  static get claims() {
    const user = userRef.has(this) ? userRef.get(this) : null;
    return user !== null && !user.profile;
  }

  static get header() {
    const user = userRef.has(this) ? userRef.get(this) : null;
    return user !== null && `${user.token_type} ${user.access_token}`;
  }

  static async login(popup = false) {
    return popup ? await manager.signinPopup() : await manager.signinRedirect();
  }

  static async complete(popup = false) {
    const user = popup ? await manager.signinPopupCallback() : await manager.signinRedirectCallback();
    console.log(user);
    userRef.set(this, user);
    return user;
  }
  
  static async logout() {
    return  manager.signoutRedirect();
  }
  
  static async sessionStatus() {
    return manager.querySessionStatus();
  }
  
  static get events() {
    return manager.events;
  }
  
  async getUser() {
    return manager.getUser();
  }
}

export default Auth;
