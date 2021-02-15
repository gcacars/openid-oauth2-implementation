<template>
  <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
    <div class="card-body px-md-4 py-md-3 py-lg-4 text-center">
      <h4 class="text-muted mb-4">{{ $t('device.inputFormTitle') }}</h4>
      <p><img src="/illustrations/devices.svg" height="100" alt="" /></p>
      <label for="code" class="my-3">{{ $t('device.codeInputLabel') }}</label>
      <input id="code" class="form-control text-center text-uppercase mb-1" maxlength="9"
            placeholder="XXXX-XXXX" pattern="^[A-Za-z]{4}-[A-Za-z]{4}$" v-model="userCode"
            required autofocus>
      <div class="text-center text-danger my-3" v-if="falhou">
        <p><b-icon-exclamation-circle /> Ocorreu um erro ao obter os detalhes.</p>
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
    userCode: null,
  }),

  methods: {
    async enviar() {
      this.falhou = false;

      const regex = new RegExp(process.env.VUE_APP_CODE_REGEX);
      if (!regex.test(this.userCode.toUpperCase())) {
        this.$store.dispatch('addToast', {
          title: this.$t('device.invalidCode'),
          message: this.$t('device.invalidCodeMessage'),
        });
        return;
      }

      this.enviando = true;

      try {
        const json = await Resource.fetchAuthServer('/device', {
          method: 'POST',
          body: new URLSearchParams({
            user_code: this.userCode,
            xsrf: this.$route.query.x,
          }),
        }, this.$router);

        if ('error' in json || !json.ok) {
          switch (json.error) {
            case 'NotFoundCode':
              this.$store.dispatch('addToast', {
                title: 'Não encontrado',
                message: 'Não reconheci esse código, você digitou corretamente?',
              });
              break;

            case 'ExpiredCode':
              this.$store.dispatch('addToast', {
                title: 'Expirado!',
                message: 'Seu código já venceu, vá para o dispositivo e gere outro.',
              });
              break;

            case 'AlreadyUsedCode':
              this.$store.dispatch('addToast', {
                title: 'Tem algo estranho',
                subtitle: 'Este código já foi utilizado e não pode ser utilizado novamente.',
                message: 'Seu dispositivo ainda não foi conectado? Solicite um novo código.',
              });
              break;

            default:
              this.$store.dispatch('addToast', {
                title: 'Erro',
                subtitle: json.error,
                message: json.error_message,
              });
              break;
          }

          return;
        }

        if (json.data.userCode !== this.userCode) {
          this.$store.dispatch('addToast', {
            title: 'Proibido',
            message: 'O código informado anteriormente não combina com o código recebido da autorização. Por favor, reinicie o processo.',
          });
          this.userCode = null;
          return;
        }

        // Salvar no estado da aplicação
        this.$store.dispatch('interaction/setDeviceResponse', json.data);

        // Redirecionar
        if (!Resource.handleRedirect(json, this.$router)) {
          this.$router.push({ name: 'ConfirmDevice', params: { code: json.data.userCode } });
        }
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
