import { createI18n } from 'vue-i18n';

const messages = {};
const availableLocales = ['pt_BR', 'en'];

// Check preference
let lang = window.localStorage.getItem('lang');
if (!lang) lang = window.navigator.language.replace('-', '_');
if (!lang || !availableLocales.includes(lang)) lang = 'pt_BR';

let langMessages;

(async () => {
  langMessages = await import(`./${lang}`);
  messages[lang] = langMessages.default;
})();

const i18n = createI18n({
  locale: 'pt_BR',
  fallbackLocale: {
    pt: ['pt_BR'],
    en_US: ['en'],
    default: ['en', 'pt_BR'],
  },
  messages,
});

export default i18n;
