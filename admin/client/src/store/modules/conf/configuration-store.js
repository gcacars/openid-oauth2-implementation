// Estado inicial
const initialState = () => ({
  acceptQueryParamAccessTokens: false,
  acrValues: [],
  clockTolerance: 30,
  conformIdTokenClaims: true,
  grant_types: ['authorization_code', 'implicit'],
  responseTypes: ['code', 'code id_token', 'id_token', 'code id_token token', 'none'],
  revocationEndpointAuthMethods: ['client_secret_jwt', 'private_key_jwt'],
  scopes: ['openid', 'offline_access', 'email', 'profile'],
  subjectTypes: ['pairwise', 'public'],
  tokenEndpointAuthMethods: ['client_secret_basic', 'client_secret_jwt', 'private_key_jwt', 'none'],
  pkceMethods: ['S256'],
  discovery: {
    claims_locales_supported: ['pt-BR', 'pt'],
    display_values_supported: undefined,
    op_policy_uri: '/privacy',
    op_tos_uri: '/tos',
    ui_locales_supported: ['pt-BR', 'pt'],
  },
  extraParams: [],
  extraClientMetadata: {
    properties: ['web_app_type', 'usoInterno', 'terceiro', 'tenantId', 'nx_type'],
  },
});

// Obtém conjuntos personalizados
const getters = {
  flowList: () => ['authorization_code', 'implicit', 'hybrid', 'device'],
  responseTypesList() {
    return ['code', 'token', 'id_token', 'none'];
  },
};

// Ações
const actions = {};

// Mutações
const mutations = {};

// Criar depósito
const store = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};

export default store;
