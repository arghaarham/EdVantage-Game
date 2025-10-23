import { Button } from './ui/button';
import { X, Award, Shirt } from 'lucide-react';

interface InventoryModalProps {
  player: any;
  onClose: () => void;
}

export function InventoryModal({ player, onClose }: InventoryModalProps) {
  const badges = player.badges || [];
  const fashionItems = player.fashionItems || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white">Inventory</h2>
          <Button onClick={onClose} variant="ghost" className="text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white">Badges ({badges.length})</h3>
          </div>
          
          {badges.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <p className="text-white/50">No badges yet</p>
              <p className="text-white/30 text-sm mt-2">
                Complete gym challenges to earn exclusive badges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-4 border-2 border-yellow-400 text-center"
                >
                  <Award className="w-12 h-12 mx-auto mb-2 text-white" />
                  <p className="text-white text-sm">{badge}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fashion Items */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shirt className="w-5 h-5 text-pink-400" />
            <h3 className="text-white">Fashion Items ({fashionItems.length})</h3>
          </div>
          
          {fashionItems.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <p className="text-white/50">No fashion items yet</p>
              <p className="text-white/30 text-sm mt-2">
                Compete in gym challenges to earn limited edition fashion items!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fashionItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg p-4 border-2 border-pink-400 text-center"
                >
                  <Shirt className="w-12 h-12 mx-auto mb-2 text-white" />
                  <p className="text-white text-sm">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-900/30 border border-blue-500 rounded-lg p-4">
          <p className="text-white/80 text-center text-sm">
            💡 Show off your badges and fashion items to other players as you explore the world!
          </p>
        </div>
      </div>
    </div>
  );
}
