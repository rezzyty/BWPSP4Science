import React from 'react';
import { Star, Award, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface StageCompleteModalProps {
  isOpen: boolean;
  score: number;
  stars: number;
  coinsEarned: number;
  stageTitle: string;
  onRetry: () => void;
  onContinue: () => void;
}

export const StageCompleteModal: React.FC<StageCompleteModalProps> = ({
  isOpen,
  score,
  stars,
  coinsEarned,
  stageTitle,
  onRetry,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 text-white text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 flex items-center justify-center text-3xl shadow-lg border-2 border-white animate-mario-bounce">
          ⭐
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide drop-shadow mb-1">
          關卡通關完成！
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 font-semibold mb-5">
          {stageTitle}
        </div>

        {/* 3 Stars Animation */}
        <div className="flex items-center justify-center gap-3 mb-6 bg-slate-950/80 py-4 px-6 rounded-2xl border border-slate-800">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transform transition-all duration-500 ${
                stars >= starIdx
                  ? 'scale-125 animate-mario-bounce'
                  : 'scale-90 opacity-30'
              }`}
            >
              <Star
                className={`w-10 h-10 ${
                  stars >= starIdx
                    ? 'fill-amber-400 text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                    : 'text-slate-600'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Results Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold block mb-1">獲得金幣</span>
            <div className="flex items-center justify-center gap-1.5 text-xl font-black text-yellow-300">
              <span className="animate-coin">🪙</span>
              <span>+{coinsEarned}</span>
            </div>
          </div>

          <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold block mb-1">關卡得分</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {score} PTS
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playJump();
              onRetry();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-600 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再次挑戰</span>
          </button>

          <button
            onClick={() => {
              sound.playPowerUp();
              onContinue();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl transition-all active:scale-95"
          >
            <span>返回冒險地圖</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
