import React, { useState } from 'react';
import PublicChat from './PublicChat.jsx';
import DirectMessages from './DirectMessages.jsx'; // Ensure this file is renamed

const ChatRoom = ({ user, darkMode }) => {
  const [activeTab, setActiveTab] = useState('public');

  return (
    <div className={`max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Tab Navigation */}
      <div className={`border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <nav className="flex">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'public'
                ? darkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : darkMode
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Public Chat
          </button>
          <button
            onClick={() => setActiveTab('dm')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'dm'
                ? darkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : darkMode
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Direct Messages
          </button>
        </nav>
      </div>

      {/* Chat Content */}
      <div className="h-96">
        {activeTab === 'public' ? (
          <PublicChat user={user} darkMode={darkMode} />
        ) : (
          <DirectMessages user={user} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
