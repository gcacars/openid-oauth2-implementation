<template>
  <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
    <div class="card-body px-md-4 py-md-3 py-lg-4 text-center">
      <client-header :cliente="cliente" class="mb-4" />
      <p>{{ $t('device.checkCodeDisplay') }}</p>
      <p class="display-6">{{ userCode }}</p>
      <p><small>{{ $t('device.attemptWarning') }}</small></p>
      <div class="d-flex">
        <button type="button" class="btn btn-outline-secondary w-100 me-3" @click="cancelar"
                      :disabled="enviando || cancelando">
                <span class="spinner-border spinner-border-sm" role="status"
                      v-if="cancelando"></span>
                {{ $t('abortBtnLabel') }}
              </button>
        <button type="submit" class="btn btn-primary w-100"
                :disabled="enviando || cancelando">
          <span class="spinner-border spinner-border-sm" role="status" v-if="enviando"></span>
          {{ $t('continueBtnLabel') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import ClientHeader from './ClientHeader.vue';
import fetchConfig from '../config/fetch';

export default {
  components: { ClientHeader },

  data() {
    return {
      falhou: false,
      enviando: false,
      cancelando: false,
      userCode: null,
      deviceInfo: {},
      cliente: {},
      xsrf: null,
    };
  },

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
        const res = await fetch(
          `${process.env.VUE_APP_PROVIDER_URL}/device`, {
            ...fetchConfig,
            method: 'POST',
            headers: {
              accept: 'application/json',
            },
            body: new URLSearchParams({
              user_code: this.userCode,
              xsrf: this.xsrf,
              confirm: 'yes',
            }),
          },
        );

        // Obter dados
        const json = await res.json();

        // Necessário login?
        if ('redirect' in json) {
          const href = json.redirect.location;
          if (href.includes(process.env.VUE_APP_URL)) {
            this.$router.push(href.replace(process.env.VUE_APP_URL, ''));
          } else {
            window.location.href = href;
          }
          return;
        }

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
                subtitle: 'Ops',
                message: 'Ocorreu um erro desconhecido ao confirmar. Tente novamente.',
              });
              break;
          }

          return;
        }

        // Salvar no estado da aplicação
        this.$store.dispatch('interaction/confirmDevice', this.userCode);

        // Redirecionar
        this.$router.push({ name: 'DeviceConclusion' });
      } catch (error) {
        this.$store.dispatch('addToast', {
          title: 'Erro desconhecido',
          message: 'Ocorreu um erro. Tente novamente mais tarde.',
        });
        this.falhou = true;
      } finally {
        this.enviando = false;
      }
    },
  },

  created() {
    const { code } = this.$route.params;
    const device = this.$store.state.interaction.device[code];
    this.userCode = device.userCode;
    this.cliente = device.client;
    this.deviceInfo = device.deviceInfo;
    this.xsrf = device.xsrf;
  },
};
</script>
