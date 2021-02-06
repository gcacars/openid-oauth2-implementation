import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import SelectAccount from '../views/SelectAccount.vue';
import LayoutSmall from '../views/LayoutSmall.vue';

const routes = [
  {
    path: '/',
    alias: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/s',
    name: 'LayoutSmall',
    component: LayoutSmall,
    children: [
      {
        path: '/consent',
        name: 'Consent',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/Consent.vue'),
      },
      {
        path: '/device',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/DeviceInputCode.vue'),
      },
      {
        path: '/device/confirm',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/DeviceConfirm.vue'),
      },
      {
        path: '/device/conclusion',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/DeviceConclusion.vue'),
      },
    ],
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
