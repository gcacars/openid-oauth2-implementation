/* eslint-disable no-param-reassign */
import { createStore, createLogger } from 'vuex';

const debug = process.env.NODE_ENV !== 'production';
let maxId = 0;

// Estado inicial
const initialState = () => ({
  toasts: [],
});

// Obtém conjuntos personalizados
const getters = {};

// Ações
const actions = {
  addToast({ commit, state }, toast) {
    // Checar se é único
    const exists = state.toasts.find((t) => t.title === toast.title
      && t.subtitle === toast.subtitle
      && t.message === toast.message);

    if (exists) {
      // Verifica se o tempo total de exibição é menor que 15s
      if (Date.now() - exists.created < 15000) {
        // se sim, aumenta o tempo restante
        clearTimeout(exists.st);
        exists.st = setTimeout((id) => {
          commit('removeToast', id);
        }, exists.timeout, exists.id);
      }

      // Aumenta a quantidade de vezes que essa mensagem foi enviada
      exists.tries += 1;
      return;
    }

    maxId += 1;

    const fullToast = {
      // timeout padrão de 5s
      timeout: 5000,
      ...toast,
      id: maxId,
      tries: 1,
      created: Date.now(),
    };

    fullToast.st = setTimeout((id) => {
      commit('removeToast', id);
    }, fullToast.timeout, maxId);

    commit('pushToast', fullToast);
  },

  removeToast({ commit }, id) {
    commit('removeToast', id);
  },
};

// Mutações
const mutations = {
  pushToast(state, toast) {
    state.toasts.push(toast);
  },

  removeToast(state, id) {
    state.toasts = state.toasts.filter((t) => t.id !== id);
  },
};

// Criar depósito
export default createStore({
  modules: {
  },
  strict: false, // debug,
  plugins: debug ? [createLogger()] : [],
  state: initialState,
  getters,
  actions,
  mutations,
});
