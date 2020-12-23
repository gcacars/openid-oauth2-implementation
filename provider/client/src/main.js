import { createApp } from 'vue';
// import bootstrap from 'bootstrap';
import './styles/custom.scss';
import './styles/style.scss';

import App from './App.vue';
import router from './router'

const app = createApp(App);
app.config.devtools = true;
app.use(router).mount('#app');

if (process.env.NODE_ENV === 'development') {
  if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}
