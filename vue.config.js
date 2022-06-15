// const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  devServer: {
    disableHostCheck: true,
  },

  configureWebpack: {
    devtool: 'source-map',
  },

  lintOnSave: true,

  transpileDependencies: ['vuetify'],

  pluginOptions: {
    gitDescribe: {
      variableName: 'GIT_DESCRIBE'
    }
  },
}
