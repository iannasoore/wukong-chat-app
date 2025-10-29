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
    <div className="app-container">
      <div className="container-layout">
        
        {/* Header: Styled to look sharp and futuristic */}
        <header className="header">
          <h1>
            WUKONG CHAT
          </h1>
          <div className="header-controls">
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            {user && (
              <button
                onClick={handleSignOut}
                className="btn btn-logout"
              >
                <LogOut style={{width: '1em', height: '1em', marginRight: '0.5em'}} /> LOG OUT
              </button>
            )}
          </div>
        </header>

        {/* Content based on Auth State - takes remaining height */}
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
