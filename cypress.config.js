const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: '2i9t26',
  e2e: {
    baseUrl: 'http://localhost:8080/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
