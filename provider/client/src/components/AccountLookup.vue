<template>
  <div class="card-body px-md-4 py-md-3 py-lg-4 py-lg-5">
    <div class="text-muted text-center mb-4">
      <h4>{{ $t('accountLookup.welcome') }}</h4>
      <span v-html="mensagem"></span>
    </div>
    <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
      <div class="mb-1">
        <input aria-describedby="addon-left" :placeholder="$t('accountLookup.placeholder')"
                class="form-control" v-model="login" autofocus="login" required
                autocomplete="username">
      </div>
      <div class="mb-3">
        <small><a href="#">{{ $t('accountLookup.noRememberAccount') }}</a></small>
      </div>
      <button type="submit" class="btn mt-3 btn-primary w-100" :disabled="enviando">
        <span class="spinner-grow spinner-grow-sm mr-1" role="status"
              aria-hidden="true" v-if="enviando"></span>
        {{ $t('continueBtnLabel') }}
      </button>
      <div class="text-center">
        <hr class="my-3">
        <p class="mb-1">{{ $t('accountLookup.notHaveAccount') }}</p>
        <a href="#">{{ $t('accountLookup.createAccountLabel') }}</a>
      </div>
    </form>
  </div>
</template>

<script>
import fetchConfig from '../config/fetch';

export default {
  data() {
    return {
      enviando: false,
      login: '',
    };
  },

  computed: {
    // Exibe uma mensagem do motivo da tela de login ter aparecido para o usuário
    mensagem() {
      const { reason } = this.$route.query;
      switch (reason) {
        case 'SessionNotFound':
          return 'Sessão encerrada. Por favor, entre novamente.';

        case 'UnknownError':
          return 'Aconteceu algum erro desconhecido.<br>Por favor, entre novamente.';

        default:
          return 'Entre na sua conta';
      }
    },
  },

  methods: {
    async enviar() {
      this.falhou = false;
      this.enviando = true;

      try {
        // Envia o formulário
        const res = await fetch(
          `${process.env.VUE_APP_PROVIDER_URL}/ui/${this.$route.query.uid}/lookup`, {
            ...fetchConfig,
            method: 'POST',
            body: new URLSearchParams({
              prompt: 'login',
              login: this.login,
            }),
          },
        );
        const json = await res.json();

        if (!res.ok || 'error' in json || !json.ok) {
          this.enviando = false;
          this.$store.dispatch('addToast', {
            title: 'Erro',
            message: 'Ocorreu um erro ao entrar. Tente novamente.',
          });
          return;
        }

        // Salvar estado
        this.$store.dispatch('interaction/setInteractionResponse', json.data);

        // Decidir qual o próximo fluxo
        if (json.data.password) {
          this.$router.push({ name: 'Password' });
        }
      } catch (error) {
        this.$store.dispatch('addToast', {
          title: 'Erro desconhecido',
          message: 'Ocorreu um erro ao entrar. Tente novamente mais tarde.',
        });
      } finally {
        this.enviando = false;
      }
    },
  },

  created() {
    // Checar se tem dica de login
    if (this.$route.query.login_hint) {
      this.login = this.$route.query.login_hint;
    }
  },
};
</script>
