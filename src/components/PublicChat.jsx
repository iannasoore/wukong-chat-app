// publicchat.jsx
import React, { useEffect, useRef, useState } from "react";
import { collection, addDoc, orderBy, limit, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { db, getPublicCollectionPath } from "../firebase";
import MessageDisplay from "./MessageDisplay";
import MessageInput from "./MessageInput";

// PublicChat  functional Component
//it receivers props like user, darkMode, and appId
const PublicChat = ({ user, darkMode, appId = "default-app-id" }) => {
    // useState jooks give a component its own state or memory
  const [messages, setMessages] = useState([]);
  // `message` will hold the current text inside the input box. It starts as an empty string.
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

   // side effect to load messages from Firestore
  // Load messages in real time
  // `useEffect` is a hook for running "side effects" – code that interacts with the outside world, like fetching data.
  useEffect(() => {
    const q = query(
      collection(db, getPublicCollectionPath(appId, "messages")),
      orderBy("createdAt", "desc"), // Order by creation time in descending order
      limit(50)
    );

    // `onSnapshot` listens for real-time updates to the query.
    const unsubscribe = onSnapshot(q, (snapshot) => {
          // Map the raw document data from Firestore into a clean array of message objects.
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
      setMessages(msgs);
      // Update the component's state with the new list of messages. This will cause React to re-render the UI.
    }, (error) => console.error("Error fetching public messages:", error));

     // The function returned from `useEffect` is a cleanup function. It runs when the component is removed from the screen.
    // Here, it unsubscribes from the Firestore listener to prevent memory leaks.
    return () => unsubscribe();
  }, [user, appId]);

  // Send message
  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;   // If the message is empty, do nothing
    setError(null);
    setSending(true);
    try {
      // `addDoc` adds a new document to the specified Firestore collection.
      // We include a clientCreatedAt fallback so the UI can show a timestamp even
      // if serverTimestamp hasn't been resolved yet or if reads are limited.
      await addDoc(collection(db, getPublicCollectionPath(appId, "messages")), {
        text: text,
        createdAt: serverTimestamp(),
        clientCreatedAt: Date.now(),
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || "https://placehold.co/40x40/4F46E5/FFFFFF?text=U",
      });
      // After sending the message, clear the input box
      setMessage('');
    } catch (err) {
      // Log full error object for easier debugging in the browser console
      console.error("Error sending message:", err);
      const code = err?.code || err?.status || '';
      const message = err?.message || String(err);
      setError(code ? `${code}: ${message}` : message);
    } finally {
      setSending(false);
    }
  };
    // Render the chat window with messages and input
  return (
    <div className="chat-window">
      {error && (
        <div style={{padding: '0.5rem 1rem', color: 'var(--error)', backgroundColor: 'rgba(0,0,0,0.05)'}}>
          Error sending message: {error}
        </div>
      )}
      <MessageDisplay messages={messages} currentUserId={user.uid} darkMode={darkMode} />
      <MessageInput 
        message={message} 
        setMessage={setMessage} 
        sendMessage={sendMessage} 
        disabled={sending}
        darkMode={darkMode}
      />
    </div>
  );
};

export default PublicChat;
