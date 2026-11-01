import React, { useState, useEffect } from 'react';
import { UserGameState, ChapterId, QuestionType, QuestionItem } from './types/game';
import {
  loadLocalGameState,
  saveLocalGameState,
} from './utils/gameState';
import {
  getQuestionsByChapterAndType,
  getAllQuestionsForChapter,
  CHOICE_QUESTIONS,
  FILL_BLANK_QUESTIONS,
  WORD_BANK_QUESTIONS,
  TRUE_FALSE_QUESTIONS,
  MATCHING_QUESTIONS,
  CHAPTER_INFO,
} from './data/questionBank';
import { Navbar } from './components/Navbar';
import { WorldMap } from './components/WorldMap';
import { QuestionArena } from './components/QuestionArena';
import { SaveSyncModal } from './components/SaveSyncModal';
import { PowerUpModal } from './components/PowerUpModal';
import { MistakesNotebook } from './components/MistakesNotebook';
import { CertificateModal } from './components/CertificateModal';
import { AchievementsModal } from './components/AchievementsModal';
import { StageCompleteModal } from './components/StageCompleteModal';
import { sound } from './utils/soundEffects';

export default function App() {
  const [gameState, setGameState] = useState<UserGameState>(() => loadLocalGameState());
  const [activeScreen, setActiveScreen] = useState<'map' | 'arena'>('map');

  // Stage Arena State
  const [activeStageData, setActiveStageData] = useState<{
    stageKey: string;
    stageTitle: string;
    stageCode: string;
    questions: QuestionItem[];
  } | null>(null);

  // Modals
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [mistakesModalOpen, setMistakesModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);
  const [stageCompleteOpen, setStageCompleteOpen] = useState(false);
  const [lastCompletedResult, setLastCompletedResult] = useState<{
    score: number;
    stars: number;
    coinsEarned: number;
  }>({ score: 0, stars: 0, coinsEarned: 0 });

  // Auto-save whenever gameState changes
  useEffect(() => {
    saveLocalGameState(gameState);
  }, [gameState]);

  // Start specific stage from chapter
  const handleStartStage = (chapter: ChapterId, type: QuestionType) => {
    const questions = getQuestionsByChapterAndType(chapter, type);
    const chapInfo = CHAPTER_INFO[chapter];
    const typeNames: Record<QuestionType, { name: string; code: string }> = {
      choice: { name: '選擇題_知識', code: 'S4a_u1_01' },
      fill_blank: { name: '填充題_知識', code: 'S4a_u1_02' },
      word_bank: { name: '供詞填充題', code: 'S4a_u1_03' },
      true_false: { name: '判斷題_知識', code: 'S4a_u1_04' },
      matching: { name: '配對題_知識', code: 'S4a_u1_07' },
    };

    const stageKey = `${chapter}_${type}`;
    setActiveStageData({
      stageKey,
      stageTitle: `${chapInfo.name} • ${typeNames[type].name}`,
      stageCode: typeNames[type].code,
      questions,
    });
    setActiveScreen('arena');
  };

  // Start Category Drill (across chapters)
  const handleStartCategoryExercise = (type: QuestionType) => {
    let questions: QuestionItem[] = [];
    let code = 'S4a_u1';
    let label = '';

    switch (type) {
      case 'choice':
        questions = [...CHOICE_QUESTIONS];
        code = 'S4a_u1_01';
        label = '選擇題_知識 全章特訓';
        break;
      case 'fill_blank':
        questions = [...FILL_BLANK_QUESTIONS];
        code = 'S4a_u1_02';
        label = '填充題_知識 全章特訓';
        break;
      case 'word_bank':
        questions = [...WORD_BANK_QUESTIONS];
        code = 'S4a_u1_03';
        label = '供詞填充題 全章特訓';
        break;
      case 'true_false':
        questions = [...TRUE_FALSE_QUESTIONS];
        code = 'S4a_u1_04';
        label = '判斷題_知識 全章特訓';
        break;
      case 'matching':
        questions = [...MATCHING_QUESTIONS];
        code = 'S4a_u1_07';
        label = '配對題_知識 全章特訓';
        break;
    }

    // Shuffle questions slightly for drill fun
    const shuffled = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);

    setActiveStageData({
      stageKey: `drill_${type}`,
      stageTitle: label,
      stageCode: code,
      questions: shuffled,
    });
    setActiveScreen('arena');
  };

  // Boss challenge (mixed topics from Ch1, Ch2, Ch3)
  const handleStartBossChallenge = () => {
    const all = [
      ...CHOICE_QUESTIONS.slice(0, 3),
      ...TRUE_FALSE_QUESTIONS.slice(0, 3),
      ...FILL_BLANK_QUESTIONS.slice(0, 3),
      ...MATCHING_QUESTIONS.slice(0, 2),
      ...WORD_BANK_QUESTIONS.slice(0, 1),
    ].sort(() => 0.5 - Math.random());

    setActiveStageData({
      stageKey: 'boss_ultimate',
      stageTitle: '大魔王終極科學挑戰（單元一 認識地球）',
      stageCode: 'BOSS_BATTLE',
      questions: all,
    });
    setActiveScreen('arena');
  };

  // Practice single mistake
  const handlePracticeMistake = (q: QuestionItem) => {
    setMistakesModalOpen(false);
    setActiveStageData({
      stageKey: `mistake_${q.id}`,
      stageTitle: `錯題消滅練習 (${q.exerciseCode})`,
      stageCode: q.exerciseCode,
      questions: [q],
    });
    setActiveScreen('arena');
  };

  // Stage completed handler
  const handleStageComplete = (score: number, stars: number, coinsEarned: number) => {
    if (!activeStageData) return;

    const prevStage = gameState.completedStages[activeStageData.stageKey];
    const oldStars = prevStage ? prevStage.stars : 0;
    const gainedStars = Math.max(0, stars - oldStars);

    const updatedStages = {
      ...gameState.completedStages,
      [activeStageData.stageKey]: {
        stars: Math.max(stars, oldStars),
        score: Math.max(score, prevStage ? prevStage.score : 0),
        passedAt: new Date().toISOString(),
      },
    };

    const newState: UserGameState = {
      ...gameState,
      stars: gameState.stars + gainedStars,
      score: gameState.score + score,
      coins: gameState.coins + coinsEarned,
      completedStages: updatedStages,
    };

    setGameState(newState);
    setLastCompletedResult({ score, stars, coinsEarned });
    setStageCompleteOpen(true);
  };

  const handleClearMistakes = () => {
    setGameState((prev) => ({ ...prev, mistakes: [] }));
  };

  return (
    <div className="min-h-screen bg-[#5c94fc] flex flex-col font-sans select-none antialiased">
      {/* Super Mario Sky Cloud Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute top-12 left-10 text-6xl">☁️</div>
        <div className="absolute top-28 right-20 text-8xl">☁️</div>
        <div className="absolute top-72 left-1/3 text-7xl">☁️</div>
        <div className="absolute bottom-20 left-12 text-7xl">🌳</div>
        <div className="absolute bottom-20 right-16 text-7xl">🌳</div>
      </div>

      {/* Header Bar */}
      <Navbar
        gameState={gameState}
        onOpenSaveModal={() => setSaveModalOpen(true)}
        onOpenShopModal={() => setShopModalOpen(true)}
        onOpenCertificateModal={() => setCertificateModalOpen(true)}
        onOpenAchievements={() => setAchievementsModalOpen(true)}
        onOpenMistakes={() => setMistakesModalOpen(true)}
        onReturnToHome={() => {
          setActiveScreen('map');
          setActiveStageData(null);
        }}
        activeView={activeScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 pb-16">
        {activeScreen === 'map' ? (
          <WorldMap
            gameState={gameState}
            onStartStage={handleStartStage}
            onStartBossChallenge={handleStartBossChallenge}
            onStartCategoryExercise={handleStartCategoryExercise}
          />
        ) : (
          activeStageData && (
            <QuestionArena
              stageTitle={activeStageData.stageTitle}
              stageCode={activeStageData.stageCode}
              questions={activeStageData.questions}
              gameState={gameState}
              onStageComplete={handleStageComplete}
              onExit={() => {
                setActiveScreen('map');
                setActiveStageData(null);
              }}
              onUpdateState={setGameState}
            />
          )
        )}
      </main>

      {/* Ground & Brick Bottom Bar (Mario Classic Aesthetic) */}
      <footer className="relative z-10 bg-[#e76f51] border-t-4 border-yellow-400 py-3 px-4 text-center text-xs text-yellow-100 font-bold shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>🍄 專為香港小四科學（認識地球）量身設計</span>
            <span className="hidden sm:inline">•</span>
            <span>包含 01選擇、02填充、03供詞、04判斷、07配對</span>
          </div>
          <div className="flex items-center gap-2">
            <span>當前存檔碼：</span>
            <span className="font-mono bg-black/40 text-yellow-300 px-2 py-0.5 rounded font-black">
              {gameState.saveCode}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SaveSyncModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        gameState={gameState}
        onStateUpdated={setGameState}
      />

      <PowerUpModal
        isOpen={shopModalOpen}
        onClose={() => setShopModalOpen(false)}
        gameState={gameState}
        onStateUpdated={setGameState}
      />

      <MistakesNotebook
        isOpen={mistakesModalOpen}
        onClose={() => setMistakesModalOpen(false)}
        gameState={gameState}
        onPracticeMistake={handlePracticeMistake}
        onClearMistakes={handleClearMistakes}
      />

      <CertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        gameState={gameState}
      />

      <AchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        gameState={gameState}
      />

      <StageCompleteModal
        isOpen={stageCompleteOpen}
        score={lastCompletedResult.score}
        stars={lastCompletedResult.stars}
        coinsEarned={lastCompletedResult.coinsEarned}
        stageTitle={activeStageData?.stageTitle || '科學關卡'}
        onRetry={() => {
          setStageCompleteOpen(false);
          // Restart current questions
        }}
        onContinue={() => {
          setStageCompleteOpen(false);
          setActiveScreen('map');
          setActiveStageData(null);
        }}
      />
    </div>
  );
}
