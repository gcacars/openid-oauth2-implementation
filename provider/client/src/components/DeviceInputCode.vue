<template>
  <form method="post" autocomplete="off" role="form" @submit.prevent="enviar($event)">
    <div class="card-body px-md-4 py-md-3 py-lg-4 text-center">
      <h4 class="text-muted mb-4">{{ $t('device.inputFormTitle') }}</h4>
      <p><img src="/illustrations/devices.svg" height="100" alt="" /></p>
      <label for="code" class="my-3">{{ $t('device.codeInputLabel') }}</label>
      <input placeholder="XXXX-XXXX" class="form-control text-center mb-1" autofocus required
             v-model="code">
      <button type="submit" class="btn btn-primary w-50 mt-3"
              :disabled="enviando || cancelando">
        <span class="spinner-border spinner-border-sm" role="status" v-if="enviando"></span>
        {{ $t('continueBtnLabel') }}
      </button>
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
    };
  },
};
</script>
