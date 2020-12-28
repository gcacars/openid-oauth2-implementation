<template>
  <div class="container pt-lg-md">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5 col-xl-4">
        <div class="card border-0 shadow">
          <div class="card-body px-md-4 py-md-3 py-lg-4 py-lg-5">
            <div class="text-muted text-center mb-4">
              <h4>Bem vindo(a)</h4>
              <span v-html="mensagem"></span>
            </div>
            <form :action="action" method="post" autocomplete="off" role="form"
                  @submit.prevent="enviar($event)" enctype="application/x-www-form-urlencoded">
              <input type="hidden" name="prompt" value="login"/>
              <div v-if="!verificado">
                <div class="mb-1">
                  <input aria-describedby="addon-left" placeholder="E-mail ou usuário"
                        class="form-control" v-model="login" :autofocus="!login" required>
                </div>
                <div class="mb-3">
                  <small><a href="#">Não lembra qual é sua conta?</a></small>
                </div>
              </div>
              <div v-else>
                <input type="hidden" name="login" :value="login" />
                <div class="mb-3 d-flex align-items-center">
                  <span class="w-100">{{ login }}</span>
                  <button type="button" class="btn btn-outline-secondary mr-2 d-flex"
                          @click="verificado = false">
                    <b-icon-backspace-fill />
                  </button>
                </div>
                <div class="mb-1">
                  <input aria-describedby="addon-left" type="password" name="password"
                        placeholder="Password" class="form-control" v-model="senha" required>
                </div>
                <div class="mb-3">
                  <small><a href="#">Esqueceu sua senha?</a></small>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="1" id="lembrar"
                         name="remember">
                  <label class="form-check-label" for="lembrar">
                    Mantenha-me conectado
                  </label>
                </div>
              </div>
              <button type="submit" class="btn mt-3 btn-primary w-100"
                      :disabled="verificando || acessando" :autofocus="!verificado && login">
                <span class="spinner-grow spinner-grow-sm mr-1" role="status"
                      aria-hidden="true" v-if="verificando"></span>
                <span class="spinner-border spinner-border-sm" role="status"
                      aria-hidden="true" v-if="acessando"></span>
                {{ verificado ? 'Entrar' : 'Continuar' }}
              </button>
              <div class="text-center">
                <hr class="my-3">
                <p class="mb-1">Ainda não tem uma conta?</p>
                <a href="#">Criar conta</a>
              </div>
            </form>
          </div>
        </div>
        <terms-footer />
      </div>
    </div>
  </div>
</template>

<script>
import { BIconBackspaceFill } from 'bootstrap-icons-vue';
import TermsFooter from '../components/TermsFooter.vue';
import fetchConfig from '../config/fetch';

const checkedLogins = [];

export default {
  name: 'Login',
  components: {
    BIconBackspaceFill,
    TermsFooter,
  },

  data() {
    return {
      action: '',
      verificado: false,
      verificando: false,
      acessando: false,
      login: '',
      senha: '',
    };
  },

  computed: {
    // Exibe uma mensagem do motivo da tela de login ter aparecido para o usuário
    mensagem() {
      const { reason } = this.$route.query;
      switch (reason) {
        case 'SessionNotFound':
          return 'Sessão encerrada. Por favor, entre novamente.';

        case 'UnknownError':
          return 'Aconteceu algum erro desconhecido.<br>Por favor, entre novamente.';

        default:
          return 'Entre na sua conta';
      }
    },
  },

  methods: {
    async enviar(event) {
      if (!this.verificado) {
        this.verificando = true;
        await this.verificar();
        this.verificando = false;
      } else if (this.senha.trim() === '' || this.senha.length < 8) {
        this.$store.dispatch('addToast', {
          title: 'Senha inválida',
          message: 'Por favor preencha corretamente com a senha da sua conta.',
        });
      } else {
        this.acessando = true;

        try {
          // Envia o formulário
          const res = await fetch(
            `${process.env.VUE_APP_PROVIDER_URL}/ui/${this.$route.query.uid}/login`,
            { ...fetchConfig, method: 'POST', body: new URLSearchParams(new FormData(event.target)) },
          );
          const json = await res.json();

          if ('error' in json || !json.ok || !json.data.startsWith('https://')) {
            this.$store.dispatch('addToast', {
              title: 'Erro',
              message: 'Ocorreu um erro ao entrar. Tente novamente.',
            });
          }

          // Quando sucesso, recebemos um redirecionamento
          window.location.href = json.data;
        } catch (error) {
          console.log(error);
          this.$store.dispatch('addToast', {
            title: 'Erro desconhecido',
            message: 'Ocorreu um erro ao entrar. Tente novamente mais tarde.',
          });
        } finally {
          this.acessando = false;
        }
      }
    },

    verificar() {
      // Checa se esse e-mail já foi verificado
      if (checkedLogins.includes(this.login)) {
        this.verificado = true;
        return;
      }

      // Verificar na API
      // eslint-disable-next-line consistent-return
      return new Promise((resolve) => {
        setTimeout(() => {
          checkedLogins.push(this.login);
          this.verificado = true;
          resolve();
        }, 1250);
      });
    },
  },

  created() {
    // Checar se tem dica de login
    if (this.$route.query.login_hint) {
      this.login = this.$route.query.login_hint;
    }

    // Colocar URL
    this.action = `${process.env.VUE_APP_PROVIDER_URL}/ui/${this.$route.query.uid}/login`;
  },
};
</script>
