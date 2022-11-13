import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { fireuser } from '@/plugins/firebase'

const defaultState = {
  level: 1,
  gameEdition: 1,
  streamerMode: false,
}

let getters = {
  // State getters
  playerLevel(state) {
    return state.level
  },

  getGameEdition(state) {
    return state.gameEdition
  },

  getStreamerMode(state) {
    return state.streamerMode
  }
}

let actions = {
  // State mutations or setters
  incrementLevel() {
    this.level++
    
  },
  
  decrementLevel() {
    this.level--
  },

  setGameEdition(edition) {
    this.gameEdition = edition
  },

  setStreamerMode(mode) {
    this.streamerMode = mode
  }
}

const useRemoteTarkovStore = defineStore('remoteTarkov', {
  // Use the shared default state
  state: () => (JSON.parse(JSON.stringify(defaultState))),
  getters: getters,
  actions: actions,
  firestore: [
      {
        path: 'account.save',
        // {uid} will be replaced by the current auth'ed user's uid on bind 
        document: 'progress/{uid}',
        // The number of miliseconds to debounce changes to the firestore document
        debouncems: 250,
      }
    ]
  }
)

const useLocalTarkovStore = defineStore('localTarkov', {
  // Use the shared default state
  state: () => (JSON.parse(JSON.stringify(defaultState))),
  // Create a new copy of the getters and actions
  getters: getters,
  actions: actions,
  persist: {
    // Persist the local version in localstore under this key
    key: 'localTarkov',
  }
})

// Watch for fireuser state changing and bind/unbind the remoteTarkov store
watch(
  () => fireuser.loggedIn,
  (newValue) => {
    const remoteTarkovStore = useRemoteTarkovStore()
    if(newValue) {
      console.log("Bound remoteTarkov store")
      remoteTarkovStore.firebind()
    }else{
      console.log("Unbound remoteTarkov store")
      remoteTarkovStore.fireunbind()
    }
  },
  // Immediately trigger the watch
  { immediate: true }
)

// Select the store to utilize based on the current user's state
const whichStore = computed(() => {
  const remoteTarkovStore = useRemoteTarkovStore()
  const localTarkovStore = useLocalTarkovStore()
  return fireuser.loggedIn ? remoteTarkovStore : localTarkovStore
})


// Export the selected store as a function which looks like normal pinia usage
export function useTarkovStore() {return whichStore}