import React from 'react';
import { UserGameState, QuestionItem } from '../types/game';
import { getQuestionById } from '../data/questionBank';
import { sound } from '../utils/soundEffects';
import { X, BookOpen, Trash2, Play, CheckCircle } from 'lucide-react';

interface MistakesNotebookProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: UserGameState;
  onPracticeMistake: (question: QuestionItem) => void;
  onClearMistakes: () => void;
}

export const MistakesNotebook: React.FC<MistakesNotebookProps> = ({
  isOpen,
  onClose,
  gameState,
  onPracticeMistake,
  onClearMistakes,
}) => {
  if (!isOpen) return null;

  const mistakeQuestions = gameState.mistakes
    .map((id) => getQuestionById(id))
    .filter(Boolean) as QuestionItem[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-4 border-purple-400 rounded-3xl p-5 sm:p-7 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-2xl shadow-md border-2 border-white">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-300">
                奇諾比奧 錯題筆記本
              </h2>
              <p className="text-xs text-slate-300">
                溫故知新！重新複習做錯的題目，消滅知識漏洞！
              </p>
            </div>
          </div>

          {mistakeQuestions.length > 0 && (
            <button
              onClick={() => {
                sound.playJump();
                onClearMistakes();
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold px-3 py-1.5 rounded-xl bg-slate-800 border border-rose-900/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空錯題</span>
            </button>
          )}
        </div>

        {mistakeQuestions.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="text-5xl">🎉</div>
            <h3 className="text-lg font-black text-amber-300">
              太厲害了！筆記本內暫無錯題！
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              你在各關卡中的科學知識掌握得非常扎實。繼續保持，向滿星科學大師邁進吧！
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="text-xs font-bold text-amber-300">
              共有 {mistakeQuestions.length} 道錯題需要重溫：
            </div>

            {mistakeQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-slate-800/90 border-2 border-slate-700 hover:border-purple-400/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold bg-slate-950 text-cyan-300 px-2 py-0.5 rounded">
                      {q.exerciseCode}
                    </span>
                    <span className="text-xs font-bold text-amber-300">
                      {q.type === 'choice' && '選擇題'}
                      {q.type === 'fill_blank' && '填充題'}
                      {q.type === 'word_bank' && '供詞填充題'}
                      {q.type === 'true_false' && '判斷題'}
                      {q.type === 'matching' && '配對題'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white font-medium line-clamp-2">
                    {'question' in q && q.question}
                    {'sentence' in q && q.sentence}
                    {'statement' in q && q.statement}
                    {'instruction' in q && q.instruction}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-400">
                    <span className="text-purple-300 font-semibold">解說：</span>
                    {q.explanation}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playJump();
                    onPracticeMistake(q);
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>單題重練</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
