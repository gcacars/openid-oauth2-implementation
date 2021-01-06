<template>
  <div class="home">
    <small class="text-uppercase">Ações rápidas</small>
    <hr class="mt-1 mb-3">
    <div class="d-flex mb-4">
      <router-link :to="{ name: 'Client' }" custom v-slot="{ href, navigate }">
        <a :href="href" class="btn btn-outline-secondary d-flex flex-column align-items-center"
           @click="navigate">
          <b-icon-plus-square class="display-6 m-2" />
          <span>Novo cliente</span>
        </a>
      </router-link>
    </div>
    <small class="text-uppercase">Outros</small>
    <hr class="mt-1 mb-3">
    <p>Os dados que posso ver de você são estes:</p>
    <pre v-html="JSON.stringify(oidcUser, null, 2)" v-if="oidcIsAuthenticated"></pre>
    <button type="button" class="btn btn-outline-primary mb-3" @click="getUserInfo">
      Carregar UserInfo
    </button>
    <pre v-html="userInfo"></pre>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { BIconPlusSquare } from 'bootstrap-icons-vue';

const listenEvents = [
  'userUnloaded',
];

export default {
  name: 'Home',
  components: {
    BIconPlusSquare,
  },

  data: () => ({
    userInfo: '',
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

    userUnloaded() {
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
