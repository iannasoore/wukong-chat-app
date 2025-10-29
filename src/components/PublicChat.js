import React , {useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

const PublicChat = ({ user, darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

    useEffect(() => {
        const q = querry(
            collection(db, 'public-messages'),
            orderBy('timestamp', 'asc')
        ); 
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                messagesData.push({ id: doc.id, ...doc.data() });
            });
            setMessages(messagesData);
            scrollToBottom(); // Scroll to the bottom when messages are updated
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessages = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        try {
            await addDoc(collection(db, 'public-messages'), {
                text: newMessage,
                timestamp: serverTimestamp(),
                user : user.displayName, 
                userId : user.id,
                userPhoto; user.photoURL 
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    };

    return (
        <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                       <div
            key={message.id}
            className={`flex ${
              message.userId === user.uid ? 'justify-end' : 'justify-start'
            }`}
          >


        )
