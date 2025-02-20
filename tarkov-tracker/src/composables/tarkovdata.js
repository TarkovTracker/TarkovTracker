import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import apolloClient from "@/plugins/apollo";
import tarkovDataQuery from "@/utils/tarkovdataquery.js";
import tarkovHideoutQuery from "@/utils/tarkovhideoutquery.js";
import languageQuery from "@/utils/languagequery.js";
import i18n from "@/plugins/i18n";
// Import graphlib so that we can use it in the watch function
import Graph from "graphology";

provideApolloClient(apolloClient);

// Function to recursively get all of the predecessors for a task
function getPredecessors(graph, nodeId, visited = []) {
  let predecessors = [];
  try {
    predecessors = graph.inNeighbors(nodeId);
    visited.push(nodeId);
  } catch {
    console.error("Error getting predecessors for node " + nodeId);
    return [];
  }
  if (predecessors.length > 0) {
    for (let predecessor of predecessors) {
      if (visited.includes(predecessor)) {
        continue;
      }
      predecessors = predecessors.concat(
        getPredecessors(graph, predecessor, visited)
      );
    }
  }
  return predecessors;
}

// Function to recursively get all of the successors for a task
function getSuccessors(graph, nodeId, visited = []) {
  let successors = [];
  try {
    successors = graph.outNeighbors(nodeId);
    visited.push(nodeId);
  } catch {
    console.error("Error getting successors for node " + nodeId);
    return [];
  }
  if (successors.length > 0) {
    for (let successor of successors) {
      if (visited.includes(successor)) {
        continue;
      }
      successors = successors.concat(getSuccessors(graph, successor, visited));
    }
  }
  return successors;
}

const availableLanguages = ref(null);
const languageQueryErrors = ref(null);
const languageQueryResults = ref(null);
const {
  onResult: languageOnResult,
  onError: languageOnError,
} = useQuery(languageQuery, null, {
  fetchPolicy: "cache-and-network",
  notifyOnNetworkStatusChange: true,
  errorPolicy: "all",
});
languageOnResult((result) => {
  availableLanguages.value = result.data.__type.enumValues.map((enumValue) => enumValue.name)
});
languageOnError((error) => {
  // Default to English if the language query fails
  console.error(error);
  availableLanguages.value = ["en"];
});

function extractLanguageCode() {
  const locale = i18n.global.locale.value;
  // Return only the language code remove any dash or underscore and what comes after
  let browserLocale = locale.split(/[-_]/)[0];
  // If the available languages include the browser locale, return the browser locale
  // otherwise, default to English
  if (availableLanguages.value?.includes(browserLocale)) {
    return browserLocale;
  } else {
    return "en";
  }
}

const queryErrors = ref(null);
const queryResults = ref(null);
const lastQueryTime = ref(null);

const languageCode = computed(() => extractLanguageCode());

const {
  onResult: taskOnResult,
  onError: taskOnError,
  loading,
  refetch: taskRefetch,
} = useQuery(tarkovDataQuery, { lang: languageCode.value }, {
  fetchPolicy: "cache-and-network",
  notifyOnNetworkStatusChange: true,
  errorPolicy: "all",
});
taskOnResult((result) => {
  lastQueryTime.value = Date.now();
  queryResults.value = result.data;
});
taskOnError((error) => {
  queryErrors.value = error;
  console.error(queryErrors);
});

const queryHideoutErrors = ref(null);
const queryHideoutResults = ref(null);
const lastHideoutQueryTime = ref(null);
const {
  onResult: hideoutOnResult,
  onError: hideoutOnError,
  loading: hideoutLoading,
  refetch: hideoutRefetch,
} = useQuery(tarkovHideoutQuery, { lang: languageCode.value }, {
  fetchPolicy: "cache-and-network",
  notifyOnNetworkStatusChange: true,
  errorPolicy: "all",
});
hideoutOnResult((result) => {
  lastHideoutQueryTime.value = Date.now();
  queryHideoutResults.value = result.data;
  console.debug(queryResults);
});
hideoutOnError((error) => {
  queryHideoutErrors.value = error;
  console.error(queryErrors);
});

const hideoutStations = ref([]);
const hideoutModules = ref([]);
const hideoutGraph = ref({});
watch(queryHideoutResults, async (newValue, oldValue) => {
  if (newValue?.hideoutStations) {
    let newHideoutGraph = new Graph();
    newValue.hideoutStations.forEach((station) => {
      console.info(station);
      station.levels.forEach((level) => {
        console.info(level);
        newHideoutGraph.mergeNode(level.id);
        level.stationLevelRequirements.forEach((requirement) => {
          if (requirement != null) {
            let requiredStation = newValue.hideoutStations.find(
              (s) => s.id === requirement.station.id
            );
            let requiredLevel = requiredStation.levels.find(
              (l) => l.level === requirement.level
            );
            newHideoutGraph.mergeNode(requiredLevel.id);
            newHideoutGraph.mergeEdge(requiredLevel.id, level.id);
          }
        });
      });
    });

    let newModules = [];
    newValue.hideoutStations.forEach((station) => {
      station.levels.forEach((level) => {
        newModules.push({
          ...level,
          stationId: station.id,
          predecessors: [
            ...new Set(getPredecessors(newHideoutGraph, level.id)),
          ],
          successors: [...new Set(getSuccessors(newHideoutGraph, level.id))],
          parents: newHideoutGraph.inNeighbors(level.id),
          children: newHideoutGraph.outNeighbors(level.id),
        });
      });
    });
    hideoutModules.value = newModules;
    hideoutGraph.value = newHideoutGraph;
    hideoutStations.value = newValue.hideoutStations;
  }
});

const tasks = ref([]);

const taskGraph = ref({});

const objectiveMaps = ref({});
const alternativeTasks = ref({});
const objectiveGPS = ref({});

const mapTasks = ref({});

const disabledTasks = [
  "61e6e5e0f5b9633f6719ed95",
  "61e6e60223374d168a4576a6",
  "61e6e621bfeab00251576265",
  "61e6e615eea2935bc018a2c5",
  "61e6e60c5ca3b3783662be27",
];

// Watch for changes to queryResults.value?.tasks and update the task graph
watch(queryResults, async (newValue, oldValue) => {
  if (newValue?.tasks) {
    let newTaskGraph = new Graph();
    let activeRequirements = [];

    // Loop through all of the tasks and add them to the graph
    for (let task of newValue.tasks) {
      newTaskGraph.mergeNode(task.id);
      // If the task has requirements, add an edge from the requirement to the task
      if (task.taskRequirements?.length > 0) {
        for (let requirement of task.taskRequirements) {
          if (requirement?.status.includes("active")) {
            // This task doesn't require the task to be completed, but just to be active
            // This means that the task shares predecessors with the task that it requires
            // So add the requirements after we've built the rest of the graph
            activeRequirements.push({ task, requirement });
            // } else if (requirement?.status.includes("failed")) {
            //   // This is a failed requirement
            //   debugger
          } else {
            if (
              requirement?.task &&
              newValue.tasks.find((t) => t.id === requirement.task.id)
            ) {
              newTaskGraph.mergeNode(requirement.task.id);
              newTaskGraph.mergeEdge(requirement.task.id, task.id);
            }
          }
        }
      }
    }

    // Add the active requirements to the graph
    for (let activeRequirement of activeRequirements) {
      // Get the incoming edges for the required task
      // Find a node in newTaskGraph that matches the activeRequirement.requirement.task.id
      for (let neighbor of newTaskGraph.inNeighbors(
        activeRequirement.requirement.task.id
      )) {
        newTaskGraph.mergeEdge(neighbor, activeRequirement.task.id);
      }
    }

    taskGraph.value = newTaskGraph;

    // Get the latest objective maps from tarkovdata
    await fetch(
      "https://tarkovtracker.github.io/tarkovdata/objective_maps.json"
    )
      .then((response) => response.json())
      .then((data) => {
        objectiveMaps.value = data;
      });

    await fetch(
      "https://tarkovtracker.github.io/tarkovdata/task_alternatives.json"
    )
      .then((response) => response.json())
      .then((data) => {
        alternativeTasks.value = data;
      });

    await fetch("https://tarkovtracker.github.io/tarkovdata/objective_gps.json")
      .then((response) => response.json())
      .then((data) => {
        objectiveGPS.value = data;
      });

    // Loop through all of the tasks and add them to the graph
    let updatedTasks = [];
    for (let task of newValue.tasks) {
      let locations = new Set();
      let objectives = [];
      // For each objective in the task, set the maps property to the objectiveMaps value for that objective if it exists
      for (let objective of task.objectives) {
        let objMaps = [];
        let objGPS = null;
        if (objectiveMaps.value[objective.id]) {
          // Add all of the objective maps to the locations set
          for (let map of objectiveMaps.value[objective.id]) {
            locations.add(map);
          }
          objMaps = objectiveMaps.value[objective.id];
        } else {
          // Add any objective maps to the locations set
          if (objective.maps) {
            for (let map of objective.maps) {
              locations.add(map.id);
            }
          }
          objMaps = objective.maps.map((m) => m.id);
        }

        if (objectiveGPS.value[objective.id]) {
          objGPS = objectiveGPS.value[objective.id];
        }

        objectives.push({ ...objective, maps: objMaps, gps: objGPS });
      }
      // For each map in locations, add the task to the mapTasks object
      for (let location of locations) {
        if (!mapTasks.value[location]) {
          mapTasks.value[location] = [];
        }
        mapTasks.value[location].push(task.id);
      }

      let alternatives = [];

      if (alternativeTasks.value[task.id]) {
        alternatives = alternativeTasks.value[task.id];
      }

      updatedTasks.push({
        ...task,
        locations: [...locations],
        objectives: objectives,
        predecessors: [...new Set(getPredecessors(taskGraph.value, task.id))],
        successors: [...new Set(getSuccessors(taskGraph.value, task.id))],
        parents: newTaskGraph.inNeighbors(task.id),
        children: newTaskGraph.outNeighbors(task.id),
        alternatives: alternatives,
      });
    }

    tasks.value = updatedTasks;
  } else {
    console.error("No tasks found on first load");
  }
});

const neededItemTaskObjectives = computed(() => {
  // Create a list of all task objectives that require items
  let neededItemObjectives = [];
  let relevantObjectiveTypes = ["mark", "buildWeapon", "plantItem", "giveItem"];
  for (const task of tasks.value) {
    if (disabledTasks.includes(task.id)) {
      continue;
    }
    for (const objective of task.objectives) {
      if (
        relevantObjectiveTypes.includes(objective.type) &&
        objective.optional != true
      ) {
        if (objective.type == "giveItem") {
          let matchingObjective = task.objectives.find(
            (fiObj) =>
              fiObj.type == "findItem" &&
              fiObj.item.id == objective.item.id &&
              fiObj.count == objective.count &&
              fiObj.foundInRaid == objective.foundInRaid &&
              fiObj.dogTagLevel == objective.dogTagLevel &&
              fiObj.maxDurability == objective.maxDurability &&
              fiObj.minDurability == objective.minDurability
          );
          if (!matchingObjective) {
            console.debug("No matching findItem objective", objective.id);
          }
          neededItemObjectives.push({
            ...objective,
            taskId: task.id,
            findObjective: matchingObjective,
            predecessors: task.predecessors,
          });
        } else {
          neededItemObjectives.push({
            ...objective,
            taskId: task.id,
            predecessors: task.predecessors,
          });
        }
      }
    }
  }
  return neededItemObjectives.map((neededItemObjective) => {
    return { ...neededItemObjective, needType: "taskObjective" };
  });
});

const neededItemHideoutModules = computed(() => {
  let neededItemModules = [];
  hideoutModules.value.forEach((hModule) => {
    if (hModule?.itemRequirements?.length > 0) {
      hModule.itemRequirements.forEach((itemRequirement) => {
        neededItemModules.push({ ...itemRequirement, hideoutModule: hModule });
      });
    }
  });
  return neededItemModules.map((neededItemObjective) => {
    return { ...neededItemObjective, needType: "hideoutModule" };
  });
});

const tarkovDataMaps = ref({});
fetch("https://tarkovtracker.github.io/tarkovdata/maps.json")
  .then((response) => response.json())
  .then((data) => {
    tarkovDataMaps.value = data;
  });

const objectives = computed(() => {
  return (
    tasks.value?.reduce(
      (acc, task) =>
        acc.concat(
          task.objectives.map((objective) => ({
            ...objective,
            taskId: task.id,
            kappaRequired: task.kappaRequired && objective.optional != true,
          }))
        ),
      []
    ) || []
  );
});

const levels = computed(() => {
  return queryResults.value?.playerLevels;
});

const rawMaps = computed(() => {
  return queryResults.value?.maps;
});

const maps = computed(() => {
  // Remove Night Factory from the maps list (we just care about "Factory")
  if (!rawMaps.value) return [];
  let noNightFactory = rawMaps.value.filter(
    (map) => map.id != "59fc81d786f774390775787e"
  );
  let processedMaps = [];
  // Link the svg property from tarkovdata to the map object from tarkov.dev API
  noNightFactory.forEach((map) => {
    let tempMap = { ...map };
    tempMap.svg =
      Object.values(tarkovDataMaps.value).find(
        (tdm) => String(tdm.tdevId) == String(map.id)
      )?.svg || null;
    processedMaps.push(tempMap);
  });
  return processedMaps;
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
    tasks,
    objectives,
    maps,
    levels,
    traders,
    loading,
    error,
    rawMaps,
    disabledTasks,
    hideoutLoading,
    hideoutStations,
    hideoutModules,
    taskRefetch,
    hideoutRefetch,
    neededItemTaskObjectives,
    neededItemHideoutModules,
  };
}
