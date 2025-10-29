// login.jsx
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const Login = ({ darkMode }) => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div
        className={`max-w-sm w-full p-8 rounded-xl border transition-all duration-300 font-mono shadow-lg
          ${
            darkMode
              ? "bg-gray-900 border-indigo-500/50 text-gray-200"
              : "bg-white border-indigo-400 text-gray-800"
          }`}
      >
        <h2
          className={`text-3xl font-extrabold text-center mb-6 ${
            darkMode ? "text-yellow-400" : "text-indigo-600"
          }`}
        >
          WUKONG CHAT
        </h2>

        <button
          onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center space-x-3 py-3 px-4 font-semibold rounded-lg border transition-all duration-300
            ${
              darkMode
                ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500"
                : "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-700"
            }`}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5 bg-white rounded-sm p-0.5"
          />
          <span>Sign in with Google</span>
        </button>

        <p
          className={`mt-4 text-center text-sm ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Secure connection via Firebase Auth
        </p>
      </div>
    </div>
  );
};

export default Login;
