<template>
  <div aria-live="polite" aria-atomic="true" class="position-relative">
    <div class="toast-container position-absolute top-0 end-0 p-3">
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" v-for="toast in toasts">
        <div class="toast-header">
          <b-icon-exclamation-square />
          <strong class="me-auto">{{ toast.title }}</strong>
          <small class="text-muted">{{ toast.subtitle }}</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">{{ toast.message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { BIconExclamationSquare } from 'bootstrap-icons-vue';

export default {
  components: {
    BIconExclamationSquare,
  },
  
  data() {
    return {
      toasts: [],
    };
  },
}
</script>