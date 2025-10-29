import React, { useState } from 'react';
import PublicChat from './PublicChat';
import DirectMessages from './DirectMessages';

const ChatRoom = ({ user, darkMode }) => {
  const [activeTab, setActiveTab] = useState('public');

  // Define color palette variables for cleaner conditional classes
  const primaryColor = darkMode ? 'bg-indigo-900' : 'bg-blue-600';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';


  return (
    <div className={`max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm ${bgColor} ${
      darkMode ? 'shadow-indigo-900/50' : 'shadow-gray-300/50'
    } transition-all duration-300`}>

      {/* Tab Navigation */}
      <div className={`border-b-2 ${borderColor}`}>
        <nav className="flex divide-x divide-current">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-3 px-6 text-center text-lg font-semibold tracking-wide transition-all duration-300 transform -skew-x-6 mr-1 ${
              activeTab === 'public'
                ? `${primaryColor} ${textColor} border-b-4 border-yellow-400 shadow-inner`
                : `${cardBg} ${subtextColor} hover:bg-opacity-75`
            }`}
          >
            <span className="skew-x-6 inline-block">Public Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('dm')}
            className={`flex-1 py-3 px-6 text-center text-lg font-semibold tracking-wide transition-all duration-300 transform skew-x-6 ml-1 ${
              activeTab === 'dm'
                ? `${primaryColor} ${textColor} border-b-4 border-yellow-400 shadow-inner`
                : `${cardBg} ${subtextColor} hover:bg-opacity-75`
            }`}
          >
            <span className="-skew-x-6 inline-block">Direct Messages</span>
          </button>
        </nav>
      </div>

      {/* Chat Content */}
      <div className="h-[400px] lg:h-[600px] overflow-y-auto">
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