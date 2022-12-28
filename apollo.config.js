module.exports = {
  client: {
    service: {
      name: 'My-Graph-9wt0hn',
      // URL to the GraphQL API
      url: 'https://api.tarkov.dev/graphql',
    },
    // Files processed by the extension
    includes: [
      'tarkov-tracker/src/**/*.vue',
      'tarkov-tracker/src/**/*.js',
    ],
  },
}