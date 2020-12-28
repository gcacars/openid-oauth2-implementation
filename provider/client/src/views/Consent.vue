<template>
  <div class="container pt-lg-md">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-5 pt-5">
        <div class="card border-0 shadow">
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
                <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start
                     justify-content-lg-around">
                  <div class="rounded shadow p-2 bg-light mb-3 mb-md-0" id="logo">
                    <img :src="cliente.logoUri" alt="app" class="w-100" id="logo-img">
                  </div>
                  <div class="text-center text-md-end ps-2">
                    <h4>{{ cliente.clientName }}</h4>
                    <span class="text-muted">quer acessar dados da sua conta</span>
                  </div>
                </div>
                <account-horizontal :account="sessao" :logout="true" class="text-center" />
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
            </div>
            <div class="card-footer text-muted d-flex p-4" v-if="!carregando && !falhou">
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
          </form>
        </div>
        <terms-footer />
      </div>
    </div>
  </div>
</template>

<style scoped>
#logo {
  margin-top: -3.5rem;
  height: 7rem;
  width: 8rem;
  overflow: hidden;
}
#logo-img {
  width: 6rem;
  height: 6rem;
  object-fit: contain;
}
.accordion-button {
  /* Forçar para esquerda - no mobile o texto fica centralizado */
  text-align: start;
}

@media (min-width: 768px) {
  #logo {
    margin-top: -3.5rem;
    height: 9rem;
    width: 10rem;
  }
  #logo-img {
    width: 8rem;
    height: 8rem;
  }
}
</style>

<script>
import { BIconExclamationCircle } from 'bootstrap-icons-vue';
import AccountHorizontal from '../components/AccountHorizontal.vue';
import TermsFooter from '../components/TermsFooter.vue';
import fetchConfig from '../config/fetch';

export default {
  name: 'Consent',
  components: {
    BIconExclamationCircle,
    AccountHorizontal,
    TermsFooter,
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
        const res = await fetch(
          `${process.env.VUE_APP_PROVIDER_URL}/ui/${this.$route.query.uid}/confirm`,
          { ...fetchConfig, method: 'POST', body: new URLSearchParams(new FormData(event.target)) },
        );
        const json = await res.json();

        if ('error' in json || !json.ok || !json.data.startsWith('https://')) {
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
        window.location.href = json.data;
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

        const res = await fetch(`${process.env.VUE_APP_PROVIDER_URL}/ui/${this.$route.query.uid}`, fetchConfig);

        const json = await res.json();
        if (!json.ok || !json.data) this.falhou = true;

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
