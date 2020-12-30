<template>
  <nav class="sidebar">
    <div class="sidebar-sticky">
      <div class="mt-4 me-0 mb-5 text-center">
        <router-link to="/" custom v-slot="{ href }">
          <a class="fs-4 fw-bold link-light text-decoration-none" :href="href">
            Aplicação Exemplo
          </a>
        </router-link>
      </div>
      <ul class="nav nav-pills flex-column">
        <li class="nav-item">
          <router-link to="/" custom v-slot="{ href, isExactActive }">
            <a class="nav-link" aria-current="page" :href="href" :class="{ active: isExactActive }">
              <b-icon-house class="me-2" />
              Início
            </a>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/openid" custom v-slot="{ href, isExactActive }">
            <a class="nav-link" :href="href" :class="{ active: isExactActive }">
              <b-icon-key class="me-2" />
              Estudo do OpenID
            </a>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/projetos" custom v-slot="{ href, isExactActive }">
            <a class="nav-link" :href="href" :class="{ active: isExactActive }">
              <b-icon-files-alt class="me-2" />
              Projetos
            </a>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/sobre" custom v-slot="{ href, isExactActive }">
            <a class="nav-link" :href="href" :class="{ active: isExactActive }">
              <b-icon-info-circle class="me-2" />
              Sobre
            </a>
          </router-link>
        </li>
      </ul>

      <small class="d-block text-muted text-uppercase fw-bolder mt-4 mb-2">
        Outros recursos
      </small>
      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link" href="https://admin-op.dev.br" target="_blank">
            <b-icon-grid1x2 class="me-2" />
            Painel administrativo
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://account-admin.dev.br" target="_blank">
            <b-icon-person-badge-fill class="me-2" />
            Provedor de identidade
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import {
  BIconInfoCircle, BIconPersonBadgeFill, BIconFilesAlt, BIconHouse, BIconKey, BIconGrid1x2,
} from 'bootstrap-icons-vue';

export default {
  name: 'Sidebar',
  components: {
    BIconInfoCircle,
    BIconPersonBadgeFill,
    BIconFilesAlt,
    BIconHouse,
    BIconKey,
    BIconGrid1x2,
  },
};
</script>
