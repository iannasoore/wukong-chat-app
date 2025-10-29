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
      className={`px-4 py-2 font-bold flex items-center space-x-2 transition-all duration-200 border-b-2 font-mono text-sm
        ${activeTab === tab
          ? 'text-yellow-400 border-yellow-400 bg-indigo-600/20'
          : darkMode
            ? 'text-gray-400 border-transparent hover:text-yellow-500/70 hover:bg-gray-800'
            : 'text-gray-600 border-transparent hover:text-indigo-600 hover:bg-gray-200'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col rounded-xl shadow-2xl overflow-hidden transition-colors duration-500 border-2 ${darkMode ? 'shadow-indigo-500/30 border-indigo-500/50' : 'shadow-gray-400/50 border-gray-200'}`} style={{ height: '75vh' }}>
      
      {/* Tab Header */}
      <div className={`flex border-b border-dashed ${darkMode ? 'border-indigo-500/50 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <TabButton tab="public" icon={MessageSquare} label="Public Chat" />
        <TabButton tab="dm" icon={Users} label="Direct Messages" />
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'public' && <PublicChat user={user} darkMode={darkMode} />}
        {activeTab === 'dm' && <DirectMessages user={user} darkMode={darkMode} />}
      </div>
    </div>
  );
};

export default ChatRoom;