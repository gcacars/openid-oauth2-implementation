import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import LanguageSelector from '../components/LanguageSelector.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    components: {
      default: Login,
      header: LanguageSelector,
    },
  },
  {
    path: '/',
    name: 'Catalog',
    component: () => import(/* webpackChunkName: "read" */ '../views/Catalog.vue'),
    beforeEnter: (to, from, next) => {
      const token = window.localStorage.getItem('token');
      const expires = window.localStorage.getItem('expires_at');

      if (!token || !expires || Date.now() > parseInt(expires, 10) * 1000) {
        next('/login');
      } else {
        next();
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
