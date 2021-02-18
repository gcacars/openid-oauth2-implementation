<template>
  <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
    <div class="card-body px-md-4 py-md-3 py-lg-4 text-center">
      <h4 class="text-muted mb-4">{{ $t('otp.enrollment.inputFormTitle') }}</h4>
      <div class="alert alert-warning p-2" v-if="details.required">
        <small>Você precisa cadastrar um dispositivo para continuar.</small>
      </div>
      <account-horizontal :account="session" :logout="true" class="my-3 text-center" />
      <div class="d-flex">
        <p class="p-3">
          <span class="mb-1">{{ $t('otp.enrollment.actionInfo') }}</span><br>
          <a href="#" @click.prevent="appList = !appList">
            <small>
              {{ $t(`otp.enrollment.options${appList ? 'Hide' : 'Show'}`) }}
              {{ $t('otp.enrollment.seeAppOptions') }}
            </small>
          </a>
        </p>
        <p style="width: 160px">
          <img :src="details.qrCode" width="160" height="160" alt="" v-if="details.qrCode">
          <span class="spinner-border" role="status" v-else></span>
        </p>
      </div>
      <div class="d-flex justify-content-center">
        <div class="card text-dark bg-light mb-3 w-75" v-show="appList">
          <div class="card-body">
            <div class="d-flex justify-content-center">
              <ul class="nav nav-pills mb-3">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: platform === 'android' }" href="#"
                    @click.prevent="platform = 'android'">Android</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: platform === 'ios' }" href="#"
                    @click.prevent="platform = 'ios'">iOS</a>
                </li>
              </ul>
            </div>
            <ul class="p-0">
              <li v-for="app in appsFiltered" :key="app.name">
                <a :href="app[platform]" target="_blank">{{ app.name }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-3">
        <label for="code" class="mb-3">{{ $t('otp.enrollment.codeInputLabel') }}</label>
        <input id="code" class="form-control text-center text-uppercase mb-1" maxlength="6"
              placeholder="000 000" pattern="^[0-9]{6}$" v-model="otpCode"
              required autofocus>
        <div class="invalid-feedback">{{ $t('otp.wrongCode') }}</div>
      </div>
      <div class="text-center text-danger my-3" v-if="falhou">
        <p><b-icon-exclamation-circle /> {{ $t('otp.error') }}</p>
      </div>
      <button type="submit" class="btn btn-primary w-50" :disabled="enviando">
        <span class="spinner-border spinner-border-sm" role="status" v-if="enviando"></span>
        {{ $t('continueBtnLabel') }}
      </button>
    </div>
  </form>
</template>

<script>
import { BIconExclamationCircle } from 'bootstrap-icons-vue';
import AccountHorizontal from './AccountHorizontal.vue';
import Resource from '../app/Resource';

export default {
  components: {
    BIconExclamationCircle,
    AccountHorizontal,
  },

  data: () => ({
    falhou: false,
    enviando: false,
    appList: false,
    tentativas: 0,
    otpCode: null,
    session: {},
    details: {},
    platform: 'android',
    apps: [
      {
        name: 'Microsoft Authenticator',
        android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator',
        ios: 'https://apps.apple.com/us/app/microsoft-authenticator/id983156458',
      },
      {
        name: 'Google Authenticator',
        android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
        ios: 'https://apps.apple.com/us/app/google-authenticator/id388497605',
      },
      {
        name: 'Authy',
        android: 'https://play.google.com/store/apps/details?id=com.authy.authy',
        ios: 'https://apps.apple.com/us/app/authy/id494168017',
      },
    ],
  }),

  computed: {
    appsFiltered() {
      return this.apps.filter((a) => !!a[this.platform]);
    },
  },

  methods: {
    async detalhes() {
      try {
        const json = await Resource.fetchAuthServer('/otp', {}, this.$router);

        if ('error' in json || !json.ok) {
          this.enviando = false;
          this.$store.dispatch('addToast', {
            title: this.$t('errors.errorTitle'),
            subtitle: json.error,
            message: `${this.$t('errors.errorTitle')} ${json.error_description}`,
          });
          return;
        }

        if ('details' in json.data) {
          this.details = json.data.details;
          this.session = json.data.session;
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

        // Salvar no estado da aplicação
        // this.$store.dispatch('interaction/setDeviceResponse', json.data);

        // Redirecionar
        Resource.handleRedirect(json, this.$router);
        /*
        if (!Resource.handleRedirect(json, this.$router)) {
          this.$router.push({ name: 'ConfirmDevice', params: { code: json.data.otpCode } });
        }
        */
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

  created() {
    this.detalhes();
  },
};
</script>
