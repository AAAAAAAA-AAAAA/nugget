'use client';

import { useState } from 'react';

interface RescueChicken {
  id: number;
  defaultName: string;
  customName: string;
  backstory: string;
  location: string;
  lat: number;
  lng: number;
}

interface AdoptionCenterProps {
  onNavigateToAdoption: (lat: number, lng: number, name: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const initialRescueChickens: RescueChicken[] = [
  {
    id: 1,
    defaultName: 'Clucky',
    customName: '',
    backstory: 'Rescued from a building fire in San Francisco. This brave hen survived and is looking for a loving home.',
    location: 'San Francisco Animal Shelter',
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: 2,
    defaultName: 'Phoenix',
    customName: '',
    backstory: 'Found abandoned in a cardboard box during a thunderstorm in New York. Now fully recovered and ready for adoption.',
    location: 'NYC Farm Sanctuary',
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: 3,
    defaultName: 'Lucky',
    customName: '',
    backstory: 'Saved from a factory farm shutdown in Iowa. This gentle rooster loves human companionship.',
    location: 'Iowa Chicken Rescue',
    lat: 41.8780,
    lng: -93.0977
  },
  {
    id: 4,
    defaultName: 'Hope',
    customName: '',
    backstory: 'Rescued from a flood in Houston. Despite her ordeal, she\'s the friendliest hen you\'ll ever meet.',
    location: 'Texas Animal Haven',
    lat: 29.7604,
    lng: -95.3698
  },
  {
    id: 5,
    defaultName: 'Brave',
    customName: '',
    backstory: 'Found injured on a highway in Los Angeles. After months of rehabilitation, she\'s ready for a forever home.',
    location: 'LA Bird Rescue Center',
    lat: 34.0522,
    lng: -118.2437
  },
  {
    id: 6,
    defaultName: 'Sunny',
    customName: '',
    backstory: 'Rescued from a neglectful situation in Miami. This cheerful hen brings joy wherever she goes.',
    location: 'Miami Animal Adoption Center',
    lat: 25.7617,
    lng: -80.1918
  },
  {
    id: 7,
    defaultName: 'Hero',
    customName: '',
    backstory: 'Saved from an illegal cockfighting ring in Chicago. Now rehabilitated and seeking a peaceful life.',
    location: 'Chicago Sanctuary',
    lat: 41.8781,
    lng: -87.6298
  },
  {
    id: 8,
    defaultName: 'Grace',
    customName: '',
    backstory: 'Found malnourished in Seattle. After proper care, she\'s now healthy and looking for a loving family.',
    location: 'Seattle Farm Animal Rescue',
    lat: 47.6062,
    lng: -122.3321
  }
];

export default function AdoptionCenter({ onNavigateToAdoption, onOpenChange }: AdoptionCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chickens, setChickens] = useState<RescueChicken[]>(initialRescueChickens);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');

  const handleNameEdit = (id: number) => {
    const chicken = chickens.find(c => c.id === id);
    if (chicken) {
      setEditingId(id);
      setTempName(chicken.customName || chicken.defaultName);
    }
  };

  const handleNameSave = (id: number) => {
    setChickens(chickens.map(c => 
      c.id === id ? { ...c, customName: tempName.trim() } : c
    ));
    setEditingId(null);
    setTempName('');
  };

  const handleNameCancel = () => {
    setEditingId(null);
    setTempName('');
  };

  const handleAdopt = (chicken: RescueChicken) => {
    onNavigateToAdoption(chicken.lat, chicken.lng, chicken.location);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          const newState = !isOpen;
          setIsOpen(newState);
          onOpenChange?.(newState);
        }}
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 transition-colors flex items-center justify-center text-2xl"
        title="Rescue Chickens"
      >
        🐥
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-yellow-500 text-white p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">🐥 Rescue Chicken Adoption Center</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenChange?.(false);
                }}
                className="text-white hover:text-yellow-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                These brave chickens have been rescued from various situations and are looking for loving homes. 
                Click on the adoption location to see where you can meet them!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chickens.map((chicken) => (
                  <div
                    key={chicken.id}
                    className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    {/* Name Section */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🐔</span>
                      {editingId === chicken.id ? (
                        <div className="flex gap-2 flex-1">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded dark:bg-zinc-800 dark:text-white"
                            maxLength={20}
                            autoFocus
                          />
                          <button
                            onClick={() => handleNameSave(chicken.id)}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleNameCancel}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex-1">
                            {chicken.customName || chicken.defaultName}
                          </h3>
                          <button
                            onClick={() => handleNameEdit(chicken.id)}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            title="Rename this chicken"
                          >
                            ✏️ Rename
                          </button>
                        </>
                      )}
                    </div>

                    {/* Backstory */}
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded p-3 mb-3">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                        "{chicken.backstory}"
                      </p>
                    </div>

                    {/* Location and Adopt Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">📍 </span>
                        <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                          {chicken.location}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdopt(chicken)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors font-medium text-sm"
                      >
                        Adopt Me! 💛
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
