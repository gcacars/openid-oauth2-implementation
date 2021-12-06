<template>
  <div class="card-body px-md-4 py-md-3 py-lg-4">
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
      <div class="text-center">
        <button type="submit" class="btn mt-3 btn-primary w-50" :disabled="enviando">
          <span class="spinner-grow spinner-grow-sm mr-1" role="status"
                aria-hidden="true" v-if="enviando"></span>
          {{ $t('continueBtnLabel') }}
        </button>
        <hr class="my-3">
        <p class="mb-1">{{ $t('accountLookup.notHaveAccount') }}</p>
        <a href="#">{{ $t('accountLookup.createAccountLabel') }}</a>
      </div>
    </form>
  </div>
</template>

<script>
import Resource from '../app/Resource';

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
      this.enviando = true;

      try {
        // Envia o formulário
        const json = await Resource.fetchAuthServer(`/ui/${this.$route.query.uid}/lookup`, {
          method: 'POST',
          body: new URLSearchParams({
            prompt: 'login',
            login: this.login,
          }),
        });

        if ('error' in json || !json.ok) {
          this.enviando = false;
          this.$store.dispatch('addToast', {
            title: this.$t('errors.errorTitle'),
            subtitle: json.error,
            message: `${this.$t('errors.errorTitle')} ${json.error_description}`,
          });
          return;
        }

        // Salvar estado
        this.$store.dispatch('interaction/setInteractionResponse', json.data);

        if (!Resource.handleRedirect(json, this.$router)) {
          // Decidir qual o próximo fluxo
          if (json.data.methods.password) {
            this.$router.push({ name: 'Password' });
          }
        }
      } catch (error) {
        this.$store.dispatch('addToast', {
          title: this.$t('errors.unknownError'),
          message: this.$t('errors.errorOcurredTryAgain'),
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
