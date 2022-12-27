import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import apolloClient from "@/plugins/apollo";
import tarkovDataQuery from "@/utils/tarkovdataquery.js"
import tarkovHideoutQuery from "@/utils/tarkovhideoutquery.js"
// Import graphlib so that we can use it in the watch function
import Graph from 'graphology';

provideApolloClient(apolloClient)

// Function to recursively get all of the predecessors for a task
function getPredecessors(graph, nodeId) {
  let predecessors = graph.inNeighbors(nodeId)
  if (predecessors.length > 0) {
    for (let predecessor of predecessors) {
      predecessors = predecessors.concat(getPredecessors(graph, predecessor))
    }
  }
  return predecessors
}

// Function to recursively get all of the successors for a task
function getSuccessors(graph, nodeId) {
  let successors = graph.outNeighbors(nodeId)
  if (successors.length > 0) {
    for (let successor of successors) {
      successors = successors.concat(getSuccessors(graph, successor))
    }
  }
  return successors
}

const queryErrors = ref(null)
const queryResults = ref(null)
const lastQueryTime = ref(null)

const { onResult: taskOnResult, onError: taskOnError, loading } = useQuery(tarkovDataQuery, null, { fetchPolicy: "cache-and-network", prefetch: false });
taskOnResult((result) => {
  lastQueryTime.value = Date.now()
  queryResults.value = result.data
});
taskOnError((error) => {
  queryErrors.value = error
  console.error(queryErrors)
});


const queryHideoutErrors = ref(null)
const queryHideoutResults = ref(null)
const lastHideoutQueryTime = ref(null)
const { onResult: hideoutOnResult, onError: hideoutOnError, loading: hideoutLoading } = useQuery(tarkovHideoutQuery, null, { fetchPolicy: "cache-and-network", prefetch: false });
hideoutOnResult((result) => {
  lastHideoutQueryTime.value = Date.now()
  queryHideoutResults.value = result.data
  console.debug(queryResults)
});
hideoutOnError((error) => {
  queryHideoutErrors.value = error
  console.error(queryErrors)
});

const hideoutStations = ref([])
const hideoutModules = ref([])
const hideoutGraph = ref({})
watch(queryHideoutResults, async (newValue, oldValue) => {
  if (newValue?.hideoutStations) {
    let newHideoutGraph = new Graph();
    newValue.hideoutStations.forEach((station) => {
      // For each level
      station.levels.forEach((level) => {
        newHideoutGraph.mergeNode(level.id)
        // For each stationRequirement
        level.stationLevelRequirements.forEach((requirement) => {
          let requiredStation = newValue.hideoutStations.find((station) => station.id === requirement.station.id)
          let requiredLevel = requiredStation.levels.find((level) => level.level === requirement.level)
          newHideoutGraph.mergeNode(requiredLevel.id)
          newHideoutGraph.mergeEdge(requiredLevel.id, level.id)
        })
      })
    })

    let newModules = []
    newValue.hideoutStations.forEach((station) => {
      // For each level
      station.levels.forEach((level) => {
        newModules.push({ ...level, predecessors: [...new Set(getPredecessors(newHideoutGraph, level.id))], successors: [...new Set(getSuccessors(newHideoutGraph, level.id))], parents: newHideoutGraph.inNeighbors(level.id), children: newHideoutGraph.outNeighbors(level.id) })
      })
    })
    hideoutModules.value = newModules
    hideoutGraph.value = newHideoutGraph
    hideoutStations.value = newValue.hideoutStations
  }
})

const tasks = ref([])

const taskGraph = ref({})

const objectiveMaps = ref({})
const alternativeTasks = ref({})

const mapTasks = ref({})

const disabledTasks = ["61e6e5e0f5b9633f6719ed95", "61e6e60223374d168a4576a6", "61e6e621bfeab00251576265", "61e6e615eea2935bc018a2c5", "61e6e60c5ca3b3783662be27"]

// Watch for changes to queryResults.value?.tasks and update the task graph
watch(queryResults, async (newValue, oldValue) => {
  if (newValue?.tasks) {
    let newTaskGraph = new Graph();
    let activeRequirements = []

    // Loop through all of the tasks and add them to the graph
    for (let task of newValue.tasks) {

      // If the task has requirements, add an edge from the requirement to the task
      if (task.taskRequirements?.length > 0) {
        for (let requirement of task.taskRequirements) {
          if (requirement.status.includes("active")) {
            // This task doesn't require the task to be completed, but just to be active
            // This means that the task shares predecessors with the task that it requires
            // So add the requirements after we've built the rest of the graph
            activeRequirements.push({ task, requirement })
          } else {
            newTaskGraph.mergeNode(requirement.task.id)
            newTaskGraph.mergeNode(task.id)
            newTaskGraph.mergeEdge(requirement.task.id, task.id)
          }
        }
      } else {
        // The task doesn't have task requirements, so add it to the graph just as a node
        newTaskGraph.mergeNode(task.id)
      }
    }

    // Add the active requirements to the graph
    for (let activeRequirement of activeRequirements) {
      // Get the incoming edges for the required task
      // Find a node in newTaskGraph that matches the activeRequirement.requirement.task.id
      for (let neighbor of newTaskGraph.inNeighbors(activeRequirement.requirement.task.id)) {
        newTaskGraph.mergeEdge(neighbor, activeRequirement.task.id)
      }
    }

    taskGraph.value = newTaskGraph

    // Get the latest objective maps from tarkovdata
    await fetch('https://tarkovtracker.github.io/tarkovdata/objective_maps.json')
      .then(response => response.json())
      .then(data => {
        objectiveMaps.value = data
      })

    await fetch('https://tarkovtracker.github.io/tarkovdata/task_alternatives.json')
      .then(response => response.json())
      .then(data => {
        alternativeTasks.value = data
      })

    // Loop through all of the tasks and add them to the graph
    let updatedTasks = []
    for (let task of newValue.tasks) {
      let locations = new Set()
      let objectives = []
      // For each objective in the task, set the maps property to the objectiveMaps value for that objective if it exists
      for (let objective of task.objectives) {
        if (objectiveMaps.value[objective.id]) {
          // Add all of the objective maps to the locations set
          for (let map of objectiveMaps.value[objective.id]) {
            locations.add(map)
          }
          objectives.push({ ...objective, maps: objectiveMaps.value[objective.id] })
        } else {
          // Add any objective maps to the locations set
          if (objective.maps) {
            for (let map of objective.maps) {
              locations.add(map.id)
            }
          }
          objectives.push({ ...objective, maps: objective.maps.map(m => m.id) })
        }
      }
      // For each map in locations, add the task to the mapTasks object
      for (let location of locations) {
        if (!mapTasks.value[location]) {
          mapTasks.value[location] = []
        }
        mapTasks.value[location].push(task.id)
      }

      let alternatives = []

      if (alternativeTasks.value[task.id]) {
        alternatives = alternativeTasks.value[task.id]
      }

      updatedTasks.push({ ...task, locations: [...locations], objectives: objectives, predecessors: [...new Set(getPredecessors(taskGraph.value, task.id))], successors: [...new Set(getSuccessors(taskGraph.value, task.id))], parents: newTaskGraph.inNeighbors(task.id), children: newTaskGraph.outNeighbors(task.id), alternatives: alternatives })
    }

    tasks.value = updatedTasks
  } else {
    console.error("No tasks found on first load")
  }
})

const objectives = computed(() => {
  return tasks.value?.reduce(
    (acc, task) => acc.concat(task.objectives),
    []
  ) || [];
});

const levels = computed(() => {
  return queryResults.value?.playerLevels;
});

const rawMaps = computed(() => {
  return queryResults.value?.maps;
});

const maps = computed(() => {
  // Remove Night Factory from the maps list
  if (!rawMaps.value) return []
  return rawMaps?.value.filter(map => map.id != '59fc81d786f774390775787e')
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
    tasks, objectives, maps, levels, traders, loading, error, rawMaps, disabledTasks, hideoutLoading, hideoutStations, hideoutModules
  };
}