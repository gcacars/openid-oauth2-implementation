// Estado inicial
const initialState = (opts = {}) => ({
  ...opts,
  // Configuração básica
  client_id: null,
  client_id_issued_at: null,
  client_name: null,
  client_secret_expires_at: null,
  client_secret: null,
  client_uri: null,
  contacts: [],
  initiate_login_uri: null,
  redirect_uris: [],
  logo_uri: null,
  policy_uri: null,
  tos_uri: null,
  // OAuth
  default_acr_values: [],
  application_type: null,
  grant_types: [],
  response_types: [],
  scope: null,
  sector_identifier_uri: null,
  subject_type: null,
  // Token
  default_max_age: null,
  require_auth_time: null,
  id_token_signed_response_alg: null,
  id_token_encrypted_response_alg: null,
  id_token_encrypted_response_enc: null,
  // Segurança
  jwks: [],
  jwks_uri: null,
  tls_client_auth_subject_dn: null,
  tls_client_auth_san_dns: null,
  tls_client_auth_san_uri: null,
  tls_client_auth_san_ip: null,
  tls_client_auth_san_email: null,
  tls_client_certificate_bound_access_tokens: null,
  // Features
  token_endpoint_auth_method: null,
  token_endpoint_auth_signing_alg: null,
  introspection_endpoint_auth_method: null,
  introspection_endpoint_auth_signing_alg: null,
  introspection_signed_response_alg: null,
  introspection_encrypted_response_alg: null,
  introspection_encrypted_response_enc: null,
  revocation_endpoint_auth_method: null,
  revocation_endpoint_auth_signing_alg: null,
  backchannel_logout_session_required: null,
  backchannel_logout_uri: null,
  frontchannel_logout_session_required: null,
  frontchannel_logout_uri: null,
  post_logout_redirect_uris: [],
  request_object_signing_alg: null,
  request_object_encryption_alg: null,
  request_object_encryption_enc: null,
  require_signed_request_object: null,
  request_uris: null,
  userinfo_signed_response_alg: null,
  userinfo_encrypted_response_alg: null,
  userinfo_encrypted_response_enc: null,
  authorization_signed_response_alg: null,
  authorization_encrypted_response_alg: null,
  authorization_encrypted_response_enc: null,
  require_pushed_authorization_requests: null,
  web_message_uris: [],
});

// Obtém conjuntos personalizados
const getters = {};

// Ações
const actions = {};

// Mutações
const mutations = {};

// Criar depósito
function mountStore(opts = {}) {
  const initialData = typeof opts === 'object' ? opts : {};
  return {
    namespaced: true,
    state: () => initialState(initialData),
    getters,
    actions,
    mutations,
  };
}

const Client = initialState();
const store = mountStore();

export default store;
export {
  store,
  mountStore,
  Client,
};
