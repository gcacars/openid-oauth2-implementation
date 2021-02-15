<template>
  <div class="card-body px-md-4 py-md-3 py-lg-4">
    <div class="text-center">
      <h4 class="text-muted mb-4">{{ sessao.given_name }}, {{ $t('password.subtitle') }}</h4>
      <p><img src="/illustrations/authentication.svg" height="120" alt="" /></p>
    </div>
    <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
      <input type="hidden" name="login" :value="login" autocomplete="username" />
      <div class="mb-3 d-flex align-items-center">
        <account-horizontal :account="sessao" class="w-100" />
        <button type="button" class="btn btn-outline-secondary mr-2 d-flex"
                @click="back">
          <b-icon-backspace-fill />
        </button>
      </div>
      <div class="mb-1">
        <input aria-describedby="addon-left" type="password" class="form-control" required
               :placeholder="$t('password.inputPlaceholder')" v-model="senha"
               autocomplete="current-password">
      </div>
      <div class="mb-3">
        <small><a href="#">{{ $t('password.forgotPassword') }}</a></small>
      </div>
      <div class="text-center">
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" value="1" id="lembrar"
                  name="remember">
          <label class="form-check-label" for="lembrar">
            {{ $t('password.keepConnected') }}
          </label>
        </div>
        <button type="submit" class="btn mt-3 btn-primary w-50" :disabled="enviando">
          <span class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true" v-if="enviando"></span>
          {{ $t('password.loginBtn') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { BIconBackspaceFill } from 'bootstrap-icons-vue';
import AccountHorizontal from './AccountHorizontal.vue';
import Resource from '../app/Resource';

export default {
  components: {
    BIconBackspaceFill,
    AccountHorizontal,
  },

  data() {
    return {
      enviando: false,
      senha: null,
    };
  },

  computed: {
    sessao() {
      return this.$store.state.interaction.authenticate.session;
    },
    login() {
      return this.$store.state.interaction.authenticate.session.username;
    },
  },

  methods: {
    back() {
      this.$router.push({
        name: 'Login',
        query: {
          login_hint: this.login,
        },
      });
    },

    async enviar() {
      console.log(this.$store.state);
      this.enviando = true;

      try {
        const { uid } = this.sessao;

        // Envia o formulário
        const json = await Resource.fetchAuthServer(
          `/ui/${uid}/login`, {
            method: 'POST',
            body: new URLSearchParams({
              prompt: 'login',
              login: this.login,
              password: this.senha,
            }),
          },
        );

        if ('error' in json || !json.ok) {
          this.enviando = false;
          this.$store.dispatch('addToast', {
            title: this.$t('errors.errorTitle'),
            subtitle: json.error,
            message: `${this.$t('errors.errorTitle')} ${json.error_description}`,
          });
          return;
        }

        // Quando sucesso, recebemos um redirecionamento
        if (!Resource.handleRedirect(json, this.$router)) {
          window.location.href = json.redirect.location;
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
};
</script>
