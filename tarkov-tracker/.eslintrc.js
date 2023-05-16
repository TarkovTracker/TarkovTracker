module.exports = {
  env: {
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    vueFeatures: {
      filter: true,
      interpolationAsNonHTML: false,
    },
  },
  extends: ["plugin:vue/vue3-recommended", "eslint:recommended", "prettier"],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
    "no-debugger": "off",
    "no-unused-vars": "off",
  },
};
