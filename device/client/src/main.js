import { createApp } from 'vue';
import '@popperjs/core';
import 'bootstrap';
import './styles/custom.scss';
import './styles/style.scss';

import App from './App.vue';
import router from './router';
import i18n from './locales';

createApp(App).use(router).use(i18n).mount('#app');
