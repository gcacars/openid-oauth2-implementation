<template>
  <header class="navbar sticky-top flex-nowrap bg-white">
    <button class="btn d-md-none me-2" type="button" @click="alternarMenu">
      <b-icon-list class="me-1" />
    </button>
    <div class="input-group me-3">
      <div class="input-group-text">
        <b-icon-search class="me-1" />
      </div>
      <input class="form-control" type="text" placeholder="Pesquisar" aria-label="Pesquisar"
             v-model="q">
      <button class="btn btn-outline-primary" type="button" v-if="q" @click="q = ''">
        &times;
      </button>
      <button class="btn btn-primary" type="button" v-if="q">Pesquisar</button>
    </div>
    <div class="dropdown">
      <button type="button" data-bs-toggle="dropdown" id="notifications"
              class="btn mx-2" aria-expanded="false">
        <b-icon-bell />
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notifications">
        <li v-for="note in recentNotifications" :key="note.ts">
          <div class="dropdown-item d-flex justify-content-between">
            <span>{{ note.text }}</span>
            <span class="text-muted ms-2">{{ note.data }}</span>
          </div>
        </li>
        <li class="dropdown-item text-center disabled" v-if="recentNotifications.length === 0">
          <small>
            <em>Oba! Não há nenhuma notificação.</em>
          </small>
        </li>
      </ul>
    </div>
    <div class="dropdown" v-if="oidcIsAuthenticated && oidcUser">
      <button type="button" data-bs-toggle="dropdown" id="user-menu"
              class="btn mx-2 text-nowrap dropdown-toggle" aria-expanded="false">
        <account-horizontal :account="oidcUser" />
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="user-menu">
        <li><a class="dropdown-item" href="#">Perfil</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" @click.prevent="signOutSilent">Sair e ficar</a></li>
        <li><a class="dropdown-item" href="#" @click.prevent="signOut">Sair</a></li>
      </ul>
    </div>
    <div class="btn-group" v-else>
      <button type="button" class="btn btn-primary" @click="auth">Entrar</button>
      <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split"
              data-bs-toggle="dropdown" aria-expanded="false">
        <span class="visually-hidden">Abrir opções</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="#" @click.prevent="auth({
          acr_values: ['owners_device'],
          extraQueryParams: { login_hint: 'karina@exemplo.com.br' },
        })">Obrigar uso de OTP</a></li>
        <li><a class="dropdown-item" href="#" @click.prevent="auth({
          resource: 'https://api.app-rp.dev.br',
        })">Informar recurso</a></li>
        <li><a class="dropdown-item" href="#" @click.prevent="auth({
          resource: 'urn:nx:all',
        })">Todos recursos</a></li>
      </ul>
    </div>
    <div class="position-absolute start-0 end-0 d-flex justify-content-center pe-none"
         v-if="alerta">
      <div class="alert alert-warning mt-5 shadow">{{ alerta }}</div>
    </div>
  </header>
</template>

<script>
import { nanoid } from 'nanoid';
import { mapGetters, mapActions } from 'vuex';
import { BIconBell, BIconSearch, BIconList } from 'bootstrap-icons-vue';
import AccountHorizontal from './AccountHorizontal.vue';

const listenEvents = [
  'userLoaded',
  'userUnloaded',
  'accessTokenExpiring',
  'accessTokenExpired',
  'userSignedOut',
  'oidcError',
  'automaticSilentRenewError',
];

export default {
  name: 'TopHeader',
  components: {
    BIconList,
    BIconBell,
    BIconSearch,
    AccountHorizontal,
  },

  data: () => ({
    q: '',
    alerta: '',
    notifications: [],
  }),

  computed: {
    ...mapGetters('auth', [
      'oidcIsAuthenticated',
      'oidcUser',
    ]),
    hasAccess: () => this.oidcIsAuthenticated || this.$route.meta.isPublic,
    recentNotifications() {
      return [...this.notifications].sort((a, b) => a.ts < b.ts);
    },
  },

  methods: {
    ...mapActions('auth', [
      'signOutOidc',
      'signOutOidcSilent',
      'authenticateOidcPopup',
      'removeOidcUser',
    ]),
    auth(params = {}) {
      const options = {
        ...params,
        extraQueryParams: {
          login_hint: 'manoel@exemplo.com.br',
          ...params.extraQueryParams,
          nonce: nanoid(),
        },
      };

      this.authenticateOidcPopup({
        options,
      });
    },
    alertar(msg) {
      // Emite um alerta que some depois
      this.alerta = msg;
      setTimeout(() => { this.alerta = null; }, 4000);
    },
    notify(text) {
      this.notifications.push({
        ts: Date.now(),
        data: new Date().toLocaleTimeString(),
        text,
      });
    },
    userLoaded(e) {
      const msg = `${e.detail?.profile?.given_name} entrou!`;
      this.alertar(msg);
      this.notify(msg);
    },
    userUnloaded() {
      this.alertar('Sessão encerrada');
      this.notify('Sessão encerrada');
    },
    accessTokenExpiring() {
      this.notify('Token expirando...');
    },
    accessTokenExpired() {
      this.notify('Token expirado!');
    },
    userSignedOut() {
      this.alertar('Usuário saiu');
      this.notify('Usuário saiu');
    },
    oidcError() {
      this.alertar('Erro ao entrar :(');
      this.notify('Erro ao entrar :(');
    },
    automaticSilentRenewError() {
      this.alertar('Erro ao renovar token');
      this.notify('Erro ao renovar token');
    },
    signOut() {
      // Remover usuário da sessão local e fazer o logout
      this.removeOidcUser().then(() => {
        this.signOutOidc();
      });
    },
    signOutSilent() {
      // Remover usuário da sessão local e fazer o logout
      this.removeOidcUser().then(() => {
        this.signOutOidcSilent();
      });
    },
    alternarMenu() {
      // Alterna o menu em dispositivos mobile
      document.body.classList.toggle('opened');
    },
    closeNotification() {
      this.showNotifications = false;
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
