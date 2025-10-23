import { useState } from 'react';
import { GameWorld } from './components/GameWorld';
import { LoginScreen } from './components/LoginScreen';
import StartScreen from './components/StartScreen';
import CharacterSelection from './components/CharacterSelection';

export default function App() {
  const [player, setPlayer] = useState<any>(null);
  const [stage, setStage] = useState<'start' | 'select' | 'login' | 'game'>('start');
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

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
          onSelect={(player) => {
            setSelectedCharacter(player);
            setStage('login');
          }}
          onBack={() => setStage('start')}
        />
      )}

      {stage === 'login' && (
        <LoginScreen
          prefill={selectedCharacter ?? undefined}
          onLogin={(p) => {
            // merge character choices if present
            const merged = { ...(selectedCharacter || {}), ...p };
            handleLogin(merged);
          }}
        />
      )}

      {stage === 'game' && player && (
        <GameWorld player={player} setPlayer={setPlayer} onLogout={handleLogout} />
      )}
    </div>
  );
}