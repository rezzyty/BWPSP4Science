import React, { useState } from 'react';
import { UserGameState, ChapterId, QuestionType } from '../types/game';
import { CHAPTER_INFO, getQuestionsByChapterAndType } from '../data/questionBank';
import { CHARACTERS } from '../data/characters';
import { sound } from '../utils/soundEffects';
import { Star, CheckCircle, Play, Sparkles, BookCheck, ShieldAlert, Award, Compass, Layers } from 'lucide-react';

interface WorldMapProps {
  gameState: UserGameState;
  onStartStage: (chapter: ChapterId, type: QuestionType) => void;
  onStartBossChallenge: () => void;
  onStartCategoryExercise: (type: QuestionType) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  gameState,
  onStartStage,
  onStartBossChallenge,
  onStartCategoryExercise,
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'categories'>('chapters');
  const [selectedChapter, setSelectedChapter] = useState<ChapterId>('ch1');

  const exercises: {
    type: QuestionType;
    label: string;
    subLabel: string;
    code: string;
    icon: string;
    badgeBg: string;
  }[] = [
    {
      type: 'choice',
      label: '選擇題_知識',
      subLabel: '單選與多選綜合理解',
      code: 'S4a_u1_01',
      icon: '🎯',
      badgeBg: 'bg-red-500',
    },
    {
      type: 'fill_blank',
      label: '填充題_知識',
      subLabel: '科學關鍵字精準填寫',
      code: 'S4a_u1_02',
      icon: '✍️',
      badgeBg: 'bg-amber-500',
    },
    {
      type: 'word_bank',
      label: '供詞填充題',
      subLabel: '從科學詞庫點選配對',
      code: 'S4a_u1_03',
      icon: '📦',
      badgeBg: 'bg-emerald-500',
    },
    {
      type: 'true_false',
      label: '判斷題_知識',
      subLabel: '是非正誤與觀念辨析',
      code: 'S4a_u1_04',
      icon: '⚖️',
      badgeBg: 'bg-blue-500',
    },
    {
      type: 'matching',
      label: '配對題_知識',
      subLabel: '多項連線與特徵歸納',
      code: 'S4a_u1_07',
      icon: '🔗',
      badgeBg: 'bg-purple-500',
    },
  ];

  const currentChapterInfo = CHAPTER_INFO[selectedChapter];

  // Calculate total stars
  const totalCompleted = Object.keys(gameState.completedStages).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 border-4 border-yellow-300 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-black text-xs sm:text-sm px-3 py-1 rounded-full border-2 border-white shadow">
              <span>🌟 香港小學四年級 常識／科學科</span>
              <span>• 單元一 認識地球</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              哈囉，{gameState.studentName}！
            </h2>
            <p className="text-sm sm:text-base text-yellow-100 max-w-xl font-medium">
              碧姬公主、耀西、黛西公主、羅潔塔公主與咚奇剛已經就位！選擇章節開啟闖關，奪取無敵星與超級能量！
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border-2 border-amber-300 shadow-xl shrink-0">
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">
                {gameState.stars}
              </div>
              <div className="text-[11px] font-bold text-slate-300">累計星數</div>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {totalCompleted}/15
              </div>
              <div className="text-[11px] font-bold text-slate-300">通關進度</div>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {gameState.score}
              </div>
              <div className="text-[11px] font-bold text-slate-300">冒險得分</div>
            </div>
          </div>
        </div>

        {/* Decorative Pixel / Coin Elements in background */}
        <div className="absolute -bottom-8 -right-8 text-8xl opacity-20 pointer-events-none select-none">
          🏰
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-center sm:justify-start gap-2 border-b-2 border-slate-700/60 pb-2">
        <button
          onClick={() => {
            sound.playJump();
            setActiveTab('chapters');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm sm:text-base transition-all ${
            activeTab === 'chapters'
              ? 'bg-amber-400 text-slate-950 shadow-lg scale-102 border-2 border-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>章節冒險地圖 (Chapter 1, 2, 3)</span>
        </button>

        <button
          onClick={() => {
            sound.playJump();
            setActiveTab('categories');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm sm:text-base transition-all ${
            activeTab === 'categories'
              ? 'bg-amber-400 text-slate-950 shadow-lg scale-102 border-2 border-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>五大題型專項特訓</span>
        </button>
      </div>

      {activeTab === 'chapters' ? (
        /* CHAPTERS VIEW */
        <div className="space-y-6">
          {/* Chapter Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['ch1', 'ch2', 'ch3'] as ChapterId[]).map((chapId) => {
              const info = CHAPTER_INFO[chapId];
              const isSelected = selectedChapter === chapId;

              // Count completed stages for this chapter
              const chapCompleted = exercises.filter(
                (ex) => gameState.completedStages[`${chapId}_${ex.type}`]
              ).length;

              return (
                <div
                  key={chapId}
                  onClick={() => {
                    sound.playJump();
                    setSelectedChapter(chapId);
                  }}
                  className={`cursor-pointer rounded-3xl p-5 border-4 transition-all relative overflow-hidden ${
                    isSelected
                      ? `bg-slate-900 ${info.borderColor} ring-4 ring-yellow-400/40 shadow-2xl scale-102`
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{info.bannerIcon}</span>
                    <span className="bg-slate-800 text-xs px-2.5 py-1 rounded-full font-bold text-amber-300 border border-slate-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{chapCompleted}/5 關卡</span>
                    </span>
                  </div>

                  <h3 className="font-black text-lg sm:text-xl text-white mb-1">
                    {info.name}
                  </h3>
                  <div className="text-xs font-bold text-amber-400 mb-2">
                    {info.subTitle}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    {info.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-slate-400">
                    <span>導師：{info.guideName}</span>
                    <span className={`text-xs ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                      {isSelected ? '▶ 探索中' : '點擊查看'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Stage Level Cards for Selected Chapter */}
          <div className="bg-slate-900/90 rounded-3xl border-4 border-amber-400/80 p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentChapterInfo.bannerIcon}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                    {currentChapterInfo.name} — 五大練習關卡
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  題庫完全對應教育出版社小四科學題庫，由導師親自指導！
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300">
                <span>導師助陣：</span>
                <span className="text-amber-300 font-extrabold">{currentChapterInfo.guideName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((ex, index) => {
                const stageKey = `${selectedChapter}_${ex.type}`;
                const completion = gameState.completedStages[stageKey];
                const questions = getQuestionsByChapterAndType(selectedChapter, ex.type);
                const qCount = questions.length;

                return (
                  <div
                    key={ex.type}
                    className="bg-slate-800/90 border-2 border-slate-700 hover:border-amber-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:scale-101 shadow-md group"
                  >
                    <div>
                      {/* Top Bar with Stage Code & Stars */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-black bg-slate-950 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-800">
                          {ex.code}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-4 h-4 ${
                                completion && completion.stars >= starIdx
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-700">
                          {ex.icon}
                        </span>
                        <div>
                          <h4 className="font-black text-base text-white group-hover:text-amber-300 transition-colors">
                            關卡 {index + 1}：{ex.label}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {ex.subLabel}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
                        <span>題目數量：</span>
                        <span className="font-mono font-bold text-amber-300">
                          {qCount} {ex.type === 'word_bank' || ex.type === 'matching' ? '大題' : '題'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-4 mt-3 border-t border-slate-700/60 flex items-center justify-between">
                      {completion ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>最高分: {completion.score}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">
                          未挑戰
                        </span>
                      )}

                      <button
                        onClick={() => {
                          sound.playJump();
                          onStartStage(selectedChapter, ex.type);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow transition-transform"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{completion ? '再次挑戰' : '進入關卡'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Special Chapter Boss / Summary Card */}
              <div className="bg-gradient-to-br from-red-950/80 via-slate-900 to-purple-950/80 border-2 border-red-500/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-black bg-red-900 text-yellow-300 px-2.5 py-1 rounded-lg">
                      BOSS 關卡
                    </span>
                    <span className="text-xs text-red-300 font-bold">考驗全章重點</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-red-800">
                      👾
                    </span>
                    <div>
                      <h4 className="font-black text-base text-red-300">
                        {currentChapterInfo.name.split('：')[1]} 大魔王
                      </h4>
                      <span className="text-[11px] text-slate-300 font-medium">
                        隨機混合 5 大題型極限挑戰！
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    答對獲得雙倍金幣與專屬「無敵星徽章」，考驗你的真實科學實力！
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => {
                      sound.playPowerUp();
                      onStartBossChallenge();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg active:scale-95"
                  >
                    <span>挑戰大魔王</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CATEGORY DRILL VIEW */
        <div className="bg-slate-900/90 rounded-3xl border-4 border-amber-400/80 p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="border-b-2 border-slate-800 pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-amber-300">
              五大題型專項特訓模式
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              可按題型跨章節集中練習，精通各類題型的作答技巧！
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.type}
                className="bg-slate-800/80 border-2 border-slate-700 hover:border-amber-400 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-3 rounded-2xl bg-slate-900 border border-slate-700">
                    {ex.icon}
                  </span>
                  <div>
                    <span className="text-[11px] font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded">
                      {ex.code}
                    </span>
                    <h4 className="font-black text-base text-white mt-1">
                      {ex.label}
                    </h4>
                    <p className="text-xs text-slate-400">{ex.subLabel}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playJump();
                    onStartCategoryExercise(ex.type);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>專項特訓</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
