import { useState, useEffect } from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
        
        {/* Sparkle effects */}
        {showSparkles && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 transform rotate-45 animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
        {/* Game Title with pixel art styling */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-4 drop-shadow-2xl">
            EdVantage
          </h1>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wider">
              MMORPG gamified learning experience.
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          </div>
          <p className="text-lg text-yellow-200 mt-4 font-medium">
            Educational Battle Arena
          </p>
        </div>

        {/* Main menu card with pixel art border */}
        <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-4 border-yellow-400 rounded-lg p-8 max-w-md w-full shadow-2xl">
          {/* Decorative corners */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>

          {/* Welcome message */}
          <div className="text-center mb-8">
            <p className="text-white text-lg font-medium mb-2">
              Welcome, Trainer!
            </p>
            <p className="text-yellow-200 text-sm">
              Embark on an epic journey through the world of Pokémon
            </p>
          </div>

          {/* Start button with enhanced styling */}
          <div className="flex justify-center">
            <button
              onClick={onStart}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative group"
              aria-label="Start game"
            >
              {/* Button background with pixel art style */}
              <div className="relative">
                <div 
                  className={`w-48 h-16 bg-cover bg-center transition-all duration-200 ${
                    isHovered ? 'scale-105' : 'scale-100'
                  }`}
                  style={{
                    backgroundImage: `url(${new URL('../assets/UI/Buttons/Button_Blue_3Slides.png', import.meta.url).href})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    filter: isHovered ? 'brightness(1.1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' : 'none',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg tracking-wider drop-shadow-lg">
                      START GAME
                    </span>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                {isHovered && (
                  <div className="absolute inset-0 bg-blue-400/20 rounded-lg animate-pulse"></div>
                )}
              </div>
            </button>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center mt-6 space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom decorative text */}
        <div className="mt-8 text-center">
          <p className="text-yellow-300/70 text-sm font-medium tracking-wider">
            • BATTLE • EXPLORE • CONQUER •
          </p>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
