<template>
  <div class="d-flex justify-content-center align-items-center text-center">
    <div class="col-sm-10 col-xl-6">
      <h1 class="display-1">Deviceflix</h1>
      <div class="d-flex align-items-center justify-content-center mt-3" v-if="status">
        <span class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">{{ $t('init["sr-loading"]') }}</span>
        </span>
        <small class="ms-2">{{ $t(`init.${status}`) }}</small>
      </div>
      <div class="mt-5 d-flex" v-if="!failed && status === null">
        <div class="w-100 pe-3">
          <p>{{ $t('init.url_instructions') }}</p>
          <p class="lead mb-4 text-white"><strong>{{ params.verification_uri }}</strong></p>
          <p>{{ $t('init.code_instructions') }}</p>
          <p class="display-4 text-white font-monospace">{{ params.user_code }}</p>
        </div>
        <div class="flex-shrink-1">
          <p><small><em>{{ $t('init.qrcode_instructions') }}</em></small></p>
          <img :src="params.qrCode">
        </div>
      </div>
      <div v-if="failed">
        <p class="display-6">{{ $t('init.error') }}</p>
        <button type="button" class="btn btn-outline-light" @click="getCodes">
          {{ $t('init.try_again') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from '../app/socket';

export default {
  name: 'Home',
  components: {},

  data: () => ({
    status: null,
    failed: false,
    params: {},
  }),

  methods: {
    getCodes() {
      this.failed = false;
      this.status = 'authenticating';
      socket.emit('get-codes');
    },
    onCode(data) {
      this.status = null;
      this.params = data;
      socket.emit('wait-authorization');
    },
    disconnected(reason) {
      this.status = 'disconnected';
      console.info(`Disconnected: ${reason}`);
    },
    authorized(info) {
      this.status = 'authorizing';
      window.localStorage.setItem('token', info.id_token);
      window.localStorage.setItem('expires_at', info.expires_at);
      window.localStorage.setItem('user_info', JSON.stringify(info.userInfo));
      this.$router.push('/');
    },
    error(arg) {
      console.error('authorization-error', arg);
      this.failed = true;
    },
  },

  mounted() {
    // Socket connection
    this.status = 'initialization';

    // Listen to events
    socket.on('connect', this.getCodes);
    socket.on('codes', this.onCode);
    socket.on('disconnect', this.disconnected);
    socket.on('authorized', this.authorized);
    socket.on('authorization-error', this.error);

    this.getCodes();
  },

  unmounted() {
    // Remove listeners
    socket.off('connect', this.getCodes);
    socket.off('codes', this.onCode);
    socket.off('disconnect', this.disconnected);
    socket.off('authorized', this.authorized);
    socket.off('authorization-error', this.error);
  },
};
</script>

<style scoped>
.row {
  min-height: 100vh;
}
</style>
