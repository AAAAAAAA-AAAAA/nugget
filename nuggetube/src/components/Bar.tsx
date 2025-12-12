'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../app/lib/filebase';

export default function Bar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
      <h1 className="text-xl font-bold">NuggetTube</h1>
      {user ? (
        <div className="flex items-center gap-4">
          <span>Welcome, {user.displayName}</span>
          <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Login
        </a>
      )}
    </div>
  );
}