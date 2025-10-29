// app.jsx
import React, { useEffect, useState } from "react";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from "./firebase";
import { LogOut } from "lucide-react";

import Login from "./components/Login.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import ChatRoom from "./components/ChatRoom.jsx";

// Custom sign-in function using the initial auth token
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribe;

    const signIn = async () => {
      
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
        if (currentUser) {
          // Ensure user profile exists for DM purposes
          const userRef = doc(db, 'artifacts', "default-app-id", 'public', 'data', 'users', currentUser.uid);
          setDoc(userRef, { 
            uid: currentUser.uid, 
            displayName: currentUser.displayName || `Anon-${currentUser.uid.substring(0, 8)}`,
            photoURL: currentUser.photoURL || 'https://placehold.co/40x40/4F46E5/FFFFFF?text=U',
            lastActive: serverTimestamp() 
          }, { merge: true });
        }
      });
    };
    
    signIn();
    
    return () => unsubscribe && unsubscribe();
  }, []);

  return { user, authReady };
};

const App = () => {
  const { user, authReady } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Theme initialization from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Theme toggle handler
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

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-mono">
        <p className="text-xl text-yellow-400">LOADING_ACCESS_PROTOCOL...</p>
      </div>
    );
  }

  return (
    // Global container: Set dark background for full screen
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gray-950 text-white' // Deeper background for cyberpunk feel
        : 'bg-gray-50 text-gray-900'
    } font-mono`}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Header: Styled to look sharp and futuristic */}
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-dashed border-indigo-500/50">
          <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-widest ${
            darkMode ? 'text-yellow-400' : 'text-indigo-600'
          } transition-colors duration-300`}>
            WUKONG CHAT
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            {user && (
              <button
                onClick={handleSignOut}
                className={`px-3 py-1 text-sm font-medium rounded-full border border-current transition-all duration-300 ${
                    darkMode 
                        ? 'text-red-400 border-red-400 hover:bg-red-400 hover:text-gray-900' 
                        : 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white'
                }`}
              >
                <LogOut className="w-4 h-4 inline mr-1 -mt-0.5" /> LOG OUT
              </button>
            )}
          </div>
        </header>

        {/* Content based on Auth State */}
        {user ? (
          <ChatRoom user={user} darkMode={darkMode} />
        ) : (
          <Login darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default App;
