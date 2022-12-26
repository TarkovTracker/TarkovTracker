import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

// The editor pinia store. Used to keep editor state
export const useEditorStore = defineStore('editor', {
  state: () => ({
    // The initial state of the store
    objectiveMaps: useStorage('editor_objectiveMaps', {}),
    alternativeTasks: useStorage('editor_alternativeTasks', {}),
  }),
  getters: {
    // State getters
    getObjectiveMaps(state) {
      return (objectiveId) => state.objectiveMaps[objectiveId] || []
    },

    getObjectiveMapsFull(state) {
      return state.objectiveMaps || {}
    },

    getAlternativeTasks(state) {
      return (taskId) => state.alternativeTasks[taskId] || {}
    },

    getAlternativeTasksFull(state) {
      return state.alternativeTasks || {}
    }
  },
  actions: {
    // State mutations or setters
    setObjectiveMaps(objectiveId, maps) {
      this.objectiveMaps[objectiveId] = maps
    },

    setAlternativeTasks(taskId, tasks) {
      this.alternativeTasks[taskId] = tasks
    },

    // State reset function
    reset() {
      this.resetObjectiveMaps()
      this.resetAlternativeTasks()
    },

    // objectiveMaps reset function
    resetObjectiveMaps() {
      this.objectiveMaps = {}
    },

    resetAlternativeTasks() {
      this.alternativeTasks = {}
    }
  }
})