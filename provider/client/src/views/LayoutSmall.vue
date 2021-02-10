<template>
  <div class="container pt-lg-md">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-lg-5 col-xl-4 pt-5 px-0">
        <div class="card border-0 shadow">
          <div class="overflow-hidden">
            <router-view v-slot="{ Component }">
              <transition enter-active-class="animate__animated animate__fadeInRight"
                          leave-active-class="animate__animated animate__fadeOut position-absolute
                          start-0 end-0 top-0">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
        <terms-footer />
      </div>
    </div>
  </div>
</template>

<script>
import TermsFooter from '../components/TermsFooter.vue';

export default {
  components: {
    TermsFooter,
  },
};
</script>
