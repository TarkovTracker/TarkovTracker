// Pathify
import { make } from 'vuex-pathify'

// Data
const state = {
  dark: true,
  mini: false,
  drawer: null,
  user_auth: null,
}

const mutations = {
	...make.mutations(state),
	// ANY MODIFICATIONS TO USER AUTH NEED TO BE EXCLUDED FROM VUEX PERSIST STORAGE
	set_user_auth (state, user) {
		state.user_auth = { ...user }
	},

	clear_user_auth (state) {
		state.user_auth = null
	},
}

const actions = {}

const getters = {
  ...make.getters(state),

  get_user_auth_uid: (state) => {
      if (state.user_auth && state.user_auth.uid) {
        return state.user_auth.uid
      } else {
        return null
      }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
