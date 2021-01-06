<template>
  <div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'OidcPopupCallback',
  methods: {
    ...mapActions('auth', [
      'oidcSignInPopupCallback',
    ]),
  },
  created() {
    this.oidcSignInPopupCallback()
      .catch((err) => {
        this.$router.replace(`/auth-error?msg=${err.message}`);
      });
  },
};
</script>
