<template>
  <h5 class="card-title mb-4">URIs</h5>
  <div class="mb-3">
    <label class="form-label">{{ $t('redirect_uris_label') }}</label>
    <p class="text-center" v-if="modelValue.length === 0">
      <em class="text-muted">{{ $t('redirect_uris_empty') }}</em>
    </p>
    <ul class="list-group list-group-flush mb-3 text-primary">
      <li class="list-group-item d-flex justify-content-between align-items-center"
          v-for="uri in modelValue" :key="uri">
        {{ uri }}
        <button type="button" class="btn btn-sm btn-outline-danger"
                @click="removeUri(uri)">
          &times;
        </button>
      </li>
    </ul>
    <div class="input-group mb-3">
      <input type="text" class="form-control" v-model="new_uri"
              placeholder="https://exemplo.com.br/path">
      <button class="btn btn-outline-primary" type="button" @click="addUri">
        {{ $t('redirect_uris_add_button_label') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Array,
      required: false,
      defaultValue() {
        return [];
      },
    },

    client_uri: {
      type: String,
      required: false,
      defaultValue: '',
    },
  },

  emits: ['update:modelValue'],

  data: () => ({ new_uri: '' }),

  methods: {
    addUri() {
      // evitar colocar URLs duplicadas
      if (!this.new_uri.trim() && !this.modelValue.includes(this.new_uri)) {
        this.$emit('update:modelValue', this.modelValue.concat([this.new_uri]));
      }
      // reiniciar campo
      this.new_uri = this.client_uri;
    },

    removeUri(uri) {
      this.$emit('update:modelValue', this.modelValue.filter((u) => u !== uri));
    },
  },
};
</script>
