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
        isPublic: true,
      },
      beforeEnter(to, from, next) {
        if (!store.state.auth.access_token) next('/public');
        next();
      },
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
      path: '/logout',
      name: 'Logout',
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
      path: '/openid',
      name: 'OpenID',
      components: {
        default: () => import(/* webpackChunkName: "adicionais" */ '../views/Markdown.vue'),
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        isPublic: true,
        file: 'OpenID.md',
      },
    },
    {
      path: '/projetos',
      name: 'Projetos',
      components: {
        default: () => import(/* webpackChunkName: "adicionais" */ '../views/Markdown.vue'),
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        isPublic: true,
        file: 'README.md',
      },
    },
    {
      path: '/sobre',
      name: 'Sobre',
      components: {
        default: () => import(/* webpackChunkName: "adicionais" */ '../views/Markdown.vue'),
        sidebar: Sidebar,
        header: TopHeader,
      },
      meta: {
        isPublic: true,
        file: 'app/client/README.md',
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

  router.beforeEach(vuexOidcCreateRouterMiddleware(store, 'auth'));
  return router;
}

export default makeRouter;
