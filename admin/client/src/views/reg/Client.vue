<template>
  <form class="row">
    <div class="col-md-4">
      <div class="card">
        <div class="card-img-top p-2">
          <img src="https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo3.png" alt="" class="w-100">
        </div>
        <div class="card-body">
            <h5 class="card-title text-center mb-4">Aplicação exemplo</h5>
            <input type="hidden" name="logo_uri" value="https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo3.png">
            <div class="mb-3">
              <label class="form-label" for="client_name">Nome da aplicação</label>
              <input type="text" class="form-control" id="client_name" name="client_name"
                     placeholder="Empresa S.A.">
            </div>
            <div class="mb-3">
              <label class="form-label" for="client_uri">URL principal da aplicação</label>
              <input type="text" class="form-control" id="client_uri" name="client_uri" placeholder="https://exemplo.com.br">
            </div>
            <div class="mb-3">
              <label class="form-label" for="policy_uri">URL da política de privacidade</label>
              <input type="text" class="form-control" id="policy_uri" name="policy_uri" placeholder="https://exemplo.com.br/privacidade">
            </div>
            <div class="mb-3">
              <label class="form-label" for="tos_uri">URL dos termos de serviço</label>
              <input type="text" class="form-control" id="tos_uri" name="tos_uri" placeholder="https://exemplo.com.br/tos">
            </div>
            <div class="mb-3">
              <label class="form-label w-100">Tipo de aplicação</label>
              <div class="btn-group">
                <input type="radio" class="btn-check" name="application_type" id="web"
                       value="web" v-model="application_type" autocomplete="off">
                <label class="btn btn-outline-primary" for="web">web</label>
                <input type="radio" class="btn-check" name="application_type" id="native"
                       value="native" v-model="application_type" autocomplete="off">
                <label class="btn btn-outline-primary" for="native">nativo</label>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label w-100">Plataforma</label>
              <div class="btn-group" v-if="application_type === 'web'">
                <input type="radio" class="btn-check" name="platform" id="pweb" autocomplete="off"
                       value="web" v-model="platform">
                <label class="btn btn-outline-primary" for="pweb" title="Aplicações Web">web</label>
                <input type="radio" class="btn-check" name="platform" id="spa" autocomplete="off"
                       value="spa" v-model="platform">
                <label class="btn btn-outline-primary" for="spa" title="Aplicações de página única">
                  SPA (Single-page application)
                </label>
              </div>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="1" id="third_party">
              <label class="form-check-label" for="third_party">
                Aplicação de terceiros (externa)
              </label>
            </div>
          </div>
      </div>
    </div>
    <div class="col-md-8">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title"></h5>
          <h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6>
          <p class="card-text">Conteúdo.</p>
          <a href="#" class="card-link">Card link</a>
          <a href="#" class="card-link">Another link</a>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      application_type: null,
      platform: null,
    };
  },
};
</script>
