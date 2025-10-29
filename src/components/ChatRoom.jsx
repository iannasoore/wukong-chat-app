import React, { useState } from 'react';
import PublicChat from './PublicChat.jsx';
import DirectMessages from './DirectMessages.jsx';

const ChatRoom = ({ user, darkMode, handleSignOut }) => {
  const [activeTab, setActiveTab] = useState('public');
  const primaryColor = darkMode ? 'bg-indigo-900' : 'bg-blue-600';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';

  return (
    <div className={`max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm ${cardBg} ${darkMode ? 'shadow-indigo-900/50' : 'shadow-gray-300/50'
      } transition-all duration-300`}>

      {/* Header (Top Bar) */}
      <div className={`p-4 flex justify-between items-center border-b-2 ${borderColor} ${cardBg}`}>
        <div className="flex items-center">
          <img
            src={user.photoURL || 'https://placehold.co/48x48/374151/ffffff?text=U'}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500 mr-4 transition-transform duration-300 hover:scale-105"
          />
          <div className='flex flex-col'>
            <span className={`text-xl font-extrabold tracking-wider ${textColor}`}>
              {user.displayName}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              ID: {user.uid.substring(0, 16)}...
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSignOut}
            className={`px-3 py-1 text-sm font-medium rounded-full border border-current transition-all duration-300 ${darkMode
                ? 'text-red-400 border-red-400 hover:bg-red-400 hover:text-gray-900'
                : 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white'
              }`}
          >
            LOG OUT
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`border-b-2 ${borderColor}`}>
        <nav className="flex divide-x divide-current">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-3 px-6 text-center text-lg font-semibold tracking-wide transition-all duration-300 transform -skew-x-6 mr-1 ${activeTab === 'public'
                ? `${primaryColor} ${textColor} border-b-4 border-yellow-400 shadow-inner`
                : `${cardBg} ${subtextColor} hover:bg-opacity-75`
              }`}
          >
            <span className="skew-x-6 inline-block">Public Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('dm')}
            className={`flex-1 py-3 px-6 text-center text-lg font-semibold tracking-wide transition-all duration-300 transform skew-x-6 ml-1 ${activeTab === 'dm'
                ? `${primaryColor} ${textColor} border-b-4 border-yellow-400 shadow-inner`
                : `${cardBg} ${subtextColor} hover:bg-opacity-75`
              }`}
          >
            <span className="-skew-x-6 inline-block">Direct Messages</span>
          </button>
        </nav>
      </div>

      {/* Chat Content */}
      <div className="h-[400px] lg:h-[600px] overflow-y-hidden">
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