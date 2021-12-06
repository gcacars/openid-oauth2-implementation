import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import LayoutSmall from '../views/LayoutSmall.vue';
// import Login from '../views/Login.vue';
import AccountLookup from '../components/AccountLookup.vue';
import SelectAccount from '../views/SelectAccount.vue';

const routes = [
  {
    path: '/s',
    name: 'LayoutSmall',
    component: LayoutSmall,
    children: [
      {
        path: '/',
        name: 'Login',
        alias: '/login',
        component: AccountLookup,
      },
      {
        path: '/auth',
        name: 'Password',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/AuthPassword.vue'),
        beforeEnter: (to, from, next) => {
          if ('session' in store.state.interaction.authenticate) {
            next();
          } else {
            next({ name: 'Login' });
          }
        },
      },
      {
        path: '/consent',
        name: 'Consent',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/Consent.vue'),
        meta: {
          cardAdditionalClasses: ['col-xl-5'],
        },
      },
      {
        path: '/otp',
        name: 'OTP',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/OTPVerify.vue'),
      },
      {
        path: '/otp-enroll',
        name: 'OTPEnrollment',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/OTPEnrollment.vue'),
        meta: {
          cardAdditionalClasses: ['col-xl-5'],
        },
      },
      {
        path: '/mfa',
        name: 'MFA',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/MFAEnforcement.vue'),
      },
      {
        path: '/device',
        name: 'Device',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/DeviceInputCode.vue'),
      },
      {
        path: '/device/:code',
        name: 'ConfirmDevice',
        component: () => import(/* webpackChunkName: "adicionais" */ '../components/DeviceConfirm.vue'),
        beforeEnter: (to, from, next) => {
          const regex = new RegExp(process.env.VUE_APP_CODE_REGEX);
          const { code } = to.params;

          // Fluxo normal
          if (from.name === 'Device' && regex.test(store.state.interaction.device[code].userCode)) {
            return next();
          }

          // Fluxo via QR Code
          if (regex.test(to.query.user_code)) {
            // FIX
            store.dispatch('interaction/setDeviceUserCode', to.query.user_code);
            return next();
          }

          // Ops...
          return next({ name: 'Device' });
        },
      },
      {
        path: '/device/conclusion',
        name: 'DeviceConclusion',
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
