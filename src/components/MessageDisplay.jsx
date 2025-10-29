import React, { useEffect, useRef } from 'react';

// 2.3 MessageDisplay Component
const MessageDisplay = ({ messages, currentUserId, darkMode }) => {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isSelf = msg.uid === currentUserId;
        const time = msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '...';
        
        return (
          <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-xl border border-current shadow-md transition-colors duration-300 ${
              isSelf
                ? 'bg-indigo-600 border-indigo-400 text-white rounded-br-none'
                : darkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 rounded-tl-none'
                  : 'bg-white border-gray-300 text-gray-800 rounded-tl-none'
            }`}>
              <div className={`flex items-center space-x-2 mb-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                {!isSelf && (
                  <img 
                    src={msg.photoURL || 'https://placehold.co/24x24/4F46E5/FFFFFF?text=U'} 
                    alt={msg.displayName || 'User'} 
                    className="w-6 h-6 rounded-full border border-yellow-400"
                  />
                )}
                <span className={`text-xs font-semibold ${isSelf ? 'text-yellow-300' : 'text-indigo-400'}`}>{msg.displayName || 'Unknown User'}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              <span className={`block mt-1 text-[10px] ${isSelf ? 'text-indigo-300' : 'text-gray-500'} text-right`}>{time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageDisplay;