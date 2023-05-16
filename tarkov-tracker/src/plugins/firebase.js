import { reactive } from "vue";
import firebase from "firebase/compat/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import "firebase/compat/auth";

const { hostname } = new URL(document.location.href);

const firebaseConfig =
  hostname == "tarkovtracker.io"
    ? {
        apiKey: "AIzaSyCRgDK1U5wjeQA8RbRFTAj_jprsG4hF0zw",
        authDomain: "auth.tarkovtracker.io",
        projectId: "tarkovtracker-production",
        storageBucket: "tarkovtracker-production.appspot.com",
        messagingSenderId: "140836645499",
        appId: "1:140836645499:web:2253dd97b8224a898b90de",
        measurementId: "G-ZH4YVDFWTJ",
      }
    : hostname == "tarkovtracker-staging.web.app"
    ? {
        apiKey: "AIzaSyARSzfwWQlvRfyEVVoH6psgnswpxY-qo70",
        authDomain: "tarkovtracker-staging.firebaseapp.com",
        projectId: "tarkovtracker-staging",
        storageBucket: "tarkovtracker-staging.appspot.com",
        messagingSenderId: "944174466132",
        appId: "1:944174466132:web:eec147253f3d13ff9b99c1",
        measurementId: "G-WPT5B7M897",
      }
    : {
        apiKey: "AIzaSyDzod-ZcUKOmlYNChDAeGWhoatPt6niPu0",
        authDomain: "tarkovtracker-next.firebaseapp.com",
        projectId: "tarkovtracker-next",
        storageBucket: "tarkovtracker-next.appspot.com",
        messagingSenderId: "260245547337",
        appId: "1:260245547337:web:e2821d280026b1af539298",
        measurementId: "G-JYJTN74JNW",
      };

// Initialize Firebase
const fireapp = firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(fireapp);

// Set up a reactive object for using the user object from auth
const fireuser = reactive({});
fireapp.auth().onAuthStateChanged(function (user) {
  if (user) {
    Object.assign(fireuser, user?._delegate);
    fireuser.loggedIn = true;
  } else {
    Object.keys(fireuser).forEach((key) => {
      delete fireuser[key];
    });
  }
});

//Use emulators if we're localhost
if (window.location.hostname === "localhost") {
  fireapp.firestore().useEmulator("localhost", 5002);
  fireapp.functions().useEmulator("localhost", 5001);
  fireapp.auth().useEmulator("http://localhost:9099");
}

export { firebase, fireapp, analytics, fireuser };
