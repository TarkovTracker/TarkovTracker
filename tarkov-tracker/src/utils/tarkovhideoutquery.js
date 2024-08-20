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
          value
        }
        crafts {
          id
          duration
          requiredItems {
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
            quantity
          }
          rewardItems {
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
            quantity
          }
        }
      }
    }
  }
`;
