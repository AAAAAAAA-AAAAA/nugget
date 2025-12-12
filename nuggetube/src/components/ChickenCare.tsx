'use client';

import { useState } from 'react';

interface Bird {
  id: number;
  isChick: boolean;
  isDrumstick: boolean;
  mood?: 'happy' | 'neutral' | 'sad' | 'angry';
}

interface ChickenCareProps {
  chickens: Bird[];
  onCareAction: (chickenId: number, action: string) => void;
  onOpenChange?: (open: boolean) => void;
}

export default function ChickenCare({ chickens, onCareAction, onOpenChange }: ChickenCareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChicken, setSelectedChicken] = useState<number | null>(null);

  const handleOpen = () => {
    const newState = true;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedChicken(null);
    onOpenChange?.(false);
  };

  const handleCareAction = (action: string) => {
    if (selectedChicken !== null) {
      onCareAction(selectedChicken, action);
    }
  };

  const getMoodEmoji = (mood?: 'happy' | 'neutral' | 'sad' | 'angry') => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '😐';
    }
  };

  const getMoodText = (mood?: 'happy' | 'neutral' | 'sad' | 'angry') => {
    switch (mood) {
      case 'happy': return 'Happy & Content';
      case 'sad': return 'Sad & Lonely';
      case 'angry': return 'Angry & Upset';
      default: return 'Neutral';
    }
  };

  const careActions = [
    { action: 'feed', emoji: '🌾', label: 'Feed', effect: 'Makes chicken happy!' },
    { action: 'water', emoji: '💧', label: 'Give Water', effect: 'Refreshing!' },
    { action: 'bath', emoji: '🛁', label: 'Give Bath', effect: 'Clean and happy!' },
    { action: 'play', emoji: '🎾', label: 'Play', effect: 'Fun time!' },
    { action: 'pet', emoji: '🤗', label: 'Pet', effect: 'Affection boost!' },
    { action: 'ignore', emoji: '😶', label: 'Ignore', effect: 'Makes sad...' }
  ];

  const activeChickens = chickens.filter(c => !c.isDrumstick);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-44 right-6 z-50 h-14 w-14 rounded-full bg-pink-500 text-white shadow-lg hover:bg-pink-600 transition-colors flex items-center justify-center text-2xl"
        title="Chicken Care"
      >
        💝
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-b from-pink-50 to-rose-50 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-pink-500 text-white p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">💝 Chicken Care Center</h2>
              <button
                onClick={handleClose}
                className="text-white hover:text-pink-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeChickens.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">
                    You don't have any chickens to care for yet!
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Generate some chickens first 🐔
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-amber-800 mb-4 text-center">
                    Select a chicken to care for, then choose an action below!
                  </p>

                  {/* Chicken Selection Grid */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-amber-900 mb-3">Select a Chicken:</h3>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border-2 border-pink-300">
                      {activeChickens.map((bird) => (
                        <button
                          key={bird.id}
                          onClick={() => setSelectedChicken(bird.id)}
                          className={`text-4xl transition-all hover:scale-110 relative ${
                            selectedChicken === bird.id
                              ? 'scale-125 ring-4 ring-pink-500 rounded-lg bg-pink-100'
                              : ''
                          }`}
                          title={`Chicken #${bird.id + 1}`}
                        >
                          {bird.isChick ? '🐤' : '🐔'}
                          <span className="absolute -top-1 -right-1 text-lg">
                            {getMoodEmoji(bird.mood)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Chicken Info */}
                  {selectedChicken !== null && (
                    <div className="mb-6 p-4 bg-white rounded-lg border-2 border-pink-300 shadow-md">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-6xl">
                          {activeChickens.find(c => c.id === selectedChicken)?.isChick ? '🐤' : '🐔'}
                        </span>
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-amber-900">
                            Chicken #{selectedChicken + 1}
                          </h3>
                          <div className="flex items-center gap-2 justify-center mt-2">
                            <span className="text-3xl">
                              {getMoodEmoji(activeChickens.find(c => c.id === selectedChicken)?.mood)}
                            </span>
                            <span className="text-lg font-semibold text-amber-800">
                              {getMoodText(activeChickens.find(c => c.id === selectedChicken)?.mood)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Care Actions */}
                  {selectedChicken !== null && (
                    <div>
                      <h3 className="text-lg font-bold text-amber-900 mb-3">Care Actions:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {careActions.map((careItem) => (
                          <button
                            key={careItem.action}
                            onClick={() => handleCareAction(careItem.action)}
                            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border-2 border-pink-300 hover:bg-pink-100 hover:border-pink-500 transition-all shadow-md hover:shadow-lg"
                          >
                            <span className="text-4xl">{careItem.emoji}</span>
                            <span className="font-bold text-amber-900">{careItem.label}</span>
                            <span className="text-xs text-amber-700 text-center">{careItem.effect}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedChicken === null && (
                    <div className="text-center py-8 text-amber-700">
                      👆 Select a chicken above to start caring for it!
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
