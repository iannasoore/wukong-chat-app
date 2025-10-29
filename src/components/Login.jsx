import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = ({ darkMode }) => {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className={`max-w-md mx-auto mt-16 p-8 rounded-xl shadow-lg ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Welcome to ChatApp</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Sign in to start chatting
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <img 
            src="https://developers.google.com/identity/images/g-logo.png" 
            alt="Google" 
            className="w-6 h-6 mr-2"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;