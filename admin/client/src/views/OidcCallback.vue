<template>
  <span></span>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'OidcCallback',
  methods: {
    ...mapActions('auth', [
      'oidcSignInCallback',
    ]),
  },

  created() {
    this.oidcSignInCallback()
      .then((redirectPath) => {
        this.$router.replace(redirectPath);
      })
      .catch((err) => {
        this.$router.replace(`/auth-error?msg=${err.message}`);
      });
  },
};
</script>
