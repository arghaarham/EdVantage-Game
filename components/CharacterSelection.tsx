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
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="bg-white/6 backdrop-blur-lg rounded-xl p-8 w-full max-w-2xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">Choose Your Character</h2>
          <div className="flex gap-2">
            <button onClick={() => setMode('signin')} className={`px-3 py-1 rounded ${mode === 'signin' ? 'bg-white/20 text-white' : 'text-white/60'}`}>
              Sign in
            </button>
            <button onClick={() => setMode('create')} className={`px-3 py-1 rounded ${mode === 'create' ? 'bg-white/20 text-white' : 'text-white/60'}`}>
              Create
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {DEFAULT_CHARACTERS.map(c => (
            <div key={c.id} className={`p-2 rounded-lg text-center cursor-pointer border-4 ${selected === c.id ? 'border-white' : 'border-white/20'}`} onClick={() => setSelected(c.id)}>
              <div className="relative w-28 h-28 mx-auto mb-2">
                  {/* repeating idle pattern behind */}
                  {/* idle tiled pattern behind the tower */}
                  <IdlePattern src={c.warrior as string} frameWidth={48} frameHeight={48} frameIndex={0} opacity={0.18} size={20} className="" />

                  {/* tower image sits above the pattern */}
                  <img src={c.tower as string} alt={`${c.label} tower`} className="absolute inset-0 w-full h-full object-contain z-10" />

                  {/* animated warrior stays centered above the tower (doesn't shift) */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 z-20" style={{ width: 64, height: 64 }}>
                    <SpriteAnimator src={c.warrior as string} frameWidth={48} frameHeight={48} frameCount={36} fps={8} scale={1.2} />
                  </div>
              </div>
              <div className="text-white/80">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="text-white block mb-1">Name</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 rounded bg-white/10 text-white border border-white/20" />
          </div>

          <div>
            <label className="text-white block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded bg-white/10 text-white border border-white/20" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleContinue} className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
            Continue
          </button>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 rounded border border-white/20 text-white">
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CharacterSelection;
