// Vue
import Vue from 'vue'
import Vuex from 'vuex'
import pathify from '@/plugins/vuex-pathify'
import VuexPersistence from 'vuex-persist'

// Modules
import * as modules from './modules'

Vue.use(Vuex)

// Use localstorage for saving everything since we're not using an account
const vuexLocal = new VuexPersistence({
  key: 'vuex',
  storage: window.localStorage,
  // Keep all modules stored here except for app, which works across localstore and firestore
  modules: Object.keys(modules).filter(x => x != 'app')
})

// Use localstorage for 'app' module things like dark mode
const vuexAppLocal = new VuexPersistence({
  key: 'vuex-app',
  storage: window.localStorage,
  // Keep just the app module here, which is used across localstore and firestore
  modules: ['app'],
  // Make sure we dont store the user_auth variable in local storage
  reducer: (state) => ({
    app: {
      ...state.app,
      user_auth: undefined
    }
  })
})

const store = new Vuex.Store({
  modules,
  plugins: [
    pathify.plugin,
    vuexAppLocal.plugin,
    vuexLocal.plugin
  ]
})

export default store

export const ROOT_DISPATCH = Object.freeze({ root: true })
