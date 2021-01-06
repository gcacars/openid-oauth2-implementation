<template>
  <div>
    <h3 class="text-warning">Você foi desconectado!</h3>
    <p class="mt-4">
      Olá, após um grande período de inatividade sua sessão foi encerrada.
      Para continuar <strong>faça o login</strong> clicando em <em>Entrar</em> no menu superior.
    </p>
  </div>
</template>

<style scoped>
p {
  max-width: 600px;
}
</style>

<script>
export default {
  methods: {
    userLoaded() {
      this.$router.replace('/');
    },
  },

  mounted() {
    // Ouvir eventos do OIDC
    window.addEventListener('vuexoidc:userLoaded', this.userLoaded);
  },

  unmounted() {
    // Cancelar escuta dos eventos quando o componente for descarregado
    window.removeEventListener('vuexoidc:userLoaded', this.userLoaded);
  },
};
</script>
