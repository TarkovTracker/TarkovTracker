import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import { computed } from "vue";
import apolloClient from "./apollo";
import gql from "graphql-tag";

provideApolloClient(apolloClient);

const TarkovDataPlugin = {
  install(app) {
    let loadingState = {}
    let errorState = {}
    let resultState = {}

    // Take the result of a query and place the parts in their respective state object
    const tasksReturn = useQuery(taskQuery);
    loadingState.tasks = tasksReturn.loading
    errorState.tasks = tasksReturn.error
    resultState.tasks = tasksReturn.result

    const tradersReturn = useQuery(traderQuery);
    loadingState.traders = tradersReturn.loading
    errorState.traders = tradersReturn.error
    resultState.traders = tradersReturn.result

    const levelsReturn = useQuery(levelQuery);
    loadingState.levels = levelsReturn.loading
    errorState.levels = levelsReturn.error
    resultState.levels = levelsReturn.result

    const mapsReturn = useQuery(mapQuery);
    loadingState.maps = mapsReturn.loading
    errorState.maps = mapsReturn.error
    resultState.maps = mapsReturn.result

    // Create a computed property for each state object
    const tasks = computed(() => {
      return resultState.tasks.value?.tasks;
    });

    const objectives = computed(() => {
      return tasks.value?.reduce(
        (acc, task) => acc.concat(task.objectives),
        []
      );
    });

    const levels = computed(() => {
      return resultState.levels.value?.playerLevels;
    });

    const maps = computed(() => {
      return resultState.maps.value?.maps;
    });

    const traders = computed(() => {
      return resultState.traders.value?.traders;
    });

    const dataLoading = computed(() => {
      return Object.values(loadingState).some(state => state.value);
    })

    const dataError = computed(() => {
      return Object.values(errorState).some(state => state.value);
    })

    // Provide data from tarkovdata
    app.provide("tarkov-data", { tasks, objectives, maps, levels, traders, dataLoading, dataError });
  },
};

export { TarkovDataPlugin };

const traderQuery = gql`
  query TraderList {
    traders {
      id
      name
      resetTime
      levels {
        id
        level
        requiredPlayerLevel
        requiredReputation
        requiredCommerce
        insuranceRate
        payRate
        repairCostMultiplier
      }
      tarkovDataId
    }
  }
`

const levelQuery = gql`
  query LevelList {
    playerLevels {
      level
      exp
    }
  }
`
const mapQuery = gql`
  query MapList {
    maps {
      id
      name
      tarkovDataId
      enemies
      wiki
      raidDuration
      players
      description
    }
  }
`

const taskQuery = gql`
  query TaskList {
    tasks {
      id
      tarkovDataId
      name
      trader {
        id
        name
      }
      map {
        id
        name
      }
      experience
      wikiLink
      minPlayerLevel
      taskRequirements {
        task {
          id
          name
        }
        status
      }
      traderLevelRequirements {
        trader {
          id
          name
        }
        level
      }
      objectives {
        id
        description
        type
        maps {
          id
          name
        }
        optional
        __typename
        ... on TaskObjectiveBuildItem {
          item {
            id
            name
          }
          containsAll {
            id
            name
          }
          containsOne {
            id
            name
          }
          attributes {
            name
            requirement {
              compareMethod
              value
            }
          }
        }
        ... on TaskObjectiveExperience {
          healthEffect {
            bodyParts
            effects
            time {
              compareMethod
              value
            }
          }
        }
        ... on TaskObjectiveExtract {
          exitStatus
          zoneNames
        }
        ... on TaskObjectiveItem {
          item {
            id
            name
          }
          count
          foundInRaid
          dogTagLevel
          maxDurability
          minDurability
        }
        ... on TaskObjectiveMark {
          markerItem {
            id
            name
          }
        }
        ... on TaskObjectivePlayerLevel {
          playerLevel
        }
        ... on TaskObjectiveQuestItem {
          questItem {
            id
            name
          }
          count
        }
        ... on TaskObjectiveShoot {
          shotType
          target
          count
          zoneNames
          bodyParts
          usingWeapon {
            id
            name
          }
          usingWeaponMods {
            id
            name
          }
          wearing {
            id
            name
          }
          notWearing {
            id
            name
          }
          distance {
            compareMethod
            value
          }
          playerHealthEffect {
            bodyParts
            effects
            time {
              compareMethod
              value
            }
          }
          enemyHealthEffect {
            bodyParts
            effects
            time {
              compareMethod
              value
            }
          }
        }
        ... on TaskObjectiveSkill {
          skillLevel {
            name
            level
          }
        }
        ... on TaskObjectiveTaskStatus {
          task {
            id
            name
          }
          status
        }
        ... on TaskObjectiveTraderLevel {
          trader {
            id
            name
          }
          level
        }
      }
      startRewards {
        traderStanding {
          trader {
            id
            name
          }
          standing
        }
        items {
          count
          item {
            id
            name
            containsItems {
              item {
                id
                name
              }
              count
            }
          }
        }
        offerUnlock {
          id
          trader {
            id
            name
          }
          level
          item {
            id
            name
            containsItems {
              count
              item {
                id
                name
              }
            }
          }
        }
        skillLevelReward {
          name
          level
        }
        traderUnlock {
          id
          name
        }
      }
      finishRewards {
        traderStanding {
          trader {
            id
            name
          }
          standing
        }
        items {
          count
          item {
            id
            name
            containsItems {
              item {
                id
                name
              }
              count
            }
          }
        }
        offerUnlock {
          id
          trader {
            id
            name
          }
          level
          item {
            id
            name
            containsItems {
              count
              item {
                id
                name
              }
            }
          }
        }
        skillLevelReward {
          name
          level
        }
        traderUnlock {
          id
          name
        }
      }
      factionName
      neededKeys {
        keys {
          id
          name
        }
        map {
          id
          name
        }
      }
    }
  }
`