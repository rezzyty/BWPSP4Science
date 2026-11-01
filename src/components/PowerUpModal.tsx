import React from 'react';
import { UserGameState, PowerUpItem } from '../types/game';
import { INITIAL_POWER_UPS, CHARACTERS } from '../data/characters';
import { sound } from '../utils/soundEffects';
import { X, Sparkles, PlusCircle, Check } from 'lucide-react';

interface PowerUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: UserGameState;
  onStateUpdated: (newState: UserGameState) => void;
}

export const PowerUpModal: React.FC<PowerUpModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onStateUpdated,
}) => {
  if (!isOpen) return null;

  const handleBuy = (item: PowerUpItem) => {
    if (gameState.coins < item.cost) {
      sound.playWrong();
      return;
    }
    sound.playPowerUp();
    const currentCount = gameState.inventory[item.id] || 0;
    const newInventory = {
      ...gameState.inventory,
      [item.id]: currentCount + 1,
    };
    onStateUpdated({
      ...gameState,
      coins: gameState.coins - item.cost,
      inventory: newInventory,
    });
  };

  const handleSelectCharacter = (charId: string) => {
    sound.playJump();
    onStateUpdated({
      ...gameState,
      selectedCharacter: charId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 text-white shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎒</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300">
                冒險道具背包 & 角色大廳
              </h2>
              <p className="text-xs text-slate-300">
                答題賺取金幣，解鎖強大的超級瑪利歐道具支援！
              </p>
            </div>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-full border border-yellow-500/50 flex items-center gap-1.5 font-black text-yellow-300 text-sm sm:text-base">
            <span className="animate-coin">🪙</span>
            <span>{gameState.coins}</span>
          </div>
        </div>

        {/* Section 1: Choose Guide Character */}
        <div className="mb-6">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> 選擇你的科學冒險導師：
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.values(CHARACTERS).map((c) => {
              const isSelected = gameState.selectedCharacter === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCharacter(c.id)}
                  className={`cursor-pointer rounded-2xl p-2.5 sm:p-3 border-2 transition-all text-center flex flex-col items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-300/50 scale-102 shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${c.avatarBg} flex items-center justify-center text-2xl shadow-md border border-white/50 mb-1.5`}
                  >
                    <span>{c.emoji}</span>
                  </div>
                  <div className="font-black text-xs sm:text-sm text-white">{c.name}</div>
                  <div className="text-[10px] text-amber-300 font-semibold">{c.title}</div>
                  {isSelected && (
                    <span className="mt-1 text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 目前出戰
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Power-Ups Inventory & Shop */}
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 mb-2.5">
            <span>🍄</span> 能量道具背包（答題時可獲得額外輔助）：
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INITIAL_POWER_UPS.map((item) => {
              const count = gameState.inventory[item.id] || 0;
              const canAfford = gameState.coins >= item.cost;

              return (
                <div
                  key={item.id}
                  className="bg-slate-800/90 border-2 border-slate-700 hover:border-amber-400/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-2xl shadow-md border border-white/40 shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-amber-300">
                          {item.name}
                        </span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded-full text-xs font-mono font-bold text-emerald-400 border border-slate-800">
                          擁有: x{count}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 mt-auto">
                    <div className="flex items-center gap-1 text-xs text-yellow-300 font-bold">
                      <span>價格：</span>
                      <span>🪙 {item.cost}</span>
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow transition-all ${
                        canAfford
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-95'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{canAfford ? '購買 +1' : '金幣不足'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-400">
          💡 提示：在關卡答題時，可隨時點擊道具圖示使用「超級蘑菇護盾」或「超級葉子導師提示」！
        </div>
      </div>
    </div>
  );
};
