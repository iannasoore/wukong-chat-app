import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login.jsx'; // Ensure this file is renamed
import ChatRoom from './components/ChatRoom.jsx'; // Ensure this file is renamed
import './index.css'; // Import main CSS file

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <main className="p-4">
        {user ? <ChatRoom user={user} darkMode={darkMode} /> : <Login darkMode={darkMode} />}
      </main>
    </div>
  );
};

export default App;