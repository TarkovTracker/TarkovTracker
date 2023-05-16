import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

// The 'app' Pinia Store. Used to keep global app state
export const useAppStore = defineStore("app", {
  state: () => ({
    // The initial state of the store
    drawerRail: useStorage("app_drawerRail", false),
    drawerShow: null,
    localeOverride: useStorage("app_localeOverride", null),
  }),
  getters: {
    // State getters
    drawerUseRail(state) {
      return (mdAndDown) => !mdAndDown && state.drawerRail;
    },
  },
  actions: {
    // State mutations or setters
  },
});
