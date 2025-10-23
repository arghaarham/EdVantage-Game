import { Button } from './ui/button';
import { X, Sword } from 'lucide-react';

interface PlayersListProps {
  players: any[];
  onClose: () => void;
  onChallenge: (player: any) => void;
}

export function PlayersList({ players, onClose, onChallenge }: PlayersListProps) {
  return (
    <div className="absolute top-20 right-4 w-80 bg-black/80 backdrop-blur-lg rounded-lg border border-white/20 p-4 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white">Online Players ({players.length})</h3>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {players.length === 0 ? (
          <p className="text-white/50 text-center py-4">No other players online</p>
        ) : (
          players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white"
                  style={{ backgroundColor: p.avatarColor }}
                />
                <div>
                  <p className="text-white">{p.username}</p>
                  <p className="text-white/60">Level {p.level}</p>
                </div>
              </div>
              <Button
                onClick={() => onChallenge(p)}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Sword className="w-4 h-4 mr-1" />
                Duel
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
