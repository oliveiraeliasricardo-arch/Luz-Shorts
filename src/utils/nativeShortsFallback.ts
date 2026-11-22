import { Capacitor, CapacitorHttp } from '@capacitor/core';
import type { ShortsApiResponse } from '../types/shorts';
import {
  buildDiverseFeed,
  fetchCuratedRssWithAdapter,
  formatFilteredResponse,
} from '../shared/curatorCore';

export function isNativeCapacitorApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function fetchShortsOnNativeDevice(
  forceRefresh = false,
  pageIndex = 0
): Promise<ShortsApiResponse> {
  const rawItems = await fetchCuratedRssWithAdapter(async (url) => {
    const response = await CapacitorHttp.get({
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14) LuzShorts/1.0',
      },
      connectTimeout: 8000,
      readTimeout: 8000,
      responseType: 'text',
    });

    if (response.status < 200 || response.status >= 300) {
      return null;
    }

    return typeof response.data === 'string'
      ? response.data
      : JSON.stringify(response.data ?? '');
  }, pageIndex);

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
