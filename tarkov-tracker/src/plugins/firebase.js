import { reactive } from 'vue'
import firebase from "firebase/compat/app";
import { getAnalytics } from "firebase/analytics";
import 'firebase/compat/firestore'
import 'firebase/compat/functions'
import 'firebase/compat/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCRgDK1U5wjeQA8RbRFTAj_jprsG4hF0zw",
  authDomain: "tarkovtracker-production.firebaseapp.com",
  databaseURL: "https://tarkovtracker-production-default-rtdb.firebaseio.com",
  projectId: "tarkovtracker-production",
  storageBucket: "tarkovtracker-production.appspot.com",
  messagingSenderId: "140836645499",
  appId: "1:140836645499:web:2253dd97b8224a898b90de",
  measurementId: "G-ZH4YVDFWTJ"
};

// Initialize Firebase
const fireapp = firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(fireapp);

// Set up a reactive object for using the user object from auth
const fireuser = reactive({})
fireapp.auth().onAuthStateChanged(function (user) {
  if (user) {
    Object.assign(fireuser, user?._delegate)
    fireuser.loggedIn = true
  } else {
    Object.keys(fireuser).forEach((key) => {
      delete fireuser[key]
    })
  }
});


// Use emulators if we're localhost
if (window.location.hostname === 'localhost') {
  fireapp.firestore().useEmulator('localhost', 5002)
  fireapp.functions().useEmulator('localhost', 5001)
  fireapp.auth().useEmulator('http://localhost:9099')
}

export { firebase, fireapp, analytics, fireuser }