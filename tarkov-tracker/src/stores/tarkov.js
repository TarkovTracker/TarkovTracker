import { defineStore } from 'pinia'
import {  watch} from 'vue'
import { fireuser } from '@/plugins/firebase'
//import { set } from 'lodash-es'

const defaultState = {
  testPath: {
    test: 'test',
    level: 1
  },
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
    this.testPath.level++
  },
  
  decrementLevel() {
    this.level--
    this.testPath.level--
  },

  setGameEdition(edition) {
    this.gameEdition = edition
  },

  setStreamerMode(mode) {
    this.streamerMode = mode
  }
}

export const useTarkovStore = defineStore('swapTarkov', {
  // Use the shared default state
  state: () => (JSON.parse(JSON.stringify(defaultState))),
  getters: getters,
  actions: actions,
  fireswap: [
    {
        // The JSON path of the store to bind to
        path: '.',
        // {uid} will be replaced by the current auth'ed user's uid on bind 
        document: 'progress/{uid}',
        // The number of miliseconds to debounce changes to the firestore document
        debouncems: 250,
        // The local storage key to persist the store to when unbound
        localKey: 'progress',
    }
    ]
  }
)

// const useLocalTarkovStore = defineStore('localTarkov', {
//   // Use the shared default state
//   state: () => (JSON.parse(JSON.stringify(defaultState))),
//   // Create a new copy of the getters and actions
//   getters: getters,
//   actions: actions,
//   persist: {
//     // Persist the local version in localstore under this key
//     key: 'localTarkov',
//   }
// })

// Watch for fireuser state changing and bind/unbind the remoteTarkov store
watch(
  () => fireuser.loggedIn,
  (newValue) => {
    const tarkovStore = useTarkovStore()
    if(newValue) {
      if (typeof tarkovStore.firebindAll === 'function') {
        console.log("Bound remoteTarkov store")
        tarkovStore.firebindAll()
      } else {
        console.log("No remoteTarkov store to bind")
      }
    }else{
      if (typeof tarkovStore.fireunbindAll === 'function') {
        console.log("Unbound remoteTarkov store")
        tarkovStore.fireunbindAll()
      } else {
        console.log("No remoteTarkov store to unbind")
      }
    }
  },
)



// Select the store to utilize based on the current user's state

// Export the selected store as a function which looks like normal pinia usage
// export function useTarkovStore() {return computed(() => {
//   return fireuser.loggedIn ? usetarkovStore() : useLocalTarkovStore()
// })
// }