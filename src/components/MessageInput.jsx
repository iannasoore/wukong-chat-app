import React from 'react';
import { Send } from 'lucide-react';

// 2.4 MessageInput Component
const MessageInput = ({ message, setMessage, sendMessage, disabled, darkMode }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const placeholderText = disabled ? 'Select a user to initiate private comms...' : 'Input command >';

  return (
    <div className="input-area">
      <div className="input-area-flex">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={disabled}
          rows={1}
          className="input-textarea"
          style={{ maxHeight: '150px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || disabled}
          className="btn input-send-btn"
        >
          <Send style={{width: '1.25rem', height: '1.25rem'}} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;