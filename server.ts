import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const SAVES_FILE = path.join(DATA_DIR, 'game_saves.json');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(SAVES_FILE)) {
  fs.writeFileSync(SAVES_FILE, JSON.stringify({}), 'utf-8');
}

function getSaves(): Record<string, any> {
  try {
    const raw = fs.readFileSync(SAVES_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function writeSaves(saves: Record<string, any>) {
  fs.writeFileSync(SAVES_FILE, JSON.stringify(saves, null, 2), 'utf-8');
}

// Generate simple kid-friendly 6-character code (e.g., "DK-772", "STAR99", "PEACH5")
function generateSaveCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// API: Save game record
app.post('/api/save', (req, res) => {
  try {
    const { code, data, studentName } = req.body;
    const saves = getSaves();
    let saveCode = (code ? String(code).trim().toUpperCase() : '').replace(/[^A-Z0-9]/g, '');

    if (!saveCode || saveCode.length < 4) {
      saveCode = generateSaveCode();
      while (saves[saveCode]) {
        saveCode = generateSaveCode();
      }
    }

    const now = new Date().toISOString();
    saves[saveCode] = {
      code: saveCode,
      studentName: studentName || '瑪利歐探險家',
      data,
      updatedAt: now,
    };

    writeSaves(saves);
    res.json({
      success: true,
      code: saveCode,
      updatedAt: now,
      message: `存檔成功！你的雲端存檔碼為：${saveCode}`,
    });
  } catch (err: any) {
    console.error('Error in /api/save:', err);
    res.status(500).json({ success: false, error: err.message || '存檔失敗' });
  }
});

// API: Load game record
app.get('/api/load/:code', (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const saves = getSaves();
    if (saves[code]) {
      res.json({
        success: true,
        code,
        studentName: saves[code].studentName,
        data: saves[code].data,
        updatedAt: saves[code].updatedAt,
      });
    } else {
      res.status(404).json({
        success: false,
        message: `找不到存檔碼「${code}」，請確認是否輸入正確（共6位英文字母或數字）。`,
      });
    }
  } catch (err: any) {
    console.error('Error in /api/load:', err);
    res.status(500).json({ success: false, error: err.message || '讀檔失敗' });
  }
});

// Health check
app.get('/api/ping', (_, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = 3000;
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mario Science Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
