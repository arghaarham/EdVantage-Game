import { useState } from 'react';
import { GameWorld } from './components/GameWorld';
import StartScreen from './components/StartScreen';
import CharacterSelection from './components/CharacterSelection';

export default function App() {
  const [player, setPlayer] = useState<any>(null);
  const [stage, setStage] = useState<'start' | 'select' | 'game'>('start');

  const handleLogin = (playerData: any) => {
    setPlayer(playerData);
    setStage('game');
  };

  const handleLogout = () => {
    setPlayer(null);
    setStage('start');
  };

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden">
      {stage === 'start' && <StartScreen onStart={() => setStage('select')} />}

      {stage === 'select' && (
        <CharacterSelection
          onSelect={handleLogin}
          onBack={() => setStage('start')}
        />
      )}

      {stage === 'game' && player && (
        <GameWorld player={player} setPlayer={setPlayer} onLogout={handleLogout} />
      )}
    </div>
  );
}