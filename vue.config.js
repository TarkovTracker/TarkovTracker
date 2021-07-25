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

  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  }
}
