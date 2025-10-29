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
    <div className="min-h-screen flex items-center justify-center p-4"
        style={{ 
            backgroundImage: darkMode ? 'radial-gradient(circle at center, rgba(16, 24, 40, 0.9), rgba(0, 0, 0, 0.9))' : 'none', 
            backgroundColor: darkMode ? '#0F172A' : '#F8FAFC' 
        }}>
      <div className={`max-w-md w-full p-8 rounded-xl border-2 border-indigo-500/50 backdrop-blur-sm 
        shadow-3xl transition-all duration-500 
        ${darkMode ? 'bg-gray-900/80 shadow-indigo-500/30' : 'bg-white/90 shadow-gray-400/50'}`}>

        <div className="text-center">
          <h2 className={`text-4xl font-extrabold tracking-widest mb-2 ${
            darkMode ? 'text-yellow-400' : 'text-indigo-600'
          } font-mono`}>
            WUKONG CHAT
          </h2>
          <p className={`mb-8 text-lg font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            ACCESS PROTOCOL: REQUIRED
          </p>
          
          <button
            onClick={signInWithGoogle}
            // Styled as a high-contrast, action button with glow effect
            className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] 
              flex items-center justify-center space-x-3 text-lg 
              ${darkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/50 border border-indigo-400'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-400/50'
              }`}
          >
            {/* Using a custom span for text to align the graphic feel */}
            <span className="text-xl -translate-y-[1px]">
                {/* Placeholder for the Google G-logo (no longer needed, using the G-logo.png) */}
                <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    className="w-6 h-6 mr-2 inline-block bg-white rounded-sm p-0.5" // Added bg-white for contrast
                />
            </span>
            <span>
                INITIATE_LOGIN
            </span>
          </button>
          <p className={`mt-6 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="font-mono text-yellow-400 mr-1">//</span> Secure Connection via Firebase Auth
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;