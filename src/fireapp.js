import firebase from 'firebase/app'
import firebaseConfig from './firebaseConfig.js'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/analytics'
import 'firebase/auth'

// Get a Firestore instance
const fireapp = firebase
  .initializeApp(firebaseConfig)

if (window.location.hostname === 'localhost') {
  fireapp.firestore().useEmulator('localhost', 8081)
  fireapp.functions().useEmulator('localhost', 5001)
  fireapp.auth().useEmulator('http://localhost:9099')
}

export default fireapp
