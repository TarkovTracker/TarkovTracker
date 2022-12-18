import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import { fireuser, fireapp } from '@/plugins/firebase'
import { doc, collection, onSnapshot } from 'firebase/firestore'
import apolloClient from "@/plugins/apollo";
import tarkovDataQuery from "@/utils/tarkovdataquery.js"
import { defineStore } from 'pinia'

provideApolloClient(apolloClient)

const firedb = fireapp.firestore()

const queryErrors = ref(null)
const queryResults = ref(null)
const lastQueryTime = ref(null)

const { onResult, onError, loading } = useQuery(tarkovDataQuery, null, { fetchPolicy: "network-only", pollInterval: 300000, });
onResult((result) => {
  lastQueryTime.value = Date.now()
  queryResults.value = result.data
  console.debug(queryResults)
});
onError((error) => {
  queryErrors.value = error
  console.error(queryErrors)
});

// Create a computed property for each state object
const tasks = computed(() => {
  return queryResults.value?.tasks || [];
});

const objectives = computed(() => {
  return tasks.value?.reduce(
    (acc, task) => acc.concat(task.objectives),
    []
  ) || [];
});

const levels = computed(() => {
  return queryResults.value?.playerLevels;
});

const maps = computed(() => {
  return queryResults.value?.maps;
});

const traders = computed(() => {
  return queryResults.value?.traders;
});

const error = computed(() => {
  return queryErrors.value !== null;
});

const useSystemStore = defineStore('system', {
  state: () => ({}),
  getters: {
    // The tokens the user has
    userTokens() {
      return this.$state?.tokens || []
    },
    // The number of tokens the user has
    userTokenCount() { return this.$state?.tokens?.length || 0 },
    // The uid of the team the user is in
    userTeam() { return this.$state?.team || null },
    // Whether the user's team is their own (uid == team)
    userTeamIsOwn() { return this.$state?.team == fireuser.uid || false },
  },

})

const systemStore = useSystemStore()

const systemRef = computed(() => {
  if (fireuser.loggedIn) {
    return doc(collection(firedb, 'system'), fireuser.uid)
  } else {
    return null
  }
});

const systemUnsubscribe = ref(null)

function clearState(store, newState) {
  // Find all of the properties that are missing from store.$state that exist in newState
  const missingProperties = Object.keys(store.$state).filter((key) => {
    return !Object.hasOwn(newState, key)
  })
  // Create a new object with the missing properties set to null
  const missingPropertiesObject = missingProperties.reduce((acc, key) => {
    acc[key] = null
    return acc
  }, {})
  store.$patch(missingPropertiesObject)
}

function startStoreWatcher(store, ref, unsubscribe) {
  return watch(ref, async (newRef) => {
    // Start listening to the new systemRef
    if (newRef) {
      if (unsubscribe.value) {
        console.debug("Unsubscribing from", store.$id)
        unsubscribe.value()
      }
      console.debug(`Ref changed to ${newRef} for ${store.$id}`)
      unsubscribe.value = onSnapshot(newRef, (snapshot) => {
        console.debug(`${store.$id} data changed`)
        const snapshotData = snapshot.data()
        debugger
        store.$patch(snapshotData)
        clearState(store, snapshotData)
      }, (error) => {
        if (error.code == 'permission-denied' && unsubscribe.value) {
          console.debug("Unsubscribing from", store.$id, "due to permission denied")
          unsubscribe.value()
          clearState(store, {})
        }
      });
    } else {
      if (unsubscribe.value) {
        console.debug("Unsubscribing from", store.$id)
        unsubscribe.value()
      }
      console.debug(`Ref changed to null for ${store.$id}`)
      clearState(store, {})
    }
  }, { immediate: true });
}

startStoreWatcher(systemStore, systemRef, systemUnsubscribe)

const teamRef = computed(() => {
  if (fireuser.loggedIn) {
    if (systemStore.userTeam) {
      console.debug("Team ref now " + systemStore.userTeam)
      return doc(collection(firedb, 'team'), systemStore.userTeam)
    } else {
      console.debug("Team ref now null")
      return null
    }
  } else {
    console.debug("Team ref now null")
    return null
  }
}, { immediate: true });
const teamUnsubscribe = ref(null)
const useTeamStore = defineStore('team', {
  state: () => { return {} },
  getters: {
    // The owner of the team
    teamOwner() { return this.$state?.owner || null },
    teamPassword() { return this.$state?.password || null },
    teamMembers() { return this.$state?.members || [] },
    teammates() {
      // Return the members of the team, but without the current user
      if (this.$state?.members) {
        return this.$state.members.filter((member) => {
          return member != fireuser.uid
        })
      } else {
        return []
      }
    },
  }
})
const teamStore = useTeamStore()

startStoreWatcher(teamStore, teamRef, teamUnsubscribe)

// We keep the state outside of the function so that it acts as a singleton
export function useTarkovData() {
  return {
    tasks, objectives, maps, levels, traders, loading, error, teamStore, systemStore
  };
}