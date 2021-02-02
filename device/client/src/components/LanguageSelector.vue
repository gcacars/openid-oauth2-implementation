<template>
  <div class="d-flex">
    <a href="#" class="lng p-2" @click.prevent="setLang(loc.id)" v-for="loc in locales"
       :key="loc.id" :class="{ active: lang === loc.id }">
      {{ loc.label }}
    </a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lang: null,
      locales: [{ id: 'en', label: 'EN' }, { id: 'pt_BR', label: 'PT' }],
    };
  },

  methods: {
    setLang(val) {
      this.lang = val;
      window.localStorage.setItem('lang', val);
      window.location.reload();
    },
  },

  created() {
    this.lang = window.localStorage.getItem('lang') || 'pt_BR';
  },
};
</script>

<style scoped>
div {
  opacity: 0.4;
}
div:hover {
  opacity: 1;
}
.lng {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
}
.lng.active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.15);
}
.lng:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
