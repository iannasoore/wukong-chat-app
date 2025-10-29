// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd5lPehhtPJXkQLq4VAouAB-2dAVB7RMY",
  authDomain: "buddha-chat-59401.firebaseapp.com",
  projectId: "buddha-chat-59401",
  storageBucket: "buddha-chat-59401.appspot.com",
  messagingSenderId: "328835328415",
  appId: "1:328835328415:web:84a2c3ebca52635e3ab5aa",
  measurementId: "G-D7RXYFMPQ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };