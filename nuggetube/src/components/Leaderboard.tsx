'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db, auth } from '../app/lib/filebase';
import { onAuthStateChanged } from 'firebase/auth';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  chickenCount: number;
  chickCount?: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalChickens, setTotalChickens] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Real-time listener for leaderboard
    const q = query(
      collection(db, 'users'),
      orderBy('chickenCount', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: LeaderboardEntry[] = [];
      let total = 0;
      querySnapshot.forEach((doc) => {
        const entry = doc.data() as LeaderboardEntry;
        data.push(entry);
        total += entry.chickenCount;
      });
      setLeaderboard(data);
      setTotalChickens(total);
      setTotalUsers(querySnapshot.size);
      
      // Calculate user rank
      if (currentUser) {
        const rank = data.findIndex(entry => entry.userId === currentUser.uid);
        setUserRank(rank !== -1 ? rank + 1 : null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    });

    // Get total user count
    getCountFromServer(collection(db, 'users')).then((snapshot) => {
      setTotalUsers(snapshot.data().count);
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, [currentUser?.uid]);

  if (loading) {
    return <div className="text-center p-4">Loading leaderboard...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">🏆 Chicken Leaderboard</h2>
      
      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded">
          <div className="text-2xl font-bold">{totalChickens}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">Total Chickens</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
          <div className="text-2xl font-bold">{totalUsers}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">Total Users</div>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded">
          <div className="text-2xl font-bold">{userRank ? `#${userRank}` : '-'}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">Your Rank</div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-center text-gray-500">No data yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3 rounded ${
                currentUser?.uid === entry.userId 
                  ? 'bg-yellow-200 dark:bg-yellow-800 border-2 border-yellow-400' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <img src={entry.photoURL} alt={entry.displayName} className="w-8 h-8 rounded-full" />
                <span className="font-medium">{entry.displayName}</span>
                {currentUser?.uid === entry.userId && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">YOU</span>
                )}
              </div>
              <div className="flex gap-2 text-sm">
                <span className="font-semibold">🐔 {entry.chickenCount}</span>
                {entry.chickCount ? <span className="font-semibold">🐤 {entry.chickCount}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}