<template>
  <div>
    <h3>Você não está conectado!</h3>
    <p class="mt-4">
      Olá, para poder fazer a administração do provedor OpenID e servidor de autorização,
      primeiro <strong>faça o login</strong> clicando em <em>Entrar</em> no menu superior.
    </p>
  </div>
</template>

<style scoped>
p {
  max-width: 600px;
}
</style>

<script>
const listenEvents = [
  'userLoaded',
];

export default {
  methods: {
    userLoaded() {
      this.$router.replace('/');
    },
  },

  mounted() {
    // Ouvir eventos do OIDC
    listenEvents.forEach((event) => {
      window.addEventListener(`vuexoidc:${event}`, this[event]);
    });
  },

  unmounted() {
    // Cancelar escuta dos eventos quando o componente for descarregado
    listenEvents.forEach((event) => {
      window.removeEventListener(`vuexoidc:${event}`, this[event]);
    });
  },
};
</script>
