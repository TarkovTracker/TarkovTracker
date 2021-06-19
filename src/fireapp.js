import Firebase from 'firebase'
import firebaseConfig from './firebaseConfig.js'
import 'firebase/firestore'
import 'firebase/functions'

// Get a Firestore instance
const fireapp = Firebase
  .initializeApp(firebaseConfig)

if (window.location.hostname === 'localhost') {
  fireapp.firestore().useEmulator('localhost', 8081)
  fireapp.functions().useEmulator('localhost', 5001)
  fireapp.auth().useEmulator('http://localhost:9099')
}

export default fireapp
