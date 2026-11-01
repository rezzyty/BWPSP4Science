import React, { useState } from 'react';
import { UserGameState } from '../types/game';
import { uploadGameSave, downloadGameSave, exportBackupToken, importBackupToken } from '../utils/gameState';
import { sound } from '../utils/soundEffects';
import { Cloud, Download, Upload, Copy, Check, RefreshCw, Key, ShieldCheck, X } from 'lucide-react';

interface SaveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: UserGameState;
  onStateUpdated: (newState: UserGameState) => void;
}

export const SaveSyncModal: React.FC<SaveSyncModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onStateUpdated,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [offlineTokenInput, setOfflineTokenInput] = useState('');
  const [showOfflineSection, setShowOfflineSection] = useState(false);
  const [studentName, setStudentName] = useState(gameState.studentName);

  if (!isOpen) return null;

  const handleCloudSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updatedState = { ...gameState, studentName };
      const res = await uploadGameSave(updatedState);
      if (res.success) {
        sound.playCoin();
        onStateUpdated({ ...updatedState, saveCode: res.code });
        setMessage({
          text: `🎉 ${res.message}！在其他電腦或平板輸入此代碼即可同步！`,
          type: 'success',
        });
      } else {
        setMessage({ text: res.message, type: 'error' });
      }
    } catch (e: any) {
      setMessage({ text: '存檔連線異常，請稍後再試。', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloudLoad = async () => {
    if (!inputCode.trim()) {
      setMessage({ text: '請輸入 6 位存檔代碼！', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await downloadGameSave(inputCode);
      if (res.success && res.data) {
        sound.playPowerUp();
        onStateUpdated(res.data);
        setMessage({ text: `🌟 ${res.message}`, type: 'success' });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        sound.playWrong();
        setMessage({ text: res.message, type: 'error' });
      }
    } catch {
      setMessage({ text: '讀檔連線失敗，請檢查存檔碼是否正確。', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.saveCode);
    setCopied(true);
    sound.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyToken = () => {
    const token = exportBackupToken(gameState);
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    sound.playCoin();
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleImportToken = () => {
    if (!offlineTokenInput.trim()) return;
    const restored = importBackupToken(offlineTokenInput);
    if (restored) {
      sound.playPowerUp();
      onStateUpdated(restored);
      setMessage({ text: '離線進度代碼匯入成功！', type: 'success' });
      setTimeout(() => onClose(), 1000);
    } else {
      sound.playWrong();
      setMessage({ text: '離線進度碼無效，請確認是否完整複製。', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-2xl shadow-lg border-2 border-white">
            <Cloud className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              跨裝置存檔與雲端同步
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              隨時在學校 iPad、家用電腦或手機切換，進度永不遺失！
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs sm:text-sm font-bold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950 border border-emerald-500 text-emerald-200'
                : 'bg-rose-950 border border-rose-500 text-rose-200'
            }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        {/* Current Student Name */}
        <div className="mb-5 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            小學生姓名 / 冒險者稱號：
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full bg-slate-900 border-2 border-amber-400/60 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
            placeholder="請輸入你的姓名"
          />
        </div>

        {/* Section 1: Your Active Save Code */}
        <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-2 border-blue-500/50 p-4 rounded-2xl mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-cyan-300 font-extrabold flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> 本機專屬 6 位存檔碼
            </span>
            <span className="text-[11px] text-slate-400">已自動儲存在本機</span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-blue-400/40">
            <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-widest">
              {gameState.saveCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已複製' : '複製代碼'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed">
            💡 <strong>如何切換裝置：</strong> 記下這 6 位代碼，在另一部設備打開遊戲，於下方「讀取雲端進度」輸入，即可接續所有星星、金幣與關卡！
          </p>

          <button
            onClick={handleCloudSave}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>立即上傳並更新雲端進度</span>
          </button>
        </div>

        {/* Section 2: Load save from another device */}
        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl mb-4">
          <h3 className="text-sm font-extrabold text-amber-300 mb-2 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-amber-400" /> 從其他設備讀取存檔
          </h3>
          <p className="text-xs text-slate-300 mb-3">
            如果你在學校電腦或其他手機上記下了存檔碼，請在此輸入：
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="例如：DK77UP"
              maxLength={10}
              className="flex-1 bg-slate-900 border-2 border-slate-600 focus:border-amber-400 rounded-xl px-3 py-2 font-mono text-base font-bold text-white uppercase tracking-wider outline-none"
            />
            <button
              onClick={handleCloudLoad}
              disabled={loading || !inputCode.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow active:scale-95 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>讀取進度</span>
            </button>
          </div>
        </div>

        {/* Section 3: Offline Backup Toggle */}
        <div className="border-t border-slate-800 pt-3">
          <button
            onClick={() => setShowOfflineSection(!showOfflineSection)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-bold"
          >
            <span>{showOfflineSection ? '▲ 隱藏離線備份碼' : '▼ 離線字串備份 (無需網絡)'}</span>
          </button>

          {showOfflineSection && (
            <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-bold">手動文字備份碼：</span>
                <button
                  onClick={handleCopyToken}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-bold"
                >
                  {tokenCopied ? '已複製全文' : '複製文字碼'}
                </button>
              </div>
              <textarea
                value={offlineTokenInput}
                onChange={(e) => setOfflineTokenInput(e.target.value)}
                placeholder="貼上文字備份碼以匯入……"
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-[11px] outline-none"
              />
              <button
                onClick={handleImportToken}
                className="mt-2 w-full py-1.5 bg-blue-700 hover:bg-blue-600 rounded font-bold text-white"
              >
                匯入文字備份
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
