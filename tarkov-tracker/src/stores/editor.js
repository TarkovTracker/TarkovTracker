import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

// The editor pinia store. Used to keep editor state
export const useEditorStore = defineStore('editor', {
  state: () => ({
    // The initial state of the store
    objectiveMaps: useStorage('editor_objectiveMaps', {}),
  }),
  getters: {
    // State getters
    getObjectiveMaps(state) {
      return (objectiveId) => state.objectiveMaps[objectiveId] || []
    },

    getObjectiveMapsFull(state) {
      return state.objectiveMaps || {}
    }
  },
  actions: {
    // State mutations or setters
    setObjectiveMaps(objectiveId, maps) {
      this.objectiveMaps[objectiveId] = maps
    },

    // State reset function
    reset() {
      this.resetObjectiveMaps()
    },

    // objectiveMaps reset function
    resetObjectiveMaps() {
      this.objectiveMaps = {}
    }
  }
})