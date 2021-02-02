<template>
  <div class="d-flex flex-nowrap text-center">
    <div class="card bg-transparent me-3" style="width: 15rem;" v-for="(item, idx) in items"
         :key="item.id" :class="{ 'shadow-lg': selectedIndex === idx + 1 }">
      <img src="/rfc.svg" class="card-img-top p-3" alt="">
      <h5 class="card-title px-3 mt-4 mb-3">{{ $t(`catalog.specs.${item.id}`) }}</h5>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    selectedIndex: {
      type: Number,
      required: false,
      defaultValue: 0,
    },
  },
};
</script>

<style scoped>
img {
  object-fit: contain;
  background-color: white;
  height: 15rem;
}
.card {
  opacity: .75;
}
.card.shadow-lg {
  opacity: 1;
  transform: scale(106%);
}
</style>
