import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {ReactNativeAsyncStorage} from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getFunctions } from 'firebase/functions';
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth"

// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyBZUXtnvatkpSnrvafbHpsjg_iJn25-3Ds",
  authDomain: "studybuddy-d4472.firebaseapp.com",
  projectId: "studybuddy-d4472",
  storageBucket: "studybuddy-d4472.appspot.com",
  messagingSenderId: "377519413246",
  appId: "1:377519413246:ios:1c091a7dcf20c456a792af",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Storage and get a reference to the service
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export {firebaseConfig, app, db, storage, functions, auth};

 