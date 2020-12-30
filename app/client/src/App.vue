<template>
  <div class="container-fluid">
    <div class="row">
      <nav class="col-md-3 col-xl-2 d-md-block sidebar collapse">
        <div class="position-sticky">
          <div class="mt-4 me-0 mb-5 text-center">
            <a class="fs-4 fw-bold link-light text-decoration-none" href="#">
              Aplicação Exemplo
            </a>
          </div>
          <ul class="nav nav-pills flex-column">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">
                <span data-feather="home"></span>
                Início
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                <span data-feather="bar-chart-2"></span>
                Estudo do OpenID
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                <span data-feather="layers"></span>
                Projetos
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                <span data-feather="layers"></span>
                Sobre
              </a>
            </li>
          </ul>

          <small class="d-block text-muted text-uppercase fw-bolder mt-4 mb-2">
            Outros recursos
          </small>
          <ul class="nav flex-column">
            <li class="nav-item">
              <a class="nav-link" href="https://admin-op.dev.br" target="_blank">
                <span data-feather="file-text"></span>
                Painel administrativo
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="https://account-admin.dev.br" target="_blank">
                <span data-feather="file-text"></span>
                Provedor de identidade
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <header class="navbar sticky-top flex-md-nowrap p-0">
          <button class="navbar-toggler position-absolute d-md-none collapsed" type="button"
            data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <input class="form-control w-25" type="text" placeholder="Pesquisar"
            aria-label="Pesquisar">
          <ul class="navbar-nav px-3">
            <li class="nav-item text-nowrap">
              <a class="nav-link" href="#">Sair</a>
            </li>
          </ul>
        </header>
        
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">{{ user.name }}</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group me-2">
              <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
              <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">
              <span data-feather="calendar"></span>
              This week
            </button>
          </div>
        </div>
        
        <div>
          <router-link to="/">Home</router-link> |
          <a href="#" @click="login">Login</a>
        </div>
        <router-view v-slot="{ Component }">
          <transition enter-active-class="animate__animated animate__backInRight" 
                      leave-active-class="animate__animated animate__backOutRight">
            <component :is="Component" />
          </transition>
        </router-view>

        <canvas class="my-4 w-100" id="myChart" width="900" height="380"></canvas>

        <h2>Section title</h2>
        <div class="table-responsive">
          <table class="table table-striped table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Header</th>
                <th>Header</th>
                <th>Header</th>
                <th>Header</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1,001</td>
                <td>Lorem</td>
                <td>ipsum</td>
                <td>dolor</td>
                <td>sit</td>
              </tr>
              <tr>
                <td>1,002</td>
                <td>amet</td>
                <td>consectetur</td>
                <td>adipiscing</td>
                <td>elit</td>
              </tr>
              <tr>
                <td>1,003</td>
                <td>Integer</td>
                <td>nec</td>
                <td>odio</td>
                <td>Praesent</td>
              </tr>
              <tr>
                <td>1,003</td>
                <td>libero</td>
                <td>Sed</td>
                <td>cursus</td>
                <td>ante</td>
              </tr>
              <tr>
                <td>1,004</td>
                <td>dapibus</td>
                <td>diam</td>
                <td>Sed</td>
                <td>nisi</td>
              </tr>
              <tr>
                <td>1,005</td>
                <td>Nulla</td>
                <td>quis</td>
                <td>sem</td>
                <td>at</td>
              </tr>
              <tr>
                <td>1,006</td>
                <td>nibh</td>
                <td>elementum</td>
                <td>imperdiet</td>
                <td>Duis</td>
              </tr>
              <tr>
                <td>1,007</td>
                <td>sagittis</td>
                <td>ipsum</td>
                <td>Praesent</td>
                <td>mauris</td>
              </tr>
              <tr>
                <td>1,008</td>
                <td>Fusce</td>
                <td>nec</td>
                <td>tellus</td>
                <td>sed</td>
              </tr>
              <tr>
                <td>1,009</td>
                <td>augue</td>
                <td>semper</td>
                <td>porta</td>
                <td>Mauris</td>
              </tr>
              <tr>
                <td>1,010</td>
                <td>massa</td>
                <td>Vestibulum</td>
                <td>lacinia</td>
                <td>arcu</td>
              </tr>
              <tr>
                <td>1,011</td>
                <td>eget</td>
                <td>nulla</td>
                <td>Class</td>
                <td>aptent</td>
              </tr>
              <tr>
                <td>1,012</td>
                <td>taciti</td>
                <td>sociosqu</td>
                <td>ad</td>
                <td>litora</td>
              </tr>
              <tr>
                <td>1,013</td>
                <td>torquent</td>
                <td>per</td>
                <td>conubia</td>
                <td>nostra</td>
              </tr>
              <tr>
                <td>1,014</td>
                <td>per</td>
                <td>inceptos</td>
                <td>himenaeos</td>
                <td>Curabitur</td>
              </tr>
              <tr>
                <td>1,015</td>
                <td>sodales</td>
                <td>ligula</td>
                <td>in</td>
                <td>libero</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Auth from './app/Auth';

export default {
  data: () => ({
    user: {
      name: 'Gabriel',
    },
  }),

  methods: {
    login() {
      Auth.login();
    }
  }
}
</script>

<style scoped>
.sidebar {
  height: 100vh;
  position: fixed;
}
</style>
