/* =============================================
   Firebase Initialization
   ============================================= */

const firebaseConfig = {
  apiKey:            "AIzaSyCcGcU-3BN-9_1bwHMU8jBVf8rIa67MujM",
  authDomain:        "golf-guide-ef34e.firebaseapp.com",
  projectId:         "golf-guide-ef34e",
  storageBucket:     "golf-guide-ef34e.firebasestorage.app",
  messagingSenderId: "269665616985",
  appId:             "1:269665616985:web:6c32b331c7b5cdf5701d48",
  measurementId:     "G-SSPTBKJE70"
};

firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();
