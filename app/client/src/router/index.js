import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Auth from '../app/Auth';

/**
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      // authName: mainAuth.authName,
    },
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/public',
    name: 'Public',
  },
  {
    path: '/cb',
    name: 'Callback',
    beforeEnter(to, from, next) {
      console.log(to, from);
      Auth.complete();
      next('/');
    },
    redirect: '/',
  },
  {
    path: '/logout',
    name: 'Logout',
    beforeEnter(to, from, next) {
      Auth.logout();
      next();
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!Auth.loggedIn()) {
      const res = await Auth.login();
      console.log(res, 'Auth login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
