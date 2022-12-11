import { defineStore } from 'pinia'
import { watch } from 'vue'
import { fireuser } from '@/plugins/firebase'

export const defaultState = {
  tokens: [],
  team: null,
}

// Getters are for reading store state in a uniform manner
export const getters = {
  // The tokens the user has
  userTokens: (state) => { return state.tokens || [] },
  // The number of tokens the user has
  userTokenCount: (state) => { return state.tokens?.length || 0 },
  // The uid of the team the user is in
  userTeam: (state) => { return state.team || null },
  // Whether the user's team is their own (uid == team)
  userTeamIsOwn: (state) => { return state.team == fireuser.uid || false },
}

// Actions are for mutations and setters
export const actions = {}

export const useSystemStore = defineStore('firesystem', {
  // Use the shared default state
  state: () => (JSON.parse(JSON.stringify(defaultState))),
  getters: getters,
  actions: actions,
  fireswap: [
    {
      // The JSON path of the store to bind to
      path: '.',
      // {uid} will be replaced by the current auth'ed user's uid on bind 
      document: 'system/{uid}',
      // The number of miliseconds to debounce changes to the firestore document
      debouncems: 250,
      // The local storage key to persist the store to when unbound
      localKey: 'system',
    }
  ]
}
)

// Watch for fireuser state changing and bind/unbind the remoteTarkov store
watch(
  () => fireuser.loggedIn,
  (newValue) => {
    const systemStore = useSystemStore()
    if (newValue) {
      if (typeof systemStore.firebindAll === 'function') {
        console.log("Bound remoteSystem store")
        systemStore.firebindAll()
      } else {
        console.log("No remoteSystem store to bind")
      }
    } else {
      if (typeof systemStore.fireunbindAll === 'function') {
        console.log("Unbound remoteSystem store")
        systemStore.fireunbindAll()
      } else {
        console.log("No remoteSystem store to unbind")
      }
    }
  },
  { immediate: true }
)