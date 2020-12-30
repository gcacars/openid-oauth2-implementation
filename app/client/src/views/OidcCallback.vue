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
    /*
    try {
      const redirectPath = await this.oidcSignInCallback();
      this.$router.push(redirectPath);
    } catch (error) {
      console.error(error);
      this.$router.push('/oidc-callback-error'); // Handle errors any way you want
    }
    */
    this.oidcSignInCallback()
      .then((redirectPath) => {
        console.log(redirectPath, 'CB-FINISHED');
        this.$router.replace(redirectPath);
      })
      .catch((err) => {
        this.$router.replace(`/auth-error?msg=${err.message}`);
      });
  },
};
</script>
