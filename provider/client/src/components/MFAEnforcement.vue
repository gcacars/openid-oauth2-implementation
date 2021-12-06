<template>
  <div class="card-body px-md-4 py-md-3 py-lg-4 text-center">
    <h4 class="text-muted mb-4">{{ $t('mfa.formTitle') }}</h4>
    <p><img src="/illustrations/2fa.svg" height="150" alt="" /></p>
    <p class="mt-5"><strong>{{ $t('mfa.info') }}</strong></p>
    <p v-if="required"><strong>{{ $t('mfa.requiredAction') }}</strong></p>
    <p>{{ $t('device.closeWindowInformative') }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      required: false,
    };
  },
};
</script>
