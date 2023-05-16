import { defineStore } from "pinia";
import { watch } from "vue";
import { fireuser } from "@/plugins/firebase";
import { getters, actions, defaultState } from "@/shared_state.js";

export const useTarkovStore = defineStore("swapTarkov", {
  // Use the shared default state
  state: () => JSON.parse(JSON.stringify(defaultState)),
  getters: getters,
  actions: actions,
  fireswap: [
    {
      // The JSON path of the store to bind to
      path: ".",
      // {uid} will be replaced by the current auth'ed user's uid on bind
      document: "progress/{uid}",
      // The number of miliseconds to debounce changes to the firestore document
      debouncems: 250,
      // The local storage key to persist the store to when unbound
      localKey: "progress",
    },
  ],
});

// Watch for fireuser state changing and bind/unbind the remoteTarkov store
watch(
  () => fireuser.loggedIn,
  (newValue) => {
    const tarkovStore = useTarkovStore();
    if (newValue) {
      if (typeof tarkovStore.firebindAll === "function") {
        console.debug("Bound remoteTarkov store");
        tarkovStore.firebindAll();
      } else {
        console.debug("No remoteTarkov store to bind");
      }
    } else {
      if (typeof tarkovStore.fireunbindAll === "function") {
        console.debug("Unbound remoteTarkov store");
        tarkovStore.fireunbindAll();
      } else {
        console.debug("No remoteTarkov store to unbind");
      }
    }
  },
  { immediate: true }
);
