import { defineStore } from 'pinia'
import { watch } from 'vue'
import { fireuser } from '@/plugins/firebase'

export const defaultState = {
  allTipsHidden: false,
  hideTips: {},
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