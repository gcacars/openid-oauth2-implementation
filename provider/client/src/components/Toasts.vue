<template>
  <teleport to="body">
    <div class="position-absolute top-0 start-0 end-0">
      <div aria-live="polite" aria-atomic="true" class="position-relative">
        <div class="toast-container position-absolute top-0 end-0 p-3">
          <div class="toast fade show" role="alert" aria-live="assertive"
               aria-atomic="true" v-for="toast in toasts">
            <div class="toast-header">
              <span class="badge bg-info text-dark me-2" v-if="toast.tries > 1">
                {{ toast.tries }}
              </span>
              <strong class="me-auto">{{ toast.title }}</strong>
              <small class="text-muted">{{ toast.subtitle }}</small>
              <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close">
              </button>
            </div>
            <div class="toast-body">{{ toast.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  components: {},

  computed: {
    toasts() {
      return this.$store.state.toasts;
    },
  },
};
</script>
