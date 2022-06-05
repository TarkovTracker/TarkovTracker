const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: '2i9t26',
  e2e: {
    baseUrl: 'http://localhost:5000/',
  },
});
