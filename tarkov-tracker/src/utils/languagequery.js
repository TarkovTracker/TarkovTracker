import gql from "graphql-tag";

export default gql`
  {
    __type(name: "LanguageCode") {
      enumValues {
        name
      }
    }
  }
`