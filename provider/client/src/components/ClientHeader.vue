<template>
  <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start
      justify-content-between">
  <div class="rounded shadow p-2 bg-light mb-3 mb-md-0" id="logo">
    <img :src="cliente.logoUri" alt="app" class="w-100" id="logo-img">
  </div>
  <div class="text-center text-md-end ps-2">
    <h4>{{ cliente.clientName }}</h4>
    <span class="text-muted">{{ $t('client.wannaAccess') }}</span>
  </div>
</div>
</template>

<script>
export default {
  props: {
    cliente: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
#logo {
  margin-top: -3.5rem;
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
    margin-top: -3.5rem;
    height: 9rem;
    width: 10rem;
  }
  #logo-img {
    width: 8rem;
    height: 8rem;
  }
}
</style>
