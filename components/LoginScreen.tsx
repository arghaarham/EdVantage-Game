import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginScreenProps {
  onLogin: (player: any) => void;
  prefill?: {
    username?: string;
    password?: string;
    avatarColor?: string;
  };
}

export function LoginScreen({ onLogin, prefill }: LoginScreenProps) {
  const [username, setUsername] = useState(prefill?.username ?? '');
  const [password, setPassword] = useState(prefill?.password ?? '');
  const [avatarColor, setAvatarColor] = useState(prefill?.avatarColor ?? '#3b82f6');
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
  ];

  const handleJoinGame = async (createIfNotFound = false) => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = createIfNotFound
        ? `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/player/create`
        : `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/player/join`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          avatarColor,
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
        onLogin(data.player);
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
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-center text-white mb-2">Pokemon MMORPG</h1>
        <p className="text-center text-white/70 mb-6">Educational Battle Arena</p>

        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
              onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
            />
            <div className="mt-3">
              <label className="block text-white mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Avatar Color</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-12 h-12 rounded-full border-4 transition-transform ${
                    avatarColor === color ? 'border-white scale-110' : 'border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleJoinGame()}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? 'Joining...' : 'Join Game'}
          </Button>
        </div>

        <div className="mt-6 text-white/60 text-center">
          <p>Explore the world, battle other players,</p>
          <p>and conquer the Gym challenges!</p>
        </div>
      </div>
    </div>
  );
}