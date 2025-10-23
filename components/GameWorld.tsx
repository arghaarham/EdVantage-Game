import { useState, useEffect, useRef } from 'react';
import { Map } from './Map';
import { PlayersList } from './PlayersList';
import { ChatBox } from './ChatBox';
import { DuelModal } from './DuelModal';
import { GymModal } from './GymModal';
import { InventoryModal } from './InventoryModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Trophy, Backpack, LogOut, Users } from 'lucide-react';

interface GameWorldProps {
  player: any;
  setPlayer: (player: any) => void;
  onLogout: () => void;
}

export function GameWorld({ player, setPlayer, onLogout }: GameWorldProps) {
  const [otherPlayers, setOtherPlayers] = useState<any[]>([]);
  const [showDuel, setShowDuel] = useState(false);
  const [showGym, setShowGym] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [duelOpponent, setDuelOpponent] = useState<any>(null);
  const [showPlayersList, setShowPlayersList] = useState(false);

  const fetchIntervalRef = useRef<any>(null);

  // Fetch other players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/player/list?playerId=${player.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.players) {
            setOtherPlayers(data.players);
          }
        }
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };

    fetchPlayers();
    fetchIntervalRef.current = setInterval(fetchPlayers, 2000);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [player.id]);

  const handlePlayerMove = async (x: number, y: number) => {
    setPlayer({ ...player, x, y });
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/player/position`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerId: player.id,
            x,
            y,
          }),
        }
      );
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const handleChallengeDuel = (opponent: any) => {
    setDuelOpponent(opponent);
    setShowDuel(true);
  };

  const handleEnterGym = () => {
    setShowGym(true);
  };

  return (
    <div className="w-full h-full relative">
      {/* Main Game Area */}
      <Map 
        player={player}
        otherPlayers={otherPlayers}
        onPlayerMove={handlePlayerMove}
        onEnterGym={handleEnterGym}
        onChallengeDuel={handleChallengeDuel}
      />

      {/* Top Bar - Player Info */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full border-2 border-white"
              style={{ backgroundColor: player.avatarColor }}
            />
            <div>
              <p className="text-white">{player.username}</p>
              <div className="flex gap-2 items-center">
                <p className="text-white/70">Level {player.level}</p>
                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  />
                </div>
                <p className="text-white/70">{player.hp}/{player.maxHp} HP</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowPlayersList(!showPlayersList)}
            className="bg-black/60 backdrop-blur-sm hover:bg-black/80 border border-white/20"
          >
            <Users className="w-4 h-4 mr-2" />
            Players ({otherPlayers.length})
          </Button>
          <Button
            onClick={() => setShowInventory(true)}
            className="bg-black/60 backdrop-blur-sm hover:bg-black/80 border border-white/20"
          >
            <Backpack className="w-4 h-4 mr-2" />
            Inventory
          </Button>
          <Button
            onClick={handleEnterGym}
            className="bg-purple-600/80 backdrop-blur-sm hover:bg-purple-700 border border-purple-400/30"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Gym
          </Button>
          <Button
            onClick={onLogout}
            variant="destructive"
            className="bg-red-600/80 backdrop-blur-sm hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Players List */}
      {showPlayersList && (
        <PlayersList 
          players={otherPlayers}
          onClose={() => setShowPlayersList(false)}
          onChallenge={handleChallengeDuel}
        />
      )}

      {/* Chat Box */}
      <ChatBox playerId={player.id} username={player.username} />

      {/* Modals */}
      {showDuel && duelOpponent && (
        <DuelModal
          player={player}
          opponent={duelOpponent}
          onClose={() => setShowDuel(false)}
          onComplete={(result) => {
            setShowDuel(false);
            if (result.won) {
              setPlayer({ 
                ...player,
                level: player.level + 1,
                hp: player.maxHp 
              });
            }
          }}
        />
      )}

      {showGym && (
        <GymModal
          player={player}
          onClose={() => setShowGym(false)}
          onComplete={(rewards) => {
            setShowGym(false);
            if (rewards.badge) {
              setPlayer({
                ...player,
                badges: [...(player.badges || []), rewards.badge]
              });
            }
            if (rewards.fashionItem) {
              setPlayer({
                ...player,
                fashionItems: [...(player.fashionItems || []), rewards.fashionItem]
              });
            }
          }}
        />
      )}

      {showInventory && (
        <InventoryModal
          player={player}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* Controls Guide */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20 z-10">
        <p className="text-white/70 text-sm">Use Arrow Keys or WASD to move</p>
        <p className="text-white/70 text-sm">Click on players to duel</p>
        <p className="text-white/70 text-sm">Enter purple gym area to compete</p>
      </div>
    </div>
  );
}
