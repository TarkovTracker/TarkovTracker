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
      kappaRequired
      lightkeeperRequired
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
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
            properties {
              ... on ItemPropertiesWeapon {
                defaultPreset {
                  id
                  shortName
                  name
                  link
                  wikiLink
                  image512pxLink
                  gridImageLink
                  baseImageLink
                  iconLink
                  image8xLink
                  backgroundColor
                }
              }
            }
          }
          containsAll {
            id
            shortName
            name
            link
            wikiLink
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
          }
          containsOne {
            id
            shortName
            name
            link
            wikiLink
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
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
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
            properties {
              ... on ItemPropertiesWeapon {
                defaultPreset {
                  id
                  shortName
                  name
                  link
                  wikiLink
                  image512pxLink
                  gridImageLink
                  baseImageLink
                  iconLink
                  image8xLink
                  backgroundColor
                }
              }
            }
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
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
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
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
            properties {
              ... on ItemPropertiesWeapon {
                defaultPreset {
                  id
                  shortName
                  name
                  link
                  wikiLink
                  image512pxLink
                  gridImageLink
                  baseImageLink
                  iconLink
                  image8xLink
                  backgroundColor
                }
              }
            }
          }
          usingWeaponMods {
            id
            shortName
            name
            link
            wikiLink
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
          }
          wearing {
            id
            shortName
            name
            link
            wikiLink
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
          }
          notWearing {
            id
            shortName
            name
            link
            wikiLink
            image512pxLink
            gridImageLink
            baseImageLink
            iconLink
            image8xLink
            backgroundColor
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
                image512pxLink
                gridImageLink
                baseImageLink
                iconLink
                image8xLink
                backgroundColor
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
                image512pxLink
                gridImageLink
                baseImageLink
                iconLink
                image8xLink
                backgroundColor
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
                image512pxLink
                gridImageLink
                baseImageLink
                iconLink
                image8xLink
                backgroundColor
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
                image512pxLink
                gridImageLink
                baseImageLink
                iconLink
                image8xLink
                backgroundColor
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
          image512pxLink
          gridImageLink
          baseImageLink
          iconLink
          image8xLink
          backgroundColor
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
`;
