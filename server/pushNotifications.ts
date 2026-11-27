import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { PushSubscription } from 'web-push';
import { isUpcomingOrPremiereEntry } from '../src/shared/curatorCore.ts';
import type { ChristianShort, ContentCategory } from '../src/types/shorts.ts';

const require = createRequire(import.meta.url);
const webpush = require('web-push') as typeof import('web-push');

const ALL_CATEGORIES: ContentCategory[] = [
  'pregacoes',
  'biblia',
  'louvores',
  'testemunhos',
  'feliz7play',
];

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  pregacoes: 'Pregações',
  biblia: 'Bíblia',
  louvores: 'Louvores',
  testemunhos: 'Testemunhos',
  feliz7play: 'Feliz7Play',
};

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'push-subscriptions.json');
const MAX_KNOWN_IDS = 5000;
const NEW_VIDEO_MAX_AGE_MS = 36 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export interface StoredPushSubscription {
  id: string;
  subscription: PushSubscription;
  categories: ContentCategory[];
  createdAt: string;
  updatedAt: string;
  lastNotifiedVideoIds: string[];
}

interface PushStoreState {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  knownVideoIds: string[];
  subscriptions: StoredPushSubscription[];
}

let storeState: PushStoreState | null = null;
let candidateFetcher: (() => Promise<ChristianShort[]>) | null = null;
let checkIntervalHandle: ReturnType<typeof setInterval> | null = null;
let checkInFlight: Promise<{ checked: number; notified: number }> | null = null;

function hashEndpoint(endpoint: string): string {
  return crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 24);
}

function sanitizeCategories(raw: unknown): ContentCategory[] {
  if (!Array.isArray(raw)) return [...ALL_CATEGORIES];
  const valid = raw.filter(
    (c): c is ContentCategory =>
      typeof c === 'string' && ALL_CATEGORIES.includes(c as ContentCategory)
  );
  return valid.length > 0 ? Array.from(new Set(valid)) : [...ALL_CATEGORIES];
}

function isValidPushSubscription(raw: unknown): raw is PushSubscription {
  if (!raw || typeof raw !== 'object') return false;
  const sub = raw as Record<string, unknown>;
  if (typeof sub.endpoint !== 'string' || !/^https?:\/\/.+/.test(sub.endpoint)) {
    return false;
  }
  const keys = sub.keys as Record<string, unknown> | undefined;
  if (
    !keys ||
    typeof keys !== 'object' ||
    typeof keys.p256dh !== 'string' ||
    keys.p256dh.length < 16 ||
    typeof keys.auth !== 'string' ||
    keys.auth.length < 8
  ) {
    return false;
  }
  return true;
}

function ensureStoreLoaded(): PushStoreState {
  if (storeState) return storeState;

  const envPub = process.env.VAPID_PUBLIC_KEY?.trim() || '';
  const envPriv = process.env.VAPID_PRIVATE_KEY?.trim() || '';
  let loaded: Partial<PushStoreState> = {};

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      loaded = JSON.parse(raw) as Partial<PushStoreState>;
    }
  } catch {
    loaded = {};
  }

  let vapidPublicKey = envPub || (typeof loaded.vapidPublicKey === 'string' ? loaded.vapidPublicKey : '');
  let vapidPrivateKey =
    envPriv || (typeof loaded.vapidPrivateKey === 'string' ? loaded.vapidPrivateKey : '');

  if (!vapidPublicKey || !vapidPrivateKey) {
    const generated = webpush.generateVAPIDKeys();
    vapidPublicKey = generated.publicKey;
    vapidPrivateKey = generated.privateKey;
  }

  const subject =
    process.env.VAPID_SUBJECT?.trim() ||
    (process.env.APP_URL?.startsWith('http') ? process.env.APP_URL : 'mailto:notificacoes@gracaplay.app');

  webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey);

  storeState = {
    vapidPublicKey,
    vapidPrivateKey,
    knownVideoIds: Array.isArray(loaded.knownVideoIds)
      ? loaded.knownVideoIds.filter((id): id is string => typeof id === 'string').slice(0, MAX_KNOWN_IDS)
      : [],
    subscriptions: Array.isArray(loaded.subscriptions)
      ? loaded.subscriptions.filter((s) => s && isValidPushSubscription(s.subscription))
      : [],
  };

  persistStore();
  return storeState;
}

function persistStore(): void {
  if (!storeState) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeState, null, 2), 'utf8');
  } catch {
    // Non-fatal on read-only filesystems; in-memory state continues working
  }
}

export function getVapidPublicKey(): string {
  return ensureStoreLoaded().vapidPublicKey;
}

export function getActiveSubscriberCount(): number {
  return ensureStoreLoaded().subscriptions.length;
}

export function upsertPushSubscription(
  rawSub: unknown,
  rawCategories?: unknown
): { ok: true; categories: ContentCategory[] } | { ok: false; error: string } {
  if (!isValidPushSubscription(rawSub)) {
    return { ok: false, error: 'Assinatura Push inválida.' };
  }
  const state = ensureStoreLoaded();
  const id = hashEndpoint(rawSub.endpoint);
  const categories = sanitizeCategories(rawCategories);
  const nowIso = new Date().toISOString();
  const existing = state.subscriptions.find((s) => s.id === id);

  if (existing) {
    existing.subscription = rawSub;
    existing.categories = categories;
    existing.updatedAt = nowIso;
  } else {
    state.subscriptions.push({
      id,
      subscription: rawSub,
      categories,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastNotifiedVideoIds: [],
    });
  }

  persistStore();
  return { ok: true, categories };
}

export function updatePushPreferences(
  endpoint: unknown,
  rawCategories?: unknown
): { ok: boolean; categories?: ContentCategory[] } {
  if (typeof endpoint !== 'string' || !endpoint) return { ok: false };
  const state = ensureStoreLoaded();
  const id = hashEndpoint(endpoint);
  const existing = state.subscriptions.find((s) => s.id === id);
  if (!existing) return { ok: false };
  existing.categories = sanitizeCategories(rawCategories);
  existing.updatedAt = new Date().toISOString();
  persistStore();
  return { ok: true, categories: existing.categories };
}

export function removePushSubscription(endpoint: unknown): boolean {
  if (typeof endpoint !== 'string' || !endpoint) return false;
  const state = ensureStoreLoaded();
  const id = hashEndpoint(endpoint);
  const prevLen = state.subscriptions.length;
  state.subscriptions = state.subscriptions.filter((s) => s.id !== id);
  if (state.subscriptions.length !== prevLen) {
    persistStore();
    return true;
  }
  return false;
}

function buildVideoNotificationPayload(video: ChristianShort, extraCount = 0) {
  const catLabel = CATEGORY_LABELS[video.category] || 'Cristão';
  const title =
    extraCount > 0
      ? `GraçaPlay · ${extraCount + 1} novos vídeos em ${catLabel}`
      : `Novo vídeo em ${catLabel}`;
  const body = video.channelTitle
    ? `${video.title} — ${video.channelTitle}`
    : video.title;

  return JSON.stringify({
    title,
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: video.thumbnailUrl || undefined,
    tag: `gracaplay-new-${video.id}`,
    videoId: video.id,
    category: video.category,
    url: `/?v=${encodeURIComponent(video.id)}`,
  });
}

async function deliverNotification(
  subRecord: StoredPushSubscription,
  payloadJson: string
): Promise<'sent' | 'expired' | 'failed'> {
  try {
    await webpush.sendNotification(subRecord.subscription, payloadJson, {
      TTL: 60 * 60 * 12,
      urgency: 'normal',
    });
    return 'sent';
  } catch (err: unknown) {
    const statusCode =
      typeof err === 'object' && err !== null && 'statusCode' in err
        ? Number((err as { statusCode?: number }).statusCode)
        : 0;
    if (statusCode === 404 || statusCode === 410) {
      return 'expired';
    }
    return 'failed';
  }
}

export async function sendTestPushToEndpoint(
  endpoint: unknown,
  fallbackSubscription?: unknown,
  rawCategories?: unknown
): Promise<{ ok: boolean; error?: string; videoTitle?: string }> {
  const state = ensureStoreLoaded();
  let record =
    typeof endpoint === 'string' && endpoint
      ? state.subscriptions.find((s) => s.id === hashEndpoint(endpoint))
      : undefined;

  if (!record && isValidPushSubscription(fallbackSubscription)) {
    upsertPushSubscription(fallbackSubscription, rawCategories);
    record = state.subscriptions.find((s) => s.id === hashEndpoint(fallbackSubscription.endpoint));
  }

  if (!record) {
    return { ok: false, error: 'Ative as notificações primeiro neste dispositivo.' };
  }

  let sampleVideo: ChristianShort | undefined;
  if (candidateFetcher) {
    try {
      const latest = await candidateFetcher();
      const allowedSet = new Set(record.categories);
      sampleVideo =
        latest.find(
          (v) =>
            allowedSet.has(v.category) &&
            !isUpcomingOrPremiereEntry(v.title, v.description, v.publishedAt)
        ) ??
        latest.find((v) => !isUpcomingOrPremiereEntry(v.title, v.description, v.publishedAt));
    } catch {
      // Fallback generic sample
    }
  }

  const payloadJson = sampleVideo
    ? JSON.stringify({
        title: `GraçaPlay · Notificações ativadas`,
        body: `Exemplo: ${sampleVideo.title}${sampleVideo.channelTitle ? ` — ${sampleVideo.channelTitle}` : ''}`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        image: sampleVideo.thumbnailUrl || undefined,
        tag: `gracaplay-test-${Date.now()}`,
        videoId: sampleVideo.id,
        category: sampleVideo.category,
        url: `/?v=${encodeURIComponent(sampleVideo.id)}`,
      })
    : JSON.stringify({
        title: 'GraçaPlay · Notificações ativadas',
        body: 'Você receberá avisos aqui sempre que entrarem novos vídeos cristãos.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `gracaplay-test-${Date.now()}`,
        url: '/',
      });

  const outcome = await deliverNotification(record, payloadJson);
  if (outcome === 'expired') {
    removePushSubscription(record.subscription.endpoint);
    return {
      ok: false,
      error: 'A inscrição anterior expirou neste navegador. Ative novamente.',
    };
  }
  if (outcome === 'failed') {
    return {
      ok: false,
      error: 'Não foi possível entregar o push de teste neste ambiente.',
    };
  }
  return { ok: true, videoTitle: sampleVideo?.title };
}

export async function getLatestReleasesForSync(
  rawCategories?: ContentCategory[],
  limit = 10
): Promise<ChristianShort[]> {
  if (!candidateFetcher) return [];
  const items = await candidateFetcher();
  const catSet = new Set(
    rawCategories && rawCategories.length > 0 ? rawCategories : ALL_CATEGORIES
  );
  const cutoffMs = Date.now() - NEW_VIDEO_MAX_AGE_MS;

  return items
    .filter((item) => {
      if (!catSet.has(item.category)) return false;
      if (isUpcomingOrPremiereEntry(item.title, item.description, item.publishedAt)) return false;
      const pubMs = Date.parse(item.publishedAt);
      return Number.isFinite(pubMs) && pubMs >= cutoffMs;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit);
}

export async function checkAndNotifyNewVideos(): Promise<{
  checked: number;
  notified: number;
}> {
  if (checkInFlight) return checkInFlight;

  checkInFlight = (async () => {
    if (!candidateFetcher) return { checked: 0, notified: 0 };
    const state = ensureStoreLoaded();
    const candidates = await candidateFetcher();
    if (candidates.length === 0) return { checked: 0, notified: 0 };

    const playable = candidates.filter(
      (item) => !isUpcomingOrPremiereEntry(item.title, item.description, item.publishedAt)
    );

    // First run baseline: seed knownVideoIds without notifying old items
    if (state.knownVideoIds.length === 0) {
      state.knownVideoIds = playable.map((v) => v.id).slice(0, MAX_KNOWN_IDS);
      persistStore();
      return { checked: playable.length, notified: 0 };
    }

    const knownSet = new Set(state.knownVideoIds);
    const cutoffMs = Date.now() - NEW_VIDEO_MAX_AGE_MS;
    const newlyReleased = playable
      .filter((item) => {
        if (knownSet.has(item.id)) return false;
        const pubMs = Date.parse(item.publishedAt);
        return Number.isFinite(pubMs) && pubMs >= cutoffMs;
      })
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

    // Record all observed playable IDs so older unseen items aren't alerted next cycle
    if (playable.some((v) => !knownSet.has(v.id))) {
      const mergedKnown = [
        ...playable.filter((v) => !knownSet.has(v.id)).map((v) => v.id),
        ...state.knownVideoIds,
      ];
      state.knownVideoIds = Array.from(new Set(mergedKnown)).slice(0, MAX_KNOWN_IDS);
      persistStore();
    }

    if (newlyReleased.length === 0 || state.subscriptions.length === 0) {
      return { checked: playable.length, notified: 0 };
    }

    let notifiedCount = 0;
    const expiredEndpoints: string[] = [];

    for (const subRecord of state.subscriptions) {
      const subCatSet = new Set(subRecord.categories);
      const sentSet = new Set(subRecord.lastNotifiedVideoIds || []);
      const matching = newlyReleased.filter(
        (v) => subCatSet.has(v.category) && !sentSet.has(v.id)
      );
      if (matching.length === 0) continue;

      const leadVideo = matching[0];
      const payloadJson = buildVideoNotificationPayload(leadVideo, matching.length - 1);
      const outcome = await deliverNotification(subRecord, payloadJson);

      if (outcome === 'sent') {
        notifiedCount += 1;
        subRecord.lastNotifiedVideoIds = [
          ...matching.map((v) => v.id),
          ...(subRecord.lastNotifiedVideoIds || []),
        ].slice(0, 200);
      } else if (outcome === 'expired') {
        expiredEndpoints.push(subRecord.subscription.endpoint);
      }
    }

    if (expiredEndpoints.length > 0) {
      const expiredHashes = new Set(expiredEndpoints.map(hashEndpoint));
      state.subscriptions = state.subscriptions.filter((s) => !expiredHashes.has(s.id));
    }

    persistStore();
    return { checked: playable.length, notified: notifiedCount };
  })().finally(() => {
    checkInFlight = null;
  });

  return checkInFlight;
}

export function initializePushNotifier(fetcher: () => Promise<ChristianShort[]>): void {
  candidateFetcher = fetcher;
  ensureStoreLoaded();

  if (checkIntervalHandle) {
    clearInterval(checkIntervalHandle);
    checkIntervalHandle = null;
  }

  // Seed baseline / check shortly after boot, then check every 15 minutes
  setTimeout(() => {
    void checkAndNotifyNewVideos().catch(() => {});
  }, 15_000);

  checkIntervalHandle = setInterval(() => {
    void checkAndNotifyNewVideos().catch(() => {});
  }, CHECK_INTERVAL_MS);
}
