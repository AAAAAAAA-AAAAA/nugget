'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/filebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect to home page after 1 second
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      console.log('User logged in:', result.user);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Login to NuggetTube</h1>
      {!user ? (
        <button onClick={handleGoogleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Sign in with Google
        </button>
      ) : (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <p>Redirecting...</p>
          <img src={user.photoURL || '/default-profile.png'} alt="Profile" style={{ borderRadius: '50%', width: '100px' }} />
        </div>
      )}
    </div>
  );
}