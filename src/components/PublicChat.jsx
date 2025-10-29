import React, {useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
    collection, 
    addDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from 'firebase/firestore';

const PublicChat = ({ user, darkMode }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { 
        //for public chats. listens to pulic chats
        const q = query(
            collection(db, 'public-messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                messagesData.push({ id: doc.id, ...doc.data() });
            });
            setMessages(messagesData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
    
        try {
            await addDoc(collection(db, 'public-messages'), {
                text: newMessage,
                timestamp: serverTimestamp(),
                user: user.displayName,
                user.id: user.uid,
                userPhoto: user.photoURL
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        }
    })