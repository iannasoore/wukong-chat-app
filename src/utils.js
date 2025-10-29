// --- HELPERS & CONSTANTS ---
export const PUBLIC_COLLECTION_NAME = 'public-messages';
export const USERS_COLLECTION_NAME = 'users';
export const DM_MESSAGES_COLLECTION_NAME = 'messages';

// Function to generate a predictable room ID for two users
export const getDmRoomId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

// This seems to be injected by your environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Function to get the path for public data
export const getPublicCollectionPath = (collectionName) => {
    return `artifacts/${appId}/public/data/${collectionName}`;
};

// Function to get the path for a specific user's private data
export const getPrivateCollectionPath = (userId, collectionName) => {
    return `artifacts/${appId}/users/${userId}/${collectionName}`;
};

// Function to assign a unique color per user ID for their name
export const getUserColor = (userId) => {
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