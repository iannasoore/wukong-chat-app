// app.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import Login from "./login";
import PublicChat from "./publicchat";
import Chat from "./chat";
import ThemeToggle from "./themetoggle";
import { MessageSquare, Users, LogOut } from "lucide-react";

const App = () => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [tab, setTab] = useState("public"); // 'public' or 'dm'

  // Initialize auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        await signInAnonymously(auth);
      } else {
        setUser(currentUser);
        // Ensure user doc exists for DMs
        const userRef = doc(db, "artifacts", "default-app", "public", "data", "users", currentUser.uid);
        await setDoc(
          userRef,
          {
            uid: currentUser.uid,
            displayName: currentUser.displayName || `Anon-${currentUser.uid.slice(0, 6)}`,
            photoURL:
              currentUser.photoURL || "https://placehold.co/40x40/4F46E5/FFFFFF?text=U",
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Dark mode init
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono bg-gray-950 text-yellow-400">
        <p>INITIALIZING PROTOCOL...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors font-mono ${
        darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-indigo-500/50">
          <h1
            className={`text-3xl font-extrabold tracking-widest ${
              darkMode ? "text-yellow-400" : "text-indigo-600"
            }`}
          >
            WUKONG CHAT
          </h1>

          <div className="flex items-center gap-4">
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            {user && (
              <button
                onClick={handleLogout}
                className={`px-3 py-1 text-sm font-semibold rounded-full border transition-all ${
                  darkMode
                    ? "text-red-400 border-red-400 hover:bg-red-900"
                    : "text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                }`}
              >
                <LogOut className="inline w-4 h-4 mr-1" />
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Body */}
        {user ? (
          <>
            <div className="flex justify-center mb-6 space-x-2">
              <button
                onClick={() => setTab("public")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-b-2 font-semibold transition ${
                  tab === "public"
                    ? "border-yellow-400 text-yellow-400"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-yellow-400"
                    : "border-transparent text-gray-600 hover:text-indigo-600"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Public
              </button>
              <button
                onClick={() => setTab("dm")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-b-2 font-semibold transition ${
                  tab === "dm"
                    ? "border-yellow-400 text-yellow-400"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-yellow-400"
                    : "border-transparent text-gray-600 hover:text-indigo-600"
                }`}
              >
                <Users className="w-4 h-4" /> Direct
              </button>
            </div>

            {tab === "public" ? (
              <PublicChat user={user} darkMode={darkMode} />
            ) : (
              <Chat user={user} darkMode={darkMode} />
            )}
          </>
        ) : (
          <Login darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default App;
