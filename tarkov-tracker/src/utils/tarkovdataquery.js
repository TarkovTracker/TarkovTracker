import gql from "graphql-tag";

export default gql`
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
          shortName
          link
          wikiLink
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