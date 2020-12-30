/* eslint-disable no-param-reassign */
import { createStore, createLogger } from 'vuex';
import { vuexOidcCreateStoreModule } from 'vuex-oidc';
import oidcSettings from '../config/oidc';

const debug = process.env.NODE_ENV !== 'production';

// Estado inicial
const initialState = () => ({
});

// Obtém conjuntos personalizados
const getters = {};

// Ações
const actions = {};

// Mutações
const mutations = {};

// Criar depósito
export default createStore({
  modules: {
    auth: vuexOidcCreateStoreModule(oidcSettings, {
      namespaced: true,
      dispatchEventsOnWindow: true,
    }, {
      userLoaded: (user) => console.info('OIDC user is loaded:', user),
      userUnloaded: () => console.info('OIDC user is unloaded'),
      accessTokenExpiring: () => console.info('Access token will expire'),
      accessTokenExpired: () => console.info('Access token did expire'),
      silentRenewError: () => console.info('OIDC user is unloaded'),
      userSignedOut: () => console.info('OIDC user is signed out'),
      oidcError: (payload) => console.info('OIDC error', payload),
      automaticSilentRenewError: (payload) => console.info('OIDC automaticSilentRenewError', payload),
    }),
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
  state: initialState,
  getters,
  actions,
  mutations,
});
