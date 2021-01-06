import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Consent from '../views/Consent.vue';
import SelectAccount from '../views/SelectAccount.vue';

const routes = [
  {
    path: '/',
    alias: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/consent',
    name: 'Consent',
    component: Consent,
  },
  {
    path: '/select_account',
    name: 'SelectAccount',
    component: SelectAccount,
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: SelectAccount, // FIX
  },
  {
    path: '/tos',
    name: 'Tos',
    // separação do código no nível de rota
    // isso irá gerar um código separado para essa rota (adicional.[hash].js)
    // que será carregando posteriormente quando a rota for visitada.
    component: () => import(/* webpackChunkName: "adicionais" */ '../views/TOS.vue'),
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import(/* webpackChunkName: "adicionais" */ '../views/TOS.vue'), // FIX
  },
  {
    path: '/logout',
    name: 'Logout',
    redirect: () => `${process.env.VUE_APP_PROVIDER_URL}/ui/logout`,
  },
  {
    path: '/abort',
    name: 'Abort',
    redirect: () => `${process.env.VUE_APP_PROVIDER_URL}/ui/abort`,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
