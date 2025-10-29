// File: src/components/EnhancedDirectMessages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

const EnhancedDirectMessages = ({ user, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Define key colors for the cyberpunk look
  const accentColor = 'indigo-500'; // For primary actions/highlights
  const secondaryAccent = 'yellow-400'; // For contrast
  const darkBg = 'bg-gray-800';
  const lightBg = 'bg-white';
  const darkCard = 'bg-gray-700';
  const lightCard = 'bg-gray-100';

  // Automatically discover users from public messages
  useEffect(() => {
    const discoverUsers = async () => {
      try {
        const messagesSnapshot = await getDocs(collection(db, 'public-messages'));
        const uniqueUsers = new Map();

        // Add current user first (optional, usually filtered out for DMs)
        uniqueUsers.set(user.uid, {
          id: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email
        });

        // Discover other users from public messages
        messagesSnapshot.forEach(doc => {
          const message = doc.data();
          if (message.userId && message.userId !== user.uid) {
            uniqueUsers.set(message.userId, {
              id: message.userId,
              displayName: message.user,
              photoURL: message.userPhoto,
              email: message.email
            });
          }
        });

        setUsers(Array.from(uniqueUsers.values()));
      } catch (error) {
        console.error('Error discovering users:', error);
      }
    };

    discoverUsers();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!selectedUser) return;

    const conversationId = [user.uid, selectedUser.id].sort().join('_');
    const q = query(
      collection(db, 'direct-messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedUser, user.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedUser) return;

    const conversationId = [user.uid, selectedUser.id].sort().join('_');

    try {
      await addDoc(collection(db, 'direct-messages'), {
        text: newMessage,
        timestamp: serverTimestamp(),
        senderId: user.uid,
        senderName: user.displayName,
        receiverId: selectedUser.id,
        receiverName: selectedUser.displayName,
        conversationId: conversationId,
        userPhoto: user.photoURL
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-full flex divide-x divide-gray-700/50">
      {/* Users List (Sidebar) */}
      <div className={`w-1/3 min-w-[250px] overflow-hidden ${
        darkMode ? `${darkBg} text-gray-100` : `${lightBg} text-gray-800`
      }`}>
        <div className={`p-4 border-b border-dashed ${
          darkMode ? 'border-indigo-900' : 'border-gray-300'
        }`}>
          <h3 className="text-xl font-bold tracking-wider text-indigo-400">USERS ONLINE</h3>
          <p className="text-xs text-yellow-400 mt-1 uppercase">
            {users.length - 1} contacts available
          </p>
        </div>
        <div className="overflow-y-auto h-full max-h-[calc(100%-70px)]">
          {users.filter(u => u.id !== user.uid).map((userItem) => (
            <button
              key={userItem.id}
              onClick={() => setSelectedUser(userItem)}
              className={`w-full text-left p-3 flex items-center space-x-3 border-b transition-all duration-200 transform hover:scale-[1.01] ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } ${
                selectedUser?.id === userItem.id
                  ? `bg-indigo-600 text-white shadow-lg shadow-indigo-600/30`
                  : darkMode
                  ? 'hover:bg-gray-700/50'
                  : 'hover:bg-gray-100'
              }`}
            >
              <img
                src={userItem.photoURL || '/default-avatar.png'}
                alt={userItem.displayName}
                className={`w-10 h-10 rounded-full object-cover ring-1 ring-offset-2 ${
                    selectedUser?.id === userItem.id 
                        ? 'ring-yellow-400 ring-offset-indigo-600' 
                        : 'ring-gray-500 ring-offset-current'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${selectedUser?.id === userItem.id ? 'text-white' : ''}`}>{userItem.displayName}</p>
                <p className={`text-xs truncate ${selectedUser?.id === userItem.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {userItem.email}
                </p>
              </div>
              {selectedUser?.id === userItem.id && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area (Main Panel) */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className={`p-4 border-b ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center space-x-3">
                <img
                  src={selectedUser.photoURL || '/default-avatar.png'}
                  alt={selectedUser.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-green-500/50"
                />
                <div>
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.displayName}</span>
                  <p className="text-xs text-green-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                    ACTIVE
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${
              darkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="p-4 border border-dashed border-gray-600 rounded-lg max-w-sm">
                      <p className="text-gray-400 mb-1 font-mono">
                          {'// NO MESSAGES LOGGED'}
                      </p>
                      <p className="text-sm text-yellow-400">
                          {'>> INIT: secure_link_established'}
                      </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user.uid ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-xl p-3 shadow-md transition-all duration-300 ${
                        message.senderId === user.uid
                          ? `bg-indigo-600 text-white rounded-br-none`
                          : darkMode
                          ? 'bg-gray-700 text-white rounded-tl-none border border-gray-600'
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                      }`}
                    >
                      <p className="break-words font-light">{message.text}</p>
                      <span
                        className={`text-[10px] block mt-1 opacity-70 ${
                          message.senderId === user.uid
                            ? 'text-indigo-200'
                            : darkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        } text-right`}
                      >
                        {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={sendMessage} className={`p-4 border-t ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send encrypted message to ${selectedUser.displayName}...`}
                  className={`flex-1 rounded-lg border px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold tracking-wider transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
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
          /* Initial State / Empty Chat */
          <div className={`flex-1 flex items-center justify-center ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            <div className="text-center p-6 border-2 border-dashed border-yellow-400/50 rounded-lg backdrop-blur-sm">
              <p className="text-xl font-bold text-yellow-400 mb-2 font-mono">
                {'// TERMINAL_STANDBY'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Select a user on the left to initiate a private, secure connection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDirectMessages;
