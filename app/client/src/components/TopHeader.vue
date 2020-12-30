<template>
  <header class="navbar sticky-top flex-nowrap bg-light">
    <button class="btn d-md-none me-2" type="button" @click="alternarMenu">
      <b-icon-list class="me-1" />
    </button>
    <div class="input-group me-3">
      <div class="input-group-text">
        <b-icon-search class="me-1" />
      </div>
      <input class="form-control" type="text" placeholder="Pesquisar" aria-label="Pesquisar">
    </div>
    <div class="dropdown">
      <button type="button" class="btn mx-2" id="notifications" aria-expanded="false"
              @click="showNotifications = !showNotifications">
        <b-icon-bell />
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notifications"
          :class="{ show: showNotifications }">
        <li><a class="dropdown-item" href="#">Action</a></li>
        <li><a class="dropdown-item" href="#">Another action</a></li>
        <li><a class="dropdown-item" href="#">Something else here</a></li>
      </ul>
    </div>
    <div class="dropdown" v-if="oidcIsAuthenticated && oidcUser">
      <button type="button" class="btn mx-2 text-nowrap" id="notifications" aria-expanded="false"
              @click="showUserMenu = !showUserMenu">
        <account-horizontal :account="oidcUser" />
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notifications"
          :class="{ show: showUserMenu }">
        <li><a class="dropdown-item" href="#">Perfil</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" @click.prevent="signOut">Sair</a></li>
      </ul>
    </div>
    <button type="button" class="btn" @click="authenticateOidcPopup" v-else>
      Entrar
    </button>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { BIconBell, BIconSearch, BIconList } from 'bootstrap-icons-vue';
import AccountHorizontal from './AccountHorizontal.vue';

export default {
  name: 'TopHeader',
  components: {
    BIconList,
    BIconBell,
    BIconSearch,
    AccountHorizontal,
  },

  data: () => ({
    showUserMenu: false,
    showNotifications: false,
  }),

  computed: {
    ...mapGetters('auth', [
      'oidcIsAuthenticated',
      'oidcUser',
    ]),
    hasAccess: () => this.oidcIsAuthenticated || this.$route.meta.isPublic,
  },

  methods: {
    ...mapActions('auth', [
      'signOutOidc',
      'authenticateOidcPopup',
      'removeOidcUser',
    ]),
    userLoaded(e) {
      console.log('I am listening to the user loaded event in vuex-oidc', e.detail);
    },
    oidcError(e) {
      console.log('I am listening to the oidc oidcError event in vuex-oidc', e.detail);
    },
    automaticSilentRenewError(e) {
      console.log('I am listening to the automaticSilentRenewError event in vuex-oidc', e.detail);
    },
    signOut() {
      this.removeOidcUser().then(() => {
        this.signOutOidc();
      });
    },

    alternarMenu() {
      document.body.classList.toggle('opened');
    },
  },

  mounted() {
    window.addEventListener('vuexoidc:userLoaded', this.userLoaded);
    window.addEventListener('vuexoidc:oidcError', this.oidcError);
    window.addEventListener('vuexoidc:automaticSilentRenewError', this.automaticSilentRenewError);
  },

  unmounted() {
    window.removeEventListener('vuexoidc:userLoaded', this.userLoaded);
    window.removeEventListener('vuexoidc:oidcError', this.oidcError);
    window.removeEventListener('vuexoidc:automaticSilentRenewError', this.automaticSilentRenewError);
  },
};
</script>
