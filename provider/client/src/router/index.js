import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Consent from '../views/Consent.vue';
import SelectAccount from '../views/SelectAccount.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
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
    path: '/tos',
    name: 'TermoServico',
    // separação do código no nível de rota
    // isso irá gerar um código separado para essa rota (adicional.[hash].js)
    // que será carregando posteriormente quando a rota for visitada.
    component: () => import(/* webpackChunkName: "adicionais" */ '../views/TOS.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
