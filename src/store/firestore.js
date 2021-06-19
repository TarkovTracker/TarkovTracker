// Vue
import Vue from 'vue'
import Vuex from 'vuex'
import { vuexfireMutations, firestoreAction } from 'vuexfire'
import pathify from '@/plugins/vuex-pathify'
import fireapp from '../fireapp.js'
import { db } from '../db.js'
import VuexPersistence from 'vuex-persist'

// Modules
import * as modules from './modules'

Vue.use(Vuex)

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
      user_auth: undefined,
    },
  }),
})

const store = new Vuex.Store({
  modules,
  plugins: [
    pathify.plugin,
    vuexAppLocal.plugin,
  ],
  mutations: {
  	// Root level mutations needed for vuexfire
    ...vuexfireMutations,
  },

  actions: {
    // Progress Bind and Unbind
  	bindProgress: firestoreAction(({ bindFirestoreRef, commit, state }) => {
  		const progressRef = db.collection('progress').doc(fireapp.auth().currentUser.uid)
  		progressRef.get()
  		  .then((docSnapshot) => {
          // If progress document doesn't exist, set it to the default data
  		    if (!docSnapshot.exists) {
  		    	commit('progress/reset_state')
  		      	progressRef.set(state.progress)
  		    }
  		})
      return bindFirestoreRef('progress', db.collection('progress').doc(fireapp.auth().currentUser.uid))
  	}),
  	unbindProgress: firestoreAction(({ unbindFirestoreRef }) => {
      unbindFirestoreRef('progress')
    }),

    // User Settings Bind and Unbind
    bindUser: firestoreAction(({ bindFirestoreRef, commit, state }) => {
      const userRef = db.collection('user').doc(fireapp.auth().currentUser.uid)
      userRef.get()
        .then((docSnapshot) => {
          // If user document doesn't exist, set it to the default data
          if (!docSnapshot.exists) {
            commit('user/reset_state')
              userRef.set(state.user)
          }
      })
      return bindFirestoreRef('user', db.collection('user').doc(fireapp.auth().currentUser.uid))
    }),
    unbindUser: firestoreAction(({ unbindFirestoreRef }) => {
      unbindFirestoreRef('user')
    }),

    // Team Bind and Unbind
    bindFiresys: firestoreAction(({ bindFirestoreRef, commit, state }) => {
      return bindFirestoreRef('firesys', db.collection('system').doc(fireapp.auth().currentUser.uid), { maxRefDepth: 1 })
    }),
    unbindFiresys: firestoreAction(({ unbindFirestoreRef }) => {
      unbindFirestoreRef('firesys')
    }),
  },
})

export default store

export const ROOT_DISPATCH = Object.freeze({ root: true })
