<template>
  <div class="container-fluid">
    <div class="row justify-content-end">
      <router-view name="sidebar" class="col-8 col-md-4 col-lg-3 col-xl-2" />

      <main class="col-md-8 col-lg-9 col-xl-10 px-4 pb-4" id="main">
        <router-view name="header" class="mb-2 mb-md-4" />

        <router-view v-slot="{ Component }">
          <transition enter-active-class="animate__animated animate__fadeInRight"
                      leave-active-class="animate__animated animate__fadeOutRight">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
  <session-lost />
</template>

<script>
import SessionLost from './components/SessionLost.vue';

export default {
  components: {
    SessionLost,
  },
};
</script>
