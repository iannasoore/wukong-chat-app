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
import MessageDisplay from './MessageDisplay.jsx'; // Reusable component for showing messages
import MessageInput from './MessageInput.jsx';  // Reusable component for the text input.
import { ChevronRight, User, X, Users } from 'lucide-react'; // Icons for the UI

// This component handles the entire Direct Messaging experience, including the user list and the private chat window.
const DirectMessages = ({ user, darkMode, appId = "default-app-id" }) => {
  // --- State Management ---
  // `useState` hooks to manage the component's internal state.
  const [users, setUsers] = useState([]); // Holds the list of all other users available to chat with.
  const [selectedUser, setSelectedUser] = useState(null);
  // Holds the user object for the currently active chat, or `null` if none is selected.
  const [messages, setMessages] = useState([]); // Holds the messages for the currently selected chat.
  const [message, setMessage] = useState(''); // Holds the text for the message input box.
  const [activeUsers, setActiveUsers] = useState({}); // An object to track the online/offline status of each user.

  const currentUserId = user.uid; // A convenient variable for the current user's ID.

  // Effect to fetch users and their active status
  // This `useEffect` is responsible for populating the user list on the sidebar.
  useEffect(() => {
    // 1. Define the Firestore Query for the 'users' collection.
    const usersQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'));

    // Combine user fetching and status listening into a single listener for efficiency.
    // `onSnapshot` creates a real-time listener that updates whenever the user data changes.
    const unsubscribe = onSnapshot(usersQ, (snapshot) => {
      const usersData = [];
      const statusMap = {};
      snapshot.forEach(doc => {
        const userData = { id: doc.id, ...doc.data() };
        // Simple check: active if lastActive is recent (e.g., within 5 minutes)
        statusMap[doc.id] = userData.lastActive && (Date.now() - userData.lastActive.toDate().getTime() < 300000);
        // We filter out the current user from the list so you don't see yourself.
        if (doc.id !== currentUserId) {
          usersData.push(userData);
        }
      });
      // Update the state for the user list and their activity status.
      setUsers(usersData);
      setActiveUsers(statusMap);
    });

    // 3. Cleanup: Unsubscribe from the listener when the component unmounts to prevent memory leaks.
    return () => unsubscribe();
  }, [currentUserId, appId]); // Dependency array: This effect re-runs if the logged-in user changes.

  // Effect to fetch messages for the currently selected chat.
  useEffect(() => {
    // If no user is selected, clear the messages and do nothing else.
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    // Helper function to create a consistent, sorted chat room ID for any two users.
    const chatPath = (u1, u2) => {
        // Create a unique, deterministic chat ID based on user UIDs
        const ids = [u1, u2].sort();
        return `chat_${ids[0]}_${ids[1]}`;
    }

    const chatID = chatPath(currentUserId, selectedUser.id);
    // The path to the messages is a subcollection inside a document named after the chatID.
    const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'chats', chatID, 'messages');

    // Query the last 50 messages, ordered by creation time.
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));

    // Set up a real-time listener for the messages in this specific chat room.
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
        setMessages(msgs);
    }, (error) => console.error("Error fetching DM messages:", error));

    // Cleanup: Unsubscribe from the message listener when the selected user changes or the component unmounts.
    return () => unsubscribeMessages();
  }, [selectedUser, currentUserId, appId]); // Dependency array: This effect re-runs when a new user is selected.

  // Event handler for sending a new message.
  const sendMessage = async () => {
    const text = message.trim(); // Get the message text and remove whitespace.
    // Don't send if there's no text or no user selected.
    if (!text || !selectedUser) return;

    try {
      const chatID = [currentUserId, selectedUser.id].sort().join('_');
      const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'chats', `chat_${chatID}`, 'messages');

      // Add the new message document to the database.
      await addDoc(messagesRef, {
        text: text,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName || `Anon-${user.uid.substring(0, 8)}`,
        photoURL: user.photoURL || 'https://placehold.co/40x40/4F46E5/FFFFFF?text=U',
      });
      // IMPORTANT: Clear the input field after sending.
      setMessage('');
    } catch (error) {
      console.error("Error sending DM:", error);
    }
  };

  const handleSelectUser = (u) => {
    // Update the state to the newly selected user.
    setSelectedUser(u);
    setMessage(''); // Clear input when switching
  };

  // --- JSX: The Rendered UI ---
  return (
    <div className="dm-layout">
      {/* User List Sidebar */}
      <div className="dm-sidebar">
        <div className="dm-sidebar-header">
            <Users style={{display: 'inline', width: '1em', height: '1em', marginRight: '0.5em', marginTop: '-0.25em'}} /> ONLINE_USERS
        </div>
        <div className="dm-user-list">
          {/* Map over the `users` array to render a button for each user. */}
          {users.map((u) => (
            <button
              // A unique key is essential for React's list rendering.
              key={u.id}
              onClick={() => handleSelectUser(u)}
              className={`dm-user-button ${selectedUser?.id === u.id ? 'selected' : ''}`}
            >
              <div className="user-status">
                <img 
                  src={u.photoURL || 'https://placehold.co/32x32/4F46E5/FFFFFF?text=U'} 
                  alt={u.displayName} 
                  className="user-avatar"
                />
                {/* The green/red status dot. */}
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
        {/* Conditional Rendering: Show chat UI or a placeholder message. */}
        {selectedUser ? (
          <>
            {/* Header showing who you're talking to. */}
            <div className="dm-chat-header">
              <h3>
                <User style={{width: '1.25rem', height: '1.25rem'}} />
                <span>COMMUNICATING WITH: {selectedUser.displayName}</span>
              </h3>
              <button 
                // "Close" the chat by setting selectedUser to null.
                onClick={() => setSelectedUser(null)}
                className="btn"
                style={{color: 'var(--error)', padding: '0.25rem', borderRadius: '9999px'}}
                aria-label="Close chat"
              >
                <X style={{width: '1rem', height: '1rem'}} />
              </button>
            </div>

            {/* Reusable components for displaying messages and the input box. */}
            <MessageDisplay 
              messages={messages} 
              currentUserId={currentUserId} 
              darkMode={darkMode}
            />

            <MessageInput 
              message={message} 
              setMessage={setMessage} 
              sendMessage={sendMessage} 
              disabled={!selectedUser}
              darkMode={darkMode}
            />
          </>
        ) : (
          // Placeholder shown when no chat is active.
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
