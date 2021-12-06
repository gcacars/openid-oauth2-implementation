const oidcSettings = {
  authority: process.env.VUE_APP_PROVIDER_URL, // 'http://localhost:3000' || 
  client_id: 'app',
  response_type: 'code',
  scope: 'openid profile api:read api:write',
  ui_locales: ['pt-BR'],
  prompt: 'login',

  redirect_uri: `${process.env.VUE_APP_URL}/auth`,
  popupRedirectUri: `${process.env.VUE_APP_URL}/authp`,
  // post_logout_redirect_uri: `${process.env.VUE_APP_URL}/logout`,
  silentRedirectUri: `${process.env.VUE_APP_URL}/s.html`,

  max_age: 300,
  clockSkew: 60,
  staleStateAge: 300,
  checkSessionInterval: 2000,
  automaticSilentRenew: true,
  automaticSilentSignin: true,
  filterProtocolClaims: false, // remove: nbf, iss, at_hash, nonce
  includeIdTokenInSilentRenew: true,
  loadUserInfo: true,
  monitorSession: true,
  revokeAccessTokenOnSignout: true,
  extraQueryParams: {},
};

export default oidcSettings;
