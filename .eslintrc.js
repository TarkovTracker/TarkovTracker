module.exports = {
  root: true,

  env: {
    node: true
  },

  parserOptions: {
    parser: '@babel/eslint-parser'
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-parsing-error': [2, {
      'invalid-first-character-of-tag-name': false
    }],
    'template-curly-spacing': 'off',
    indent: 'off',
    'no-unused-vars': 'warn'
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ],

  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    'plugin:cypress/recommended'
  ],
}
