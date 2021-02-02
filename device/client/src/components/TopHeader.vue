<template>
  <header class="d-flex align-items-center">
    <h6 class="display-6 me-5">Deviceflix</h6>
    <em style="opacity: 0.6">{{ $t('layout.nav_instructions') }}</em>
    <div class="dropdown ms-auto" v-if="user">
      <button type="button" data-bs-toggle="dropdown" id="user-menu"
              class="btn ms-2 text-nowrap dropdown-toggle" aria-expanded="false">
        <img :src="user.picture" alt="" class="rounded-circle me-3">
        <span class="d-none d-md-inline-block">{{ user.given_name }}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="user-menu">
        <li>
          <a class="dropdown-item" href="#" @click.prevent="signOut">
            {{ $t('layout.logoff') }}
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script>
import socket from '../app/socket';

export default {
  data() {
    return {
      user: null,
    };
  },
  
  methods: {
    signOut() {
      socket.emit('flush-keys');
      socket.on('flushed', this.redirect);
    },
    redirect() {
      this.$router.push('/login');
    },
  },
  
  mounted() {
    this.user = JSON.parse(window.localStorage.getItem('user_info'));
  },

  unmounted() {
    socket.off('flushed', this.redirect);
  },
}
</script>

<style scoped>
img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}
</style>
