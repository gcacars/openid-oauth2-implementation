<template>
  <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
    <div class="card-body px-md-4 py-md-3 py-lg-4 text-center">
      <h4 class="text-muted mb-4">{{ $t('device.confirmFormTitle') }}</h4>
      <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start
            justify-content-lg-around">
        <div class="rounded shadow p-2 bg-light mb-3 mb-md-0" id="logo">
          <img :src="cliente.logoUri" alt="app" class="w-100" id="logo-img">
        </div>
        <div class="text-center text-md-end ps-2">
          <h4>{{ cliente.clientName }}</h4>
          <span class="text-muted">quer ter acesso à sua conta</span>
        </div>
      </div>
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
export default {
  data() {
    return {
      cliente: {
        clientName: '[Interno] Deviceflix',
        logoUri: 'https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo3.png',
      },
      falhou: false,
      enviando: false,
      cancelando: false,
      carregando: true,
      tentativas: 0,
      userCode: 'STJM-DTDF',
    };
  },
};
</script>

<style scoped>
#logo {
  height: 7rem;
  width: 8rem;
  overflow: hidden;
}
#logo-img {
  width: 6rem;
  height: 6rem;
  object-fit: contain;
}

@media (min-width: 768px) {
  #logo {
    height: 9rem;
    width: 10rem;
  }
  #logo-img {
    width: 8rem;
    height: 8rem;
  }
}
</style>
