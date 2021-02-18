<template>
  <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
    <div class="card-body px-md-4 py-md-3 py-lg-4 text-center">
      <h4 class="text-muted mb-4">{{ $t('otp.inputFormTitle') }}</h4>
      <p><img src="/illustrations/2fa.svg" height="100" alt="" /></p>
      <div class="mb-3">
        <label for="code" class="my-3">{{ $t('otp.codeInputLabel') }}</label>
        <input id="code" class="form-control text-center text-uppercase mb-1" maxlength="6"
              placeholder="000 000" pattern="^[0-9]{6}$" v-model="otpCode"
              required autofocus>
        <div class="invalid-feedback">{{ $t('otp.wrongCode') }}</div>
      </div>
      <div class="text-center text-danger my-3" v-if="falhou">
        <p><b-icon-exclamation-circle /> {{ $t('otp.error') }}</p>
      </div>
      <button type="submit" class="btn btn-primary w-50 mt-3" :disabled="enviando">
        <span class="spinner-border spinner-border-sm" role="status" v-if="enviando"></span>
        {{ $t('continueBtnLabel') }}
      </button>
    </div>
  </form>
</template>

<script>
import { BIconExclamationCircle } from 'bootstrap-icons-vue';
import Resource from '../app/Resource';

export default {
  components: {
    BIconExclamationCircle,
  },

  data: () => ({
    falhou: false,
    enviando: false,
    tentativas: 0,
    otpCode: null,
  }),

  methods: {
    async enviar() {
      this.falhou = false;
      this.enviando = true;

      try {
        const json = await Resource.fetchAuthServer('/otp', {
          method: 'POST',
          body: new URLSearchParams({
            token: this.otpCode,
          }),
        }, this.$router);

        if ('error' in json || !json.ok) {
          this.enviando = false;
          this.$store.dispatch('addToast', {
            title: this.$t('errors.errorTitle'),
            subtitle: json.error,
            message: `${this.$t('errors.errorTitle')} ${json.error_description}`,
          });
          return;
        }

        // Redirecionar
        Resource.handleRedirect(json, this.$router);
      } catch (error) {
        this.$store.dispatch('addToast', {
          title: this.$t('errors.unknownError'),
          message: this.$t('errors.errorOcurredTryAgain'),
        });
        this.falhou = true;
      } finally {
        this.enviando = false;
      }
    },
  },
};
</script>
