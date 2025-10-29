import React , { useSate, useEffect, useRef }from 'react';
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
    if (selectedUser)  
      return;  
    const conversationId = [user.uid, selectedUser.id].sort().join('_');
    const q = query(
      collection(db, 'direct-messages', conversationId, 'messages'),
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
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedUser) return;
    
    const conversationId = [user.uid, selectedUser.id].sort().join('_');
    try {
      await addDoc(collection(db, 'direct-messages', conversationId, 'messages'), {
        text: newMessage,
        timestamp: serverTimestamp(),
        senderId: user.uid,
        sendName: user.displayName,
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
                    