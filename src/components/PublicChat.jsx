// publicchat.jsx
import React, { useEffect, useRef, useState } from "react";
import { collection, addDoc, orderBy, limit, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { db, getPublicCollectionPath } from "../firebase";
import MessageDisplay from "./MessageDisplay";
import MessageInput from "./MessageInput";

const PublicChat = ({ user, darkMode, appId = "default-app-id" }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  // Load messages in real time
  useEffect(() => {
    const q = query(
      collection(db, getPublicCollectionPath(appId, "messages")),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
      setMessages(msgs);
    }, (error) => console.error("Error fetching public messages:", error));

    return () => unsubscribe();
  }, [user, appId]);

  // Send message
  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;

    try {
      await addDoc(collection(db, getPublicCollectionPath(appId, "messages")), {
        text: text,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || "https://placehold.co/40x40/4F46E5/FFFFFF?text=U",
      });
      setMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyb-medium/50">
      <MessageDisplay messages={messages} currentUserId={user.uid} darkMode={darkMode} />
      <MessageInput 
        message={message} 
        setMessage={setMessage} 
        sendMessage={sendMessage} 
        disabled={false}
        darkMode={darkMode}
      />
    </div>
  );
};

export default PublicChat;
