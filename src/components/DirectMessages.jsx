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
