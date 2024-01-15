import { useLiveData } from "@/composables/livedata";
import { useTarkovData } from "@/composables/tarkovdata";
import { fireuser } from "@/plugins/firebase";
import { useTarkovStore } from "@/stores/tarkov";
import { useUserStore } from "@/stores/user";
import { defineStore } from "pinia";
import { computed } from "vue";

const { teammateStores } = useLiveData();
const userStore = useUserStore();
const { tasks, traders, hideoutStations, hideoutModules } = useTarkovData();

const gameEditions = [
  { version: 1, value: 0.0, defaultStashLevel: 1 },
  { version: 2, value: 0.0, defaultStashLevel: 2 },
  { version: 3, value: 0.2, defaultStashLevel: 3 },
  { version: 4, value: 0.2, defaultStashLevel: 4 },
];

export const useProgressStore = defineStore("progress", () => {
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
    if (teamStores.value) {
      Object.entries(teamStores.value).forEach(([teamId, store]) => {
        if (teamId == "self" || !userStore.teamIsHidden(teamId)) {
          visibleStores[teamId] = store;
        }
      });
    }
    return visibleStores;
  });

  const tasksCompletions = computed(() => {
    // For each task, check if it is completed for each team member
    let completions = {};
    for (const task of tasks.value) {
      completions[task.id] = {};
      for (const teamId of Object.keys(visibleTeamStores.value)) {
        completions[task.id][teamId] = visibleTeamStores.value[
          teamId
        ].isTaskComplete(task.id);
      }
    }
    return completions;
  });

  const traderRep = computed(() => {
    let rep = {};
    for (const teamId of Object.keys(visibleTeamStores.value)) {
      rep[teamId] = {};
      // Now add any rep from the game version
      // Find the gameEdition object with a version that matches the game edition
      let bonus =
        gameEditions.find(
          (edition) =>
            edition.version === visibleTeamStores.value[teamId].gameEdition
        )?.value || 0.0;
      // For each trader, loop through and add the rep
      if (traders.value) {
        for (const trader of traders.value) {
          // Add the game edition value to the total
          if (rep[teamId]?.[trader.id]) {
            rep[teamId][trader.id] = rep[teamId]?.[trader.id] + bonus;
          } else {
            rep[teamId][trader.id] = bonus;
          }
        }
      }
      // Loop through each task and add the rep to the total for each trader
      for (const task of tasks.value) {
        // If the task is marked as complete, add the rep to the total
        if (tasksCompletions.value[task.id][teamId]) {
          // Check if there are any traderStanding rewards
          if (task?.finishRewards?.traderStanding?.length > 0) {
            for (const traderStanding of task.finishRewards.traderStanding) {
              rep[teamId][traderStanding.trader.id] =
                rep[teamId]?.[traderStanding.trader.id] +
                traderStanding.standing || traderStanding.standing;
            }
          }
        }
      }
    }
    return rep;
  });

  const gameEditionData = computed(() => {
    return gameEditions;
  });

  const traderLevelsAchieved = computed(() => {
    let levels = {};
    // Figure out which tier each user is at for each trader
    for (const teamId of Object.keys(visibleTeamStores.value)) {
      levels[teamId] = {};
      // For each trader, loop through the tiers and check if the user has met the requirements
      if (!traders.value) continue;
      for (const trader of traders.value) {
        levels[teamId][trader.id] = 1;
        if (trader?.levels.length > 0) {
          for (const level of trader.levels) {
            // Check if the user has enough reputation
            if (
              traderRep.value[teamId]?.[trader.id] >= level.requiredReputation
            ) {
              // Check if the user is high enough level
              if (
                visibleTeamStores.value[teamId].playerLevel >=
                level.requiredPlayerLevel
              ) {
                // If these conditions are met, check if the level is higher than the current level
                if (level.level > levels[teamId][trader.id]) {
                  levels[teamId][trader.id] = level;
                }
              }
            }
          }
        }
      }
    }
    return levels;
  });

  const playerFaction = computed(() => {
    let faction = {};
    for (const teamId of Object.keys(visibleTeamStores.value)) {
      faction[teamId] = visibleTeamStores.value[teamId].getPMCFaction;
    }
    return faction;
  });

  const unlockedTasks = computed(() => {
    // For each task, check if any team member has it available
    let available = {};
    for (const task of tasks.value) {
      available[task.id] = {};
      for (const teamId of Object.keys(visibleTeamStores.value)) {
        // Check if the task is already marked as complete for this team member
        if (tasksCompletions.value[task.id][teamId]) {
          available[task.id][teamId] = false;
          continue;
        }
        // Check if the parent tasks are marked as complete for this team member
        if (task.parents) {
          let parentTasksComplete = true;
          for (const parentTaskId of task.parents) {
            if (!tasksCompletions.value[parentTaskId][teamId]) {
              parentTasksComplete = false;
              break;
            }
          }
          if (task.taskRequirements?.length > 0) {
            // For each of the requirements which require status failed, check if the task is failed. If it is not, mark the task as not available
            for (const req of task.taskRequirements.filter((req) =>
              req.status.includes("failed") && req.status.length == 1
            )) {
              if (!visibleTeamStores.value[teamId].isTaskFailed(req.task.id)) {
                parentTasksComplete = false;
                break;
              }
            }
          }
          if (!parentTasksComplete) {
            available[task.id][teamId] = false;
            continue;
          }
        }
        // If we aren't already marked as false, check if the player has met the level requirement
        if (task?.minPlayerLevel && task?.minPlayerLevel > 0) {
          if (
            visibleTeamStores.value[teamId].playerLevel < task.minPlayerLevel
          ) {
            available[task.id][teamId] = false;
            continue;
          }
        }
        // If we aren't already marked as false, check if the trader has met the level requirement
        if (task?.traderLevelRequirements?.length > 0) {
          // For each requirement, check if the trader is at the required level
          let traderLevelsMet = true;
          for (const requirement of task.traderLevelRequirements) {
            if (
              traderLevelsAchieved.value[teamId]?.[requirement.trader.id] <
              requirement.level
            ) {
              traderLevelsMet = false;
              break;
            }
          }
          if (!traderLevelsMet) {
            available[task.id][teamId] = false;
            continue;
          }
        }

        if (
          task?.factionName != "Any" &&
          task?.factionName != visibleTeamStores.value[teamId].getPMCFaction
        ) {
          available[task.id][teamId] = false;
          continue;
        }
        // If we aren't already marked as false, the task is available
        available[task.id][teamId] = true;
      }
    }
    return available;
  });

  // const levelAppropriateTasks = computed(() => {
  //   // For each task, check if any team member has it available
  //   let available = {}
  //   if (!unlockedTasks.value) return {}
  //   for (const task of unlockedTasks.value) {
  //     available[task.id] = {}
  //     for (const teamId of Object.keys(visibleTeamStores.value)) {
  //       // Check if the task is unlocked for this team member
  //       if (!unlockedTasks.value[task.id][teamId]) {
  //         available[task.id][teamId] = false
  //         continue
  //       }
  //       // Check if the task is level appropriate for this team member
  //       if (task?.minPlayerLevel && task?.minPlayerLevel > 0) {
  //         if (visibleTeamStores.value[teamId].playerLevel < task.minPlayerLevel) {
  //           available[task.id][teamId] = false
  //           continue
  //         }
  //       }
  //       // If we aren't already marked as false, the task is available
  //       available[task.id][teamId] = true
  //     }
  //   }
  //   return available
  // })

  const objectiveCompletions = computed(() => {
    // For each objective, check if it is completed for each team member
    let completions = {};
    for (const task of tasks.value) {
      for (const objective of task.objectives) {
        completions[objective.id] = {};
        for (const teamId of Object.keys(visibleTeamStores.value)) {
          completions[objective.id][teamId] = visibleTeamStores.value[
            teamId
          ].isTaskObjectiveComplete(objective.id);
        }
      }
    }
    return completions;
  });

  const moduleCompletions = computed(() => {
    // For each module, check if it is completed for each team member
    let completions = {};
    if (!hideoutModules.value) return {};
    for (const hModule of hideoutModules.value) {
      completions[hModule.id] = {};
      for (const teamId of Object.keys(visibleTeamStores.value)) {
        completions[hModule.id][teamId] = visibleTeamStores.value[
          teamId
        ].isHideoutModuleComplete(hModule.id);
        //For stash modules, check if they are 'complete' based on game edition
        if (hModule.stationId == "5d484fc0654e76006657e0ab") {
          let stashLevel =
            gameEditions.find(
              (edition) =>
                edition.version == visibleTeamStores.value[teamId].gameEdition
            )?.defaultStashLevel ?? 1;
          if (stashLevel >= hModule.level) {
            completions[hModule.id][teamId] = true;
          }
        }
      }
    }
    return completions;
  });

  const modulePartCompletions = computed(() => {
    // For each module part, check if it is completed for each team member
    let completions = {};
    if (!hideoutModules.value) return {};
    for (const hideoutModule of hideoutModules.value) {
      for (const part of hideoutModule.itemRequirements) {
        completions[part.id] = {};
        for (const teamId of Object.keys(visibleTeamStores.value)) {
          completions[part.id][teamId] = visibleTeamStores.value[
            teamId
          ].isHideoutPartComplete(part.id);
        }
      }
    }
    return completions;
  });

  const stationLevels = computed(() => {
    let stationLevelTemp = {};
    // For each station, check if we have marked it as built
    hideoutStations.value.forEach((station) => {
      stationLevelTemp[station.id] = {};
      for (const teamId of Object.keys(visibleTeamStores.value)) {
        stationLevelTemp[station.id][teamId] = 0;
        // Check if were the stash station, and if so, set the default level according to the game edition
        if (station.id == "5d484fc0654e76006657e0ab") {
          stationLevelTemp[station.id][teamId] =
            gameEditions.find(
              (edition) =>
                edition.version == visibleTeamStores.value[teamId].gameEdition
            )?.defaultStashLevel ?? 1;
        }
        station.levels.forEach((level) => {
          if (
            moduleCompletions.value?.[level.id]?.[teamId] &&
            level.level > stationLevelTemp?.[station.id]?.[teamId]
          ) {
            stationLevelTemp[station.id][teamId] = level.level;
          }
        });
      }
    });
    return stationLevelTemp;
  });

  const availableModules = computed(() => {
    let tempAvailableModules = {};
    hideoutModules.value.forEach((hModule) => {
      tempAvailableModules[hModule.id] = {};
      // For each user, check if the hModule is available
      for (const teamId of Object.keys(visibleTeamStores.value)) {
        // If the module is already built, it is not available
        if (moduleCompletions.value?.[hModule.id]?.[teamId]) {
          tempAvailableModules[hModule.id][teamId] = false;
          continue;
        }

        // If one of the parent modules is not built, the module is not available
        let parentModulesBuilt = true;
        for (const parentModule of hModule.parents) {
          if (!moduleCompletions.value?.[parentModule]?.[teamId]) {
            parentModulesBuilt = false;
            break;
          }
        }
        if (!parentModulesBuilt) {
          tempAvailableModules[hModule.id][teamId] = false;
          continue;
        }

        // If we've got this far, the module is available
        tempAvailableModules[hModule.id][teamId] = true;
      }
    });
    return tempAvailableModules;
  });

  const visibleStations = computed(() => {
    let visibleStations = {};
    // Loop through stationLevels and check load any station with a level > 0 on the 'self' teamstore
    for (const stationId of Object.keys(stationLevels.value)) {
      if (stationLevels.value[stationId]["self"] > 0) {
        visibleStations[stationId] = hideoutStations.value.find(
          (station) => station.id == stationId
        );
      }
    }

    // Loop through availableModules and load the relevant station if it is available
    for (const moduleId of Object.keys(availableModules.value)) {
      if (availableModules.value[moduleId]["self"]) {
        // Find the station for this module
        const station = hideoutStations.value.find((station) =>
          station.levels.find((level) => level.id == moduleId)
        );
        if (station) {
          visibleStations[station.id] = station;
        }
      }
    }

    return visibleStations;
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
      teamStores.value[getTeamIndex(teamId)].getDisplayName ??
      teamId.substring(0, 6)
    );
  };

  const getLevel = function (teamId) {
    return this.teamStores[this.getTeamIndex(teamId)].playerLevel ?? 1;
  };

  const getFaction = function (teamId) {
    return this.teamStores[this.getTeamIndex(teamId)].faction ?? "USEC";
  };

  const teammemberNames = computed(() => {
    let names = {};
    //Return the displayNames of all visible team members
    for (const teamId of Object.keys(teamStores.value)) {
      if (teamId == "self") {
        names[teamId] =
          teamStores.value[getTeamIndex(teamId)].getDisplayName ??
          fireuser.uid.substring(0, 6);
      } else {
        names[teamId] =
          teamStores.value[getTeamIndex(teamId)].getDisplayName ??
          teamId.substring(0, 6);
      }
    }
    return names;
  });

  return {
    teamStores,
    getDisplayName,
    getTeamIndex,
    visibleTeamStores,
    getLevel,
    teammemberNames,
    tasksCompletions,
    objectiveCompletions,
    unlockedTasks,
    traderRep,
    traderLevelsAchieved,
    moduleCompletions,
    stationLevels,
    availableModules,
    visibleStations,
    gameEditionData,
    modulePartCompletions,
    playerFaction,
    getFaction,
  };
});
