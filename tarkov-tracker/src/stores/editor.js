import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

// The editor pinia store. Used to keep editor state
export const useEditorStore = defineStore("editor", {
  state: () => ({
    // The initial state of the store
    objectiveMaps: useStorage("editor_objectiveMaps", {}),
    alternativeTasks: useStorage("editor_alternativeTasks", {}),
    objectiveGPS: useStorage("editor_objectiveGPS", {}),
  }),
  getters: {
    // State getters
    getObjectiveMaps(state) {
      return (objectiveId) => state.objectiveMaps[objectiveId] ?? [];
    },

    getObjectiveMapsFull(state) {
      return state.objectiveMaps ?? {};
    },

    getAlternativeTasks(state) {
      return (taskId) => state.alternativeTasks[taskId] ?? {};
    },

    getAlternativeTasksFull(state) {
      return state.alternativeTasks ?? {};
    },

    getObjectiveGPS(state) {
      return (objectiveId) => state.objectiveGPS[objectiveId] ?? null;
    },

    getObjectiveGPSFull(state) {
      return state.objectiveGPS ?? {};
    },
  },
  actions: {
    // State mutations or setters
    setObjectiveMaps(objectiveId, maps) {
      this.objectiveMaps[objectiveId] = maps;
    },

    setAlternativeTasks(taskId, tasks) {
      this.alternativeTasks[taskId] = tasks;
    },

    setObjectiveGPS(objectiveId, gps) {
      this.objectiveGPS[objectiveId] = gps;
    },

    // State reset function
    reset() {
      this.resetObjectiveMaps();
      this.resetAlternativeTasks();
      this.resetObjectiveGPS();
    },

    // objectiveMaps reset function
    resetObjectiveMaps() {
      this.objectiveMaps = {};
    },

    resetAlternativeTasks() {
      this.alternativeTasks = {};
    },

    resetObjectiveGPS() {
      this.objectiveGPS = {};
    },
  },
});
