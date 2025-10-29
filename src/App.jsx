import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    // Global container: Set dark background for full screen
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gray-950 text-white' // Deeper background for cyberpunk feel
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Header: Styled to look sharp and futuristic */}
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-dashed border-indigo-500/50">
          <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-widest font-mono ${
            darkMode ? 'text-yellow-400' : 'text-indigo-600'
          } transition-colors duration-300`}>
            WUKONG CHAT
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            {user && (
              <button
                onClick={handleSignOut}
                // Styled as high-contrast red button (matching ChatRoom header style)
                className={`px-3 py-1 text-sm font-medium rounded-full border border-current transition-all duration-300 ${
                    darkMode 
                        ? 'text-red-400 border-red-400 hover:bg-red-400 hover:text-gray-900' 
                        : 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white'
                }`}
              >
                LOG OUT
              </button>
            )}
          </div>
        </header>

        {/* Content based on Auth State */}
        {user ? (
          // Pass handleSignOut to ChatRoom so the button inside ChatRoom can use it
          <ChatRoom user={user} darkMode={darkMode} handleSignOut={handleSignOut} />
        ) : (
          <Login darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}

export default App;