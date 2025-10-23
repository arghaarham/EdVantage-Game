import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Static imports so Vite resolves asset URLs at build time
import towerBlue from '../assets/Factions/Knights/Buildings/Tower/Tower_Blue.png';
import towerRed from '../assets/Factions/Knights/Buildings/Tower/Tower_Red.png';
import towerPurple from '../assets/Factions/Knights/Buildings/Tower/Tower_Purple.png';
import towerYellow from '../assets/Factions/Knights/Buildings/Tower/Tower_Yellow.png';

import warriorBlue from '../assets/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png';
import warriorRed from '../assets/Factions/Knights/Troops/Warrior/Red/Warrior_Red.png';
import warriorPurple from '../assets/Factions/Knights/Troops/Warrior/Purple/Warrior_Purple.png';
import warriorYellow from '../assets/Factions/Knights/Troops/Warrior/Yellow/Warrior_Yellow.png';
import SpriteAnimator from './SpriteAnimator';
import IdlePattern from './IdlePattern';

interface CharacterSelectionProps {
  onSelect: (player: any) => void;
  onBack?: () => void;
}

// Hanya 4 tim sesuai permintaan
const DEFAULT_CHARACTERS = [
  { id: 'blue', label: 'Blue', color: '#3b82f6', tower: towerBlue, warrior: warriorBlue },
  { id: 'red', label: 'Red', color: '#ef4444', tower: towerRed, warrior: warriorRed },
  { id: 'purple', label: 'Purple', color: '#8b5cf6', tower: towerPurple, warrior: warriorPurple },
  { id: 'yellow', label: 'Yellow', color: '#f59e0b', tower: towerYellow, warrior: warriorYellow },
];

export function CharacterSelection({ onSelect, onBack }: CharacterSelectionProps) {
  const [selected, setSelected] = useState<string>(DEFAULT_CHARACTERS[0]?.id ?? 'blue');
  const [images, setImages] = useState<Record<string, { tower?: HTMLImageElement; warrior?: HTMLImageElement }>>({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinGame = async (createIfNotFound = false) => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      const character = DEFAULT_CHARACTERS.find(c => c.id === selected)!;
      const endpoint = createIfNotFound
        ? `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/player/create`
        : `https://${projectId}.supabase.co/functions/v1/make-server-5d85a/player/join`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          avatarColor: character.color,
          characterId: character.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        // if joining failed and we didn't try create, offer create account
        if (!createIfNotFound && data.error.includes('not found')) {
          const ok = confirm('Account not found. Would you like to create a new account with this name and password?');
          if (ok) {
            await handleJoinGame(true);
            return;
          }
        }

        alert(data.error);
        return;
      }

      if (data.player) {
        onSelect(data.player);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to join game:', error);
      alert('Failed to join game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
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
        
        {/* Particle burst effect */}
        {showParticles && (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                style={{
                  left: `${40 + Math.random() * 20}%`,
                  top: `${40 + Math.random() * 20}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-2 drop-shadow-2xl">
              EdVantage
            </h1>
            <p className="text-white/80 text-lg font-medium">Educational Battle Arena</p>
          </div>

          {/* Main card */}
          <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-4 border-yellow-400 rounded-lg p-6 shadow-2xl">
            {/* Decorative corners */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>

            <div className="space-y-6">
              {/* Mode selection */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-yellow-200 font-bold text-xl tracking-wider">CHOOSE YOUR CHARACTER</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setMode('signin')} 
                    className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wider transition-all ${
                      mode === 'signin' 
                        ? 'bg-yellow-400 text-slate-900 shadow-lg' 
                        : 'bg-slate-700/50 text-yellow-200 border-2 border-yellow-400/50 hover:border-yellow-400'
                    }`}
                  >
                    SIGN IN
                  </button>
                  <button 
                    onClick={() => setMode('create')} 
                    className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wider transition-all ${
                      mode === 'create' 
                        ? 'bg-yellow-400 text-slate-900 shadow-lg' 
                        : 'bg-slate-700/50 text-yellow-200 border-2 border-yellow-400/50 hover:border-yellow-400'
                    }`}
                  >
                    CREATE
                  </button>
                </div>
              </div>

              {/* Character selection - 4 tim dalam 2x2 grid */}
              <div>
                <label className="block text-yellow-200 font-bold mb-3 text-sm tracking-wider">
                  SELECT TEAM
                </label>
                <div className="grid grid-cols-2 gap-6">
                  {DEFAULT_CHARACTERS.map(c => (
                    <div 
                      key={c.id} 
                      className={`relative group cursor-pointer transition-all duration-200 ${
                        selected === c.id ? 'scale-105' : 'scale-100 hover:scale-102'
                      }`}
                      onClick={() => setSelected(c.id)}
                    >
                      <div className={`relative p-4 rounded-lg border-4 transition-all duration-200 ${
                        selected === c.id 
                          ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 bg-slate-700/30' 
                          : 'border-yellow-400/50 hover:border-yellow-400/80 bg-slate-700/10'
                      }`}>
                        <div className="relative w-32 h-32 mx-auto mb-3">
                          {/* repeating idle pattern behind */}
                          <IdlePattern src={c.warrior as string} frameWidth={48} frameHeight={48} frameIndex={0} opacity={0.18} size={20} className="" />

                          {/* tower image sits above the pattern */}
                          <img src={c.tower as string} alt={`${c.label} tower`} className="absolute inset-0 w-full h-full object-contain z-10" />

                          {/* animated warrior stays centered above the tower */}
                          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 z-20" style={{ width: 64, height: 64 }}>
                            <SpriteAnimator src={c.warrior as string} frameWidth={48} frameHeight={48} frameCount={36} fps={8} scale={1.2} />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-200 font-bold text-lg">{c.label}</div>
                          <div className="text-yellow-300/70 text-sm">TEAM</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username field */}
                <div>
                  <label className="block text-yellow-200 font-bold mb-2 text-sm tracking-wider">
                    USERNAME
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-slate-700/50 border-2 border-yellow-400/50 text-white placeholder:text-white/50 rounded-lg px-4 py-3 font-medium focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-yellow-200 font-bold mb-2 text-sm tracking-wider">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a password"
                      className="w-full bg-slate-700/50 border-2 border-yellow-400/50 text-white placeholder:text-white/50 rounded-lg px-4 py-3 font-medium focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleJoinGame()}
                  disabled={isLoading}
                  className="flex-1 relative group"
                >
                  <div 
                    className={`w-full h-14 bg-cover bg-center transition-all duration-200 ${
                      isLoading ? 'opacity-70' : 'group-hover:scale-105'
                    }`}
                    style={{
                      backgroundImage: `url(${new URL('../assets/UI/Buttons/Button_Blue_3Slides.png', import.meta.url).href})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: !isLoading ? 'brightness(1.1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' : 'none',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg tracking-wider drop-shadow-lg">
                        {isLoading ? 'JOINING...' : 'JOIN GAME'}
                      </span>
                    </div>
                  </div>
                </button>

                {onBack && (
                  <button 
                    onClick={onBack} 
                    className="px-6 py-3 rounded-lg border-2 border-yellow-400/50 text-yellow-200 font-bold hover:border-yellow-400 hover:bg-yellow-400/10 transition-all"
                  >
                    BACK
                  </button>
                )}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="flex justify-center mt-6 space-x-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>

          {/* Bottom message */}
          <div className="mt-6 text-center">
            <p className="text-yellow-300/70 text-sm font-medium tracking-wider">
              • EXPLORE • BATTLE • CONQUER •
            </p>
            <p className="text-white/60 text-xs mt-2">
              Explore the world, battle other players, and conquer the Gym challenges!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterSelection;
