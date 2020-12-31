<template>
  <div>
      <div class="spinner-border" role="status" v-if="loading">
      <span class="visually-hidden">Carregando...</span>
    </div>
    <div class="text-danger" v-else-if="failed">Ocorreu uma falha. Tente novamente.</div>
    <div class="lh-lg" v-html="md" v-else></div>
  </div>
</template>

<script>
import marked from 'marked';

const baseGitHub = 'https://raw.githubusercontent.com/nexsolab/poc-auth-server/main/';

// Personalizar a renderização do markdown
marked.use({
  renderer: {
    // Personalizar a criação de tabelas para usar os estilos do Bootstrap
    table(h, b) {
      return `<table class="table table-bordered table-hover">${h}${b}</table>`;
    },

    // Adicionar um espaço melhor nos cabeçalhos
    heading(text, level) {
      const bsClass = 6 - level; // inverter, o H*1* deve ter mt-*5*
      return `<h${level} class="mt-${bsClass}">${text}</h${level}>`;
    },
  },
});

marked.setOptions({
  baseUrl: baseGitHub,
});

export default {
  name: 'Markdown',
  data: () => ({
    loading: true,
    failed: false,
    md: null,
  }),

  methods: {
    async load() {
      try {
        // Obtém o arquivo raw de markdown indicado na rota
        const { file } = this.$route.meta;
        const res = await fetch(`${baseGitHub}${file}`);
        const text = await res.text();
        this.md = marked(text);
      } catch (error) {
        this.failed = true;
      } finally {
        this.loading = false;
      }
    },
  },

  watch: {
    $route() {
      // Quando a rota mudar, devemos mudar o arquivo carregado
      this.load();
    },
  },

  mounted() {
    this.load();
  },
};
</script>

<style>
pre code {
  background-color: rgb(201, 218, 246);
  display: block;
  line-height: 1rem;
  padding: 1rem;
}
</style>
