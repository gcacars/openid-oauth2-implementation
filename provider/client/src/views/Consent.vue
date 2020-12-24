<template>
  <div class="container pt-lg-md">
    <div class="row justify-content-center">
      <div class="col-lg-6 col-xl-5 pt-5">
        <div class="card border-0 shadow">
          <form :action="action" method="post" autocomplete="off" role="form">
            <div class="card-body px-lg-4 pt-lg-5">
              <div class="d-flex">
                <div class="rounded shadow p-2 bg-light" id="logo">
                  <img :src="client.logo_uri" alt="app" id="logo-img">
                </div>
                <div class="text-end ms-auto">
                  <h4>{{ client.name }}</h4>
                  <span class="text-muted">Quer acessar dados da sua conta:</span>
                </div>
              </div>
              <div class="text-center my-4">
                <img :src="client.logo_uri" alt="profile" class="rounded-circle me-1" id="profile">
                {{ login }}<small class="ms-2">(<a href="#">sair</a>)</small>
              </div>
              <input type="hidden" name="prompt" value="consent"/>
              <p>Ao continuar, você irá permitir que:</p>
              <div class="text-muted mb-3 border-start border-3 border-info ps-3" role="alert">
                <small>
                  <strong>Tenha certeza que confia em {{ client.name }}.</strong><br>
                  Você pode estar compartilhando dados sensíveis com terceiros.
                  Verifique como é tratado sua privacidade.
                </small>
              </div>
              <small><em>Você pode revogar este acesso posteriormente em sua conta.</em></small>
            </div>
            <div class="card-footer text-muted d-flex p-4">
              <button type="button" class="btn btn-outline-secondary w-100 me-3">Cancelar</button>
              <button type="submit" class="btn btn-primary w-100">Permitir</button>
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
  margin-top: -5rem;
}
#logo-img {
  width: 8rem;
  height: 8rem;
}
#profile {
  width: 2rem;
  height: 2rem;
}
</style>

<script>
// import { BIconBackspaceFill } from 'bootstrap-icons-vue';

export default {
  name: 'Consent',
  components: {
  },

  data() {
    return {
      client: {
        name: 'Aplicação Exemplo',
        logo_uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi0Z05l3U61dladqDjD4-1Wh6QWW1v58M1hw&usqp=CAU',
      },
      action: '',
      carregando: true,
      uid: null,
      login: null,
    };
  },

  methods: {
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
