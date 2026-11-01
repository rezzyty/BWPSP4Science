import React, { useState } from 'react';
import { UserGameState } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { sound } from '../utils/soundEffects';
import { Volume2, VolumeX, Cloud, ShoppingBag, Award, Heart, Sparkles, BookOpen } from 'lucide-react';

interface NavbarProps {
  gameState: UserGameState;
  onOpenSaveModal: () => void;
  onOpenShopModal: () => void;
  onOpenCertificateModal: () => void;
  onOpenMistakes: () => void;
  onReturnToHome: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameState,
  onOpenSaveModal,
  onOpenShopModal,
  onOpenCertificateModal,
  onOpenMistakes,
  onReturnToHome,
  activeView,
}) => {
  const [muted, setMuted] = useState(!sound.enabled);
  const character = CHARACTERS[gameState.selectedCharacter] || CHARACTERS.peach;

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setMuted(!sound.enabled);
    if (sound.enabled) sound.playCoin();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-4 border-amber-400 px-3 py-2 sm:px-6 sm:py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Home Button */}
        <div
          onClick={() => {
            sound.playJump();
            onReturnToHome();
          }}
          className="flex items-center gap-2 cursor-pointer group hover:scale-105 transition-transform"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-yellow-400 to-red-500 p-1 flex items-center justify-center shadow-lg border-2 border-white animate-mario-bounce">
            <span className="text-2xl sm:text-3xl">🍄</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 font-extrabold text-sm sm:text-base tracking-wider drop-shadow">
                小四科學
              </span>
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full border border-yellow-300">
                香港專用
              </span>
            </div>
            <h1 className="text-white font-black text-base sm:text-xl tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              瑪利歐科學大冒險
            </h1>
          </div>
        </div>

        {/* Player Stats: Hearts, Coins, Stars */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-800/80 px-3 py-1.5 rounded-full border-2 border-slate-700 shadow-inner">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1 text-rose-400 font-black text-sm sm:text-base">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>x{gameState.lives}</span>
          </div>

          <div className="h-4 w-px bg-slate-600"></div>

          {/* Coins */}
          <div className="flex items-center gap-1 text-yellow-300 font-black text-sm sm:text-base">
            <span className="inline-block text-base sm:text-lg animate-coin">🪙</span>
            <span>{gameState.coins}</span>
          </div>

          <div className="h-4 w-px bg-slate-600"></div>

          {/* Stars */}
          <div className="flex items-center gap-1 text-amber-300 font-black text-sm sm:text-base">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
            <span>{gameState.stars}</span>
          </div>
        </div>

        {/* Action Buttons: Save Code, Shop, Mistake Book, Mute */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mistake Book */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenMistakes();
            }}
            title="錯題複習本"
            className="relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md border-b-2 border-purple-900 active:translate-y-0.5 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">錯題筆記</span>
            {gameState.mistakes.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {gameState.mistakes.length}
              </span>
            )}
          </button>

          {/* Power-up Inventory / Shop */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenShopModal();
            }}
            title="道具背包與商店"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border-b-2 border-amber-800 active:translate-y-0.5 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-slate-900" />
            <span className="hidden md:inline">道具背包</span>
          </button>

          {/* Cloud Save & Cross-device code */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenSaveModal();
            }}
            title="跨裝置存檔與雲端同步"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border-b-2 border-blue-900 active:translate-y-0.5 transition-all"
          >
            <Cloud className="w-4 h-4" />
            <span>存檔碼:</span>
            <span className="bg-blue-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs tracking-wider">
              {gameState.saveCode}
            </span>
          </button>

          {/* Certificate */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenCertificateModal();
            }}
            title="冒險證書"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? '開啟音效' : '關閉音效'}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            {muted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
