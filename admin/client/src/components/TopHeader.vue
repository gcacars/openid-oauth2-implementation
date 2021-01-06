<template>
  <header class="navbar sticky-top flex-nowrap bg-white">
    <button class="btn d-md-none me-2" type="button" @click="alternarMenu">
      <b-icon-list class="me-1" />
    </button>
    <span class="w-100 display-6 text-black-50">{{ title }}</span>
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
              class="btn ms-2 text-nowrap dropdown-toggle" aria-expanded="false">
        <account-horizontal :account="oidcUser" />
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="user-menu">
        <li><a class="dropdown-item" href="#">Histórico de atividades</a></li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <a class="dropdown-item d-flex justify-content-between align-items-center" 
             href="https://account-admin.dev.br" target="_blank">
            Provedor de identidade
            <b-icon-box-arrow-up-right class="ms-2" />
          </a>
        </li>
        <li>
          <a class="dropdown-item d-flex justify-content-between align-items-center" 
             href="https://apprp.dev.br/" target="_blank">
            Aplicação exemplo
            <b-icon-box-arrow-up-right class="ms-2" />
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#">Meu perfil</a></li>
        <li><a class="dropdown-item" href="#" @click.prevent="signOutSilent">Sair</a></li>
      </ul>
    </div>
    <button type="button" class="btn" @click="authenticateOidcPopup" v-else>
      Entrar
    </button>
    <div class="position-absolute start-0 end-0 d-flex justify-content-center pe-none"
         v-if="alerta">
      <div class="alert alert-warning mt-5 shadow">{{ alerta }}</div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { BIconBell, BIconSearch, BIconList, BIconBoxArrowUpRight } from 'bootstrap-icons-vue';
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
    BIconBoxArrowUpRight,
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
    title() {
      return this.$route?.meta?.title;
    },
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
