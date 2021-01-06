<template>
  <span>
    <img :src="account.picture" alt="" class="rounded-circle me-3">
    <span class="d-none d-md-inline-block">{{ account.given_name }}</span>
    <small class="ms-2" v-if="logout">
      <router-link to="Logout" custom v-slot="{ href, navigate }">
        <a :href="href" @click="navigate">(sair)</a>
      </router-link>
    </small>
  </span>
</template>

<script>
export default {
  props: {
    account: {
      type: Object,
      default: () => {},
      required: true,
    },
    logout: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}
</style>
