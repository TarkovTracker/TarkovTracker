// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const { hostname } = new URL(document.location.href);

// Use production environment if we're on production URL, otherwise use staging
const firebaseConfig = (hostname == 'tarkovtracker.io') ? 
{
  apiKey: 'AIzaSyAFSSlIkqk8EkBevVz_rVkILTK0z7n7SzQ',
  authDomain: 'auth.tarkovtracker.io',
  databaseURL: 'https://tarkovtracker-59ebc-default-rtdb.firebaseio.com',
  projectId: 'tarkovtracker-59ebc',
  storageBucket: 'tarkovtracker-59ebc.appspot.com',
  messagingSenderId: '232806041830',
  appId: '1:232806041830:web:b6d3473a0465c5d8871327',
  measurementId: 'G-6TT7F1S3HE',
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