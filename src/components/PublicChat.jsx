// publicchat.jsx
import React, { useEffect, useRef, useState } from "react";
import { collection, addDoc, orderBy, limit, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Send } from "lucide-react";

const PublicChat = ({ user, darkMode, appId = "default-app" }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Load messages in real time
  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "messages"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [appId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, "artifacts", appId, "public", "data", "messages"), {
        text: text.trim(),
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || "https://placehold.co/40x40/4F46E5/FFFFFF?text=U",
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col h-[70vh] border rounded-xl overflow-hidden transition-all duration-300 ${
        darkMode ? "bg-gray-900 border-indigo-500/50" : "bg-white border-gray-200"
      }`}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isSelf = msg.uid === user.uid;
          return (
            <div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg border shadow-sm ${
                  isSelf
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              >
                <div className="text-xs font-semibold opacity-80 mb-1">
                  {msg.displayName || "Unknown"}
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={`flex items-center p-3 border-t ${
          darkMode ? "border-indigo-500/50 bg-gray-950" : "border-gray-200 bg-gray-50"
        }`}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message..."
          className={`flex-1 p-2 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 outline-none ${
            darkMode
              ? "bg-gray-800 text-white border border-indigo-400/50"
              : "bg-white text-gray-800 border border-gray-300"
          }`}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className={`ml-3 px-4 py-2 rounded-lg font-bold flex items-center gap-1 border transition-all ${
            text.trim()
              ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-500"
              : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
};

export default PublicChat;
