import { computed, ref, watch } from "vue";
import { fireuser, fireapp } from "@/plugins/firebase";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { defineStore, storeToRefs } from "pinia";
import { getters, actions, defaultState } from "@/shared_state.js";
import { useTarkovStore } from "@/stores/tarkov";
import { useUserStore } from "@/stores/user";

const firedb = fireapp.firestore();

const useSystemStore = defineStore("system", {
  state: () => ({}),
  getters: {
    // The tokens the user has
    userTokens() {
      return this.$state?.tokens || [];
    },
    // The number of tokens the user has
    userTokenCount() {
      return this.$state?.tokens?.length || 0;
    },
    // The uid of the team the user is in
    userTeam() {
      return this.$state?.team || null;
    },
    // Whether the user's team is their own (uid == team)
    userTeamIsOwn() {
      return this.$state?.team == fireuser.uid || false;
    },
  },
});

const systemStore = useSystemStore();
const userStore = useUserStore();

const systemRef = computed(() => {
  if (fireuser.loggedIn) {
    return doc(collection(firedb, "system"), fireuser.uid);
  } else {
    return null;
  }
});

const systemUnsubscribe = ref(null);

function clearState(store, newState) {
  try {
    // Find all of the properties that are missing from store.$state that exist in newState
    const missingProperties = Object.keys(store.$state).filter((key) => {
      if (typeof newState === "undefined") return true;
      try {
        let missingKey = !Object.hasOwn(newState, key);
        return missingKey;
      } catch (error) {
        console.error(error);
        return true;
      }
    });
    // Create a new object with the missing properties set to null
    const missingPropertiesObject = missingProperties.reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});
    store.$patch(missingPropertiesObject);
  } catch (error) {
    console.error(error);
  }
}

function startStoreWatcher(store, ref, unsubscribe) {
  return watch(
    ref,
    async (newRef) => {
      // Start listening to the new systemRef
      if (newRef) {
        if (unsubscribe?.value) {
          console.debug("Unsubscribing from", store.$id);
          unsubscribe.value();
          clearState(store, {});
        }
        console.debug(`Ref changed to ${newRef.path} for ${store.$id}`);
        unsubscribe.value = onSnapshot(
          newRef,
          (snapshot) => {
            console.debug(`${store.$id} data changed`);
            const snapshotData = snapshot.data();
            store.$patch(snapshotData);
            clearState(store, snapshotData);
          },
          (error) => {
            if (error.code == "permission-denied" && unsubscribe.value) {
              console.debug(
                "Unsubscribing from",
                store.$id,
                "due to permission denied"
              );
              unsubscribe.value();
              clearState(store, {});
            }
          }
        );
      } else {
        if (unsubscribe?.value) {
          console.debug("Unsubscribing from", store.$id);
          unsubscribe.value();
        }
        console.debug(`Ref changed to null for ${store.$id}`);
        clearState(store, {});
      }
    },
    { immediate: true }
  );
}

startStoreWatcher(systemStore, systemRef, systemUnsubscribe);

const teamRef = computed(
  () => {
    if (fireuser.loggedIn) {
      if (systemStore.userTeam && typeof systemStore.userTeam == "string") {
        console.debug("Team ref now " + systemStore.userTeam);
        return doc(collection(firedb, "team"), systemStore.userTeam);
      } else {
        console.debug("Team ref now null");
        return null;
      }
    } else {
      console.debug("Team ref now null");
      return null;
    }
  },
  { immediate: true }
);
const teamUnsubscribe = ref(null);
const useTeamStore = defineStore("team", {
  state: () => {
    return {};
  },
  getters: {
    // The owner of the team
    teamOwner() {
      return this.$state?.owner || null;
    },
    isOwner() {
      return this.$state?.owner == fireuser.uid || false;
    },
    teamPassword() {
      return this.$state?.password || null;
    },
    teamMembers() {
      return this.$state?.members || [];
    },
    teammates() {
      // Return the members of the team, but without the current user
      if (this.$state?.members) {
        return this.$state.members.filter((member) => {
          return member != fireuser.uid;
        });
      } else {
        return [];
      }
    },
  },
});
const teamStore = useTeamStore();
startStoreWatcher(teamStore, teamRef, teamUnsubscribe);

const teammateUnsubscribes = ref({});
const teammateStores = ref({});
const { teammates } = storeToRefs(teamStore);
watch(
  teammates,
  async (newTeammates) => {
    // Remove any teammates that are no longer in the team
    for (const teammate of Object.keys(teammateStores.value)) {
      if (!newTeammates.includes(teammate)) {
        console.debug("Removing teammate", teammate);
        if (teammateUnsubscribes.value[teammate]) {
          teammateUnsubscribes.value[teammate]();
        }
        delete teammateStores.value[teammate];
      }
    }
    // Add any new teammates
    try {
      if (Array.isArray(newTeammates)) {
        for (const teammate of newTeammates) {
          if (!teammateStores.value[teammate]) {
            console.debug("Adding teammate", teammate);
            teammateStores.value[teammate] = defineStore(
              `teammate-${teammate}`,
              {
                state: () => JSON.parse(JSON.stringify(defaultState)),
                getters: getters,
                actions: actions,
              }
            );
            teammateUnsubscribes.value[teammate] = onSnapshot(
              doc(firedb, "progress", teammate),
              (snapshot) => {
                console.debug(
                  `${teammateStores.value[teammate].$id} data changed`
                );
                const snapshotData = snapshot.data();
                const teammateStore = teammateStores.value[teammate]();
                teammateStore.$patch(snapshotData);
                clearState(teammateStore, snapshotData);
              },
              (error) => {
                if (
                  error.code == "permission-denied" &&
                  teammateUnsubscribes.value[teammate]
                ) {
                  console.debug(
                    "Unsubscribing from",
                    teammateStores.value[teammate].$id,
                    "due to permission denied"
                  );
                  teammateUnsubscribes.value[teammate]();
                }
              }
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  { immediate: true }
);

const useProgressStore = defineStore("progress", () => {
  const teamStores = computed(() => {
    let stores = {};
    stores["self"] = useTarkovStore();
    for (const teammate of Object.keys(teammateStores.value)) {
      stores[teammate] = teammateStores.value[teammate]();
    }
    return stores;
  });

  const visibleTeamStores = computed(() => {
    let visibleStores = {};
    if (this?.teamStores) {
      Object.entries(this.teamStores).forEach(([teamId, store]) => {
        if (!userStore.teamIsHidden(teamId)) {
          visibleStores[teamId] = store;
        }
      });
    }
    return visibleStores;
  });

  const getTeamIndex = function (teamId) {
    if (teamId == fireuser.uid) {
      return "self";
    } else {
      return teamId;
    }
  };

  const getDisplayName = function (teamId) {
    return (
      this.teamStores[this.getTeamIndex(teamId)].getDisplayName ||
      teamId.substring(0, 6)
    );
  };

  const getLevel = function (teamId) {
    return this.teamStores[this.getTeamIndex(teamId)].playerLevel || 1;
  };

  return {
    teamStores,
    getDisplayName,
    getTeamIndex,
    visibleTeamStores,
    getLevel,
  };
});

// We keep the state outside of the function so that it acts as a singleton
export function useLiveData() {
  return {
    useTeamStore,
    useSystemStore,
    useProgressStore,
    teammateStores,
  };
}
