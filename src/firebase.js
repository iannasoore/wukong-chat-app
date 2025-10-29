// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBd5lPehhtPJXkQLq4VAouAB-2dAVB7RMY",
  authDomain: "buddha-chat-59401.firebaseapp.com",
  projectId: "buddha-chat-59401",
  storageBucket: "buddha-chat-59401.firebasestorage.app",
  messagingSenderId: "328835328415",
  appId: "1:328835328415:web:84a2c3ebca52635e3ab5aa",
  measurementId: "G-D7RXYFMPQ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// --- COLLECTION/DOCUMENT HELPERS ---

export const USERS_COLLECTION_NAME = 'users';
export const DM_MESSAGES_COLLECTION_NAME = 'dm-messages';

export function getPublicCollectionPath(appId, collectionName) {
  return `artifacts/${appId}/public/data/${collectionName}`;
}

export function getPrivateCollectionPath(appId, uid, collectionName) {
  return `artifacts/${appId}/private/${uid}/${collectionName}`;
}

export function getDmRoomId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

const colors = [
  'text-red-400',
  'text-orange-400',
  'text-yellow-400',
  'text-lime-400',
  'text-green-400',
  'text-teal-400',
  'text-cyan-400',
  'text-blue-400',
  'text-indigo-400',
  'text-purple-400',
  'text-pink-400',
];

export const getUserColor = (uid) => colors[uid.charCodeAt(uid.length - 1) % colors.length];