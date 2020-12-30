import { createApp } from 'vue';
import '@popperjs/core';
import 'bootstrap';
import './styles/custom.scss';
import './styles/style.scss';

import router from './router';
import store from './store';
import App from './App.vue';

createApp(App).use(router(store)).use(store).mount('#app');
