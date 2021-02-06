/* eslint-disable camelcase */
import { createI18n } from 'vue-i18n';
import en from './en';
import pt_BR from './pt_BR';

const messages = {
  en,
  pt_BR,
};
const availableLocales = ['pt_BR', 'en'];

// Check preference
let lang = window.localStorage.getItem('lang');
if (!lang) lang = window.navigator.language.replace('-', '_');
if (!lang || !availableLocales.includes(lang)) lang = 'pt_BR';

const i18n = createI18n({
  locale: lang,
  fallbackLocale: {
    pt: ['pt_BR'],
    en_US: ['en'],
    default: ['en', 'pt_BR'],
  },
  messages,
});

export default i18n;
