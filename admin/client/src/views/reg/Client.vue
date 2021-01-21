<template>
  <div>
    <ul class="nav nav-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <a class="nav-link active" id="tabClientMain" data-bs-toggle="tab" href="#clientMain"
           role="tab" aria-controls="clientMain" aria-selected="true">Principal</a>
      </li>
      <li class="nav-item" role="presentation">
        <a class="nav-link" id="tabClientPlatforms" data-bs-toggle="tab" href="#clientPlatform"
           role="tab" aria-controls="platform" aria-selected="false">Plataformas</a>
      </li>
      <li class="nav-item" role="presentation">
        <a class="nav-link" id="tabClientAdvanced" data-bs-toggle="tab" href="#clientAdvanced"
           role="tab" aria-controls="advanced" aria-selected="false">Avançado</a>
      </li>
    </ul>
    <div class="tab-content pt-3">
      <div class="tab-pane fade show active" id="clientMain" role="tabpanel"
           aria-labelledby="tabClientMain">
        <form class="row row-cols-lg-2 row-cols-xl-3">
          <div class="col">
            <div class="card mb-3">
              <div class="card-img-top p-2">
                <img :src="logo_uri" alt="" class="w-100">
              </div>
              <div class="card-body">
                <h5 class="card-title text-center mb-4">{{ client_name }}</h5>
                <input type="hidden" name="logo_uri" :value="logo_uri">
                <div class="mb-3">
                  <label class="form-label" for="client_name" title="client_name">
                    Nome da aplicação
                  </label>
                  <input type="text" class="form-control" id="client_name" name="client_name"
                         placeholder="Empresa S.A." v-model="client_name" required>
                </div>
                <div class="mb-3">
                  <label class="form-label" for="client_uri" title="client_uri">
                    URL principal da aplicação
                  </label>
                  <input type="text" class="form-control" id="client_uri" name="client_uri"
                         placeholder="https://exemplo.com.br" v-model="client_uri" required>
                </div>
                <div class="mb-3">
                  <label class="form-label" for="policy_uri" title="policy_uri">
                    URL da política de privacidade
                  </label>
                  <input type="text" class="form-control" id="policy_uri" name="policy_uri"
                         placeholder="https://exemplo.com.br/privacidade" v-model="policy_uri">
                </div>
                <div class="mb-3">
                  <label class="form-label" for="tos_uri" title="tos_uri">
                    URL dos termos de serviço
                  </label>
                  <input type="text" class="form-control" id="tos_uri" name="tos_uri"
                         placeholder="https://exemplo.com.br/tos" v-model="tos_uri">
                </div>
                <div class="mb-3">
                  <label class="form-label w-100">Tipo de aplicação</label>
                  <div class="btn-group">
                    <input type="radio" class="btn-check" name="application_type" id="web"
                           value="web" v-model="application_type" autocomplete="off" required>
                    <label class="btn btn-outline-primary" for="web">web</label>
                    <input type="radio" class="btn-check" name="application_type" id="native"
                           value="native" v-model="application_type" autocomplete="off" required>
                    <label class="btn btn-outline-primary" for="native">nativo</label>
                  </div>
                </div>
                <div class="mb-3" v-show="application_type">
                  <label class="form-label w-100">Plataforma</label>
                  <div class="btn-group" v-if="application_type === 'web'">
                    <input type="radio" class="btn-check" name="platform" id="pweb"
                           autocomplete="off" value="web" v-model="platform">
                    <label class="btn btn-outline-primary" for="pweb"
                           title="Aplicações Web">web</label>
                    <input type="radio" class="btn-check" name="platform" id="spa"
                           autocomplete="off" value="spa" v-model="platform">
                    <label class="btn btn-outline-primary" for="spa"
                           title="Aplicações de página única">
                      SPA (Single-page application)
                    </label>
                  </div>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" value="1" id="third_party">
                  <label class="form-check-label" for="third_party">
                    Aplicação de terceiros (externa)
                  </label>
                </div>
                <div class="mb-3">
                  <label class="form-label" for="sector_identifier_uri"
                         title="sector_identifier_uri">
                    URI de identificação exclusiva
                  </label>
                  <input type="text" class="form-control" id="sector_identifier_uri"
                         name="sector_identifier_uri" v-model="sector_identifier_uri"
                         placeholder="https://exemplo.com.br">
                </div>
              </div>
            </div>
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-4">Configuração do Token</h5>
                <div class="mb-3">
                  <label class="form-label" for="default_max_age">
                    Idade máxima do token
                  </label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="default_max_age"
                           name="default_max_age" v-model.number="default_max_age"
                           placeholder="https://exemplo.com.br/pos-logout">
                    <span class="input-group-text">segundos</span>
                  </div>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" value="1" id="require_auth_time">
                  <label class="form-check-label" for="require_auth_time">
                    Requer tempo de autenticação
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-4">Configurações do aplicativo</h5>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <redirect-uris v-model="redirect_uris" :client_uri="client_uri" />
                <div class="mb-3">
                  <label class="form-label" for="post_logout_redirect_uris">
                    URI de redirecionamento após logout
                  </label>
                  <input type="text" class="form-control" id="post_logout_redirect_uris"
                         name="post_logout_redirect_uris" v-model="post_logout_redirect_uris"
                         placeholder="https://exemplo.com.br/pos-logout">
                </div>
                <div class="mb-3">
                  <label class="form-label" for="backchannel_logout_uri">
                    URI de logout (Back-channel)
                  </label>
                  <input type="text" class="form-control" id="backchannel_logout_uri"
                         name="backchannel_logout_uri" v-model="backchannel_logout_uri"
                         placeholder="https://backend.exemplo.com.br/logout">
                </div>
                <div class="mb-3">
                  <label class="form-label" for="frontchannel_logout_uri">
                    URI de logout (Front-channel)
                  </label>
                  <input type="text" class="form-control" id="frontchannel_logout_uri"
                         name="frontchannel_logout_uri" v-model="frontchannel_logout_uri"
                         placeholder="https://frontend.exemplo.com.br/logout">
                </div>
                <div class="mb-3">
                  <label class="form-label" for="initiate_login_uri">
                    URI inicializadora de login
                  </label>
                  <input type="text" class="form-control" id="initiate_login_uri"
                         name="initiate_login_uri" v-model="initiate_login_uri"
                         placeholder="https://exemplo.com.br/login">
                </div>
                <div class="mb-3">
                  <label class="form-label" for="jwks_uri">
                    URI do JWKS
                  </label>
                  <input type="text" class="form-control" id="jwks_uri" name="jwks_uri"
                         v-model="jwks_uri" placeholder="https://exemplo.com.br/jwks">
                </div>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-4">Opções</h5>
                <flows :model-value="flows" @update:model-value="changeFlow" />
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="tab-pane fade" id="clientPlatform" role="tabpanel"
           aria-labelledby="tabClientPlatforms">
        ...
      </div>
      <div class="tab-pane fade" id="clientAdvanced" role="tabpanel"
           aria-labelledby="tabClientAdvanced">
        <div class="row">
          <div class="col-md-7">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-4">Configurações OAuth e OpenID</h5>
                <response-types v-model="response_types" />
                <label class="form-label" title="grant_types">Tipos de concessões</label>
                <div class="d-flex flex-wrap mb-3">
                  <div class="form-check me-3" v-for="type in grantTypesList" :key="type">
                    <input class="form-check-input" type="checkbox" :value="type" :id="`gt_${type}`"
                           name="grant_types" v-model="grant_types">
                    <label class="form-check-label" :for="`gt_${type}`">{{ type }}</label>
                  </div>
                </div>
                <label class="form-label" title="grant_types">Escopos permitidos</label>
                <div class="d-flex flex-wrap mb-3">
                  <div class="form-check me-3" v-for="scope in scopeList" :key="scope._id">
                    <input class="form-check-input" type="checkbox" :value="scope._id"
                           name="grant_types" :id="`sc_${scope._id}`" v-model="grant_types">
                    <label class="form-check-label" :for="`sc_${scope._id}`" :title="scope.desc">
                      <em>{{ scope.title }}</em> <strong>{{ scope._id }}</strong>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-5">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-4">Métodos de autenticação do cliente</h5>
                <div class="mb-3">
                  <label for="token_endpoint_auth_method" class="form-label">Requisição de
                    Token</label>
                  <select class="form-select" aria-label="" id="token_endpoint_auth_method"
                          v-model="token_endpoint_auth_method">
                    <option selected disabled hidden>Escolha...</option>
                    <option :value="method" v-for="method in tokenAuthMethods" :key="method">
                      {{ method }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="introspection_endpoint_auth_method" class="form-label">
                    Introspecção de token
                  </label>
                  <select class="form-select" aria-label="" id="introspection_endpoint_auth_method"
                          v-model="introspection_endpoint_auth_method">
                    <option selected disabled hidden>Escolha...</option>
                    <option :value="method" v-for="method in introspectionAuthMethods"
                            :key="method">
                      {{ method }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="revocation_endpoint_auth_method" class="form-label">
                    Revogação de token
                  </label>
                  <select class="form-select" aria-label="" id="revocation_endpoint_auth_method"
                          v-model="revocation_endpoint_auth_method">
                    <option selected disabled hidden>Escolha...</option>
                    <option :value="method" v-for="method in revocationAuthMethods" :key="method">
                      {{ method }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Flows from '../../components/reg/client/Flows.vue';
import RedirectUris from '../../components/reg/client/RedirectUris.vue';
import ResponseTypes from '../../components/reg/client/ResponseTypes.vue';

export default {
  components: {
    Flows,
    ResponseTypes,
    RedirectUris,
  },

  data() {
    return {
      flows: [],
      redirect_uris: [],
      response_types: [],

      grantTypesList: [
        'authorization_code', 'client_credentials', 'refresh_token', 'hybrid', 'urn:::::device_code',
      ],
      scopeList: [
        {
          _id: 'email',
          title: 'Endereço de e-mail',
          desc: `A aplicação irá saber qual seu endereço de e-mail, e poderá 
          te enviar mensagens através dele.`,
          grantable: true,
        },
        {
          _id: 'openid',
          title: 'OpenID',
          grantable: false,
        },
        {
          _id: 'phone',
          title: 'Seu número de telefone',
          desc: `A aplicação terá acesso ao seu número de telefone e poderá
          te enviar SMS ou fazer ligações.`,
          grantable: true,
        },
        {
          _id: 'profile',
          title: 'Seu perfil',
          desc: `Sua data de nascimento, nome completo, gênero, foto, perfil e
          outras informações, estejam disponíveis para aplicação.`,
          grantable: true,
        },
      ],
      tokenAuthMethods: ['none', 'client_secret_basic', 'client_secret_jwt', 'client_secret_post', 'private_key_jwt', 'self_signed_tls_client_auth', 'tls_client_auth'],
      introspectionAuthMethods: ['none', 'client_secret_basic', 'client_secret_jwt', 'client_secret_post', 'private_key_jwt', 'self_signed_tls_client_auth', 'tls_client_auth'],
      revocationAuthMethods: ['none', 'client_secret_basic', 'client_secret_jwt', 'client_secret_post', 'private_key_jwt', 'self_signed_tls_client_auth', 'tls_client_auth'],
      logo_uri: 'https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo3.png',
      client_name: 'Aplicação exemplo',
      client_uri: null,
      policy_uri: null,
      tos_uri: null,
      application_type: null,
      platform: null,
      sector_identifier_uri: null,
      new_uri: '',
      post_logout_redirect_uris: null,
      backchannel_logout_uri: null,
      frontchannel_logout_uri: null,
      initiate_login_uri: null,
      jwks_uri: null,
      grant_types: [],
      scopesArray: [],
      token_endpoint_auth_method: null,
      introspection_endpoint_auth_method: null,
      revocation_endpoint_auth_method: null,
      default_max_age: 3600,
    };
  },

  methods: {
    changeFlow(flows) {
      if (flows.includes('implicit') && !this.response_types.includes('token')) {
        this.response_types.push('token');
      }
      if (flows.includes('authorization_code') && !this.response_types.includes('code')) {
        this.response_types.push('code');
      }
      if (this.flows.includes('implicit') && !flows.includes('implicit')
          && this.response_types.includes('token')) {
        this.response_types = this.response_types.filter((rt) => rt !== 'token');
      }
      if (this.flows.includes('authorization_code')
          && !flows.includes('authorization_code')
          && this.response_types.includes('code')) {
        this.response_types = this.response_types.filter((rt) => rt !== 'code');
      }

      this.flows = flows;
    },
  },

  watch: {
    client_uri(val, oldVal) {
      // atualizar prefixo ao adicionar novo URI
      if (!this.new_uri || this.new_uri === oldVal) {
        this.new_uri = val;
      }
    },
  },
};
</script>
