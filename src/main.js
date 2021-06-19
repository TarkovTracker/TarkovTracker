import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import './plugins'
import localstore from './store/localstore.js'
import firestore from './store/firestore.js'
import { sync } from 'vuex-router-sync'
import underscore from 'vue-underscore'
import { get as pathGet, sync as pathSync } from 'vuex-pathify'

import fireapp from './fireapp.js'
import { db } from './db.js'

import trackerGlobalMixin from './trackerGlobalMixin.js'
import trackerCommonState from './trackerCommonState.js'

// Add firebase app to vue
Vue.prototype.$firebase = fireapp
Vue.prototype.$analytics = fireapp.analytics()

Vue.config.productionTip = false

// Add capitalize as prototype function
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

// Everything in this mixin is global - it get evaluated with every component. Careful not to duplicate state here.
Vue.mixin(trackerGlobalMixin)

// Add the global mixin (Global vue component, for all vue instances & sub components)

sync(localstore, router)

const vm = new Vue({
  router,
  vuetify,
  store: localstore,
  data: {
    dataHash: '',
    overallVersion: GIT_DESCRIBE.hash,
    vmName: 'Local VM',
  },
  // This mixin are exlusively used within the root instances. It contains common properties and computed functions for the application.
  mixins: [trackerCommonState],
  mounted () {
    // Set the theme to the user's choice
    this.$vuetify.theme.dark = this.$store.get('app/dark')

    if (this.$store.copy('progress/dataVersion') === 0) {
      // We need to run migrations
      this.$store.set(
        'progress/migrations!',
        {
          questData: JSON.parse(localStorage.getItem('tarkovProgress')),
          hideoutData: JSON.parse(localStorage.getItem('tarkovHideoutProgress')),
        },
      )
      localStorage.removeItem('tarkovProgress')
      localStorage.removeItem('tarkovHideoutProgress')
    }
  },
  async created () {
    const dataHashResponse = await fetch('https://api.github.com/repos/thaddeus/tarkovdata/git/refs')
    const dataHashData = await dataHashResponse.json()
    this.$set(this, 'dataHash', dataHashData.filter(x => x.ref == 'refs/heads/master')[0].object.sha)
  },
  methods: {
    // No unique methods to the non-Firestore version (yet!)
  },
  // i18n,
  render: h => h(App),
})

const vmf = new Vue({
  router,
  vuetify,
  data: {
    dataHash: '',
    overallVersion: GIT_DESCRIBE.hash,
    progressSubscribe: null,
    userSubscribe: null,
    vmName: 'Fire VM',
  },
  store: firestore,
  mixins: [trackerCommonState],
  mounted () {
    // Set the theme to the user's choice
    this.$vuetify.theme.dark = this.$store.get('app/dark')
    if (this.$store.copy('progress/dataVersion') == 0) {
      // We need to run migrations
      this.$store.set(
        'progress/migrations!',
        {
          questData: JSON.parse(localStorage.getItem('tarkovProgress')),
          hideoutData: JSON.parse(localStorage.getItem('tarkovHideoutProgress')),
        },
      )
      localStorage.removeItem('tarkovProgress')
      localStorage.removeItem('tarkovHideoutProgress')
    }
  },
  async created () {
    const dataHashResponse = await fetch('https://api.github.com/repos/thaddeus/tarkovdata/git/refs')
    const dataHashData = await dataHashResponse.json()
    this.$set(this, 'dataHash', dataHashData.filter(x => x.ref == 'refs/heads/master')[0].object.sha)
  },
  // i18n,
  render: h => h(App),
  methods: {
    // Debounce database sets so we don't write for every property set individually
    uploadLocalProgress: _.debounce(function () {
      if (fireapp.auth().currentUser != null) {
        db.collection('progress').doc(fireapp.auth().currentUser.uid).set(this.$store.copy('progress'))
      }
    }, 1000),
    uploadLocalUser: _.debounce(function () {
      if (fireapp.auth().currentUser != null) {
        db.collection('user').doc(fireapp.auth().currentUser.uid).set(this.$store.copy('user'))
      }
    }, 1000),
    bindFirestore () {
      var bindProgress = firestore.set('bindProgress!')
      var bindUser = firestore.set('bindUser!')
      var bindFiresys = firestore.set('bindFiresys!')

      return Promise.all([bindProgress, bindUser, bindFiresys]).then(() => {
        this.progressSubscribe = this.$store.subscribe((mutation, state) => {
          const mutationPath = mutation.type.split('/')
          if (mutationPath.length > 1 && mutationPath[0] === 'progress') {
            this.uploadLocalProgress()
          }
        })

        this.userSubscribe = this.$store.subscribe((mutation, state) => {
          const mutationPath = mutation.type.split('/')
          if (mutationPath.length > 1 && mutationPath[0] === 'user') {
            this.uploadLocalUser()
          }
        })
      }, this)
    },
    unbindFirestore () {
      firestore.set('unbindProgress!')
      firestore.set('unbindUser!')
      firestore.set('unbindFiresys!')

      if (this.progressSubscribe) {
        this.progressSubscribe()
      }

      if (this.userSubscribe) {
        this.userSubscribe()
      }
    },
  },
})

fireapp.auth().onAuthStateChanged(user => {
    if (user) {
        vmf.$root.bindFirestore().then(() => {
          vmf.$store.set('app/set_user_auth', user)
          vmf.$mount('#app')
        })
    } else {
        vmf.$root.unbindFirestore()
        vm.$mount('#app')
        vm.$store.set('app/clear_user_auth')
        vmf.$store.set('app/clear_user_auth')
    }
})
