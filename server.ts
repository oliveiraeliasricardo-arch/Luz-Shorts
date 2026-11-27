import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fetchLatestNewVideoCandidates,
  getCuratedChristianShorts,
  getMoreChristianShorts,
  getSearchSuggestions,
  lookupSingleShort,
  warmCatalogInBackground,
} from './server/youtubeCurator.ts';
import {
  getLatestReleasesForSync,
  getVapidPublicKey,
  initializePushNotifier,
  removePushSubscription,
  sendTestPushToEndpoint,
  updatePushPreferences,
  upsertPushSubscription,
} from './server/pushNotifications.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

function parseExcludeIds(raw: unknown): string[] {
  const list = Array.isArray(raw)
    ? raw.filter((v): v is string => typeof v === 'string')
    : typeof raw === 'string'
      ? raw.split(',')
      : [];
  return list
    .map((s) => s.trim())
    .filter((s) => /^[a-zA-Z0-9_-]{11}$/.test(s))
    .slice(0, 8000);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  const extraAllowedOrigins = new Set(
    (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isCapacitorOrLocalOrigin =
      typeof origin === 'string' &&
      (/^(https?|capacitor|ionic):\/\/localhost(:\d+)?$/i.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin) ||
        extraAllowedOrigins.has(origin));

    if (origin && (isCapacitorOrLocalOrigin || extraAllowedOrigins.size === 0)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    const apiKeyConfigured = Boolean(process.env.YOUTUBE_API_KEY?.trim());
    res.json({
      ok: true,
      app: 'GraçaPlay',
      mode: apiKeyConfigured ? 'youtube_api' : 'curated_rss',
    });
  });

  app.get('/api/search/suggest', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    if (!q.trim()) {
      res.json({ suggestions: [] });
      return;
    }
    try {
      const suggestions = await getSearchSuggestions(q);
      res.json({ suggestions });
    } catch {
      res.json({ suggestions: [] });
    }
  });

function parseOptionalIntParam(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.trunc(raw);
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const parsed = Number(raw.trim());
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return undefined;
}

  const handleShortsRequest = async (
    params: {
      category?: unknown;
      q?: unknown;
      refresh?: unknown;
      exclude?: unknown;
      seed?: unknown;
      random_offset?: unknown;
      randomOffset?: unknown;
    },
    res: express.Response
  ) => {
    const category = typeof params.category === 'string' ? params.category : 'all';
    const q = typeof params.q === 'string' ? params.q : '';
    const forceRefresh =
      params.refresh === true || params.refresh === '1' || params.refresh === 'true';
    const excludeIds = parseExcludeIds(params.exclude);
    const seed = parseOptionalIntParam(params.seed);
    const randomOffset = parseOptionalIntParam(params.random_offset ?? params.randomOffset);

    try {
      const payload = await getCuratedChristianShorts({
        category,
        q,
        forceRefresh,
        excludeIds,
        seed,
        randomOffset,
      });
      res.json(payload);
    } catch (err) {
      res.status(502).json({
        error: 'Não foi possível carregar os vídeos cristãos no momento.',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  };

  app.get('/api/shorts', (req, res) => handleShortsRequest(req.query, res));
  app.post('/api/shorts', (req, res) =>
    handleShortsRequest(
      {
        category: req.body?.category ?? req.query.category,
        q: req.body?.q ?? req.query.q,
        refresh: req.body?.refresh ?? req.query.refresh,
        exclude: req.body?.exclude ?? req.query.exclude,
        seed: req.body?.seed ?? req.query.seed,
        random_offset:
          req.body?.random_offset ??
          req.body?.randomOffset ??
          req.query.random_offset ??
          req.query.randomOffset,
      },
      res
    )
  );

  const handleMoreShortsRequest = async (
    params: {
      category?: unknown;
      q?: unknown;
      cursor?: unknown;
      exclude?: unknown;
      seed?: unknown;
      random_offset?: unknown;
      randomOffset?: unknown;
    },
    res: express.Response
  ) => {
    const category = typeof params.category === 'string' ? params.category : 'all';
    const q = typeof params.q === 'string' ? params.q : '';
    const cursor = typeof params.cursor === 'string' ? params.cursor : undefined;
    const excludeIds = parseExcludeIds(params.exclude);
    const seed = parseOptionalIntParam(params.seed);
    const randomOffset = parseOptionalIntParam(params.random_offset ?? params.randomOffset);

    try {
      const payload = await getMoreChristianShorts({
        category,
        q,
        cursor,
        excludeIds,
        seed,
        randomOffset,
      });
      res.json(payload);
    } catch (err) {
      res.status(502).json({
        error: 'Não foi possível carregar mais vídeos no momento.',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  };

  app.get('/api/shorts/more', (req, res) => handleMoreShortsRequest(req.query, res));
  app.post('/api/shorts/more', (req, res) =>
    handleMoreShortsRequest(
      {
        category: req.body?.category ?? req.query.category,
        q: req.body?.q ?? req.query.q,
        cursor: req.body?.cursor ?? req.query.cursor,
        exclude: req.body?.exclude ?? req.query.exclude,
        seed: req.body?.seed ?? req.query.seed,
        random_offset:
          req.body?.random_offset ??
          req.body?.randomOffset ??
          req.query.random_offset ??
          req.query.randomOffset,
      },
      res
    )
  );

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

  app.get('/api/push/public-key', (_req, res) => {
    res.json({
      enabled: true,
      publicKey: getVapidPublicKey(),
    });
  });

  app.post('/api/push/subscribe', (req, res) => {
    const result = upsertPushSubscription(req.body?.subscription, req.body?.categories);
    if (!result.ok) {
      res.status(400).json(result);
      return;
    }
    res.json({ ok: true, categories: result.categories });
  });

  app.post('/api/push/preferences', (req, res) => {
    const result = updatePushPreferences(req.body?.endpoint, req.body?.categories);
    if (!result.ok) {
      res.status(404).json({ ok: false, error: 'Inscrição não encontrada.' });
      return;
    }
    res.json(result);
  });

  app.post('/api/push/unsubscribe', (req, res) => {
    const removed = removePushSubscription(req.body?.endpoint);
    res.json({ ok: true, removed });
  });

  app.post('/api/push/test', async (req, res) => {
    const result = await sendTestPushToEndpoint(
      req.body?.endpoint,
      req.body?.subscription,
      req.body?.categories
    );
    if (!result.ok) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  });

  app.get('/api/push/latest', async (req, res) => {
    try {
      const rawCats =
        typeof req.query.categories === 'string'
          ? req.query.categories
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;
      const items = await getLatestReleasesForSync(
        rawCats as Array<'pregacoes' | 'biblia' | 'louvores' | 'testemunhos' | 'feliz7play'> | undefined,
        8
      );
      res.json({ items, checkedAt: new Date().toISOString() });
    } catch {
      res.json({ items: [], checkedAt: new Date().toISOString() });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Rota da API não encontrada.' });
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
    console.log(`GraçaPlay server listening on http://0.0.0.0:${PORT}`);
    warmCatalogInBackground();
    initializePushNotifier(fetchLatestNewVideoCandidates);
  });
}

startServer();
