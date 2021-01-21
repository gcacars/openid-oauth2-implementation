import { createI18nPlugin, useI18nPlugin } from '@unify/vuex-i18n';
import ptBR from './pt-BR';

function mountLocales(store) {
  const plugin = createI18nPlugin(store, {
    moduleName: 'i18n',
    onTranslationNotFound: (locale, key) => `${locale}[${key}]`,
  });

  const i18n = useI18nPlugin();
  i18n.add('pt_BR', ptBR);
  i18n.set('pt_BR');

  return plugin;
}

export default mountLocales;
