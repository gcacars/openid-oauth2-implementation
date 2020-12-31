<template>
  <span>
    <img :src="account.picture" alt="profile" class="rounded-circle me-1">
    <span class="d-none d-md-inline-block">{{ account.given_name }}</span>
    <small class="ms-2" v-if="logout">
      (<router-link to="Logout" v-slot="{ href }"><a :href="href">sair</a></router-link>)
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
