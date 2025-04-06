import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBujSxHd8cDsqQK7CKarmW7Q6I4rhJKwQ8",
  authDomain: "departamental-las-heras.firebaseapp.com",
  projectId: "departamental-las-heras",
  storageBucket: "departamental-las-heras.appspot.com",
  messagingSenderId: "172287140679",
  appId: "1:172287140679:android:408f1d43c79510b63d6262"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
