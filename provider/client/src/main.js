import { createApp } from 'vue';
import '@popperjs/core';
import 'bootstrap';
import './styles/custom.scss';
import './styles/style.scss';

import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);
app.config.devtools = true;
app.use(router);
app.use(store);
app.mount('#app');

if (process.env.NODE_ENV === 'development') {
  if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) {
    // eslint-disable-next-line no-underscore-dangle
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}
