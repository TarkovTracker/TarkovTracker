// This Storage Module is for User's progress and other data that may be shared in a team or via a public endpoint
import { make } from 'vuex-pathify'

const getDefaultState = () => {
  return {
    quests: {},
    objectives: {},
    hideout: {},
    hideoutObjectives: {},
    shareName: null,
    dataVersion: 1,
    level: 71,
    gameEdition: 3,
  }
}

const mutations = {

  ...make.mutations(getDefaultState()),

  complete_quest (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.quests)) {
        state.quests = { ...state.quests, [x]: {} }
      }
      state.quests[x] = { ...state.quests[x], complete: true }
      state.quests[x] = { ...state.quests[x], timeComplete: new Date().getTime() }
    })
  },

  uncomplete_quest (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.quests)) {
        state.quests = { ...state.quests, [x]: {} }
      }
      state.quests[x] = { ...state.quests[x], complete: false }
      state.quests[x] = { ...state.quests[x], timeComplete: null }
    })
  },

  fail_quest (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.quests)) {
        state.quests = { ...state.quests, [x]: {} }
      }
      state.quests[x] = { ...state.quests[x], failed: true }
      state.quests[x] = { ...state.quests[x], complete: true }
      state.quests[x] = { ...state.quests[x], timeComplete: new Date().getTime() }
    })
  },

  unfail_quest (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.quests)) {
        state.quests = { ...state.quests, [x]: {} }
      }
      state.quests[x] = { ...state.quests[x], failed: false }
      state.quests[x] = { ...state.quests[x], complete: false }
      state.quests[x] = { ...state.quests[x], timeComplete: null }
    })
  },

  complete_objective (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.objectives)) {
        state.objectives = { ...state.objectives, [x]: {} }
      }
      state.objectives[x] = { ...state.objectives[x], complete: true }
      state.objectives[x] = { ...state.objectives[x], timeComplete: new Date().getTime() }
    })
  },

  uncomplete_objective (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.objectives)) {
        state.objectives = { ...state.objectives, [x]: {} }
      }
      state.objectives[x] = { ...state.objectives[x], complete: false }
      state.objectives[x] = { ...state.objectives[x], timeComplete: null }
    })
  },

  set_objective_have (state, { id, amount }) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    if (!Array.isArray(amount)) {
      amount = [amount]
    }
    id.forEach((x, y) => {
      if (!(x in state.objectives)) {
        state.objectives = { ...state.objectives, [x]: {} }
      }
      state.objectives[x].have = amount[y]
    })
  },

  increase_objective_have (state, { id, amount }) {
    if (!(id in state.objectives)) {
      state.objectives[id] = {}
      state.objectives[id].have = amount
    } else {
      state.objectives[id].have += amount
    }
  },

  decrease_objective_have (state, { id, amount }) {
    if (!(id in state.objectives)) {
      state.objectives[id] = {}
      state.objectives[id].have = 0
    } else {
      state.objectives[id].have += -amount
      if (state.objectives[id].have < 0) {
        state.objectives[id].have = 0
      }
    }
  },

  complete_hideout (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.hideout)) {
        state.hideout[x] = {}
      }
      state.hideout[x].complete = true
      state.hideout[x].timeComplete = new Date().getTime()
    })
  },

  uncomplete_hideout (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.hideout)) {
        state.hideout[x] = {}
      }
      state.hideout[x].complete = false
      state.hideout[x].timeComplee = null
    })
  },

  complete_hideout_objective (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.hideoutObjectives)) {
        state.hideoutObjectives[x] = {}
      }
      state.hideoutObjectives[x].complete = true
      state.hideoutObjectives[x].timeComplete = new Date().getTime()
    })
  },

  uncomplete_hideout_objective (state, id) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    id.forEach((x, y) => {
      if (!(x in state.hideoutObjectives)) {
        state.hideoutObjectives[x] = {}
      }
      state.hideoutObjectives[x].complete = false
      state.hideoutObjectives[x].timeComplete = null
    })
  },

  set_hideout_objective_have (state, { id, amount }) {
    if (!Array.isArray(id)) {
      id = [id]
    }
    if (!Array.isArray(amount)) {
      amount = [amount]
    }
    id.forEach((x, y) => {
      if (!(x in state.hideoutObjectives)) {
        state.hideoutObjectives[x] = {}
      }
      state.hideoutObjectives[x].have = amount[y]
    })
  },

  increase_hideout_objective_have (state, { id, amount }) {
    if (!(id in state.hideoutObjectives)) {
      state.hideoutObjectives[id] = {}
      state.hideoutObjectives[id].have = amount
    } else {
      state.hideoutObjectives[id].have += amount
    }
  },

  decrease_hideout_objective_have (state, { id, amount }) {
    if (!(id in state.hideoutObjectives)) {
      state.hideoutObjectives[id] = {}
      state.hideoutObjectives[id].have = 0
    } else {
      state.hideoutObjectives[id].have += -amount
      if (state.hideoutObjectives[id].have < 0) {
        state.hideoutObjectives[id].have = 0
      }
    }
  },

  set_data_version (state, version) {
    state.dataVersion = version
  },

  import_progress (state, progress) {
    Object.keys(progress).forEach((key) => {
      if (state[key]) {
        state[key] = progress[key]
      }
    })
  },

  reset_state (state) {
    Object.assign(state, getDefaultState())
  },
}

const getters = {

  ...make.getters(getDefaultState()),

  quests_array: (state) => {
    if (state && 'quests' in state) {
      return Object.values(state.quests)
    } else {
      return []
    }
  },

  objectives_array: (state) => {
    if (state && 'objectives' in state) {
      return Object.values(state.objectives)
    } else {
      return []
    }
  },

  hideout_array: (state) => {
    if (state && 'hideout' in state) {
      return Object.values(state.hideout)
    } else {
      return []
    }
  },

  hideout_objectives_array: (state) => {
    if (state && 'hideoutObjectives' in state) {
      return Object.values(state.hideoutObjectives)
    } else {
      return []
    }
  },

  quest_complete: (state) => (id) => {
    if (state && 'quests' in state && id in state.quests && 'complete' in state.quests[id]) {
      return state.quests[id].complete
    } else {
      return false
    }
  },

  quest_time_complete: (state) => (id) => {
    if (state && 'quests' in state && id in state.quests && 'timeComplete' in state.quests[id]) {
      return state.quests[id].timeComplete
    } else {
      return null
    }
  },

  objective_complete: (state) => (id) => {
    if (state && 'objectives' in state && id in state.objectives && 'complete' in state.objectives[id]) {
      return state.objectives[id].complete
    } else {
      return false
    }
  },

  objective_time_complete: (state) => (id) => {
    if (state && 'objectives' in state && id in state.objectives && 'timeComplete' in state.objectives[id]) {
      return state.objectives[id].timeComplete
    } else {
      return null
    }
  },

  objective_have: (state) => (id) => {
    if (state && 'objectives' in state && id in state.objectives && 'have' in state.objectives[id]) {
      return state.objectives[id].have
    } else {
      return 0
    }
  },

  hideout_complete: (state) => (id) => {
    if (state && 'hideout' in state && id in state.hideout && 'complete' in state.hideout[id]) {
      return state.hideout[id].complete
    } else {
      return false
    }
  },

  hideout_objective_complete: (state) => (id) => {
    if (state && 'hideoutObjectives' in state && id in state.hideoutObjectives && 'complete' in state.hideoutObjectives[id]) {
      return state.hideoutObjectives[id].complete
    } else {
      return false
    }
  },

  hideout_objective_have: (state) => (id) => {
    if (state && 'hideoutObjectives' in state && id in state.hideoutObjectives && 'have' in state.hideoutObjectives[id]) {
      return state.hideoutObjectives[id].have
    } else {
      return 0
    }
  },

  export_progress: (state) => {
    var stateCopy = JSON.parse(JSON.stringify(state))

    return stateCopy
  },

  export_teamshare: (state, getters) => {
    var teamshareString = ''

    var questStrings = []
    Object.keys(state.quests).forEach((quest) => {
      if (getters.quest_complete(quest)) {
        questStrings.push(quest)
      }
    })
    teamshareString += questStrings.join(',')
    teamshareString += '|'

    var objectiveStrings = []
    Object.keys(state.objectives).forEach((objective) => {
      if (getters.objective_have(objective) > 0) {
        objectiveStrings.push(`${objective}:${getters.objective_complete(objective) ? '1' : '0'}:${getters.objective_have(objective)}`)
      } else if (getters.objective_complete(objective)) {
        objectiveStrings.push(objective)
      }
    })
    teamshareString += objectiveStrings.join(',')
    return teamshareString
  },
}

const actions = {
  import_teamshare ({ commit, state }, teamshare) {
    // Clear everything before importing
    commit('reset_state')
    // quests|objectives
    var sections = teamshare.split('|')

    // quest1,quest2,quest3,quest4
    var quests = sections[0].split(',')
    var questCompletes = []
    quests.forEach((quest) => {
      if (quest && quest != '') {
        questCompletes.push(quest)
      }
    })
    commit('complete_quest', questCompletes)

    var objectives = sections[1].split(',')
    var objectiveCompletes = []
    var objectiveHaves = []
    objectives.forEach((objective) => {
      var objectiveParts = objective.split(':')
      if (objectiveParts[0] && objectiveParts[0] != '') {
        if (objectiveParts.length > 2) {
          // We have completion and have data
          if (objectiveParts[1] == '1') {
            objectiveCompletes.push(objectiveParts[0])
          }
          objectiveHaves.push({ id: objectiveParts[0], have: Number(objectiveParts[2]) })
        } else {
          objectiveCompletes.push(objectiveParts[0])
        }
      }
    })
    commit('complete_objective', objectiveCompletes)
    commit('set_objective_have',
    {
      id: objectiveHaves.map(x => x.id),
      amount: objectiveHaves.map(x => x.have),
    })
  },

  migrations ({ commit, state }, extraState = null) {
    // commit('setName', name);
    // Migrate our progress data to the current format
    if (state.dataVersion == 0) {
      if (extraState.questData && 'quests' in extraState.questData) {
        // Reset everything before we start
        commit('reset_state')
        // For each quest in old quest progress
        var questCompletes = []
        extraState.questData.quests.forEach((x, y) => {
          // If the index was marked as complete, complete it in progress store
          if ('completed' in x && x.completed == true) {
            // commit('complete_quest', y)
            // Add y to the array of quests to complete
            questCompletes.push(y)
          }
        })
        commit('complete_quest', questCompletes)
      }

      if (extraState.questData && 'objectives' in extraState.questData) {
        // For each quest in old quest progress

        var objectiveCompletes = []
        var objectiveHaves = []
        extraState.questData.objectives.forEach((x, y) => {
          // If the index was marked as complete, complete it in progress store
          if ('completed' in x && x.completed == true) {
            objectiveCompletes.push(y)
          }

          if ('have' in x && x.have > 0) {
            objectiveHaves.push({ id: y, have: x.have })
          }
        })
        commit('complete_objective', objectiveCompletes)
        commit('set_objective_have',
        {
          id: objectiveHaves.map(x => x.id),
          amount: objectiveHaves.map(x => x.have),
        })
      }

      if (extraState.hideoutData && 'modules' in extraState.hideoutData) {
        // For each quest in old quest progress
        var hideoutCompletes = []
        extraState.hideoutData.modules.forEach((x, y) => {
          // If the index was marked as complete, complete it in progress store
          if (x && 'completed' in x && x.completed == true) {
            hideoutCompletes.push(y)
          }
        })
        commit('complete_hideout', hideoutCompletes)
      }

      if (extraState.hideoutData && 'objectives' in extraState.hideoutData) {
        // For each quest in old quest progress
        var hideoutObjectivesCompletes = []
        var hideoutObjectivesHaves = []
        extraState.hideoutData.objectives.forEach((x, y) => {
          // If the index was marked as complete, complete it in progress store
          if ('completed' in x && x.completed == true) {
            hideoutObjectivesCompletes.push(y)
          }

          if ('have' in x) {
            hideoutObjectivesHaves.push({ id: y, have: x.have })
          }
        })
        commit('complete_hideout_objective', hideoutObjectivesCompletes)
        commit('set_hideout_objective_have',
          {
            id: hideoutObjectivesHaves.map(x => x.id),
            amount: hideoutObjectivesHaves.map(x => x.have),
          })
      }
      commit('set_data_version', 1)
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
