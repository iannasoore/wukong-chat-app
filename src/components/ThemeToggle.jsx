// themetoggle.jsx
import React from "react";

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-full transition-all duration-300 
        hover:scale-110 focus:outline-none focus:ring-2 
        ${darkMode ? "bg-gray-800 text-yellow-400 ring-yellow-500" : "bg-white text-indigo-600 ring-indigo-400"}`}
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        // Sun icon
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
