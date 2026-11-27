import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

interface SwPushEvent extends Event {
  data?: {
    json: () => unknown;
    text: () => string;
  } | null;
  waitUntil: (promise: Promise<unknown>) => void;
}

interface SwNotificationClickEvent extends Event {
  notification: Notification & { data?: { videoId?: string; url?: string } };
  action: string;
  waitUntil: (promise: Promise<unknown>) => void;
}

interface SwPeriodicSyncEvent extends Event {
  tag: string;
  waitUntil: (promise: Promise<unknown>) => void;
}

interface SwWindowClient {
  url: string;
  focused?: boolean;
  focus: () => Promise<SwWindowClient>;
  navigate?: (url: string) => Promise<SwWindowClient | null>;
  postMessage: (message: unknown) => void;
}

interface SwRegistration {
  showNotification: (
    title: string,
    options?: NotificationOptions & { image?: string; renotify?: boolean }
  ) => Promise<void>;
}

interface SwGlobalScope {
  __WB_MANIFEST?: Array<{ url: string; revision: string | null } | string>;
  location: Location;
  registration: SwRegistration;
  clients: {
    matchAll: (options?: {
      type?: 'window' | 'worker' | 'sharedworker' | 'all';
      includeUncontrolled?: boolean;
    }) => Promise<SwWindowClient[]>;
    openWindow: (url: string) => Promise<SwWindowClient | null>;
  };
  skipWaiting: () => Promise<void>;
  addEventListener: (
    type: string,
    listener: (event: Event) => void
  ) => void;
}

const sw = self as unknown as SwGlobalScope;

const SW_NOTIF_STATE_CACHE = 'gracaplay-notif-state-v1';
const SW_NOTIF_STATE_URL = '/__gracaplay_sw_notif_state__';

void sw.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute((self as unknown as SwGlobalScope).__WB_MANIFEST ?? []);

registerRoute(
  ({ url }) => url.origin === 'https://i.ytimg.com',
  new StaleWhileRevalidate({
    cacheName: 'youtube-thumbnails-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'gstatic-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

interface SwStoredNotifState {
  notifiedIds: string[];
  categories?: string[];
}

async function readSwNotifState(): Promise<SwStoredNotifState> {
  try {
    const cache = await caches.open(SW_NOTIF_STATE_CACHE);
    const res = await cache.match(SW_NOTIF_STATE_URL);
    if (!res) return { notifiedIds: [] };
    const parsed = (await res.json()) as Partial<SwStoredNotifState>;
    return {
      notifiedIds: Array.isArray(parsed.notifiedIds) ? parsed.notifiedIds : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
    };
  } catch {
    return { notifiedIds: [] };
  }
}

async function writeSwNotifState(next: SwStoredNotifState): Promise<void> {
  try {
    const cache = await caches.open(SW_NOTIF_STATE_CACHE);
    await cache.put(
      SW_NOTIF_STATE_URL,
      new Response(JSON.stringify(next), {
        headers: { 'Content-Type': 'application/json' },
      })
    );
  } catch {
    // Ignore storage errors inside SW
  }
}

async function recordNotifiedVideoId(videoId?: string): Promise<void> {
  if (!videoId) return;
  const current = await readSwNotifState();
  const nextIds = [videoId, ...current.notifiedIds.filter((id) => id !== videoId)].slice(
    0,
    250
  );
  await writeSwNotifState({ ...current, notifiedIds: nextIds });
}

sw.addEventListener('message', (rawEvent) => {
  const event = rawEvent as MessageEvent<{
    type?: string;
    categories?: string[];
  }>;
  if (event.data?.type === 'GRACAPLAY_SYNC_NOTIF_PREFS') {
    const cats = Array.isArray(event.data.categories) ? event.data.categories : undefined;
    void readSwNotifState().then((cur) =>
      writeSwNotifState({ ...cur, categories: cats })
    );
  }
});

sw.addEventListener('push', (rawEvent) => {
  const event = rawEvent as SwPushEvent;
  const handlePush = async () => {
    let data: {
      title?: string;
      body?: string;
      icon?: string;
      badge?: string;
      image?: string;
      tag?: string;
      videoId?: string;
      category?: string;
      url?: string;
    } = {};

    try {
      if (event.data) {
        data = (event.data.json() as typeof data) || {};
      }
    } catch {
      const text = event.data?.text() || '';
      data = {
        title: 'GraçaPlay · Novo vídeo',
        body: text || 'Confira o novo vídeo cristão disponível.',
      };
    }

    const title = data.title || 'GraçaPlay · Novo vídeo';
    const body = data.body || 'Um novo vídeo cristão foi adicionado para você.';
    const targetUrl =
      data.url || (data.videoId ? `/?v=${encodeURIComponent(data.videoId)}` : '/');

    if (data.videoId) {
      await recordNotifiedVideoId(data.videoId);
    }

    await sw.registration.showNotification(title, {
      body,
      icon: data.icon || '/pwa-192x192.png',
      badge: data.badge || '/pwa-192x192.png',
      image: data.image,
      tag: data.tag || `gracaplay-${data.videoId || 'update'}`,
      renotify: false,
      data: {
        videoId: data.videoId,
        category: data.category,
        url: targetUrl,
      },
    });
  };

  event.waitUntil(handlePush());
});

sw.addEventListener('notificationclick', (rawEvent) => {
  const event = rawEvent as SwNotificationClickEvent;
  event.notification.close();

  const videoId = event.notification.data?.videoId;
  const rawTargetUrl =
    event.notification.data?.url ||
    (videoId ? `/?v=${encodeURIComponent(videoId)}` : '/');
  const fullTargetUrl = new URL(rawTargetUrl, sw.location.origin).href;

  const focusOrOpen = async () => {
    const windowClients = await sw.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    for (const client of windowClients) {
      try {
        if (client.url.startsWith(sw.location.origin)) {
          await client.focus();
          if (videoId) {
            client.postMessage({ type: 'GRACAPLAY_OPEN_VIDEO', videoId });
          } else if (client.navigate) {
            await client.navigate(fullTargetUrl);
          }
          return;
        }
      } catch {
        // Fallback to opening a new window
      }
    }

    await sw.clients.openWindow(fullTargetUrl);
  };

  event.waitUntil(focusOrOpen());
});

sw.addEventListener('periodicsync', (rawEvent) => {
  const event = rawEvent as SwPeriodicSyncEvent;
  if (event.tag !== 'gracaplay-new-videos') return;

  const checkLatestInBg = async () => {
    try {
      const state = await readSwNotifState();
      const catQuery =
        state.categories && state.categories.length > 0
          ? `?categories=${encodeURIComponent(state.categories.join(','))}`
          : '';
      const res = await fetch(`/api/push/latest${catQuery}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        items?: Array<{
          id: string;
          title: string;
          channelTitle?: string;
          category?: string;
          thumbnailUrl?: string;
        }>;
      };
      const items = json.items ?? [];
      const seenSet = new Set(state.notifiedIds);
      const fresh = items.find((item) => item?.id && !seenSet.has(item.id));
      if (!fresh) return;

      await recordNotifiedVideoId(fresh.id);
      await sw.registration.showNotification('Novo vídeo no GraçaPlay', {
        body: fresh.channelTitle
          ? `${fresh.title} — ${fresh.channelTitle}`
          : fresh.title,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        image: fresh.thumbnailUrl,
        tag: `gracaplay-new-${fresh.id}`,
        renotify: false,
        data: {
          videoId: fresh.id,
          category: fresh.category,
          url: `/?v=${encodeURIComponent(fresh.id)}`,
        },
      });
    } catch {
      // Non-fatal background sync failure
    }
  };

  event.waitUntil(checkLatestInBg());
});
