import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import { computed, ref } from "vue";
import apolloClient from "@/plugins/apollo";
import tarkovDataQuery from "@/utils/tarkovdataquery.js"

provideApolloClient(apolloClient)

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

// We keep the state outside of the function so that it acts as a singleton
export function useTarkovData() {
  return {
    tasks, objectives, maps, levels, traders, loading, error
  };
}