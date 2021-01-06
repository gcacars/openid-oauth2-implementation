<template>
  <teleport to="body">
    <div class="modal fade" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" id="session">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-warning">
          <div class="modal-header">
            <h5 class="modal-title">Sessão perdida</h5>
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
let modal;
let routerRef;
import { mapGetters, mapActions } from 'vuex';
import { Modal } from '../../node_modules/bootstrap/dist/js/bootstrap.esm';

// Quando o usuário sai ou perde a conexão, e está numa rota que não é pública
// ele deve entrar novamente, por isso exibimos um overlay por cima da tela,
// dessa forma, se ele preencheu algum formulário, não irá perder a informação.
// Porém quando se passa mais de 20 minutos da perda de conexão, mudamos a rota
// completamente por privacidade (para ninguém copiar os dados da tela).
let st;
function sessionLost() {
  if (modal) modal.show();

  // Em 20 minutos a sessão se encerra completamente, se não for feito o login
  st = setTimeout(() => {
    if (!routerRef || !routerRef.currentRoute?.meta?.isPublic) {
      routerRef.push({ name: 'SessionLost' });
      if (modal) modal.hide();
    }
  }, 20 * 60 * 1000);
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
      return this.oidcIsAuthenticated || this.$route.meta.isPublic;
    },
  },

  methods: {
    ...mapActions('auth', [
      'authenticateOidcPopup',
    ]),
  },
  
  mounted() {
    modal = new Modal(document.getElementById('session'), {
      keyboard: false,
      backdrop: 'static',
    });

    // Guardar referência para o roteador
    routerRef = this.$route;

    // Sessão encerrada
    window.addEventListener('vuexoidc:userUnloaded', sessionLost);
    window.addEventListener('vuexoidc:accessTokenExpired', sessionLost);
    window.addEventListener('vuexoidc:silentRenewError', sessionLost);
    window.addEventListener('vuexoidc:userSignedOut', sessionLost);
    window.addEventListener('vuexoidc:automaticSilentRenewError', sessionLost);

    // Autenticado
    window.addEventListener('vuexoidc:userLoaded', connected);
  },
  
  unmounted() {
    // Sessão encerrada
    window.removeEventListener('vuexoidc:userUnloaded', sessionLost);
    window.removeEventListener('vuexoidc:accessTokenExpired', sessionLost);
    window.removeEventListener('vuexoidc:silentRenewError', sessionLost);
    window.removeEventListener('vuexoidc:userSignedOut', sessionLost);
    window.removeEventListener('vuexoidc:automaticSilentRenewError', sessionLost);

    // Autenticado
    window.removeEventListener('vuexoidc:userLoaded', connected);
    
    // Limpar temporizador
    clearTimeout(st);
  },
};
</script>
