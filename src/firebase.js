import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION & AUTH ---
// MANDATORY: Use environment variables for initialization
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- HELPERS & CONSTANTS ---
const PUBLIC_COLLECTION_NAME = 'public-messages';
const USERS_COLLECTION_NAME = 'users';
const DM_MESSAGES_COLLECTION_NAME = 'messages';

// Function to generate a predictable room ID for two users
const getDmRoomId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

// Function to get the path for public data
const getPublicCollectionPath = (collectionName) => {
    return `artifacts/${appId}/public/data/${collectionName}`;
};

// Function to get the path for a specific user's private data
const getPrivateCollectionPath = (userId, collectionName) => {
    return `artifacts/${appId}/users/${userId}/${collectionName}`;
};

// Function to assign a unique color per user ID for their name
const getUserColor = (userId) => {
    const colors = [
        'text-yellow-400',
        'text-cyan-400',
        'text-green-400',
        'text-red-400',
        'text-pink-400',
        'text-orange-400'
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

export {
    app,
    auth,
    db,
    googleProvider,
    PUBLIC_COLLECTION_NAME,
    USERS_COLLECTION_NAME,
    DM_MESSAGES_COLLECTION_NAME,
    getDmRoomId,
    getPublicCollectionPath,
    getPrivateCollectionPath,
    getUserColor
};