import React, { useState } from 'react';

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

// small idle effect sprite can reuse the same warrior sheet but we will draw a tiled semi-transparent overlay


interface CharacterSelectionProps {
  onSelect: (player: any) => void;
  onBack?: () => void;
}

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

  const handleContinue = () => {
    if (!username.trim()) {
      alert('Please enter a name');
      return;
    }

    const character = DEFAULT_CHARACTERS.find(c => c.id === selected)!;
    // For now create a local player object and pass up — real auth handled in LoginScreen
    const player = {
      username: username.trim(),
      password: password,
      avatarColor: character.color,
      characterId: character.id,
      mode,
    };

    onSelect(player);
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
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-2 drop-shadow-2xl">
              Choose Your Team
            </h1>
            <p className="text-white/80 text-lg font-medium">Select your warrior and begin your journey</p>
          </div>

          {/* Character selection card */}
          <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-4 border-yellow-400 rounded-lg p-8 shadow-2xl">
            {/* Decorative corners */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-400 transform rotate-45"></div>

            {/* Mode selection */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-2 bg-slate-700/50 rounded-lg p-1">
                <button 
                  onClick={() => setMode('signin')} 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'signin' 
                      ? 'bg-yellow-400 text-slate-900 shadow-lg' 
                      : 'text-yellow-200 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setMode('create')} 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'create' 
                      ? 'bg-yellow-400 text-slate-900 shadow-lg' 
                      : 'text-yellow-200 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Character selection grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {DEFAULT_CHARACTERS.map(c => (
                <div 
                  key={c.id} 
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selected === c.id ? 'scale-105' : 'hover:scale-102'
                  }`} 
                  onClick={() => setSelected(c.id)}
                >
                  {/* Character card */}
                  <div className={`relative bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-lg p-4 border-2 transition-all duration-300 ${
                    selected === c.id 
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' 
                      : 'border-yellow-400/30 hover:border-yellow-400/60'
                  }`}>
                    {/* Character display area */}
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      {/* Idle pattern background */}
                      <IdlePattern src={c.warrior as string} frameWidth={48} frameHeight={48} frameIndex={0} opacity={0.15} size={20} className="" />
                      
                      {/* Tower image */}
                      <img src={c.tower as string} alt={`${c.label} tower`} className="absolute inset-0 w-full h-full object-contain z-10" />
                      
                      {/* Animated warrior */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 z-20" style={{ width: 64, height: 64 }}>
                        <SpriteAnimator src={c.warrior as string} frameWidth={48} frameHeight={48} frameCount={36} fps={8} scale={1.2} />
                      </div>
                    </div>
                    
                    {/* Character name */}
                    <div className="text-center">
                      <h3 className="text-yellow-200 font-bold text-lg tracking-wider">{c.label}</h3>
                      <div className="w-8 h-8 mx-auto mt-2 rounded-full border-2 border-yellow-400/50" style={{ backgroundColor: c.color }}></div>
                    </div>
                    
                    {/* Selection indicator */}
                    {selected === c.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form inputs */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-yellow-200 font-bold mb-2 text-sm tracking-wider">
                  USERNAME
                </label>
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="Enter your username"
                  className="w-full bg-slate-700/50 border-2 border-yellow-400/50 text-white placeholder:text-white/50 rounded-lg px-4 py-3 font-medium focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-yellow-200 font-bold mb-2 text-sm tracking-wider">
                  PASSWORD
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  className="w-full bg-slate-700/50 border-2 border-yellow-400/50 text-white placeholder:text-white/50 rounded-lg px-4 py-3 font-medium focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleContinue} 
                className="relative group"
              >
                <div className="w-40 h-12 bg-cover bg-center transition-all duration-200 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${new URL('../assets/UI/Buttons/Button_Blue_3Slides.png', import.meta.url).href})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm tracking-wider drop-shadow-lg">
                      CONTINUE
                    </span>
                  </div>
                </div>
              </button>
              
              {onBack && (
                <button 
                  onClick={onBack} 
                  className="px-6 py-3 rounded-lg border-2 border-yellow-400/50 text-yellow-200 font-medium hover:border-yellow-400 hover:text-white transition-all duration-200"
                >
                  Back
                </button>
              )}
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

          {/* Bottom message */}
          <div className="mt-6 text-center">
            <p className="text-yellow-300/70 text-sm font-medium tracking-wider">
              • CHOOSE YOUR WARRIOR • BEGIN YOUR QUEST •
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterSelection;
