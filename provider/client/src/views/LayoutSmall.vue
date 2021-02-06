<template>
  <div class="container pt-lg-md">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-5 pt-5 overflow-hidden">
        <div class="card border-0 shadow">
          <router-view v-slot="{ Component }">
            <transition enter-active-class="animate__animated animate__fadeInRight"
                        leave-active-class="animate__animated animate__fadeOutRight">
              <component :is="Component" />
            </transition>
          </router-view>
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
