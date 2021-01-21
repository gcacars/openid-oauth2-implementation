<template>
  <teleport to="body">
    <div class="modal fade" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"
         id="session">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-warning">
          <div class="modal-header">
            <h5 class="modal-title">Sessão encerrada</h5>
          </div>
          <div class="modal-body text-center">
            <p>O tempo da sua sessão expirou ou ela foi perdida.</p>
            <p>Por favor, entre novamente para continuar.</p>
            <button type="button" class="btn btn-primary mt-4" @click="authenticateOidcPopup">
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { Modal } from '../../node_modules/bootstrap/dist/js/bootstrap.esm';

let modal;

// Quando o usuário sai ou perde a conexão, e está numa rota que não é pública
// ele deve entrar novamente, por isso exibimos um overlay por cima da tela,
// dessa forma, se ele preencheu algum formulário, não irá perder a informação.
// Porém quando se passa mais de 20 minutos da perda de conexão, mudamos a rota
// completamente por privacidade (para ninguém copiar os dados da tela).
// A validação não deve ocorrer na rota de callback do OIDC
let st;
function sessionLost() {
  if (modal && !this.hasAccess && this.$route.name !== 'oidcCallback') modal.show();

  // Em 20 minutos a sessão se encerra completamente, se não for feito o login
  console.log('Sessão perdida, agendando 20 minutos...', this.$route.name); // FIX
  if (!['SessionLost', 'oidcCallback'].includes(this.$route.name)) {
    st = setTimeout(() => {
      console.warn('Mudando rota...', this.$route); // FIX
      if (modal && this.hasAccess) modal.hide();
      if (!this.oidcIsAuthenticated) this.$router.push({ name: 'SessionLost' });
    }, 20 * 60 * 1000);
  }
}

function preSessionLost() {
  // Para evitar falsos-positivos, verificamos após 0,5s se deve ser exibido o banner
  setTimeout(sessionLost.bind(this), 500);
}

// Quando o usuário se conecta outra vez, limpamos o contador criado anteriormente
// dessa forma a sessão não vai mais ser encerrada completamente.
function connected() {
  clearTimeout(st);
  if (modal) modal.hide();
}

export default {
  computed: {
    ...mapGetters('auth', [
      'oidcIsAuthenticated',
    ]),
    hasAccess() {
      return this.oidcIsAuthenticated || this.$route?.meta?.isPublic;
    },
  },

  methods: {
    ...mapActions('auth', [
      'authenticateOidcPopup',
    ]),
  },

  watch: {
    $route(route) {
      // Quando a rota for para /logout após o período de inatividade
      // devemos ocultar o banner
      if (route.name === 'SessionLost') modal.hide();
    },
  },

  mounted() {
    modal = new Modal(document.getElementById('session'), {
      keyboard: false,
      backdrop: 'static',
    });

    // Sessão encerrada
    // (utilizamos o .bind(this) para conseguir acessar a rota na função)
    window.addEventListener('vuexoidc:userUnloaded', preSessionLost.bind(this));
    window.addEventListener('vuexoidc:accessTokenExpired', preSessionLost.bind(this));
    window.addEventListener('vuexoidc:silentRenewError', preSessionLost.bind(this));
    window.addEventListener('vuexoidc:userSignedOut', preSessionLost.bind(this));
    window.addEventListener('vuexoidc:automaticSilentRenewError', preSessionLost.bind(this));

    // Autenticado
    window.addEventListener('vuexoidc:userLoaded', connected);
  },

  unmounted() {
    // Sessão encerrada
    window.removeEventListener('vuexoidc:userUnloaded', preSessionLost);
    window.removeEventListener('vuexoidc:accessTokenExpired', preSessionLost);
    window.removeEventListener('vuexoidc:silentRenewError', preSessionLost);
    window.removeEventListener('vuexoidc:userSignedOut', preSessionLost);
    window.removeEventListener('vuexoidc:automaticSilentRenewError', preSessionLost);

    // Autenticado
    window.removeEventListener('vuexoidc:userLoaded', connected);

    // Limpar temporizador
    clearTimeout(st);
  },
};
</script>
