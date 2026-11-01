import React, { useState, useEffect } from 'react';
import {
  ChoiceQuestion,
  FillBlankQuestion,
  WordBankQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
} from '../types/game';
import { Check, X, CheckSquare, Square, CornerDownLeft, RotateCcw } from 'lucide-react';

// ==========================================
// 1. S4a_u1_01 選擇題
// ==========================================
interface ChoiceViewProps {
  question: ChoiceQuestion;
  selectedAnswers: string[];
  onSelectAnswer: (answers: string[]) => void;
  disabled?: boolean;
}

export const ChoiceQuestionView: React.FC<ChoiceViewProps> = ({
  question,
  selectedAnswers,
  onSelectAnswer,
  disabled = false,
}) => {
  const isMulti = question.isMultiSelect || question.correctAnswers.length > 1;

  const handleToggle = (label: string) => {
    if (disabled) return;
    if (isMulti) {
      if (selectedAnswers.includes(label)) {
        onSelectAnswer(selectedAnswers.filter((a) => a !== label));
      } else {
        onSelectAnswer([...selectedAnswers, label].sort());
      }
    } else {
      onSelectAnswer([label]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
        <span>{isMulti ? '【多項選擇題】可選多於一個答案：' : '【單項選擇題】請選出最佳答案：'}</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
          代碼: {question.exerciseCode}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
        {question.question}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {question.options.map((opt) => {
          const isSelected = selectedAnswers.includes(opt.label);
          return (
            <div
              key={opt.label}
              onClick={() => handleToggle(opt.label)}
              className={`cursor-pointer rounded-2xl p-4 border-3 transition-all flex items-start gap-3.5 select-none ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg text-white scale-101'
                  : 'bg-slate-850 border-slate-750 hover:border-slate-500 hover:bg-slate-800 text-slate-200'
              } ${disabled ? 'pointer-events-none' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 border-2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-400 border-slate-600'
                }`}
              >
                {opt.label}
              </div>

              <div className="flex-1 font-semibold text-sm sm:text-base pt-0.5">
                {opt.text}
              </div>

              <div className="text-amber-400 shrink-0 pt-1">
                {isMulti ? (
                  isSelected ? (
                    <CheckSquare className="w-5 h-5 fill-amber-400 text-slate-900" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )
                ) : isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. S4a_u1_02 填充題
// ==========================================
interface FillBlankViewProps {
  question: FillBlankQuestion;
  answers: Record<number, string>;
  onAnswerChange: (index: number, val: string) => void;
  disabled?: boolean;
}

export const FillBlankQuestionView: React.FC<FillBlankViewProps> = ({
  question,
  answers,
  onAnswerChange,
  disabled = false,
}) => {
  // Collect all acceptable answers into convenient candidate chips for easy iPad tapping
  const allWordChips = Array.from(
    new Set(question.blanks.flatMap((b) => b.acceptableAnswers))
  );

  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(1);

  // Split sentence by placeholders [___1___], [___2___], etc.
  const parts = question.sentence.split(/(\[___\d+___\])/g);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
        <span>【填充題】在橫線上填寫適當的科學詞語：</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
          代碼: {question.exerciseCode}
        </span>
      </div>

      {/* Main Sentence with Input Blanks */}
      <div className="text-base sm:text-xl font-bold text-white leading-loose bg-slate-900/80 p-5 rounded-2xl border-2 border-slate-700">
        {parts.map((part, i) => {
          const match = part.match(/\[___(\d+)___\]/);
          if (match) {
            const blankIdx = parseInt(match[1], 10);
            const val = answers[blankIdx] || '';
            const isActive = activeBlankIndex === blankIdx;

            return (
              <span key={i} className="inline-block mx-1.5 my-1 align-baseline">
                <input
                  type="text"
                  value={val}
                  disabled={disabled}
                  onFocus={() => setActiveBlankIndex(blankIdx)}
                  onChange={(e) => onAnswerChange(blankIdx, e.target.value)}
                  placeholder={`空格 (${blankIdx})`}
                  className={`bg-slate-950 border-b-4 rounded-xl px-3 py-1 font-black text-amber-300 text-center min-w-[120px] max-w-[180px] outline-none transition-all ${
                    isActive
                      ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/40'
                      : val
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-600 focus:border-amber-400'
                  }`}
                />
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>

      {/* Tablet-friendly Word Helper Bank */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <span>💡 輔助字詞便利盒（點擊可直接填入當前所選空格）：</span>
          </span>
          <span className="text-xs text-amber-300 font-bold">
            目前填寫：空格 ({activeBlankIndex})
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allWordChips.map((word) => (
            <button
              key={word}
              type="button"
              disabled={disabled}
              onClick={() => {
                onAnswerChange(activeBlankIndex, word);
                // Auto switch to next blank if available
                if (question.blanks.length > activeBlankIndex) {
                  setActiveBlankIndex(activeBlankIndex + 1);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs sm:text-sm border border-slate-600 active:scale-95 transition-all shadow"
            >
              {word}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAnswerChange(activeBlankIndex, '')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-slate-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> 清除此格
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. S4a_u1_03 供詞填充題
// ==========================================
interface WordBankViewProps {
  question: WordBankQuestion;
  answers: Record<number, string>;
  onSelectWord: (subNum: number, word: string) => void;
  disabled?: boolean;
}

export const WordBankQuestionView: React.FC<WordBankViewProps> = ({
  question,
  answers,
  onSelectWord,
  disabled = false,
}) => {
  const [activeSubNum, setActiveSubNum] = useState<number>(1);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
        <span>【供詞填充題】從上方詞庫中挑選合適的詞語填入各題：</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
          代碼: {question.exerciseCode}
        </span>
      </div>

      {/* Word Bank Pool */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-4 rounded-2xl border-2 border-emerald-500/60 shadow-lg">
        <div className="text-xs font-black text-emerald-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span>📦</span> 供詞庫（點選詞語放入當前題目）：
        </div>
        <div className="flex flex-wrap gap-2.5">
          {question.wordBank.map((word) => (
            <button
              key={word}
              type="button"
              disabled={disabled}
              onClick={() => {
                onSelectWord(activeSubNum, word);
                if (question.subQuestions.length > activeSubNum) {
                  setActiveSubNum(activeSubNum + 1);
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base border-2 border-emerald-400/60 shadow-md active:scale-95 transition-all"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-sentences list */}
      <div className="space-y-3">
        {question.subQuestions.map((sub) => {
          const isSelected = activeSubNum === sub.number;
          const currentAnswer = answers[sub.number] || '';
          const parts = sub.sentence.split('[___]');

          return (
            <div
              key={sub.number}
              onClick={() => !disabled && setActiveSubNum(sub.number)}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                  : 'bg-slate-850 border-slate-750 hover:border-slate-600'
              }`}
            >
              <div className="text-sm sm:text-base font-bold text-white flex-1 leading-relaxed">
                <span>{parts[0]}</span>
                <span className="inline-block mx-1.5 px-3 py-1 rounded-xl bg-slate-950 border-b-4 border-amber-400 text-amber-300 font-black min-w-[90px] text-center">
                  {currentAnswer || '（點選詞庫）'}
                </span>
                <span>{parts[1] || ''}</span>
              </div>

              {currentAnswer && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWord(sub.number, '');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded bg-slate-900 border border-slate-700 shrink-0"
                >
                  清除
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 4. S4a_u1_04 判斷題
// ==========================================
interface TrueFalseViewProps {
  question: TrueFalseQuestion;
  selectedAnswer: boolean | null;
  onSelectAnswer: (val: boolean) => void;
  disabled?: boolean;
}

export const TrueFalseQuestionView: React.FC<TrueFalseViewProps> = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
        <span>【判斷題】判斷下列陳述是否正確：</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
          代碼: {question.exerciseCode}
        </span>
      </div>

      <div className="bg-slate-900/90 border-2 border-slate-700 p-6 rounded-2xl shadow-inner">
        <h3 className="text-lg sm:text-2xl font-black text-white text-center leading-relaxed">
          「{question.statement}」
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 max-w-md mx-auto">
        {/* Correct Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectAnswer(true)}
          className={`py-5 px-6 rounded-3xl border-4 font-black text-lg sm:text-xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
            selectedAnswer === true
              ? 'bg-gradient-to-b from-emerald-500 to-green-600 border-white text-white scale-103 ring-4 ring-emerald-400/50'
              : 'bg-slate-800 border-slate-700 hover:border-emerald-500 text-emerald-400'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-950 flex items-center justify-center text-3xl">
            ✓
          </div>
          <span>正確 ( ✓ )</span>
        </button>

        {/* Incorrect Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectAnswer(false)}
          className={`py-5 px-6 rounded-3xl border-4 font-black text-lg sm:text-xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
            selectedAnswer === false
              ? 'bg-gradient-to-b from-rose-500 to-red-600 border-white text-white scale-103 ring-4 ring-rose-400/50'
              : 'bg-slate-800 border-slate-700 hover:border-rose-500 text-rose-400'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-rose-950 flex items-center justify-center text-3xl">
            ✗
          </div>
          <span>錯誤 ( ✗ )</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 5. S4a_u1_07 配對題
// ==========================================
interface MatchingViewProps {
  question: MatchingQuestion;
  matches: Record<string | number, string[]>;
  onToggleMatch: (leftId: string | number, rightId: string) => void;
  disabled?: boolean;
}

export const MatchingQuestionView: React.FC<MatchingViewProps> = ({
  question,
  matches,
  onToggleMatch,
  disabled = false,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | number>(
    question.leftItems[0]?.id || '1'
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
        <span>{question.instruction}</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
          代碼: {question.exerciseCode}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Items Column */}
        <div className="space-y-3">
          <div className="text-xs font-black text-cyan-300 flex items-center justify-between">
            <span>項目清單（點擊選擇一個項目）：</span>
          </div>

          {question.leftItems.map((left) => {
            const isCurrent = selectedLeft === left.id;
            const chosenRights = matches[left.id] || [];

            return (
              <div
                key={left.id}
                onClick={() => !disabled && setSelectedLeft(left.id)}
                className={`cursor-pointer rounded-2xl p-4 border-3 transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                    : 'bg-slate-850 border-slate-750 hover:border-slate-600'
                }`}
              >
                <div className="font-extrabold text-sm sm:text-base text-white">
                  {left.label}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {chosenRights.length > 0 ? (
                    <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-400/50">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {chosenRights.join('、')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-bold">未配對</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Options Column */}
        <div className="space-y-3">
          <div className="text-xs font-black text-amber-300 flex items-center justify-between">
            <span>
              配對選項（為【
              {question.leftItems.find((l) => l.id === selectedLeft)?.label || ''}
              】配對）：
            </span>
            {question.isMultiSelect && (
              <span className="text-[10px] text-yellow-200">可多選</span>
            )}
          </div>

          {question.rightOptions.map((opt) => {
            const chosenRights = matches[selectedLeft] || [];
            const isMatched = chosenRights.includes(opt.id);

            return (
              <div
                key={opt.id}
                onClick={() => !disabled && onToggleMatch(selectedLeft, opt.id)}
                className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex items-start gap-3 ${
                  isMatched
                    ? 'bg-purple-900/40 border-purple-400 ring-2 ring-purple-400/40 text-white'
                    : 'bg-slate-850 border-slate-750 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border-2 ${
                    isMatched
                      ? 'bg-purple-500 text-white border-purple-300'
                      : 'bg-slate-800 text-slate-400 border-slate-600'
                  }`}
                >
                  {opt.id}
                </div>

                <div className="flex-1 font-semibold text-xs sm:text-sm leading-snug pt-0.5">
                  {opt.text}
                </div>

                {isMatched && (
                  <Check className="w-4 h-4 text-purple-300 shrink-0 pt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
