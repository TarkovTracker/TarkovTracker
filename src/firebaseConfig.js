// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const { hostname } = new URL(document.location.href);

// Use production environment if we're on production URL, otherwise use staging
const firebaseConfig = (hostname == 'tarkovtracker.io') ? 
{
  apiKey: "AIzaSyCRgDK1U5wjeQA8RbRFTAj_jprsG4hF0zw",
  authDomain: "tarkovtracker-production.firebaseapp.com",
  projectId: "tarkovtracker-production",
  storageBucket: "tarkovtracker-production.appspot.com",
  messagingSenderId: "140836645499",
  appId: "1:140836645499:web:2253dd97b8224a898b90de",
  measurementId: "G-ZH4YVDFWTJ"
} : {
  apiKey: "AIzaSyARSzfwWQlvRfyEVVoH6psgnswpxY-qo70",
  authDomain: "tarkovtracker-staging.firebaseapp.com",
  projectId: "tarkovtracker-staging",
  storageBucket: "tarkovtracker-staging.appspot.com",
  messagingSenderId: "944174466132",
  appId: "1:944174466132:web:eec147253f3d13ff9b99c1",
  measurementId: "G-WPT5B7M897"
};

export default firebaseConfig