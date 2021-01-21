import { createRouter, createWebHistory } from 'vue-router';
import { vuexOidcCreateRouterMiddleware } from 'vuex-oidc';
import Sidebar from '../components/Sidebar.vue';
import TopHeader from '../components/TopHeader.vue';
import Empty from '../components/Empty.vue';
import OidcPopupCallback from '../views/OidcPopupCallback.vue';
import Home from '../views/Home.vue';
import Public from '../views/Public.vue';

function makeRouter(store) {
  /**
   * @type {import('vue-router').RouteRecordRaw[]}
   */
  const routes = [
    {
      path: '/',
      name: 'Home',
      components: {
        default: Home,
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        title: 'Início',
      },
    },
    {
      path: '/clients',
      name: 'ClientList',
      components: {
        default: () => import(/* webpackChunkName: "adicionais" */ '../views/reg/Clients.vue'),
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        title: 'Início',
      },
      children: [
        {
          path: 'new',
          name: 'Client',
          component: () => import(/* webpackChunkName: "adicionais" */ '../views/reg/Client.vue'),
          meta: {
            title: 'Novo cliente',
          },
        },
      ],
    },
    {
      path: '/auth',
      name: 'oidcCallback',
      components: {
        default: () => import(/* webpackChunkName: "adicionais" */ '../views/OidcCallback.vue'),
        sidebar: Empty,
        header: Empty,
      },
    },
    {
      path: '/authp',
      name: 'oidcPopupCallback',
      component: OidcPopupCallback,
    },
    {
      path: '/auth-error',
      name: 'oidcError',
      components: {
        default: () => import(/* webpackChunkName: "adicionais" */ '../views/OidcError.vue'),
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        isPublic: true,
      },
    },
    {
      path: '/public',
      name: 'Public',
      components: {
        default: Public,
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        isPublic: true,
      },
    },
    {
      path: '/logout',
      name: 'SessionLost',
      components: {
        default: () => import(/* webpackChunkName: "adicionais" */ '../views/Logout.vue'),
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        isPublic: true,
      },
    },
  ];

  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      }
      return { top: 0 };
    },
  });

  window.addEventListener('vuexoidc:userUnloaded', () => {
    router.push('/public');
  });

  // Adicionar middleware do vuex-oidc
  router.beforeEach(vuexOidcCreateRouterMiddleware(store, 'auth'));
  return router;
}

window.addEventListener('vuexoidc:oidcError', (...ar) => {
  console.error(ar, 'erro OIDC');
});

export default makeRouter;
