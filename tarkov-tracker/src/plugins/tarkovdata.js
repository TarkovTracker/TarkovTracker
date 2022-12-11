import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import { computed, ref } from "vue";
import apolloClient from "./apollo";
import gql from "graphql-tag";

provideApolloClient(apolloClient);

const TarkovDataPlugin = {
  install(app) {
    const queryErrors = ref(null)
    const queryResults = ref(null)

    const { onResult, onError, loading } = useQuery(tarkovDataQuery, null, { fetchPolicy: "network-only" });
    onResult((result) => {
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

    // Provide data from tarkovdata
    app.provide("tarkov-data", { tasks, objectives, maps, levels, traders, loading, error });
  },
};

export { TarkovDataPlugin };

const tarkovDataQuery = gql`
  query TarkovData {
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
    playerLevels {
      level
      exp
    }
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
