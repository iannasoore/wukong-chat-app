import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

const DirectMessages = ({ user, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  // Fetch all users (simplified - in real app, you'd have a users collection)
  useEffect(() => {
    // This is a simplified approach. In production, you'd maintain a users collection
    const fetchUsers = async () => {
      // For demo purposes, we'll use a static list
      // In real app, you'd query your users collection from Firestore
      setUsers([
        { id: 'user1', displayName: 'John Doe', photoURL: '' },
        { id: 'user2', displayName: 'Jane Smith', photoURL: '' },
        // Add more users as needed
      ]);
    };
    fetchUsers();
  }, []);

  const scrollToBottom =() => {
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
        conversationId: conversationId,
        userPhoto: user.photoURL
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-full flex">
      {/* Users List */}
      <div className={`w-1/3 border-r ${
        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className={`p-4 border-b text-gray-800 dark:text-white ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className="font-semibold">Users</h3>
        </div>
        <div className="overflow-y-auto">
          {users.map((userItem) => (
            <button
              key={userItem.id}
              onClick={() => setSelectedUser(userItem)}
              className={`w-full text-left p-4 border-b transition-colors ${
                selectedUser?.id === userItem.id
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : darkMode
                  ? 'border-gray-700 hover:bg-gray-700 text-white'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center">
                <img
                  src={userItem.photoURL || '/default-avatar.png'}
                  alt={userItem.displayName}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <span>{userItem.displayName}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */} 
            <div className={`p-4 border-b ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center">
                <img
                  src={selectedUser.photoURL || '/default-avatar.png'}
                  alt={selectedUser.displayName}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <span className="font-semibold text-gray-800 dark:text-white">{selectedUser.displayName}</span>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              darkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user.uid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                      message.senderId === user.uid
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  > 
                    {message.senderId !== user.uid && (
                      <div className="flex items-center mb-2">
                        <img src={message.userPhoto || '/default-avatar.png'} alt={message.senderName} className="w-8 h-8 rounded-full mr-2" />
                        <span className="font-semibold">{message.senderName}</span>
                      </div>
                    )}
                    <p className="break-words">{message.text}</p>
                    <span
                      className={`text-xs block mt-1 ${
                        message.senderId === user.uid
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >{message.timestamp?.toDate().toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
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
                  placeholder={`Message ${selectedUser.displayName}...`}
                  className={`flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessages;
