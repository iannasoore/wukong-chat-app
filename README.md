
# Wukong Chat App

A small React + Vite chat application using Firebase for realtime messaging and authentication.

Short summary
- Lightweight chat UI built with React and Tailwind (see `src/` and `src/components`).
- Firebase handles auth and Firestore realtime messages (config in `src/firebase.js`).

Quick start

1. Install dependencies

   npm install

2. Run the dev server

   npm run dev

3. Build for production

   npm run build

Notes
- Firebase configuration is in `src/firebase.js`. Make sure to provide your Firebase project credentials there (or via environment variables if you adapt the project).
- Main app entry: `src/main.jsx`. UI components live under `src/components` (ChatRoom, PublicChat, DirectMessages, MessageInput, MessageDisplay, Login, ThemeToggle).

Repository
- https://github.com/iannasoore/wukong-chat-app



