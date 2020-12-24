<template>
  <div class="container pt-lg-md">
    <div class="row justify-content-center">
      <div class="col-lg-6 col-xl-5 pt-5">
        <div class="card border-0 shadow">
          <form :action="action" method="post" autocomplete="off" role="form" @submit="enviar">
            <div class="card-body px-lg-4 pt-lg-5">
              <div class="text-center mb-4" v-if="carregando">
                <span class="spinner-border" role="status"></span>&nbsp;Carregando...
              </div>
              <div class="text-center text-danger mb-4" v-else-if="falhou">
                <p><b-icon-exclamation-circle /> Ocorreu um erro ao obter os detalhes.</p>
                <button type="button" class="btn btn-outline-secondary my-2" @click="carregar"
                        v-if="tentativas < 3">
                  Tentar novamente
                </button>
                <span v-else>Tente novamente mais tarde.</span>
              </div>
              <div v-else>
                <div class="d-flex">
                  <div class="rounded shadow p-2 bg-light" id="logo">
                    <img :src="cliente.logoUri" alt="app" id="logo-img">
                  </div>
                  <div class="text-end ms-auto">
                    <h4>{{ cliente.clientName }}</h4>
                    <span class="text-muted">quer acessar dados da sua conta</span>
                  </div>
                </div>
                <div class="text-center my-4">
                  <img :src="sessao.picture" alt="profile" class="rounded-circle me-1" id="profile">
                  {{ sessao.email }}<small class="ms-2">(<a href="#">sair</a>)</small>
                </div>
                <input type="hidden" name="prompt" value="consent"/>
                <p>Ao continuar, você irá permitir que:</p>

                <div class="accordion accordion-flush" id="grants">
                  <div class="accordion-item" v-for="scope in scopes">
                    <h2 class="accordion-header" :id="`h_${scope._id}`">
                      <button class="accordion-button" type="button" data-bs-toggle="collapse"
                        :data-bs-target="`#g_${scope._id}`" aria-expanded="true"
                        :aria-controls="`g_${scope._id}`">
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
                <small><em>Você pode revogar este acesso posteriormente em sua conta.</em></small>
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
        <div class="mt-3 text-end">
          <a href="#" class="d-inline-block link-dark me-3"><small>Privacidade</small></a>
          <a href="#" class="d-inline-block link-dark"><small>Termos de serviço</small></a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#logo {
  margin-top: -4.5rem;
  height: 9rem;
  width: 10rem;
  overflow: hidden;
}
#logo-img {
  width: 8rem;
  height: 8rem;
  object-fit: contain;
}
#profile {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}
</style>

<script>
import { BIconExclamationCircle } from 'bootstrap-icons-vue';

export default {
  name: 'Consent',
  components: {
    BIconExclamationCircle,
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
      claims: [],
    };
  },

  methods: {
    enviar() {
      this.enviando = true;
    },

    cancelar() {
      this.cancelando = true;
    },

    async carregar() {
      try {
        this.carregando = true;
        this.falhou = false;

        const res = await fetch(`${process.env.VUE_APP_PROVIDER_URL}/ui/${this.$route.query.uid}`, {
          headers: {
            'X-BuildID': process.env.VUE_APP_BUILD_HASH,
          },
          credentials: 'include',
          cache: 'force-cache',
          mode: 'cors',
          redirect: 'follow',
        });

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
        this.claims = details.claims.new.concat(details.claims.rejected.map((r) => {
          // eslint-disable-next-line no-param-reassign
          r.rejected = true;
          return r;
        })).filter((r) => r.grantable);
      } catch (error) {
        this.falhou = true;
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
