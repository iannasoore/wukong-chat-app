// File: src/components/PublicChat.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  db,
  getPublicCollectionPath,
  PUBLIC_COLLECTION_NAME,
  getUserColor
} from '../firebase.js';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';

const PublicChat = ({ user, darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const publicMessagesRef = useMemo(() => collection(db, getPublicCollectionPath(PUBLIC_COLLECTION_NAME)), []);

  useEffect(() => {
    const q = query(
      collection(db, 'public-messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    }, (error) => {
      console.error("Error fetching public messages:", error);
    });

    return () => unsubscribe();
  }, [publicMessagesRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(publicMessagesRef, {
        text: newMessage,
        timestamp: serverTimestamp(),
        user: user.displayName,
        userId: user.uid,
        userPhoto: user.photoURL,
        email: user.email // Added email here to match DM logic
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending public message:', error);
    }
  };


  return (
    <div className="h-full flex flex-col">
      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {messages.length === 0 ? (
             <div className="flex items-center justify-center h-full text-center">
                <div className="p-4 border border-dashed border-gray-600 rounded-lg max-w-sm">
                    <p className="text-gray-400 mb-1 font-mono">
                        {'// PUBLIC_CHANNEL_ONLINE'}
                    </p>
                    <p className="text-sm text-yellow-400">
                        {'>> Say hi to everyone!'}
                    </p>
                </div>
            </div>
        ) : (
            messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${
                    message.userId === user.uid ? 'justify-end' : 'justify-start'
                    }`}
                >
                    <div
                    className={`max-w-xs lg:max-w-md rounded-xl p-3 shadow-md ${
                        message.userId === user.uid
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-600/30'
                        : darkMode
                        ? 'bg-gray-700 text-white rounded-tl-none border border-gray-600'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                    }`}
                    >
                    {message.userId !== user.uid && (
                        <div className="flex items-center mb-1">
                        <img
                            src={message.userPhoto || 'https://placehold.co/24x24/374151/ffffff?text=U'}
                            alt={message.user}
                            className="w-6 h-6 rounded-full mr-2 ring-1 ring-offset-2 ring-offset-gray-700 ring-current"
                        />
                        <span className={`text-sm font-bold ${getUserColor(message.userId)}`}>
                            {message.user}
                        </span>
                        </div>
                    )}
                    <p className="break-words font-light">{message.text}</p>
                    <span
                        className={`text-[10px] block mt-1 opacity-70 ${
                        message.userId === user.uid
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
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className={`p-4 border-t ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Broadcast message to public channel..."
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
    </div>
  );
};

export default PublicChat;