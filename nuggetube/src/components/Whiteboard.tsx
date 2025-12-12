'use client';

import { useState, useRef, useEffect } from 'react';

interface WhiteboardProps {
  onAnalyze: (isFood: boolean, description: string) => void;
  onOpenChange?: (open: boolean) => void;
}

export default function Whiteboard({ onAnalyze, onOpenChange }: WhiteboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const closeAndNotify = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const openAndNotify = () => {
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const analyzeDrawing = () => {
    setAnalyzing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get image data to analyze colors
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let brownCount = 0;
    let goldenCount = 0;
    let redCount = 0;
    let whiteCount = 0;
    let blackCount = 0;
    let totalPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const { h, s, l } = rgbToHsl(r, g, b);
      
      // Skip white/empty pixels
      if (r > 245 && g > 245 && b > 245) continue;
      
      totalPixels++;

      // White feathers
      if (l > 85 && s < 20) whiteCount++;
      // Black feathers
      if (l < 15 && s < 30) blackCount++;
      // Brown (natural)
      if (h > 20 && h < 60 && s < 60 && l < 60) brownCount++;
      // Golden/yellow (fried)
      if ((h >= 40 && h <= 60) && s >= 50 && l >= 40 && l <= 70) goldenCount++;
      // Red/orange (cooked/spicy)
      if ((h >= 5 && h <= 30) && s >= 60 && l >= 30) redCount++;
    }

    // Simple AI logic based on colors
    const foodScore = (goldenCount * 1.2 + redCount * 1.1) / Math.max(1, totalPixels);
    const whiteScore = whiteCount / Math.max(1, totalPixels);
    const blackScore = blackCount / Math.max(1, totalPixels);
    const brownScore = brownCount / Math.max(1, totalPixels);
    const liveChickenScore = Math.max(whiteScore, blackScore, brownScore);

    setTimeout(() => {
      setAnalyzing(false);
      
      if (foodScore > liveChickenScore) {
        // Detected food
        const foodDescriptions = [
          'fried chicken',
          'chicken drumstick',
          'grilled chicken',
          'roasted chicken',
          'crispy chicken'
        ];
        const description = foodDescriptions[Math.floor(Math.random() * foodDescriptions.length)];
        onAnalyze(true, description);
        closeAndNotify();
      } else {
        // Detected live chicken with specificity
        let description = 'brown chicken';
        if (whiteScore > blackScore && whiteScore > brownScore) description = 'white chicken';
        if (blackScore > whiteScore && blackScore > brownScore) description = 'black chicken';
        // If very low coverage, assume small chicken (bantam)
        if (totalPixels < (canvas.width * canvas.height) * 0.02) description = 'small chicken';
        onAnalyze(false, description);
        closeAndNotify();
      }
    }, 1500);
  };

  return (
    <>
      <button
        onClick={openAndNotify}
        className="fixed bottom-6 left-6 px-4 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all z-50 font-semibold"
      >
        🎨 Draw Chicken
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">🎨 Draw Your Chicken!</h2>
              <button
                onClick={closeAndNotify}
                className="text-2xl hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
              Draw a chicken or chicken food, and I'll analyze it to recommend breeds or restaurants!
            </p>

            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
              className="border-2 border-gray-300 rounded cursor-crosshair mb-4 w-full"
              style={{ touchAction: 'none' }}
            />

            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Color:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <button
                  onClick={() => setColor('#8B4513')}
                  className="px-2 py-1 bg-[#8B4513] rounded text-white text-xs"
                >
                  Brown
                </button>
                <button
                  onClick={() => setColor('#FFD700')}
                  className="px-2 py-1 bg-[#FFD700] rounded text-white text-xs"
                >
                  Golden
                </button>
                <button
                  onClick={() => setColor('#FF8C00')}
                  className="px-2 py-1 bg-[#FF8C00] rounded text-white text-xs"
                >
                  Orange
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Size:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs">{brushSize}px</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={clearCanvas}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
              <button
                onClick={analyzeDrawing}
                disabled={analyzing}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 font-semibold"
              >
                {analyzing ? 'Analyzing... 🤔' : 'Analyze Drawing 🔍'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}