import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import '@popperjs/core';
import 'bootstrap';
import './styles/custom.scss';
import './styles/style.scss';

import App from './App.vue';
import router from './router';
import localPtBr from './locales/pt_BR';

const i18n = createI18n({
  locale: 'pt_BR',
  fallbackLocale: 'en',
  messages: {
    pt_BR: localPtBr,
  },
});

createApp(App).use(router).use(i18n).mount('#app');
