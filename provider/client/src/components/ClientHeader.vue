<template>
  <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start
      justify-content-between">
    <img :src="cliente.logoUri" alt="app" id="logo-img">
    <div class="text-center text-md-end ps-2 mt-3">
      <h5>{{ cliente.clientName }}</h5>
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
#logo-img {
  width: 50%;
  max-height: 6rem;
  object-fit: contain;
}

@media (min-width: 768px) {
  #logo-img {
    width: 8rem;
    height: 8rem;
  }
}
</style>
