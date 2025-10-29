import React , { useSate, useEffect, useRef }from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';


const DirectMessages = ({ user, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  // Fetch all users (simplified - in real app, you'd have a users collection)
  useEffect(() => {
    // This is a simplified approach. In production, you'd maintain a users collection
    const fetchUsers = async () => {
      // For demo purposes, we'll use a static list
      // In real app, you'd query your users collection from Firestore
      setUsers([
        { id: 'user1', displayName: 'John Doe', photoURL: '' },
        { id: 'user2', displayName: 'Jane Smith', photoURL: '' },
        // Add more users as needed
      ]);
    };
    fetchUsers();
  }, []);