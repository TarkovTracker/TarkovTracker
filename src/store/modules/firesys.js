// Pathify
import { make } from 'vuex-pathify'

// Data
const state = {
  team: null,
  tokens: null
}

const mutations = {
	...make.mutations(state)
}

const actions = {}

const getters = {
  ...make.getters(state)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
