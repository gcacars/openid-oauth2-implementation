<template>
  <form :action="action" method="post" autocomplete="off" role="form"
        @submit.prevent="enviar($event)">
    <div class="card-body px-md-4 py-md-3 py-lg-4">
      <div class="text-center mb-4" v-if="carregando">
        <span class="spinner-border" role="status"></span>&nbsp;Carregando...
      </div>
      <div class="text-center text-danger mb-4" v-else-if="falhou">
        <p><b-icon-exclamation-circle /> Ocorreu um erro ao obter os detalhes.</p>
        <button type="button" class="btn btn-outline-secondary my-2" @click="carregar"
                v-if="tentativas < 2">
          Tentar novamente
        </button>
        <span v-else>Tente novamente mais tarde.</span>
      </div>
      <div v-else>
        <client-header :cliente="cliente" />
        <account-horizontal :account="sessao" :logout="true" class="my-3 text-center" />
        <input type="hidden" name="prompt" value="consent"/>
        <p>Ao continuar, você irá permitir que:</p>

        <div class="accordion accordion-flush" id="grants">
          <div class="accordion-item" v-for="scope in scopes" :key="scope._id">
            <h2 class="accordion-header" :id="`h_${scope._id}`">
              <button class="accordion-button collapsed" type="button"
                      data-bs-toggle="collapse" :data-bs-target="`#g_${scope._id}`"
                      aria-expanded="true" :aria-controls="`g_${scope._id}`">
                <input class="form-check-input me-2" type="checkbox" name="accepted"
                        :value="scope._id" :checked="nuncaRejeitado(scope._id)">
                <strong>{{ scope.title }}</strong>
              </button>
            </h2>
            <div :id="`g_${scope._id}`" class="accordion-collapse collapse"
                  :aria-labelledby="`h_${scope._id}`" data-bs-parent="#grants">
              <div class="accordion-body">{{ scope.desc }}</div>
            </div>
          </div>
        </div>

        <div class="text-muted my-3 border-start border-3 border-info ps-3" role="alert">
          <small>
            <strong>Tenha certeza que confia em {{ cliente.clientName }}.</strong><br>
            Você pode estar compartilhando dados sensíveis com terceiros.
            Verifique como é tratado sua privacidade.
          </small>
        </div>
        <div class="text-center text-md-start">
          <small><em>Você pode revogar este acesso posteriormente em sua conta.</em></small>
        </div>
      </div>
      <div class="d-flex mt-5" v-if="!carregando && !falhou">
        <button type="button" class="btn btn-outline-secondary w-100 me-3" @click="cancelar"
                :disabled="enviando || cancelando">
          <span class="spinner-border spinner-border-sm" role="status"
                v-if="cancelando"></span>
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary w-100"
                :disabled="enviando || cancelando">
          <span class="spinner-border spinner-border-sm" role="status" v-if="enviando"></span>
          Permitir
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.accordion-button {
  /* Forçar para esquerda - no mobile o texto fica centralizado */
  text-align: start;
}
</style>

<script>
import { BIconExclamationCircle } from 'bootstrap-icons-vue';
import AccountHorizontal from './AccountHorizontal.vue';
import ClientHeader from './ClientHeader.vue';
import Resource from '../app/Resource';

export default {
  name: 'Consent',
  components: {
    BIconExclamationCircle,
    AccountHorizontal,
    ClientHeader,
  },

  data() {
    return {
      action: '',
      falhou: false,
      enviando: false,
      cancelando: false,
      carregando: true,
      tentativas: 0,
      cliente: {},
      sessao: {},
      scopes: [],
    };
  },

  methods: {
    // Efetivar confirmação
    async enviar(event) {
      this.enviando = true;

      try {
        const json = await Resource.fetchAuthServer(`/ui/${this.$route.query.uid}/confirm`, {
          method: 'POST',
          body: new URLSearchParams(new FormData(event.target)),
        });

        if ('error' in json || !json.ok) {
          if (json.error_code === 'SessionNotFound') {
            this.$router.push({ name: 'Login', query: { reason: 'SessionNotFound' } });
          } else {
            this.$store.dispatch('addToast', {
              title: 'Erro',
              subtitle: json.error_code,
              message: 'Ocorreu um erro ao confirmar. Tente novamente.',
            });
          }
        }

        // Quando sucesso, recebemos um redirecionamento
        if (!Resource.handleRedirect(json, this.$router)) {
          window.location.href = json.redirect.location;
        }
      } catch (error) {
        this.$store.dispatch('addToast', {
          title: 'Erro desconhecido',
          message: 'Ocorreu um erro. Tente novamente mais tarde.',
        });
      } finally {
        this.enviando = false;
      }
    },

    // Cancelar a operação
    cancelar() {
      this.cancelando = true;
    },

    // Verifica se um escopo já foi rejeitado anteriormente
    nuncaRejeitado(scopeId) {
      // eslint-disable-next-line no-underscore-dangle
      return !this.scopes.find((s) => s._id === scopeId).rejected;
    },

    // Carregar detalhes
    async carregar() {
      try {
        this.carregando = true;
        this.falhou = false;

        const json = await Resource.fetchAuthServer(`/ui/${this.$route.query.uid}`);

        if ('error' in json || !json.ok) {
          this.falhou = true;
          this.carregando = false;
          this.$store.dispatch('addToast', {
            title: this.$t('errors.errorTitle'),
            subtitle: json.error,
            message: `${this.$t('errors.errorTitle')} ${json.error_description}`,
          });
          return;
        }

        this.cliente = json.data.client;
        this.sessao = json.data.session;

        const { details } = json.data;
        this.scopes = details.scopes.new.concat(details.scopes.rejected.map((r) => {
          // eslint-disable-next-line no-param-reassign
          r.rejected = true;
          return r;
        })).filter((r) => r.grantable);
      } catch (error) {
        this.falhou = true;

        // Algo errado aconteceu, faz login novamente
        if (this.tentativas === 1) {
          this.$router.push({ name: 'Login', query: { reason: 'UnknownError' } });
        }
      } finally {
        this.carregando = false;
        this.tentativas += 1;
      }
    },
  },

  async created() {
    // Colocar URL
    this.action = `${process.env.VUE_APP_PROVIDER_URL}/ui/${this.$route.query.uid}/confirm`;

    // Obter detalhes
    this.carregar();
  },
};
</script>
