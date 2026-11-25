import { Capacitor, CapacitorHttp } from '@capacitor/core';
import type { ShortsApiResponse } from '../types/shorts';
import {
  buildDiverseFeed,
  fetchCuratedRssWithAdapter,
  fetchFastBootstrapRssWithAdapter,
  formatFilteredResponse,
} from '../shared/curatorCore';

export function isNativeCapacitorApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function nativeFetchXml(url: string, timeoutMs = 4200): Promise<string | null> {
  const response = await CapacitorHttp.get({
    url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14) GracaPlay/1.0',
    },
    connectTimeout: timeoutMs,
    readTimeout: timeoutMs,
    responseType: 'text',
  });

  if (response.status < 200 || response.status >= 300) {
    return null;
  }

  return typeof response.data === 'string'
    ? response.data
    : JSON.stringify(response.data ?? '');
}

export async function fetchFastNativeSeed(
  excludeIds: string[] = []
): Promise<ShortsApiResponse> {
  const excludeSet = new Set(excludeIds);
  const rawItems = await fetchFastBootstrapRssWithAdapter((url) =>
    nativeFetchXml(url, 2800)
  );
  const unseen = rawItems.filter((item) => !excludeSet.has(item.id));
  const diverseItems = buildDiverseFeed(unseen, true);
  return formatFilteredResponse(
    diverseItems,
    'curated_rss',
    false,
    new Date().toISOString(),
    'all',
    '',
    true,
    '1'
  );
}

const NATIVE_ROTATION_KEY = 'gracaplay_native_rss_rot_v1';

function nextNativeArchivePage(): number {
  try {
    const prev = Number(localStorage.getItem(NATIVE_ROTATION_KEY) || '0');
    const next = (Number.isFinite(prev) ? prev + 1 : 1) % 3;
    localStorage.setItem(NATIVE_ROTATION_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}

export async function fetchShortsOnNativeDevice(
  forceRefresh = false,
  pageIndex = 0,
  excludeIds: string[] = []
): Promise<ShortsApiResponse> {
  const excludeSet = new Set(excludeIds);
  const archivePage = pageIndex === 0 ? nextNativeArchivePage() : pageIndex;
  const requests =
    archivePage > 0 && pageIndex === 0
      ? [
          fetchCuratedRssWithAdapter((url) => nativeFetchXml(url, 3200), archivePage),
          fetchCuratedRssWithAdapter((url) => nativeFetchXml(url, 3200), 0),
        ]
      : [fetchCuratedRssWithAdapter((url) => nativeFetchXml(url, 3200), pageIndex)];

  const settled = await Promise.allSettled(requests);
  const merged = new Map<string, Awaited<ReturnType<typeof fetchCuratedRssWithAdapter>>[number]>();
  for (const r of settled) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      }
    }
  }

  const allItems = [...merged.values()];
  const unseenItems = allItems.filter((item) => !excludeSet.has(item.id));
  const diverseItems = buildDiverseFeed(unseenItems, true || forceRefresh);
  const hasMore = pageIndex < 2;
  return formatFilteredResponse(
    diverseItems,
    'curated_rss',
    false,
    new Date().toISOString(),
    'all',
    '',
    hasMore,
    hasMore ? String(pageIndex + 1) : null
  );
}
