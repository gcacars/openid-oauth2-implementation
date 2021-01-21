<template>
  <label class="form-label" title="response_types">
    {{ $t('registration.client.response_types_label') }}
  </label>
  <div class="d-flex flex-wrap mb-3">
    <div class="form-check me-3" v-for="type in responseTypesList" :key="type">
      <input class="form-check-input" type="checkbox" :value="type" :id="`rt_${type}`"
              name="response_types" :checked="modelValue.includes(type)"
              @change="changed($event, type)">
      <label class="form-check-label" :for="`rt_${type}`">{{ type }}</label>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    modelValue: {
      type: Array,
      required: false,
      defaultValue() {
        return [];
      },
    },
  },

  emits: ['update:modelValue'],

  computed: {
    ...mapGetters('config', [
      'responseTypesList',
    ]),
  },

  methods: {
    changed(event, type) {
      if (event.target.checked) {
        this.$emit('update:modelValue', this.modelValue.concat([type]));
      } else {
        this.$emit('update:modelValue', this.modelValue.filter((f) => f !== type));
      }
    },
  },
};
</script>
