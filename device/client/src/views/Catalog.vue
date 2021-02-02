<template>
  <div>
    <top-header class="mb-5" />
    <div class="mb-5" v-for="(group, idx) in catalog" :key="group.category">
      <h5>{{ $t(`catalog.${group.category}`) }}</h5>
      <hr class="my-3">
      <catalog-slide :items="group.specs" :selectedIndex="level === idx + 1 ? index : 0" />
    </div>
  </div>
</template>

<script>
import TopHeader from '../components/TopHeader.vue';
import CatalogSlide from '../components/CatalogSlide.vue';
import catalog from '../data/catalog';

export default {
  components: { CatalogSlide, TopHeader },
  data() {
    return {
      catalog,
      level: 1,
      index: 1,
    };
  },

  methods: {
    scroll() {
      const el = this.$el.querySelector('.shadow-lg');
      console.log(el, this.$el);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
    },

    navigate(event) {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          let level = this.level + 1;
          if (level > catalog.length) level = 1;
          this.level = level;
          setTimeout(this.scroll, 20);
          break;
        }

        case 'ArrowUp': {
          event.preventDefault();
          let level = this.level - 1;
          if (level === 0) level = catalog.length;
          this.level = level;
          setTimeout(this.scroll, 20);
          break;
        }

        case 'ArrowLeft': {
          event.preventDefault();
          let index = this.index - 1;
          if (index === 0) index = catalog[this.level - 1].specs.length;
          this.index = index;
          break;
        }

        case 'ArrowRight': {
          event.preventDefault();
          let index = this.index + 1;
          if (index > catalog[this.level - 1].specs.length) index = 1;
          this.index = index;
          break;
        }

        case 'Enter': {
          event.preventDefault();
          window.open(catalog[this.level - 1].specs[this.index - 1].link);
          break;
        }

        default:
          break;
      }
    },
  },

  watch: {
    level() {
      this.index = 1;
    },
  },

  mounted() {
    window.addEventListener('keyup', this.navigate);
  },

  unmounted() {
    window.removeEventListener('keyup', this.navigate);
  },
};
</script>
