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
const useAuth = () => {    //common js arrow function
  //useAuth is a custom hook. its reusable 

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {  // useEffect runs after the component mounts
    // Initialize Firebase Auth and Firestore
    const auth = getAuth();
    const db = getFirestore();
    let unsubscribe;

    const signIn = async () => {
      
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {//onAuthStateChanged is a firebase function that listens to the auth state changes
        setUser(currentUser);// update the user state with the current user status from firebase
        setAuthReady(true);
        if (currentUser) { // If user is signed in it creates or updates the user profile in Firestore
          // Ensure user profile exists for DM purposes
          const userRef = doc(db, 'artifacts', "default-app-id", 'public', 'data', 'users', currentUser.uid);
          setDoc(userRef, { 
            userId: currentUser.uid, 
            displayName: currentUser.displayName || `Anon-${currentUser.uid.substring(0, 8)}`,
            photoURL: currentUser.photoURL || 'https://placehold.co/40x40/4F46E5/FFFFFF?text=U',
            lastActive: serverTimestamp() 
          }, { merge: true });
        }
      });
    };
    
    signIn();
    
    return () => unsubscribe && unsubscribe();  //function that returns jsx .. // this is a cleanup function that runs when the component unmounts
  }, []);   

  return { user, authReady };
}; // java script can be written in the jsx using curly braces

const App = () => {    // Main App component
  const { user, authReady } = useAuth(); // Custom hook to manage authentication state
  const [darkMode, setDarkMode] = useState(false); // State for dark mode


  // Theme initialization from localStorage
  useEffect(() => {  // Check localStorage for dark mode preference
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

  const handleSignOut = () => {  // Sign out handler
    signOut(auth);
  };

  if (!authReady) {  // Show loading state until auth is ready
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-mono">
        <p className="text-xl text-yellow-400">LOADING...PLEASE WAIT...</p>
      </div>
    );
  }

  return (
    // Global container: Set dark background for full screen//  we use className instead of class since class is a reserve word
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
