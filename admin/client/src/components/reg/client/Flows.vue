<template>
  <label class="form-label" title="OAuth 2.1 Flows">
    {{ $t('registration.client.flows_label') }}
  </label>
  <div class="mb-3">
    <div class="form-check me-3" v-for="flow in flowList" :key="flow">
      <input class="form-check-input" type="checkbox" :value="flow" :id="`f_${flow}`"
              name="flows" :checked="isChecked(flow)" :disabled="isDisabled(flow)"
              @change="changed($event, flow)">
      <label class="form-check-label" :for="`f_${flow}`">
        {{ $t(`oauth.flows.${flow}`) }}
      </label>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

let lastSelection = [];

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
      'flowList',
    ]),
  },

  methods: {
    isChecked(flow) {
      return this.modelValue.includes(flow);
    },

    isDisabled(flow) {
      return this.modelValue.includes('hybrid') && ['authorization_code', 'implicit'].includes(flow);
    },

    changed(event, flow) {
      if (event.target.checked) {
        const arr = [flow];

        if (flow === 'hybrid') {
          // Se o híbrido foi selecionado, então o authorization_code e implicit também deve estar.
          if (!this.modelValue.includes('authorization_code')) arr.push('authorization_code');
          if (!this.modelValue.includes('implicit')) arr.push('implicit');
          // Salva o estado anterior de authorization_code e implicit
          lastSelection = this.modelValue.filter((v) => ['authorization_code', 'implicit'].includes(v));
        }

        this.$emit('update:modelValue', this.modelValue.concat(arr));
      } else {
        let arr = this.modelValue;

        if (flow === 'hybrid') {
          // Quando o híbrido for removido, filtramos a lista removendo o authorization_code e
          // implicit, depois adicionamos de volta o que tinha sido já pré-selecionado.
          arr = this.modelValue.filter((f) => !['authorization_code', 'implicit'].includes(f))
            .concat(lastSelection.filter((v) => this.modelValue.includes(v)));
        }

        this.$emit('update:modelValue', arr.filter((f) => f !== flow));
      }
    },
  },
};
</script>
