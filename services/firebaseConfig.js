import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyBXKipBPTHZxslWjjrc6aEfy9YI1YwoIAY",
  authDomain: "studybuddy-d4472.firebaseapp.com",
  projectId: "studybuddy-d4472",
  storageBucket: "studybuddy-d4472.appspot.com",
  messagingSenderId: "377519413246",
  appId: "1:377519413246:ios:1c091a7dcf20c456a792af",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

