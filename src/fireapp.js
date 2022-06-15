import firebase from 'firebase/app'
import firebaseConfig from './firebaseConfig.js'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/analytics'
import 'firebase/auth'
import 'firebase/remote-config'

// Get a Firestore instance
const fireapp = firebase
  .initializeApp(firebaseConfig)

const remoteConfig = fireapp.remoteConfig()
remoteConfig.settings.minimumFetchIntervalMillis = 1800000
remoteConfig.defaultConfig = {
  maintenance_mode: false
}

if (window.location.hostname === 'localhost') {
  fireapp.firestore().useEmulator('localhost', 8081)
  fireapp.functions().useEmulator('localhost', 5001)
  fireapp.auth().useEmulator('http://localhost:9099')
}

export default fireapp
