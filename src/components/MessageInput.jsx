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
    <div className={`p-4 border-t border-dashed ${darkMode ? 'border-indigo-500/50 bg-gray-900' : 'border-gray-300 bg-white'}`}>
      <div className="flex space-x-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={disabled}
          rows={1}
          className={`flex-1 p-3 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 transition-shadow 
            ${darkMode 
              ? 'bg-gray-800 text-white border border-indigo-400/50' 
              : 'bg-gray-100 text-gray-900 border border-gray-300'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          style={{ maxHeight: '150px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || disabled}
          className={`px-4 rounded-lg font-bold text-lg flex items-center justify-center transition-all duration-300 transform hover:scale-[1.05] border border-current
            ${(!message.trim() || disabled)
              ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-400 shadow-md shadow-indigo-500/50'
            }`}
        >
          <Send className="w-5 h-5 mr-2" />
          SEND
        </button>
      </div>
    </div>
  );
};

export default MessageInput;