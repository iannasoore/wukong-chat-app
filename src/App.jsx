import React, { useState, useEffect } from 'react';
import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  signInWithCustomToken
} from 'firebase/auth';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import ThemeToggle from './components/ThemeToggle.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Initial Auth & Theme Setup
  useEffect(() => {
    // --- 1. Canvas Authentication Setup ---
    const initializeAuth = async () => {
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Custom/Anonymous sign-in failed:", error);
      }
    };

    // --- 2. Theme Setup ---
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // --- 3. Auth State Listener ---
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    initializeAuth();
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

  // If auth state is not determined yet, show a loader
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-yellow-400 font-mono animate-pulse">INITIATING_PROTOCOL...</p>
      </div>
    );
  }

  // Only render the main app once the Firebase auth state has been checked
  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${darkMode
          ? 'bg-gray-950 text-white'
          : 'bg-gray-50 text-gray-900'
        }`}
    >
      <div className="container mx-auto px-4 py-8">

        <header className="flex justify-between items-center mb-10 pb-4 border-b border-dashed border-indigo-500/50">
          <h1
            className={`text-3xl lg:text-4xl font-extrabold tracking-widest font-mono ${darkMode ? 'text-yellow-400' : 'text-indigo-600'
              } transition-colors duration-300`}
          >
            Wukong Chat
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            {/* Only show sign out if user is signed in with a provider (not anonymously) AND is not being handled by ChatRoom */}
            {user && user.providerData.length > 0 && !user.isAnonymous && (
              <button
                onClick={handleSignOut}
                className={`px-3 py-1 text-sm font-medium rounded-full border border-current transition-all duration-300 ${darkMode
                    ? 'border-red-400 text-red-400 hover:bg-red-400 hover:text-gray-900'
                    : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
              >
                LOGOUT
              </button>
            )}
          </div>
        </header>

        {/* Conditional rendering based on user authentication */}
        {user && (user.providerData.length > 0 || user.isAnonymous) ? (
          <ChatRoom user={user} darkMode={darkMode} handleSignOut={handleSignOut} />
        ) : (
          <Login darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}

export default App;