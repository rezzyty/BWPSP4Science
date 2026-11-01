import React from 'react';
import { UserGameState } from '../types/game';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import { sound } from '../utils/soundEffects';
import { X, Award, CheckCircle, Lock, Sparkles, Trophy } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: UserGameState;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  gameState,
}) => {
  if (!isOpen) return null;

  // Evaluate unlocked status based on gameState
  const unlockedIds = ACHIEVEMENTS.filter((ach) =>
    ach.condition({
      score: gameState.score,
      stars: gameState.stars,
      coins: gameState.coins,
      completedStages: gameState.completedStages,
      totalCorrectAnswers: gameState.totalCorrectAnswers || 0,
    })
  ).map((ach) => ach.id);

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-7 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-700 pb-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-2xl shadow-md border-2 border-white">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              科學冒險成就系統與個人檔案徽章
            </h2>
            <p className="text-xs text-slate-300">
              達成各項科學里程碑，解鎖稀有角色徽章與榮譽稱號！
            </p>
          </div>
        </div>

        {/* Progress Summary Bar */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-5">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300">成就解鎖進度：</span>
            <span className="text-yellow-300 font-mono">
              {unlockedCount} / {totalCount} ({completionPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`rounded-2xl p-4 border-2 flex items-start gap-3.5 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-slate-850 to-slate-800 border-amber-400/80 shadow-lg ring-2 ring-amber-400/20'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                    isUnlocked ? ach.badgeColor : 'from-slate-800 to-slate-900'
                  } flex items-center justify-center text-2xl shadow-md border border-white/30 shrink-0`}
                >
                  <span>{isUnlocked ? ach.icon : '🔒'}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`font-black text-sm sm:text-base ${
                        isUnlocked ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {ach.title}
                    </span>
                    {isUnlocked ? (
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> 已解鎖
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> 未解鎖
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          💡 提示：繼續挑戰各個單元的選擇題、填充題與大魔王挑戰，即可解鎖全部稱號！
        </div>
      </div>
    </div>
  );
};
