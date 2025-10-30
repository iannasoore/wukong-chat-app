// login.jsx
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const Login = ({ darkMode }) => {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div>
          <h2 className="login-title">
            WUKONG CHAT
          </h2>
          <p className="login-subtitle">
            ACCESS PROTOCOL: REQUIRED
          </p>
          
          <button
            onClick={signInWithGoogle}
            className="btn login-btn"
          >
            <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                style={{width: '1.5rem', height: '1.5rem', backgroundColor: 'white', borderRadius: '2px', padding: '2px'}}
            />
            <span>
                INITIATE_LOGIN
            </span>
          </button>
          <p className="login-footer">
            <span style={{color: 'var(--accent)', marginRight: '0.25rem'}}>//</span> Secure Connection via Firebase Auth
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
