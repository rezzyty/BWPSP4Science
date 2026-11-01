import React from 'react';
import { UserGameState } from '../types/game';
import { sound } from '../utils/soundEffects';
import { X, Award, Star, CheckCircle, Printer } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: UserGameState;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  gameState,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playCoin();
    window.print();
  };

  const completedStagesCount = Object.keys(gameState.completedStages).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Decorative Frame */}
        <div className="bg-gradient-to-b from-amber-50 to-orange-50 text-slate-900 rounded-2xl p-6 sm:p-8 border-4 border-yellow-500 shadow-2xl relative overflow-hidden text-center">
          {/* Corner Decors */}
          <div className="absolute top-2 left-2 text-xl opacity-60">⭐</div>
          <div className="absolute top-2 right-2 text-xl opacity-60">⭐</div>
          <div className="absolute bottom-2 left-2 text-xl opacity-60">🍄</div>
          <div className="absolute bottom-2 right-2 text-xl opacity-60">👑</div>

          <div className="inline-block bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow mb-2">
            香港小學四年級 科學與常識科
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-red-700 tracking-wide mb-1">
            小四科學大師 • 榮譽證書
          </h2>
          <div className="text-xs font-bold text-amber-700 mb-5">
            單元一「認識地球」第 1 至 3 課 挑戰認證
          </div>

          <p className="text-xs sm:text-sm text-slate-700 mb-2 font-medium">
            茲證明蘑菇王國優秀小學員：
          </p>

          <div className="text-2xl sm:text-3xl font-black text-slate-900 border-b-2 border-red-500 pb-1 mb-4 inline-block px-8 tracking-wider">
            {gameState.studentName}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed mb-6">
            已成功完成由<strong>碧姬公主、耀西、黛西公主、羅潔塔公主及咚奇剛</strong>共同指導的科學闖關挑戰，對地球結構、板塊運動、岩石土壤、轉動地球、日晷測時及氣候減碳展現出優秀的知識理解！
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2 bg-amber-100/80 p-3 rounded-2xl border border-amber-300 mb-6">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">累計星數</span>
              <span className="font-mono text-lg font-black text-amber-600">
                ⭐ {gameState.stars}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">完成關卡</span>
              <span className="font-mono text-lg font-black text-emerald-600">
                {completedStagesCount} / 15
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">冒險總分</span>
              <span className="font-mono text-lg font-black text-purple-600">
                {gameState.score}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-300 text-xs font-bold text-slate-600">
            <div className="text-left">
              <div>認證導師：碧姬公主 & 羅潔塔</div>
              <div className="text-[10px] text-slate-400">蘑菇王國科學院</div>
            </div>
            <div className="text-right">
              <div>日期：{new Date().toLocaleDateString('zh-HK')}</div>
              <div className="text-[10px] font-mono text-slate-400">存檔碼: {gameState.saveCode}</div>
            </div>
          </div>
        </div>

        {/* Print / Close Actions */}
        <div className="flex items-center justify-between gap-3 mt-5">
          <div className="text-xs text-slate-400">
            提示：可列印證書留念或提交給老師！
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>列印證書</span>
          </button>
        </div>
      </div>
    </div>
  );
};
