import { UserGameState } from '../types/game';

const LOCAL_STORAGE_KEY = 'mario_science_adventure_p4_save_v1';

export function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getDefaultGameState(): UserGameState {
  return {
    studentName: '蘑菇王國小勇士',
    saveCode: generateRandomCode(),
    coins: 100,
    lives: 3,
    stars: 0,
    score: 0,
    selectedCharacter: 'peach',
    inventory: {
      super_mushroom: 2,
      fire_flower: 1,
      super_leaf: 2,
      ice_flower: 1,
      super_star: 1,
      one_up_mushroom: 1,
    },
    completedStages: {},
    mistakes: [],
    activePowerUp: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function loadLocalGameState(): UserGameState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultGameState(),
        ...parsed,
        inventory: {
          ...getDefaultGameState().inventory,
          ...(parsed.inventory || {}),
        },
      };
    }
  } catch (e) {
    console.warn('Failed to parse local game state:', e);
  }
  const defaultState = getDefaultGameState();
  saveLocalGameState(defaultState);
  return defaultState;
}

export function saveLocalGameState(state: UserGameState): void {
  try {
    const updated = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

// Cloud Save to Server
export async function uploadGameSave(
  state: UserGameState
): Promise<{ success: boolean; code: string; message: string }> {
  saveLocalGameState(state);
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: state.saveCode,
        studentName: state.studentName,
        data: state,
      }),
    });
    const result = await response.json();
    if (result.success) {
      return {
        success: true,
        code: result.code,
        message: result.message || `雲端存檔成功！你的專屬代碼是 ${result.code}`,
      };
    } else {
      return {
        success: false,
        code: state.saveCode,
        message: result.error || '存檔失敗，但已在本地裝置安全保存！',
      };
    }
  } catch (err: any) {
    console.warn('Cloud save network error, saved locally:', err);
    return {
      success: true,
      code: state.saveCode,
      message: `進度已保存在本裝置中！（存檔碼：${state.saveCode}）`,
    };
  }
}

// Cloud Load from Server
export async function downloadGameSave(
  code: string
): Promise<{ success: boolean; data?: UserGameState; message: string }> {
  const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleanCode) {
    return { success: false, message: '請輸入有效的6位存檔碼！' };
  }

  try {
    const response = await fetch(`/api/load/${cleanCode}`);
    const result = await response.json();
    if (result.success && result.data) {
      const state: UserGameState = {
        ...getDefaultGameState(),
        ...result.data,
        saveCode: cleanCode,
      };
      saveLocalGameState(state);
      return {
        success: true,
        data: state,
        message: `成功讀取存檔！歡迎回來，${state.studentName}！`,
      };
    } else {
      return {
        success: false,
        message: result.message || `找不到存檔碼「${cleanCode}」，請檢查後再試。`,
      };
    }
  } catch (err: any) {
    console.error('Cloud load network error:', err);
    return {
      success: false,
      message: '讀檔連線失敗，請檢查網絡連線或使用備份進度碼。',
    };
  }
}

// Offline backup token export/import
export function exportBackupToken(state: UserGameState): string {
  try {
    const jsonStr = JSON.stringify(state);
    return btoa(encodeURIComponent(jsonStr));
  } catch {
    return '';
  }
}

export function importBackupToken(token: string): UserGameState | null {
  try {
    const jsonStr = decodeURIComponent(atob(token.trim()));
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      const merged: UserGameState = {
        ...getDefaultGameState(),
        ...parsed,
      };
      saveLocalGameState(merged);
      return merged;
    }
  } catch (e) {
    console.error('Failed to import backup token:', e);
  }
  return null;
}
