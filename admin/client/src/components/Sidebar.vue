<template>
  <nav class="sidebar d-flex flex-column">
    <div class="my-4 text-center">
      <router-link to="/" custom v-slot="{ href, navigate }">
        <a class="fs-4 fw-bold link-light text-decoration-none" :href="href" @click="navigate">
          Painel administrativo
        </a>
      </router-link>
    </div>
    <div class="sidebar-sticky row h-100" v-if="oidcIsAuthenticated">
      <div v-for="(group, idx) in menu" :key="group.id">
        <small class="d-block text-muted text-uppercase fw-bolder ms-3 mb-2"
               v-if="group.label" :class="{ 'mt-4': idx > 0 }">
          {{ group.label }}
        </small>
        <ul class="nav nav-pills flex-column">
          <li class="nav-item" v-for="menu in group.submenu" :key="menu.route">
            <router-link :to="menu.route" custom v-slot="{ href, isExactActive, navigate }">
              <a class="nav-link" :href="href" :class="{ active: isExactActive }" @click="navigate">
                <component :is="menu.icon" class="me-2" />{{ menu.label }}
              </a>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="text-center mt-4" v-else>
      <small class="text-muted"><em>Você precisa se conectar primeiro :)</em></small>
    </div>
  </nav>
</template>

<script>
import { shallowRef } from 'vue';
import { mapGetters } from 'vuex';
import {
  BIconInfoCircle, BIconPersonBadgeFill, BIconFilesAlt, BIconHouse, BIconKey, BIconGrid1x2,
} from 'bootstrap-icons-vue';

const xxx = shallowRef(BIconInfoCircle);

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

  data() {
    return {
      menu: [
        {
          id: 'reg',
          label: 'Cadastros',
          submenu: [
            { route: '/clients', label: 'Clientes', icon: xxx },
            { route: '/scopes', label: 'Escopos', icon: xxx },
            { route: '/claims', label: 'Claims', icon: xxx },
            { route: '/audiences', label: 'Públicos', icon: xxx },
          ],
        },
        {
          id: 'conf',
          label: 'Configurações',
          submenu: [
            { route: '/features', label: 'Funcionalidades', icon: xxx },
            { route: '/routes', label: 'Rotas', icon: xxx },
            { route: '/jwa', label: 'Algoritmos', icon: xxx },
            { route: '/methods', label: 'Métodos de autenticação', icon: xxx },
            { route: '/others', label: 'Outros', icon: xxx },
          ],
        },
        {
          id: 'monitor',
          label: 'Monitoramento',
          submenu: [
            { route: '/dashboard', label: 'Painel', icon: xxx },
            { route: '/errors', label: 'Erros', icon: xxx },
          ],
        },
        {
          id: 'reports',
          label: 'Relatórios',
          submenu: [
            { route: '/xxx', label: 'xxx', icon: xxx },
          ],
        },
      ],
    };
  },

  computed: {
    ...mapGetters('auth', [
      'oidcIsAuthenticated',
    ]),
  },
};
</script>
