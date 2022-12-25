import { defineStore } from 'pinia'
import { watch } from 'vue'
import { fireuser } from '@/plugins/firebase'

export const defaultState = {
  allTipsHidden: false,
  hideTips: {},
  streamerMode: false,
  teamHide: {},
  questTeamHideAll: false,
  itemsTeamHideAll: false,
  mapTeamHideAll: false,
  taskPrimaryView: null,
  taskMapView: null,
  taskTraderView: null,
  taskSecondaryView: null,
  taskUserView: null,
}

// Getters are for reading store state in a uniform manner
export const getters = {
  // The tokens the user has
  showTip: (state) => { return (tipKey) => !state.allTipsHidden && !state.hideTips?.[tipKey] },
  hiddenTipCount: (state) => {
    if (!state.hideTips) {
      return 0
    } else {
      return Object.keys(state.hideTips).length
    }
  },
  hideAllTips: (state) => { return state.allTipsHidden || false },
  getStreamerMode(state) {
    return state.streamerMode || false
  },
  teamIsHidden: (state) => { return (teamId) => state.questTeamHideAll || state.teamHide?.[teamId] || false },
  questTeamAllHidden: (state) => { return state.questTeamHideAll || false },
  itemsTeamAllHidden: (state) => { return state.itemsTeamHideAll || false },
  mapTeamAllHidden: (state) => { return state.mapTeamHideAll || false },
  getTaskPrimaryView: (state) => { return state.taskPrimaryView || 'all' },
  getTaskMapView: (state) => { return state.taskMapView || 'all' },
  getTaskTraderView: (state) => { return state.taskTraderView || 'all' },
  getTaskSecondaryView: (state) => { return state.taskSecondaryView || 'available' },
  getTaskUserView: (state) => { return state.taskUserView || 'all' },
}

// Actions are for mutations and setters
export const actions = {
  hideTip(tipKey) {
    if (!this.hideTips) {
      this.hideTips = {}
    }
    this.hideTips[tipKey] = true
  },

  unhideTips() {
    this.hideTips = {}
    this.allTipsHidden = false
  },

  enableHideAllTips() {
    this.allTipsHidden = true
  },

  setStreamerMode(mode) {
    this.streamerMode = mode
  },

  toggleHidden(teamId) {
    if (!this.teamHide) {
      this.teamHide = {}
    }
    if (this.teamHide?.[teamId]) {
      this.teamHide[teamId] = false
    } else {
      this.teamHide[teamId] = true
    }
  },

  setQuestTeamHideAll(hide) {
    this.questTeamHideAll = hide
  },

  setItemsTeamHideAll(hide) {
    this.itemsTeamHideAll = hide
  },

  setMapTeamHideAll(hide) {
    this.mapTeamHideAll = hide
  },

  setTaskPrimaryView(view) {
    this.taskPrimaryView = view
  },

  setTaskMapView(view) {
    this.taskMapView = view
  },

  setTaskTraderView(view) {
    this.taskTraderView = view
  },

  setTaskSecondaryView(view) {
    this.taskSecondaryView = view
  },

  setTaskUserView(view) {
    this.taskUserView = view
  }
}

export const useUserStore = defineStore('swapUser', {
  // Use the shared default state
  state: () => (JSON.parse(JSON.stringify(defaultState))),
  getters: getters,
  actions: actions,
  fireswap: [
    {
      // The JSON path of the store to bind to
      path: '.',
      // {uid} will be replaced by the current auth'ed user's uid on bind 
      document: 'user/{uid}',
      // The number of miliseconds to debounce changes to the firestore document
      debouncems: 250,
      // The local storage key to persist the store to when unbound
      localKey: 'user',
    }
  ]
}
)

// Watch for fireuser state changing and bind/unbind the remoteTarkov store
watch(
  () => fireuser.loggedIn,
  (newValue) => {
    const userStore = useUserStore()
    if (newValue) {
      if (typeof userStore.firebindAll === 'function') {
        console.debug("Bound remoteUser store")
        userStore.firebindAll()
      } else {
        console.debug("No remoteUser store to bind")
      }
    } else {
      if (typeof userStore.fireunbindAll === 'function') {
        console.debug("Unbound remoteUser store")
        userStore.fireunbindAll()
      } else {
        console.debug("No remoteUser store to unbind")
      }
    }
  },
  { immediate: true }
)