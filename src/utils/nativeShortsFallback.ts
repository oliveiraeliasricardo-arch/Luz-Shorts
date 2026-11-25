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

export async function fetchFastNativeSeed(): Promise<ShortsApiResponse> {
  const rawItems = await fetchFastBootstrapRssWithAdapter((url) =>
    nativeFetchXml(url, 3200)
  );
  const diverseItems = buildDiverseFeed(rawItems, true);
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

export async function fetchShortsOnNativeDevice(
  forceRefresh = false,
  pageIndex = 0
): Promise<ShortsApiResponse> {
  const rawItems = await fetchCuratedRssWithAdapter(
    (url) => nativeFetchXml(url, 4200),
    pageIndex
  );

  const diverseItems = buildDiverseFeed(rawItems, forceRefresh || pageIndex > 0);
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
