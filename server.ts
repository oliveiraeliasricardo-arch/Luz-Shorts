import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getCuratedChristianShorts,
  getMoreChristianShorts,
  lookupSingleShort,
} from './server/youtubeCurator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  app.get('/api/health', (_req, res) => {
    const apiKeyConfigured = Boolean(process.env.YOUTUBE_API_KEY?.trim());
    res.json({
      ok: true,
      app: 'Luz Shorts',
      mode: apiKeyConfigured ? 'youtube_api' : 'curated_rss',
    });
  });

  app.get('/api/shorts', async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : 'all';
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';

    try {
      const payload = await getCuratedChristianShorts({
        category,
        q,
        forceRefresh,
      });
      res.json(payload);
    } catch (err) {
      res.status(502).json({
        error: 'Não foi possível carregar os vídeos cristãos no momento.',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  });

  app.get('/api/shorts/more', async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : 'all';
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const rawExclude = typeof req.query.exclude === 'string' ? req.query.exclude : '';
    const excludeIds = rawExclude
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^[a-zA-Z0-9_-]{11}$/.test(s))
      .slice(0, 60);

    try {
      const payload = await getMoreChristianShorts({
        category,
        q,
        cursor,
        excludeIds,
      });
      res.json(payload);
    } catch (err) {
      res.status(502).json({
        error: 'Não foi possível carregar mais vídeos no momento.',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  });

  app.get('/api/shorts/video/:id', async (req, res) => {
    const rawId = req.params.id || '';
    if (!/^[a-zA-Z0-9_-]{11}$/.test(rawId)) {
      res.status(400).json({ error: 'ID de vídeo do YouTube inválido.' });
      return;
    }

    try {
      const shortItem = await lookupSingleShort(rawId);
      if (!shortItem) {
        res.status(404).json({
          error: 'Vídeo não encontrado ou não atende aos critérios cristãos/doutrinários.',
        });
        return;
      }
      res.json(shortItem);
    } catch {
      res.status(502).json({ error: 'Falha ao consultar o vídeo solicitado.' });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luz Shorts server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
