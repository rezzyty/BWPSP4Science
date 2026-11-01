import React, { useState } from 'react';
import {
  QuestionItem,
  UserGameState,
  ChoiceQuestion,
  FillBlankQuestion,
  WordBankQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
} from '../types/game';
import { CHARACTERS } from '../data/characters';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  ChoiceQuestionView,
  FillBlankQuestionView,
  WordBankQuestionView,
  TrueFalseQuestionView,
  MatchingQuestionView,
} from './QuestionViews';
import {
  Heart,
  Sparkles,
  ArrowRight,
  Shield,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Zap,
  HelpCircle,
  Home,
} from 'lucide-react';

interface QuestionArenaProps {
  stageTitle: string;
  stageCode: string;
  questions: QuestionItem[];
  gameState: UserGameState;
  onStageComplete: (score: number, stars: number, coinsEarned: number) => void;
  onExit: () => void;
  onUpdateState: (newState: UserGameState) => void;
}

export const QuestionArena: React.FC<QuestionArenaProps> = ({
  stageTitle,
  stageCode,
  questions,
  gameState,
  onStageComplete,
  onExit,
  onUpdateState,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stageScore, setStageScore] = useState(0);
  const [stageCoins, setStageCoins] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Per-question user inputs
  const [choiceSelected, setChoiceSelected] = useState<string[]>([]);
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<number, string>>({});
  const [wordBankAnswers, setWordBankAnswers] = useState<Record<number, string>>({});
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string | number, string[]>>({});

  // Feedback states
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastAnswerIsCorrect, setLastAnswerIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [shieldTriggered, setShieldTriggered] = useState(false);

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  // Guide character for this question
  const guideChar =
    CHARACTERS[currentQuestion.guideCharacterId] ||
    CHARACTERS[gameState.selectedCharacter] ||
    CHARACTERS.peach;

  // Reset inputs when navigating to a question
  const resetInputStates = () => {
    setChoiceSelected([]);
    setFillBlankAnswers({});
    setWordBankAnswers({});
    setTfAnswer(null);
    setMatchingAnswers({});
    setIsAnswerSubmitted(false);
    setLastAnswerIsCorrect(null);
    setShowHint(false);
    setShieldTriggered(false);
  };

  // Check if current question has any answer selected
  const hasUserAnswered = (): boolean => {
    switch (currentQuestion.type) {
      case 'choice':
        return choiceSelected.length > 0;
      case 'fill_blank':
        return Object.keys(fillBlankAnswers).length > 0;
      case 'word_bank':
        return Object.keys(wordBankAnswers).length > 0;
      case 'true_false':
        return tfAnswer !== null;
      case 'matching':
        return Object.keys(matchingAnswers).length > 0;
    }
  };

  // Evaluate correctness
  const evaluateAnswer = (): boolean => {
    switch (currentQuestion.type) {
      case 'choice': {
        const correct = [...(currentQuestion as ChoiceQuestion).correctAnswers].sort();
        const user = [...choiceSelected].sort();
        return (
          correct.length === user.length &&
          correct.every((val, idx) => val === user[idx])
        );
      }
      case 'fill_blank': {
        const fb = currentQuestion as FillBlankQuestion;
        return fb.blanks.every((b) => {
          const userVal = (fillBlankAnswers[b.index] || '').trim().replace(/\s+/g, '');
          return b.acceptableAnswers.some(
            (ans) => ans.trim().replace(/\s+/g, '') === userVal
          );
        });
      }
      case 'word_bank': {
        const wb = currentQuestion as WordBankQuestion;
        return wb.subQuestions.every((sub) => {
          const userVal = (wordBankAnswers[sub.number] || '').trim();
          if (Array.isArray(sub.correctWord)) {
            return sub.correctWord.includes(userVal);
          }
          return sub.correctWord.trim() === userVal;
        });
      }
      case 'true_false': {
        return tfAnswer === (currentQuestion as TrueFalseQuestion).isCorrect;
      }
      case 'matching': {
        const m = currentQuestion as MatchingQuestion;
        for (const [leftId, correctArr] of Object.entries(m.correctMatches)) {
          const userArr = [...(matchingAnswers[leftId] || [])].sort();
          const targetArr = [...correctArr].sort();
          if (userArr.length !== targetArr.length) return false;
          if (!userArr.every((v, i) => v === targetArr[i])) return false;
        }
        return true;
      }
    }
  };

  // Submit Answer
  const handleSubmit = () => {
    if (isAnswerSubmitted) return;

    const isCorrect = evaluateAnswer();
    setIsAnswerSubmitted(true);
    setLastAnswerIsCorrect(isCorrect);

    if (isCorrect) {
      sound.playCoin();
      const points = 100;
      const coinEarned = (gameState.activePowerUp === 'fire_flower' ? 20 : 10);
      setStageScore((prev) => prev + points);
      setStageCoins((prev) => prev + coinEarned);
      setCorrectCount((prev) => prev + 1);

      // Update state coins immediately
      onUpdateState({
        ...gameState,
        coins: gameState.coins + coinEarned,
        score: gameState.score + points,
      });
    } else {
      // Check for Super Mushroom Shield
      if ((gameState.inventory['super_mushroom'] || 0) > 0) {
        sound.playPowerUp();
        setShieldTriggered(true);
        // Deduct 1 mushroom, preserve lives!
        onUpdateState({
          ...gameState,
          inventory: {
            ...gameState.inventory,
            super_mushroom: (gameState.inventory['super_mushroom'] || 1) - 1,
          },
        });
      } else {
        sound.playWrong();
        const newLives = Math.max(0, gameState.lives - 1);
        const newMistakes = Array.from(new Set([...gameState.mistakes, currentQuestion.id]));
        onUpdateState({
          ...gameState,
          lives: newLives,
          mistakes: newMistakes,
        });
      }
    }
  };

  // Skip or Star Pass
  const handleUseSuperStar = () => {
    if ((gameState.inventory['super_star'] || 0) <= 0) {
      sound.playWrong();
      return;
    }
    sound.playStageClear();
    confetti({ particleCount: 60, spread: 60 });
    onUpdateState({
      ...gameState,
      inventory: {
        ...gameState.inventory,
        super_star: gameState.inventory['super_star'] - 1,
      },
      coins: gameState.coins + 20,
      score: gameState.score + 150,
    });
    setStageScore((prev) => prev + 150);
    setStageCoins((prev) => prev + 20);
    setCorrectCount((prev) => prev + 1);
    setLastAnswerIsCorrect(true);
    setIsAnswerSubmitted(true);
  };

  // Use Leaf Hint
  const handleUseLeafHint = () => {
    if (showHint) return;
    if ((gameState.inventory['super_leaf'] || 0) <= 0) {
      setShowHint(true);
      return;
    }
    sound.playPowerUp();
    onUpdateState({
      ...gameState,
      inventory: {
        ...gameState.inventory,
        super_leaf: Math.max(0, (gameState.inventory['super_leaf'] || 1) - 1),
      },
    });
    setShowHint(true);
  };

  // Next Question or Finish Stage
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      sound.playJump();
      setCurrentIndex((prev) => prev + 1);
      resetInputStates();
    } else {
      // Stage finished
      sound.playStageClear();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      const finalCorrect = correctCount + (lastAnswerIsCorrect ? 1 : 0);
      const ratio = finalCorrect / questions.length;
      let stars = 1;
      if (ratio >= 0.85) stars = 3;
      else if (ratio >= 0.6) stars = 2;

      onStageComplete(stageScore, stars, stageCoins);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Top Header Navigation & Status */}
      <div className="bg-slate-900/90 border-2 border-slate-700 px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg">
        <button
          onClick={() => {
            sound.playJump();
            onExit();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>退出關卡</span>
        </button>

        <div className="text-center">
          <div className="text-xs font-mono font-bold text-amber-300 tracking-wider">
            {stageCode} • 關卡進行中
          </div>
          <div className="text-xs sm:text-sm font-black text-white">
            題號 {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Lives & Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-rose-400 font-black text-xs sm:text-sm">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>x{gameState.lives}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-300 font-black text-xs sm:text-sm">
            <span className="animate-coin">🪙</span>
            <span>+{stageCoins}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-amber-400 to-green-400 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Character Dialogue Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-3 border-amber-400/70 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xl">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${guideChar.avatarBg} flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 border-white shrink-0 animate-mario-bounce`}
        >
          <span>{guideChar.emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-sm sm:text-base text-amber-300">
              {guideChar.name}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-bold">
              {guideChar.title}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
            「{showHint ? currentQuestion.hint : guideChar.quote}」
          </p>

          {!showHint && (
            <button
              onClick={handleUseLeafHint}
              className="mt-2 text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>
                向{guideChar.name}請求科學提示（擁有葉子: x{gameState.inventory['super_leaf'] || 0}）
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Question Card */}
      <div className="bg-slate-900 border-4 border-slate-750 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        {currentQuestion.type === 'choice' && (
          <ChoiceQuestionView
            question={currentQuestion as ChoiceQuestion}
            selectedAnswers={choiceSelected}
            onSelectAnswer={setChoiceSelected}
            disabled={isAnswerSubmitted}
          />
        )}

        {currentQuestion.type === 'fill_blank' && (
          <FillBlankQuestionView
            question={currentQuestion as FillBlankQuestion}
            answers={fillBlankAnswers}
            onAnswerChange={(idx, val) =>
              setFillBlankAnswers((prev) => ({ ...prev, [idx]: val }))
            }
            disabled={isAnswerSubmitted}
          />
        )}

        {currentQuestion.type === 'word_bank' && (
          <WordBankQuestionView
            question={currentQuestion as WordBankQuestion}
            answers={wordBankAnswers}
            onSelectWord={(subNum, val) =>
              setWordBankAnswers((prev) => ({ ...prev, [subNum]: val }))
            }
            disabled={isAnswerSubmitted}
          />
        )}

        {currentQuestion.type === 'true_false' && (
          <TrueFalseQuestionView
            question={currentQuestion as TrueFalseQuestion}
            selectedAnswer={tfAnswer}
            onSelectAnswer={setTfAnswer}
            disabled={isAnswerSubmitted}
          />
        )}

        {currentQuestion.type === 'matching' && (
          <MatchingQuestionView
            question={currentQuestion as MatchingQuestion}
            matches={matchingAnswers}
            onToggleMatch={(leftId, rightId) => {
              const currentArr = matchingAnswers[leftId] || [];
              const isMulti = currentQuestion.isMultiSelect;
              if (isMulti) {
                if (currentArr.includes(rightId)) {
                  setMatchingAnswers((prev) => ({
                    ...prev,
                    [leftId]: currentArr.filter((id) => id !== rightId),
                  }));
                } else {
                  setMatchingAnswers((prev) => ({
                    ...prev,
                    [leftId]: [...currentArr, rightId].sort(),
                  }));
                }
              } else {
                setMatchingAnswers((prev) => ({
                  ...prev,
                  [leftId]: [rightId],
                }));
              }
            }}
            disabled={isAnswerSubmitted}
          />
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Super Star skip / assist button */}
          <button
            onClick={handleUseSuperStar}
            disabled={isAnswerSubmitted || (gameState.inventory['super_star'] || 0) <= 0}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>使用無敵星 (x{gameState.inventory['super_star'] || 0})</span>
          </button>

          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!hasUserAnswered()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 disabled:opacity-40 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-xl active:scale-95 transition-all"
            >
              <span>確定提交答案</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-xl active:scale-95 transition-all"
            >
              <span>{currentIndex < questions.length - 1 ? '下一題' : '完成結算！'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Feedback / Explanation Box */}
        {isAnswerSubmitted && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 animate-in fade-in ${
              lastAnswerIsCorrect
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-black text-base sm:text-lg">
              {lastAnswerIsCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-300">太棒了！回答完全正確！(+100分，獲得金幣)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-rose-400" />
                  <span className="text-rose-300">
                    {shieldTriggered
                      ? '超級蘑菇發揮效果！護盾抵擋了扣心懲罰！'
                      : '回答錯誤，不要灰心！已加入錯題筆記本。'}
                  </span>
                </>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-700">
              <strong className="text-amber-300 block mb-1">📖 科學課本官方解析：</strong>
              {currentQuestion.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
