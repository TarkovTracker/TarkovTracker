import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import './plugins'
import localstore from './store/localstore.js'
import firestore from './store/firestore.js'
import { sync } from 'vuex-router-sync'
import { _ } from 'vue-underscore';

import UniqueId from 'vue-unique-id';

import fireapp from './fireapp.js'
import { db } from './db.js'

import trackerGlobalMixin from './trackerGlobalMixin.js'
import trackerCommonState from './trackerCommonState.js'

Vue.use(UniqueId)

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

// GIT_DESCRIBE comes from vue-cli-plugin-git-describe
// eslint-disable-next-line no-undef
const gitHash = GIT_DESCRIBE.hash.replace(/g/,'')

const vm = new Vue({
  router,
  vuetify,
  store: localstore,
  data: {
    dataHash: '',
    overallVersion: gitHash,
    vmName: 'Local VM',
    fireVM: false,
  },
  // This mixin are exlusively used within the root instances. It contains common properties and computed functions for the application.
  mixins: [trackerCommonState],
  mounted () {
    // Set the theme to the user's choice
    this.$vuetify.theme.dark = this.$store.get('app/dark')

    // Allow iframe use of the site, but make sure they dont keep drawer hidden
    if (window.self == window.top) {
      this.$store.set('app/drawer', true)
    }
  },
  async created () {
    const trackerTreeResponse = await fetch(`https://api.github.com/repos/TarkovTracker/TarkovTracker/git/trees/${ gitHash }`)
    const trackerTreeData = await trackerTreeResponse.json()
    if (trackerTreeData.tree) {
      this.$set(this, 'dataHash', trackerTreeData.tree.filter(x => x.path == 'tarkovdata')[0].sha)
    }
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
    overallVersion: gitHash,
    progressSubscribe: null,
    userSubscribe: null,
    vmName: 'Fire VM',
    fireVM: true,
  },
  store: firestore,
  mixins: [trackerCommonState],
  mounted () {
    // Set the theme to the user's choice
    this.$vuetify.theme.dark = this.$store.get('app/dark')
    
    // Allow iframe use of the site, but make sure they dont keep drawer hidden
    if (window.self == window.top) {
      this.$store.set('app/drawer', true)
    }
  },
  async created () {
    const trackerTreeResponse = await fetch(`https://api.github.com/repos/TarkovTracker/TarkovTracker/git/trees/${ gitHash }`)
    const trackerTreeData = await trackerTreeResponse.json()
    if (trackerTreeData.tree) {
      this.$set(this, 'dataHash', trackerTreeData.tree.filter(x => x.path == 'tarkovdata')[0].sha)
    }
  },
  // i18n,
  render: h => h(App),
  methods: {
    // Debounce database sets so we don't write for every property set individually
    uploadLocalProgress: _.debounce(function () {
      if (fireapp.auth().currentUser != null) {
        db.collection('progress').doc(fireapp.auth().currentUser.uid).set(this.$store.copy('progress'))
      }
    }, 250),
    uploadLocalUser: _.debounce(function () {
      if (fireapp.auth().currentUser != null) {
        db.collection('user').doc(fireapp.auth().currentUser.uid).set(this.$store.copy('user'))
      }
    }, 250),
    bindFirestore () {
      var bindProgress = firestore.set('bindProgress!')
      var bindUser = firestore.set('bindUser!')
      var bindFiresys = firestore.set('bindFiresys!')

      return Promise.all([bindProgress, bindUser, bindFiresys]).then(() => {
        this.progressSubscribe = this.$store.subscribe((mutation) => {
          const mutationPath = mutation.type.split('/')
          if (mutationPath.length > 1 && mutationPath[0] === 'progress') {
            this.uploadLocalProgress()
          }
        })

        this.userSubscribe = this.$store.subscribe((mutation) => {
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
