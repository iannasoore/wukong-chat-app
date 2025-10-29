import React, { useState, useEffect, useRef } from 'react';
import { db, getPublicCollectionPath, getPrivateCollectionPath, getDmRoomId, getUserColor } from '../firebase.js';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  writeBatch
} from 'firebase/firestore';
import MessageDisplay from './MessageDisplay.jsx';
import MessageInput from './MessageInput.jsx';
import { ChevronRight, User, X, Users } from 'lucide-react';

const DirectMessages = ({ user, darkMode, appId = "default-app-id" }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState({});

  const currentUserId = user.uid;

  // 3A. Fetch User List
  useEffect(() => {
    const usersQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const allUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== currentUserId); // Exclude self
      
      setUsers(allUsers);
    }, (error) => console.error("Error fetching users:", error));

    // 2. Setup Active Status Listener (simplified example for active)
    const qActive = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
    const unsubscribeActive = onSnapshot(qActive, (snapshot) => {
        const statusMap = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            // Simple check: active if lastActive is recent (e.g., within 5 minutes)
            const isActive = data.lastActive && (Date.now() - data.lastActive.toDate().getTime() < 300000); 
            statusMap[doc.id] = isActive;
        });
        setActiveUsers(statusMap);
    });

    return () => {
        unsubscribeUsers();
        unsubscribeActive();
    };
  }, [currentUserId, appId]);

  // 3B. Fetch Messages for Selected User
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const chatPath = (u1, u2) => {
        // Create a unique, deterministic chat ID based on user UIDs
        const ids = [u1, u2].sort();
        return `chat_${ids[0]}_${ids[1]}`;
    }

    const chatID = chatPath(currentUserId, selectedUser.id);
    const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'chats', chatID, 'messages');

    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
        setMessages(msgs);
    }, (error) => console.error("Error fetching DM messages:", error));

    return () => unsubscribeMessages();
  }, [selectedUser, currentUserId, appId]);

  // 3D. Send Message Logic
  const sendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedUser) return;

    try {
      const chatID = [currentUserId, selectedUser.id].sort().join('_');
      const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'chats', `chat_${chatID}`, 'messages');

      await addDoc(messagesRef, {
        text: text,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName || `Anon-${user.uid.substring(0, 8)}`,
        photoURL: user.photoURL || 'https://placehold.co/40x40/4F46E5/FFFFFF?text=U',
      });
      setMessage('');
    } catch (error) {
      console.error("Error sending DM:", error);
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessage(''); // Clear input when switching
  };

  // --- DM RENDER ---
  return (
    <div className="dm-layout">
      {/* User List Sidebar */}
      <div className="dm-sidebar">
        <div className="dm-sidebar-header">
            <Users style={{display: 'inline', width: '1em', height: '1em', marginRight: '0.5em', marginTop: '-0.25em'}} /> ONLINE_USERS
        </div>
        <div className="dm-user-list">
          {users.map((u) => (
            <button
              key={u.userId}
              onClick={() => handleSelectUser(u)}
              className={`dm-user-button ${selectedUser?.id === u.id ? 'selected' : ''}`}
            >
              <div className="user-status">
                <img 
                  src={u.photoURL || 'https://placehold.co/32x32/4F46E5/FFFFFF?text=U'} 
                  alt={u.displayName} 
                  className="user-avatar"
                />
                <span className={`status-dot ${activeUsers[u.id] ? 'active' : 'inactive'}`} title={activeUsers[u.id] ? 'Online' : 'Offline'}></span>
              </div>
              <span className="dm-user-info">{u.displayName}</span>
              <ChevronRight style={{width: '1rem', height: '1rem', transition: 'transform 0.2s', transform: selectedUser?.id === u.id ? 'rotate(90deg)' : 'none'}} />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="dm-chat-pane">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="dm-chat-header">
              <h3>
                <User style={{width: '1.25rem', height: '1.25rem'}} />
                <span>COMMUNICATING WITH: {selectedUser.displayName}</span>
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="btn"
                style={{color: 'var(--error)', padding: '0.25rem', borderRadius: '9999px'}}
                aria-label="Close chat"
              >
                <X style={{width: '1rem', height: '1rem'}} />
              </button>
            </div>

            {/* Messages */}
            <MessageDisplay 
              messages={messages} 
              currentUserId={currentUserId} 
              darkMode={darkMode}
            />

            {/* Input */}
            <MessageInput 
              message={message} 
              setMessage={setMessage} 
              sendMessage={sendMessage} 
              disabled={!selectedUser}
              darkMode={darkMode}
            />
          </>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
            <div style={{padding: '1rem', border: '1px dashed', borderRadius: '0.5rem', maxWidth: '24rem', textAlign: 'center'}}>
              <span style={{color: 'var(--accent)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem'}}>{'// TARGET_SELECTION_REQUIRED'}</span>
              Select an online user from the left pane to initiate a direct message.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessages;
