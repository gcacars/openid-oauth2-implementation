/* eslint-disable no-param-reassign */
const initialState = () => ({
  authenticate: {},
  device: {},
});
const getters = {};
const actions = {
  setInteractionResponse({ commit }, itx) {
    commit('addInteraction', itx);
  },
  finishInteraction({ commit }, uid) {
    commit('removeInteraction', uid);
  },
  setDeviceResponse({ commit }, res) {
    commit('addDeviceInteraction', res);
  },
  confirmDevice({ commit }, code) {
    commit('removeDeviceInteraction', code);
  },
};
const mutations = {
  addInteraction(state, itx) {
    state.authenticate = itx;
  },
  removeInteraction(state) {
    state.authenticate = {};
  },
  addDeviceInteraction(state, res) {
    const code = res.userCode;
    state.device[code] = res;
  },
  removeDeviceInteraction(state, code) {
    delete state.device[code];
  },
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};
