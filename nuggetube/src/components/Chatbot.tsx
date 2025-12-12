'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatbotProps {
  onNavigate: (lat: number, lng: number, name: string) => void;
}

export default function Chatbot({ onNavigate }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your friendly chicken expert! I can help you find chicken breeds to purchase, restaurants for specific dishes, or rescue chickens for adoption. How may I assist you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load voices when component mounts
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adoptionCenters = [
    { name: 'San Francisco Animal Shelter', lat: 37.7749, lng: -122.4194, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] },
    { name: 'NYC Farm Sanctuary', lat: 40.7128, lng: -74.0060, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] },
    { name: 'Iowa Chicken Rescue', lat: 41.8780, lng: -93.0977, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] },
    { name: 'Texas Animal Haven', lat: 29.7604, lng: -95.3698, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] },
    { name: 'LA Bird Rescue Center', lat: 34.0522, lng: -118.2437, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] },
    { name: 'Miami Animal Adoption Center', lat: 25.7617, lng: -80.1918, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] },
    { name: 'Chicago Sanctuary', lat: 41.8781, lng: -87.6298, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] },
    { name: 'Seattle Farm Animal Rescue', lat: 47.6062, lng: -122.3321, keywords: ['rescue', 'adopt', 'adoption', 'save', 'shelter', 'sanctuary'] }
  ];

  const restaurants = [
    { name: 'Roscoe\'s Chicken & Waffles', lat: 34.0522, lng: -118.2437, keywords: ['waffle', 'soul food', 'comfort'] },
    { name: 'KFC HQ', lat: 38.2527, lng: -85.7585, keywords: ['fried', 'original', 'classic', 'crispy'] },
    { name: 'Nando\'s HQ', lat: -26.2041, lng: 28.0473, keywords: ['peri-peri', 'spicy', 'grilled', 'flame'] },
    { name: 'Chick-fil-A HQ', lat: 33.7490, lng: -84.3880, keywords: ['sandwich', 'american', 'fast food'] },
    { name: 'Popeyes HQ', lat: 25.7617, lng: -80.1918, keywords: ['spicy', 'louisiana', 'cajun', 'southern'] },
    { name: 'Jollibee HQ', lat: 14.5995, lng: 120.9842, keywords: ['chickenjoy', 'filipino', 'crispy'] },
    { name: 'Bonchon HQ', lat: 37.5665, lng: 126.9780, keywords: ['korean', 'crispy', 'soy garlic', 'asian'] },
    { name: 'Church\'s Chicken HQ', lat: 33.7537, lng: -84.3863, keywords: ['southern', 'biscuit', 'fried'] },
    { name: 'Kyochon', lat: 37.5172, lng: 127.0473, keywords: ['korean', 'premium', 'asian'] },
    { name: 'Raising Cane\'s HQ', lat: 30.4515, lng: -91.1871, keywords: ['fingers', 'tenders', 'sauce'] }
  ];

  const breeds = [
    { name: 'Rhode Island Red', lat: 41.5801, lng: -71.4774, keywords: ['eggs', 'brown eggs', 'beginner', 'hardy', 'dual purpose'] },
    { name: 'Silkie', lat: 35.8617, lng: 104.1954, keywords: ['fluffy', 'ornamental', 'pet', 'docile', 'black skin', 'unique'] },
    { name: 'Leghorn', lat: 43.5486, lng: 10.3106, keywords: ['eggs', 'white eggs', 'layers', 'productive'] },
    { name: 'Sussex', lat: 50.9097, lng: -0.1207, keywords: ['dual purpose', 'meat', 'eggs', 'friendly'] },
    { name: 'Brahma', lat: 20.5937, lng: 78.9629, keywords: ['large', 'meat', 'gentle', 'feathered legs', 'giant'] },
    { name: 'Orpington', lat: 51.3716, lng: 0.0989, keywords: ['large', 'friendly', 'docile', 'pet', 'buff'] },
    { name: 'Marans', lat: 45.9667, lng: -1.0000, keywords: ['dark eggs', 'chocolate eggs', 'brown eggs'] },
    { name: 'Plymouth Rock', lat: 41.9584, lng: -70.6673, keywords: ['dual purpose', 'hardy', 'friendly', 'barred'] },
    { name: 'Ayam Cemani', lat: -0.7893, lng: 113.9213, keywords: ['rare', 'black', 'exotic', 'ornamental', 'unique'] },
    { name: 'Polish', lat: 51.9194, lng: 19.1451, keywords: ['ornamental', 'crested', 'unique', 'show'] },
    { name: 'Wyandotte', lat: 42.8864, lng: -78.8784, keywords: ['cold hardy', 'dual purpose', 'laced', 'winter'] },
    { name: 'Australorp', lat: -25.2744, lng: 133.7751, keywords: ['eggs', 'layers', 'record', 'black', 'productive'] },
    { name: 'Japanese Bantam', lat: 36.2048, lng: 138.2529, keywords: ['small', 'bantam', 'ornamental', 'pet'] }
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages([...messages, { text: userMessage, isBot: false }]);
    setInput('');

    setTimeout(() => {
      const response = generateResponse(userMessage.toLowerCase());
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 500);
  };

  const speakPolitely = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure for polite, friendly voice
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for friendliness
    utterance.volume = 1.0;
    
    // Try to select a female voice (typically sounds more polite)
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Karen') ||
      voice.name.includes('Susan')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const generateResponse = (query: string): string => {
    // Check if asking about rescue/adoption
    if (query.includes('rescue') || query.includes('adopt') || query.includes('adoption') ||
        query.includes('save') || query.includes('shelter') || query.includes('sanctuary')) {
      
      const center = adoptionCenters[Math.floor(Math.random() * adoptionCenters.length)];
      onNavigate(center.lat, center.lng, center.name);
      const response = `That's wonderful that you want to help! I recommend ${center.name}. They have rescue chickens looking for loving homes. I've marked it on the map for you!`;
      speakPolitely(response);
      return response;
    }

    // Check if asking about restaurants/food
    if (query.includes('eat') || query.includes('restaurant') || query.includes('food') || 
        query.includes('waffle') || query.includes('fried') || query.includes('spicy') ||
        query.includes('korean') || query.includes('sandwich') || query.includes('barbecue') ||
        query.includes('bbq') || query.includes('grilled')) {
      
      const matches = restaurants.filter(r => 
        r.keywords.some(keyword => query.includes(keyword))
      );

      if (matches.length > 0) {
        const restaurant = matches[0];
        onNavigate(restaurant.lat, restaurant.lng, restaurant.name);
        const response = `I would be delighted to recommend ${restaurant.name}! I've marked it on the map for you. Please check it out!`;
        speakPolitely(response);
        return response;
      }

      // Default restaurant recommendation
      const defaultRestaurant = restaurants[0];
      onNavigate(defaultRestaurant.lat, defaultRestaurant.lng, defaultRestaurant.name);
      const response = `For that, I would suggest ${defaultRestaurant.name}! I've marked it on the map for you. I hope this helps!`;
      speakPolitely(response);
      return response;
    }

    // Check if asking about chicken breeds
    if (query.includes('breed') || query.includes('buy') || query.includes('purchase') ||
        query.includes('chicken') || query.includes('egg') || query.includes('pet') ||
        query.includes('backyard') || query.includes('raise') || query.includes('farm')) {
      
      const matches = breeds.filter(b => 
        b.keywords.some(keyword => query.includes(keyword))
      );

      if (matches.length > 0) {
        const breed = matches[0];
        onNavigate(breed.lat, breed.lng, breed.name);
        const response = `I would highly recommend the ${breed.name} breed! I've marked its origin on the map. Please click the marker to learn more!`;
        speakPolitely(response);
        return response;
      }

      // Default breed recommendation for beginners
      const defaultBreed = breeds[0];
      onNavigate(defaultBreed.lat, defaultBreed.lng, defaultBreed.name);
      const response = `For beginners, I would recommend ${defaultBreed.name}! They're hardy and excellent egg layers. I've marked it on the map for you!`;
      speakPolitely(response);
      return response;
    }

    const response = "I would be happy to help you with finding chicken breeds or restaurant recommendations. What are you looking for today?";
    speakPolitely(response);
    return response;
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all z-50 flex items-center justify-center text-2xl"
      >
        {isOpen ? '✕' : '🐔'}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          <div className="bg-orange-500 text-white p-4 rounded-t-lg font-bold">
            🐔 Chicken Expert AI
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isBot
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                      : 'bg-orange-500 text-white'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about chickens..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}