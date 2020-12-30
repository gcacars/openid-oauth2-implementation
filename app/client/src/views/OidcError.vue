<template>
  <div>
    <h3 class="text-danger">Ocorreu um erro ao conectar!</h3>
    <p class="mt-4 text-muted">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'OidcError',
  computed: {
    error() {
      return this.$route.query.msg;
    },
  },
};
</script>

<style scoped>
p {
  max-width: 600px;
}
</style>
