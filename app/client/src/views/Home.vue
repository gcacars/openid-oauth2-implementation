<template>
  <div class="home">
    <div class="pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2" v-if="oidcIsAuthenticated">Olá {{ oidcUser.given_name }}</h1>
    </div>
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

export default {
  name: 'Home',
  components: {
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
      console.log(this.$store.state);
      const res = await fetch(`${process.env.VUE_APP_PROVIDER_URL}/me`, {
        headers: {
          Authorization: `Bearer ${this.$store.state.auth.access_token}`,
        },
      });
      const result = await res.text();
      this.userInfo = result;
    },
  },
};
</script>
