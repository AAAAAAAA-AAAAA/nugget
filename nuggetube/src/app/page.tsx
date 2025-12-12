"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './lib/filebase';
import dynamic from 'next/dynamic';
import Leaderboard from "../components/Leaderboard";
import Chatbot from "../components/Chatbot";
import Whiteboard from "../components/Whiteboard";
import AdoptionCenter from "../components/AdoptionCenter";
import ChickenCare from "../components/ChickenCare";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

interface Bird {
  id: number;
  isChick: boolean;
  isDrumstick: boolean;
  mood?: 'happy' | 'neutral' | 'sad' | 'angry';
}

export default function Home() {
  const [chickens, setChickens] = useState<Bird[]>([]);
  const [user, setUser] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isAdoptionCenterOpen, setIsAdoptionCenterOpen] = useState(false);
  const [isChickenCareOpen, setIsChickenCareOpen] = useState(false);
  const [persistedChickenCount, setPersistedChickenCount] = useState(0);
  const [persistedChickCount, setPersistedChickCount] = useState(0);
  const [showCreatorInfo, setShowCreatorInfo] = useState(false);

  const handleNavigate = (lat: number, lng: number, name: string) => {
    setTargetLocation({ lat, lng, name });
  };

  const handleDrawingAnalysis = (isFood: boolean, description: string) => {
    // Mapping for breeds
    const breedMap: { [key: string]: { name: string; lat: number; lng: number } } = {
      'fluffy chicken': { name: 'Silkie', lat: 35.8617, lng: 104.1954 },
      'brown chicken': { name: 'Rhode Island Red', lat: 41.5801, lng: -71.4774 },
      'white chicken': { name: 'Leghorn', lat: 43.5486, lng: 10.3106 },
      'large chicken': { name: 'Brahma', lat: 20.5937, lng: 78.9629 },
      'small chicken': { name: 'Japanese Bantam', lat: 36.2048, lng: 138.2529 }
    };

    // Mapping for restaurants
    const restaurantMap: { [key: string]: { name: string; lat: number; lng: number } } = {
      'fried chicken': { name: 'KFC HQ', lat: 38.2527, lng: -85.7585 },
      'chicken drumstick': { name: 'Popeyes HQ', lat: 25.7617, lng: -80.1918 },
      'grilled chicken': { name: 'Nando\'s HQ', lat: -26.2041, lng: 28.0473 },
      'roasted chicken': { name: 'Church\'s Chicken HQ', lat: 33.7537, lng: -84.3863 },
      'crispy chicken': { name: 'Jollibee HQ', lat: 14.5995, lng: 120.9842 }
    };

    if (isFood) {
      const restaurant = restaurantMap[description] || restaurantMap['fried chicken'];
      setTargetLocation({ lat: restaurant.lat, lng: restaurant.lng, name: restaurant.name });
      alert(`🍗 Based on your drawing, I recommend ${restaurant.name}! Check the map!`);
    } else {
      const breed = breedMap[description] || breedMap['brown chicken'];
      setTargetLocation({ lat: breed.lat, lng: breed.lng, name: breed.name });
      alert(`🐔 Based on your drawing, I recommend the ${breed.name} breed! Check the map!`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load chicken data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const chickenCount = data.chickenCount || 0;
          const chickCount = data.chickCount || 0;
          setPersistedChickenCount(chickenCount);
          setPersistedChickCount(chickCount);
          const birds: Bird[] = [];
          for (let i = 0; i < chickenCount; i++) {
            birds.push({ id: birds.length, isChick: false, isDrumstick: false, mood: 'neutral' });
          }
          for (let i = 0; i < chickCount; i++) {
            birds.push({ id: birds.length, isChick: true, isDrumstick: false, mood: 'neutral' });
          }
          setChickens(birds);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const playChickenSound = () => {
    // Create audio element with chicken sound from public folder
    const audio = new Audio('/Sound-of-cockerel-crowing.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Audio play failed:', err));
  };

  const addChicken = async () => {
    if (!user) {
      alert('Please login to generate chickens!');
      return;
    }

    playChickenSound();

    // 1/10 chance to generate a chick
    const isChick = Math.random() < 0.1;
    const newBird: Bird = { id: chickens.length, isChick, isDrumstick: false, mood: 'neutral' };
    const newChickens = [...chickens, newBird];
    setChickens(newChickens);

    // Count chickens and chicks separately
    const chickenCount = newChickens.filter(b => !b.isChick).length;
    const chickCount = newChickens.filter(b => b.isChick).length;
    setPersistedChickenCount(chickenCount);
    setPersistedChickCount(chickCount);

    // Save to Firestore
    const userRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          chickenCount,
          chickCount
        });
      } else {
        await setDoc(userRef, {
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          chickenCount,
          chickCount
        });
      }
    } catch (error) {
      console.error('Error saving chicken count:', error);
    }
  };

  const toggleChicken = (id: number) => {
    setChickens(chickens.map(bird => {
      // Chicks cannot be turned into drumsticks
      if (bird.id === id && !bird.isChick) {
        return { ...bird, isDrumstick: !bird.isDrumstick };
      }
      return bird;
    }));
  };

  const handleCareAction = (chickenId: number, action: string) => {
    setChickens(chickens.map(bird => {
      if (bird.id === chickenId) {
        let newMood: 'happy' | 'neutral' | 'sad' | 'angry' = bird.mood || 'neutral';
        
        // Positive actions
        if (['feed', 'water', 'bath', 'play', 'pet'].includes(action)) {
          newMood = 'happy';
        } 
        // Negative action
        else if (action === 'ignore') {
          newMood = 'sad';
        }
        
        return { ...bird, mood: newMood };
      }
      return bird;
    }));
  };

  const getMoodEmoji = (mood?: 'happy' | 'neutral' | 'sad' | 'angry') => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '😐';
    }
  };

  const chickenCount = chickens.filter(b => !b.isChick).length;
  const chickCount = chickens.filter(b => b.isChick).length;

  return (
    <div className="flex min-h-screen items-center justify-center bg-yellow-50 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-gradient-to-b from-yellow-50 to-amber-50 sm:items-start">
        <div className="w-full flex flex-col items-center sm:items-start gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <button
            onClick={() => setShowCreatorInfo(!showCreatorInfo)}
            className="px-4 py-2 bg-amber-400 text-amber-900 rounded-lg hover:bg-amber-500 transition-colors text-sm font-medium shadow-md"
          >
            Who is this made by?
          </button>
          {showCreatorInfo && (
            <div className="bg-yellow-100 border-2 border-amber-400 rounded-lg p-4 text-center shadow-md">
              <p className="text-amber-900 font-medium">
                Find me on gmail: bunny588858@gmail.com
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-amber-900">
            Chicken Generator!
          </h1>
          <p className="max-w-md text-lg leading-8 text-amber-800">
            Press the red button to generate chickens. You've generated {persistedChickenCount} chickens and {persistedChickCount} chicks total!
          </p>
          <div className="flex flex-wrap gap-2">
            {chickens.map((bird) => (
              <span 
                key={bird.id} 
                className={`text-4xl transition-transform ${bird.isChick ? '' : 'cursor-pointer hover:scale-110'} relative`}
                onClick={() => !bird.isChick && toggleChicken(bird.id)}
                title={bird.isChick ? 'Chick (cannot be changed)' : 'Click to toggle'}
              >
                {bird.isChick ? '🐤' : (bird.isDrumstick ? '🍗' : '🐔')}
                {!bird.isDrumstick && (
                  <span className="absolute -top-1 -right-1 text-lg">
                    {getMoodEmoji(bird.mood)}
                  </span>
                )}
              </span>
            ))}
          </div>
          <Leaderboard />
          {!isWhiteboardOpen && !isAdoptionCenterOpen && !isChickenCareOpen && <Map targetLocation={targetLocation} />}
        </div>
        <Chatbot onNavigate={handleNavigate} />
          <Whiteboard onAnalyze={handleDrawingAnalysis} onOpenChange={setIsWhiteboardOpen} />
        <AdoptionCenter onNavigateToAdoption={handleNavigate} onOpenChange={setIsAdoptionCenterOpen} />        <ChickenCare chickens={chickens} onCareAction={handleCareAction} onOpenChange={setIsChickenCareOpen} />        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button
            onClick={addChicken}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 text-white transition-colors hover:bg-amber-600 shadow-md md:w-[158px]"
          >
            Generate Chicken
          </button>
          <button
            onClick={() => setChickens([])}
            className="flex h-12 w-full items-center justify-center rounded-full border-2 border-amber-400 px-5 text-amber-900 transition-colors hover:bg-amber-100 shadow-md md:w-[200px]"
            title="Clears the current display only — stats stay saved"
          >
            Clear Displayed Chickens
          </button>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border-2 border-amber-400 px-5 text-amber-900 transition-colors hover:bg-amber-100 shadow-md md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
