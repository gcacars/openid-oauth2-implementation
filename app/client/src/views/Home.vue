<template>
  <div class="home">
    <div class="pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">Olá {{ oidcUser.given_name }}</h1>
    </div>
    <div class="row">
      <div class="col-lg-7">
        <p>Resposta com os dados da UserInfo:</p>
        <pre v-html="JSON.stringify(oidcUser, null, 2)" v-if="oidcIsAuthenticated"></pre>
        <hr>
        <p>Dados brutos da UserInfo</p>
        <button type="button" class="btn btn-outline-primary mb-3" @click="getUserInfo">
          Carregar UserInfo
        </button>
        <pre v-html="userInfo"></pre>
      </div>
      <div class="col-lg-5">
        <div class="alert alert-danger" v-if="expired">Token expirado!</div>
        <p>Estado do Access Token (Introspecção)</p>
        <pre v-html="JSON.stringify(introspection, null, 2)" v-if="introspection"></pre>
        <button type="button" class="btn btn-outline-primary mb-3" @click="introspect">
          Verificar <span v-if="introspection">novamente</span>
        </button>
        <hr>
        <p>Chamar a API com o Access Token</p>
        <div :class="{ 'bg-danger': 'error' in result, 'bg-success': 'ok' in result }"
             v-if="result" class="p-3">
          <pre v-html="JSON.stringify(result, null, 2)"></pre>
        </div>
        <button type="button" class="btn btn-primary mb-3" @click="getApi">
          Chamar <span v-if="result">novamente</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

const listenEvents = [
  'userLoaded',
  'userUnloaded',
  'accessTokenExpired',
  'userSignedOut',
  'automaticSilentRenewError',
];

export default {
  name: 'Home',
  components: {
  },

  data: () => ({
    expired: false,
    result: '',
    userInfo: '',
    introspection: '',
  }),

  computed: {
    ...mapGetters('auth', [
      'oidcIsAuthenticated',
      'oidcUser',
    ]),
  },

  methods: {
    async getUserInfo() {
      const res = await fetch(`${process.env.VUE_APP_PROVIDER_URL}/me`, {
        headers: {
          Authorization: `Bearer ${this.$store.state.auth.access_token}`,
        },
      });
      const result = await res.text();
      this.userInfo = result;
    },

    async introspect() {
      const res = await fetch(`${process.env.VUE_APP_API_URL}/status`, {
        headers: {
          Authorization: `Bearer ${this.$store.state.auth.access_token}`,
        },
      });
      this.introspection = await res.json();
    },

    async getApi() {
      const res = await fetch(process.env.VUE_APP_API_URL, {
        headers: {
          Authorization: `Bearer ${this.$store.state.auth.access_token}`,
        },
      });
      this.result = await res.json();
    },

    userLoaded() {
      this.expired = false;
    },
    userUnloaded() {
      this.$router.replace('/public');
    },
    accessTokenExpired() {
      this.expired = true;
    },
    userSignedOut() {
      this.$router.replace('/public');
    },
    automaticSilentRenewError() {
      this.$router.replace('/public');
    },
  },

  mounted() {
    // Ouvir eventos do OIDC
    listenEvents.forEach((event) => {
      window.addEventListener(`vuexoidc:${event}`, this[event]);
    });
  },

  unmounted() {
    // Cancelar escuta dos eventos quando o componente for descarregado
    listenEvents.forEach((event) => {
      window.removeEventListener(`vuexoidc:${event}`, this[event]);
    });
  },
};
</script>
