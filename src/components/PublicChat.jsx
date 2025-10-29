import React, {useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
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

    useEffect(() => { 
        //for public chats. listens to pulic chats
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
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
    
        try {
            await addDoc(collection(db, 'public-messages'), {
                text: newMessage,
                timestamp: serverTimestamp(),
                user: user.displayName,
                userId: user.uid,
                userPhoto: user.photoURL
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return ( 
        <div className="h-full flex flex-col">
            {/* Message List */}
            <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} space-y-4 `}>
                {messages.map((message) => ( 
                    <div key={message.id} className={`flex ${message.userId === user.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.userId === user.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {message.userId !== user.uid && (
                                <div className="flex items-center mb-2">
                                    <img src={message.userPhoto || '/default-avatar.png'} alt={message.user} className="w-8 h-8 rounded-full mr-2" />
                                    <span className="font-semibold">{message.user}</span>
                                </div>
                            )}

                            <p className="break-words">{message.text}</p>
                            <span className={`text-xs block mt-1 ${message.userId === user.uid ? 'text-gray-300' : 'text-gray-500'}`}>
                                {message.timestamp?.toDate().toLocaleTimeString()}
                            </span>
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
            placeholder="Type your message..."
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
    </div>
  );
};

export default PublicChat;                  

        