/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // --- CUSTOM CYBERPUNK COLORS ---
      colors: {
        // Base Palette
        'cyb-dark': '#0F172A',     // Very dark blue-gray (slate-900/950 area)
        'cyb-medium': '#1F2937',   // Slightly lighter for card backgrounds (gray-800 area)
        // Primary Accent (Indigo/Neon Blue)
        'cyb-primary': '#4F46E5',  // Indigo-600
        'cyb-primary-light': '#6366F1', // Indigo-500
        // Secondary Accent (Neon Yellow/Glow)
        'cyb-accent': '#FDE047',   // Yellow-300/400 for high-contrast elements
        // Tertiary Accent (Green for "Active" Status)
        'cyb-active': '#10B981',   // Green-500
      },
      // --- CUSTOM FONT FAMILY ---
      fontFamily: {
        // Use a monospace font for that terminal/console feel
        'mono': ['"Space Mono"', 'ui-monospace', 'SFMono-regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      // --- CUSTOM SHADOWS FOR GLOW EFFECT ---
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.5)',
        'glow-indigo': '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-yellow': '0 0 8px rgba(253, 224, 71, 0.6), 0 0 16px rgba(253, 224, 71, 0.4)',
      },
    },
  },
  plugins: [],
}
