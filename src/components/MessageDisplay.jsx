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
          <div key={msg.id} className={`message-row ${isSelf ? 'self' : ''}`}>
            <div className={`message-bubble ${isSelf ? 'self' : 'other'}`}>
              {!isSelf && (
                <div className="message-meta">
                  <img src={msg.photoURL || 'https://placehold.co/24x24/4F46E5/FFFFFF?text=U'} alt={msg.displayName || 'User'} className="user-avatar" style={{width: '1.5rem', height: '1.5rem'}} />
                  <span className="name">
                  {msg.displayName || 'Unknown User'}
                </span>
                </div>
              )}
              <p>{msg.text}</p>
              <span className="message-time">{time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageDisplay;