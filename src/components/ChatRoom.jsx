import React, { useState, useEffect } from 'react';
import PublicChat from './PublicChat.jsx';
import DirectMessages from './DirectMessages.jsx';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { MessageSquare, Users } from 'lucide-react';

const appId = 'default-app-id';

// 2.7 ChatRoom Component (Contains Tabs)
const ChatRoom = ({ user, darkMode }) => {
  const [activeTab, setActiveTab] = useState('public'); // 'public' or 'dm'

  // Update user's last active time every minute
  useEffect(() => {
    const updateActiveTime = async () => {
        if (!user) return;
        try {
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
            await updateDoc(userRef, { lastActive: serverTimestamp() });
        } catch (error) {
            // Ignore common permission errors for anon users
            console.warn("Could not update last active time:", error.message);
        }
    };

    updateActiveTime();
    const interval = setInterval(updateActiveTime, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [user]);

  const TabButton = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`tab-button ${activeTab === tab ? 'active' : ''}`}
    >
      <Icon style={{width: '1em', height: '1em'}} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="main-content">
      
      {/* Tab Header */}
      <div style={{display: 'flex', borderBottom: '2px dashed var(--border-color)', backgroundColor: 'var(--bg-dark)'}}>
        <TabButton tab="public" icon={MessageSquare} label="Public Chat" />
        <TabButton tab="dm" icon={Users} label="Direct Messages" />
      </div>

      {/* Chat Content */}
      <div style={{flex: 1, overflow: 'hidden'}}>
        {activeTab === 'public' && <PublicChat user={user} darkMode={darkMode} />}
        {activeTab === 'dm' && <DirectMessages user={user} darkMode={darkMode} />}
      </div>
    </div>
  );
};

export default ChatRoom;