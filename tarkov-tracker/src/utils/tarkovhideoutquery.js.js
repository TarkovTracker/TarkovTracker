import gql from "graphql-tag";

export default gql`
  query TarkovDataHideout {
  hideoutStations {
    id
    name
    normalizedName
  	levels {
      id
      level
      description
      constructionTime
      itemRequirements {
      	id
        item {
          id
          name
          shortName
          link
          wikiLink
          avg24hPrice
        }
        count
        quantity
      }
      stationLevelRequirements {
        id
        station {
          id
          name
        }
        level
      }
      skillRequirements {
        id
        name
        level
      }
      traderRequirements {
        id
        trader {
          id
          name
        }
        level
      }
      crafts {
        id
        duration
        requiredItems {
          item {
            id
            name
            shortName
            link
            wikiLink
          }
          count
          quantity
        }
        rewardItems {
          item {
            id
            name
            shortName
            link
            wikiLink
          }
          count
          quantity
        }
      }
    }
  }
}
`