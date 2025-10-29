import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  db,
  getPublicCollectionPath,
  getPrivateCollectionPath,
  USERS_COLLECTION_NAME,
  DM_MESSAGES_COLLECTION_NAME,
  getDmRoomId,
  getUserColor
} from '../firebase.js';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  setDoc,
  writeBatch
} from 'firebase/firestore';

const DirectMessages = ({ user, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const currentRoomId = selectedUser ? getDmRoomId(user.uid, selectedUser.userId) : null;

  // Path references
  const usersRef = useMemo(() => collection(db, getPublicCollectionPath(USERS_COLLECTION_NAME)), []);


  // 3A. Fetch User List
  useEffect(() => {
    if (!user) return;

    const q = query(usersRef, orderBy('displayName', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.userId !== user.uid) { // Exclude self
          usersData.push(userData);
        }
      });
      setUsers(usersData);
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    return () => unsubscribe();
  }, [user, usersRef]);

  // 3B. Fetch Messages for Selected User
  useEffect(() => {
    if (!currentRoomId || !user) {
      setMessages([]);
      return;
    }

    // We query the sender's private path. A security rule is needed for the receiver to read this path.
    const roomRef = collection(db, getPrivateCollectionPath(user.uid, DM_MESSAGES_COLLECTION_NAME), currentRoomId, 'chats');
    const q = query(roomRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    }, (error) => {
      console.error("Error fetching DM messages:", error);
    });

    return () => unsubscribe();
  }, [currentRoomId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3C. Register/Update current user in the shared user list
  useEffect(() => {
    if (!user || !user.uid) return;
    const userDocRef = doc(db, getPublicCollectionPath(USERS_COLLECTION_NAME), user.uid);

    setDoc(userDocRef, {
      userId: user.uid,
      displayName: user.displayName || 'Anon User',
      photoURL: user.photoURL || '',
      email: user.email || '',
      lastSeen: serverTimestamp()
    }, { merge: true }).catch(err => console.error("Error setting user document:", err));
  }, [user]);


  // 3D. Send Message Logic
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedUser) return;

    const senderId = user.uid;
    const receiverId = selectedUser.userId;
    const messagePayload = {
      text: newMessage,
      timestamp: serverTimestamp(),
      senderId: senderId,
      senderName: user.displayName,
    };

    const roomId = getDmRoomId(senderId, receiverId);

    // Write the message to both the sender's path and the receiver's path for easy real-time synchronization
    const senderChatRef = collection(db, getPrivateCollectionPath(senderId, DM_MESSAGES_COLLECTION_NAME), roomId, 'chats');
    const receiverChatRef = collection(db, getPrivateCollectionPath(receiverId, DM_MESSAGES_COLLECTION_NAME), roomId, 'chats');

    const batch = writeBatch(db);

    batch.set(doc(senderChatRef), messagePayload);
    batch.set(doc(receiverChatRef), messagePayload);

    try {
      await batch.commit();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending DM message:', error);
    }
  };


  // --- DM RENDER ---
  return (
    <div className="h-full flex">
      {/* User List Sidebar */}
      <div className={`w-1/3 border-r ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="p-4 border-b border-indigo-500/50">
          <h3 className={`font-extrabold tracking-wider ${darkMode ? 'text-yellow-400' : 'text-indigo-600'}`}>
            ONLINE USERS ({users.length})
          </h3>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {users.map((u) => (
            <div
              key={u.userId}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center p-3 cursor-pointer transition-all duration-200 border-l-4 ${
                selectedUser?.userId === u.userId
                  ? 'bg-indigo-600/20 border-yellow-400'
                  : darkMode
                    ? 'hover:bg-gray-700 border-transparent'
                    : 'hover:bg-gray-100 border-transparent'
              }`}
            >
              <img
                src={u.photoURL || 'https://placehold.co/40x40/374151/ffffff?text=U'}
                alt={u.displayName}
                className="w-8 h-8 rounded-full object-cover mr-3 ring-1 ring-offset-1 ring-offset-transparent ring-current"
              />
              <span className={`text-sm font-semibold ${selectedUser?.userId === u.userId ? getUserColor(u.userId) : (darkMode ? 'text-gray-200' : 'text-gray-800')
                }`}>
                {u.displayName}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <p className={`p-4 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No other users online.
            </p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`w-2/3 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {selectedUser ? (
          <>
            {/* Header */}
            {/* FIXED: Removed duplicate 'className' attribute here. */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h4 className={`font-extrabold tracking-wide ${getUserColor(selectedUser.userId)}`}>
                CHATTING WITH: {selectedUser.displayName}
              </h4>
              <p className="text-xs text-gray-500 font-mono mt-1">
                User ID: {selectedUser.userId.substring(0, 8)}...
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 shadow-md ${message.senderId === user.uid
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-600/30'
                        : darkMode
                          ? 'bg-gray-700 text-white rounded-tl-none border border-gray-600'
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                      }`}
                  >
                    <p className="break-words font-light">{message.text}</p>
                    <span
                      className={`text-[10px] block mt-1 opacity-70 ${message.senderId === user.uid
                          ? 'text-indigo-200 text-right'
                          : darkMode
                            ? 'text-gray-400 text-left'
                            : 'text-gray-500 text-left'
                        }`}
                    >
                      {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className={`p-4 border-t ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send encrypted message to ${selectedUser.displayName}...`}
                  className={`flex-1 rounded-lg border px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold tracking-wider transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                  SEND {'>'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={`p-4 border border-dashed rounded-lg max-w-sm text-center ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
              <span className="text-yellow-400 font-bold block mb-2">{'// TARGET_SELECTION_REQUIRED'}</span>
              Select an online user from the left pane to initiate a direct message.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessages;
