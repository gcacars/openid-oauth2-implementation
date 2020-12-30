const oidcSettings = {
  authority: process.env.VUE_APP_PROVIDER_URL,
  client_id: 'app',
  response_type: 'code',
  scope: 'openid email profile',
  ui_locales: ['pt-BR'],
  prompt: 'login',
  login_hint: '',

  redirect_uri: `${process.env.VUE_APP_URL}/auth`,
  popupRedirectUri: `${process.env.VUE_APP_URL}/authp`,
  // post_logout_redirect_uri: `${process.env.VUE_APP_URL}/logout`,
  silentRedirectUri: `${process.env.VUE_APP_URL}/s.html`,

  filterProtocolClaims: true, // remove: nbf, iss, at_hash, nonce
  loadUserInfo: true,
  clockSkew: 60,
  automaticSilentRenew: true,
  automaticSilentSignin: false,
  revokeAccessTokenOnSignout: true,
  extraQueryParams: {
    login_hint: '',
  },
};

export default oidcSettings;