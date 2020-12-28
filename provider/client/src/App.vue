<template>
  <router-view/>
  <toasts />
</template>

<script>
import Toasts from './components/Toasts.vue';

export default {
  components: {
    Toasts,
  },
};
</script>
