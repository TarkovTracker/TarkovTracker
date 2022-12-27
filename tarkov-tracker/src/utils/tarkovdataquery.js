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
            shortName
            name
            link
            wikiLink
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
            shortName
            name
            link
            wikiLink
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
            shortName
            name
            link
            wikiLink
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
            shortName
            name
            link
            wikiLink
          }
          usingWeaponMods {
            id
            shortName
            name
            link
            wikiLink
          }
          wearing {
            id
            shortName
            name
            link
            wikiLink
          }
          notWearing {
            id
            shortName
            name
            link
            wikiLink
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
            shortName
            name
            link
            wikiLink
            containsItems {
              item {
                id
            		shortName
            		name
            		link
            		wikiLink
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
            shortName
            name
            link
            wikiLink
            containsItems {
              count
              item {
                id
            		shortName
            		name
            		link
            		wikiLink
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
            shortName
            name
            link
            wikiLink
            containsItems {
              item {
                id
            		shortName
            		name
            		link
            		wikiLink
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
            shortName
            name
            link
            wikiLink
            containsItems {
              count
              item {
                id
            		shortName
            		name
            		link
            		wikiLink
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
          shortName
          name
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