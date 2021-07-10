// This Storage Module is for Users individual data & preferences

import { make } from 'vuex-pathify'

const getDefaultState = () => {
  return {
    hideObtained: false,
    neededTotals: false,
  	teammates: {},
    hideTeammates: [],
  	useTeammates: false,
    useTeamObjectives: false,
    streamerMode: false,

    questViewTab: 0,
    questMapTab: 0,
    questTraderTab: 0,

    onlyKappa: false,
    onlyLevels: false,
    primarySort: 0,
    teamSort: 0,

  }
}

const state = getDefaultState()

const mutations = {

  ...make.mutations(getDefaultState()),

  write_teamshare (state, teamshare) {
    state.teammates = { ...state.teammates, [teamshare.name]: teamshare }
  },

  delete_teamshare (state, name) {
    delete state.teammates[name]
    state.teammates = { ...state.teammates }
  },

  reset_state (state) {
    Object.assign(state, getDefaultState())
  },
}

const actions = {}

const getters = {

  ...make.getters(getDefaultState()),

	get_static_teammates: (state) => {
	    return Object.values(state.teammates) || {}
	},

	get_static_teammate: (state) => (name) => {
	    if (name in state.teammates) {
	      return state.teammates[name]
	    } else {
	      return false
	   	}
	},

  get_hidden_teammates: (state) => {
    if (state && 'hideTeammates' in state) {
      return state.hideTeammates
    } else {
      return []
    }
  },
}

export default {
  namespaced: true,
  state () {
    return getDefaultState()
  },
  mutations,
  actions,
  getters,
}
