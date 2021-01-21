<template>
  <div class="row justify-content-center align-items-center text-center">
    <div class="col-sm-10 col-xl-6">
      <h1 class="display-1">Deviceflix</h1>
      <div class="d-flex align-items-center justify-content-center mt-3" v-if="status">
        <span class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">{{ $t('init["sr-loading"]') }}</span>
        </span>
        <small class="ms-2">{{ $t(`init.${status}`) }}</small>
      </div>
      <div class="mt-5 d-flex">
        <div class="w-100 pe-3">
          <p>{{ $t('init.url_instructions') }}</p>
          <p class="lead mb-4"><strong>{{ params.verification_uri }}</strong></p>
          <p>{{ $t('init.code_instructions') }}</p>
          <p class="display-4 font-monospace">{{ params.user_code }}</p>
        </div>
        <div class="flex-shrink-1">
          <p><small><em>{{ $t('init.qrcode_instructions') }}</em></small></p>
          <img :src="params.qrCode">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

let socket;

export default {
  name: 'Home',
  components: {},

  data: () => ({
    status: null,
    params: {},
  }),

  mounted() {
    socket.on('connect', () => {
      this.status = 'authenticating';
      socket.emit('get-codes', window.navigator.userAgent);
    });
    
    socket.on('codes', (data) => {
      this.status = null;
      this.params = data;
    });

    socket.on('disconnect', (reason) => {
      this.status = 'disconnected';
      console.log(`Desconectado: ${reason}`);
      // this.$route.push('/logout'); // FIX
    });
  },
  
  created() {
    this.status = 'initialization';
    socket = io('http://localhost:9000');
  },
};
</script>

<style scoped>
.row {
  min-height: 100vh;
}
</style>
