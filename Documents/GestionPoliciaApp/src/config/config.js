import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native"; // 👈 clave para detectar si es web o native

const firebaseConfig = {
  apiKey: "AIzaSyBujSxHd8cDsqQK7CKarmW7Q6I4rhJKwQ8",
  authDomain: "departamental-las-heras.firebaseapp.com",
  projectId: "departamental-las-heras",
  storageBucket: "departamental-las-heras.appspot.com",
  messagingSenderId: "172287140679",
  appId: "1:172287140679:android:408f1d43c79510b63d6262",
};

const app = initializeApp(firebaseConfig);

// ✅ Usar diferentes formas de auth según el entorno
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

const db = getFirestore(app);

export { app, auth, db };

