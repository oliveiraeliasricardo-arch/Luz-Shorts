import crypto from 'node:crypto';
import type {
  ChristianShort,
  ContentCategory,
  ShortsApiResponse,
} from '../src/types/shorts.ts';
import {
  ALL_CURATED_CHANNELS,
  buildDiverseFeed,
  buildShortRecord,
  classifyShort,
  decodeXmlEntities,
  fetchCuratedRssWithAdapter,
  formatFilteredResponse,
  parseIso8601DurationSeconds,
} from '../src/shared/curatorCore.ts';

const CACHE_TTL_MS = 15 * 60 * 1000;
const CURSOR_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_CURSORS = 60;

interface CandidateVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl?: string;
  hintCategory?: ContentCategory;
}

interface PaginationSessionState {
  createdAtMs: number;
  playlistStates: Record<string, { nextPageToken?: string | null; done?: boolean }>;
  round: number;
  seenIds: Set<string>;
  searchToken?: string | null;
  rssPage: number;
}

let cachedCatalog: {
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  fetchedAt: string;
  fetchedAtMs: number;
} | null = null;

const paginationSessions = new Map<string, PaginationSessionState>();

function prunePaginationSessions(): void {
  const now = Date.now();
  for (const [key, state] of paginationSessions.entries()) {
    if (now - state.createdAtMs > CURSOR_TTL_MS) {
      paginationSessions.delete(key);
    }
  }
  while (paginationSessions.size >= MAX_CURSORS) {
    const oldestKey = paginationSessions.keys().next().value;
    if (!oldestKey) break;
    paginationSessions.delete(oldestKey);
  }
}

function createPaginationCursor(initialIds: string[], searchToken: string | null = null): string {
  prunePaginationSessions();
  const cursor = crypto.randomUUID();
  paginationSessions.set(cursor, {
    createdAtMs: Date.now(),
    playlistStates: {},
    round: 0,
    seenIds: new Set(initialIds),
    searchToken,
    rssPage: 1,
  });
  return cursor;
}

async function fetchFromCuratedRss(pageIndex = 0): Promise<ChristianShort[]> {
  return fetchCuratedRssWithAdapter(async (url) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LuzShorts/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.text();
  }, pageIndex);
}

async function hydrateAndVerifyCandidates(
  apiKey: string,
  candidates: Map<string, CandidateVideo>
): Promise<ChristianShort[]> {
  if (candidates.size === 0) return [];

  const candidateIds = [...candidates.keys()];
  const videoMeta = new Map<
    string,
    {
      embeddable: boolean;
      durationSeconds: number | null;
      viewCount: number | null;
      fullDescription: string;
    }
  >();

  for (let i = 0; i < candidateIds.length; i += 50) {
    const chunk = candidateIds.slice(i, i + 50);
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet,contentDetails,statistics,status',
      id: chunk.join(','),
    });
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (!res.ok) continue;
    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet?: { description?: string };
        contentDetails?: { duration?: string };
        statistics?: { viewCount?: string };
        status?: { embeddable?: boolean; privacyStatus?: string };
      }>;
    };
    for (const v of data.items ?? []) {
      videoMeta.set(v.id, {
        embeddable: v.status?.embeddable !== false && v.status?.privacyStatus !== 'private',
        durationSeconds: parseIso8601DurationSeconds(v.contentDetails?.duration),
        viewCount: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
        fullDescription: decodeXmlEntities(v.snippet?.description || ''),
      });
    }
  }

  const verifiedShorts: ChristianShort[] = [];
  for (const c of candidates.values()) {
    const meta = videoMeta.get(c.id);
    if (meta && !meta.embeddable) continue;

    const fullDesc = meta?.fullDescription || c.description;
    const classified = classifyShort(
      c.channelId,
      c.channelTitle,
      c.title,
      fullDesc,
      c.hintCategory
    );
    if (!classified) continue;

    if (
      classified.category === 'louvores' &&
      meta?.durationSeconds != null &&
      (meta.durationSeconds < 75 || meta.durationSeconds > 1200)
    ) {
      continue;
    }

    if (
      classified.category !== 'louvores' &&
      classified.category !== 'pregacoes' &&
      meta?.durationSeconds &&
      meta.durationSeconds > 185
    ) {
      continue;
    }

    verifiedShorts.push(
      buildShortRecord({
        id: c.id,
        title: c.title,
        description: fullDesc,
        channelId: c.channelId,
        channelTitle: c.channelTitle,
        publishedAt: c.publishedAt,
        thumbnailUrl: c.thumbnailUrl,
        category: classified.category,
        doctrineScope: classified.doctrineScope,
        durationSeconds: meta?.durationSeconds ?? null,
        viewCount: meta?.viewCount ?? null,
      })
    );
  }

  return verifiedShorts;
}

async function fetchFromYoutubeApi(
  apiKey: string,
  forceRefresh = false
): Promise<ChristianShort[]> {
  // Fetch initial catalog using playlistItems.list (1 quota unit per call instead of 100 for search.list)
  // across all curated verified channels, rotating offset/playlists on refresh for variety.
  const channels = [...ALL_CURATED_CHANNELS];
  if (forceRefresh) {
    for (let i = channels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [channels[i], channels[j]] = [channels[j], channels[i]];
    }
  }

  const pageRequests = channels.map((spec) => {
    const suffix = spec.id.slice(2);
    const playlistId =
      spec.defaultCategory === 'biblia'
        ? `UUSH${suffix}`
        : forceRefresh && Math.random() < 0.35
        ? `UUPV${suffix}`
        : `UU${suffix}`;
    return fetchChannelPlaylistPage(apiKey, playlistId, spec.defaultCategory, null);
  });

  const responses = await Promise.allSettled(pageRequests);
  const candidates = new Map<string, CandidateVideo>();
  let anyFulfilled = false;

  for (const res of responses) {
    if (res.status !== 'fulfilled') continue;
    if (res.value.candidates.length > 0) anyFulfilled = true;
    for (const c of res.value.candidates) {
      if (!candidates.has(c.id)) {
        candidates.set(c.id, c);
      }
    }
  }

  if (!anyFulfilled || candidates.size === 0) {
    throw new Error('YouTube API playlistItems returned no results');
  }

  return hydrateAndVerifyCandidates(apiKey, candidates);
}

async function fetchChannelPlaylistPage(
  apiKey: string,
  playlistId: string,
  hintCategory: ContentCategory,
  pageToken?: string | null
): Promise<{ candidates: CandidateVideo[]; nextPageToken: string | null }> {
  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: '25',
  });
  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
    { signal: AbortSignal.timeout(9000) }
  );
  if (!res.ok) {
    return { candidates: [], nextPageToken: null };
  }

  const data = (await res.json()) as {
    nextPageToken?: string;
    items?: Array<{
      contentDetails?: { videoId?: string; videoPublishedAt?: string };
      snippet?: {
        title?: string;
        description?: string;
        channelId?: string;
        channelTitle?: string;
        publishedAt?: string;
        resourceId?: { videoId?: string };
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  };

  const candidates: CandidateVideo[] = [];
  for (const item of data.items ?? []) {
    const s = item.snippet;
    const id = item.contentDetails?.videoId || s?.resourceId?.videoId;
    if (!id || !s) continue;
    candidates.push({
      id,
      title: decodeXmlEntities(s.title || ''),
      description: decodeXmlEntities(s.description || ''),
      channelId: s.channelId || '',
      channelTitle: decodeXmlEntities(s.channelTitle || ''),
      publishedAt:
        item.contentDetails?.videoPublishedAt || s.publishedAt || new Date().toISOString(),
      thumbnailUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url,
      hintCategory,
    });
  }

  return {
    candidates,
    nextPageToken: data.nextPageToken || null,
  };
}

async function fetchLiveYoutubeSearch(
  apiKey: string,
  rawQuery: string,
  rawCategory?: string,
  pageToken?: string | null
): Promise<{ items: ChristianShort[]; nextPageToken: string | null }> {
  const cleanQuery = rawQuery.trim();
  if (!cleanQuery) return { items: [], nextPageToken: null };

  const validCat =
    rawCategory === 'pregacoes' ||
    rawCategory === 'biblia' ||
    rawCategory === 'louvores' ||
    rawCategory === 'testemunhos'
      ? rawCategory
      : undefined;

  let effectiveQuery = cleanQuery;
  if (
    (validCat === 'pregacoes' || validCat === 'biblia') &&
    !/\b(adventista|iasd|novo tempo|rodrigo silva|na mira|terceiro anjo|arilton)\b/i.test(
      cleanQuery
    )
  ) {
    effectiveQuery = `${cleanQuery} adventista`;
  } else if (
    validCat === 'louvores' &&
    !/\b(louvor|adora[cç][aã]o|gospel|hino|m[uú]sica|clipe)\b/i.test(cleanQuery)
  ) {
    effectiveQuery = `${cleanQuery} louvor gospel`;
  } else if (
    validCat === 'testemunhos' &&
    !/\b(testemunho|convers[aã]o)\b/i.test(cleanQuery)
  ) {
    effectiveQuery = `${cleanQuery} testemunho cristão`;
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
    safeSearch: 'strict',
    relevanceLanguage: 'pt',
    regionCode: 'BR',
    maxResults: '30',
    q: effectiveQuery,
  });
  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    { signal: AbortSignal.timeout(9000) }
  );
  if (!res.ok) {
    return { items: [], nextPageToken: null };
  }

  const data = (await res.json()) as {
    nextPageToken?: string;
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        description?: string;
        channelId?: string;
        channelTitle?: string;
        publishedAt?: string;
        liveBroadcastContent?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  };

  const candidates = new Map<string, CandidateVideo>();
  for (const item of data.items ?? []) {
    const id = item.id?.videoId;
    const s = item.snippet;
    if (!id || !s || s.liveBroadcastContent === 'live') continue;
    candidates.set(id, {
      id,
      title: decodeXmlEntities(s.title || ''),
      description: decodeXmlEntities(s.description || ''),
      channelId: s.channelId || '',
      channelTitle: decodeXmlEntities(s.channelTitle || ''),
      publishedAt: s.publishedAt || new Date().toISOString(),
      thumbnailUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url,
      hintCategory: validCat,
    });
  }

  const verified = await hydrateAndVerifyCandidates(apiKey, candidates);
  return {
    items: verified,
    nextPageToken: data.nextPageToken || null,
  };
}

export async function getCuratedChristianShorts(options: {
  category?: string;
  q?: string;
  forceRefresh?: boolean;
}): Promise<ShortsApiResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const apiKeyConfigured = apiKey.length > 0;
  const nowMs = Date.now();
  const trimmedQuery = (options.q || '').trim();

  let baseItems: ChristianShort[] = [];
  let sourceMode: 'youtube_api' | 'curated_rss' = 'curated_rss';
  let fetchedAt = new Date().toISOString();

  if (!options.forceRefresh && cachedCatalog && nowMs - cachedCatalog.fetchedAtMs < CACHE_TTL_MS) {
    baseItems = cachedCatalog.items;
    sourceMode = cachedCatalog.sourceMode;
    fetchedAt = cachedCatalog.fetchedAt;
  } else {
    const randomize = Boolean(options.forceRefresh);
    if (apiKeyConfigured) {
      try {
        const apiItems = await fetchFromYoutubeApi(apiKey, randomize);
        const rssItems = await fetchFromCuratedRss(0);
        const merged = new Map<string, ChristianShort>();
        for (const item of apiItems) merged.set(item.id, item);
        for (const item of rssItems) {
          if (!merged.has(item.id)) merged.set(item.id, item);
        }
        baseItems = buildDiverseFeed([...merged.values()], randomize);
        sourceMode = 'youtube_api';
      } catch {
        baseItems = buildDiverseFeed(await fetchFromCuratedRss(0), randomize);
        sourceMode = 'curated_rss';
      }
    } else {
      baseItems = buildDiverseFeed(await fetchFromCuratedRss(0), randomize);
      sourceMode = 'curated_rss';
    }

    fetchedAt = new Date().toISOString();
    cachedCatalog = {
      items: baseItems,
      sourceMode,
      fetchedAt,
      fetchedAtMs: nowMs,
    };
  }

  // If user searches with a query and YouTube API is active, query YouTube live too
  let searchToken: string | null = null;
  let combinedItems = baseItems;
  if (trimmedQuery.length >= 2 && apiKeyConfigured) {
    try {
      const liveSearch = await fetchLiveYoutubeSearch(apiKey, trimmedQuery, options.category);
      searchToken = liveSearch.nextPageToken;
      if (liveSearch.items.length > 0) {
        const merged = new Map<string, ChristianShort>();
        for (const item of liveSearch.items) merged.set(item.id, item);
        for (const item of baseItems) {
          if (!merged.has(item.id)) merged.set(item.id, item);
        }
        combinedItems = [...merged.values()];
      }
    } catch {
      // Keep baseItems filtering on transient search errors
    }
  }

  const cursor = createPaginationCursor(
    combinedItems.map((i) => i.id),
    searchToken
  );

  // When searching live on YouTube, merge live YouTube hits + accent-folded local matches
  if (trimmedQuery.length >= 2 && apiKeyConfigured) {
    const fold = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const validCategories = new Set(['all', 'pregacoes', 'biblia', 'louvores', 'testemunhos']);
    const category =
      options.category && validCategories.has(options.category) ? options.category : 'all';
    const foldedQ = fold(trimmedQuery);
    const matchedCached = baseItems.filter(
      (item) =>
        fold(item.title).includes(foldedQ) ||
        fold(item.channelTitle).includes(foldedQ) ||
        fold(item.description).includes(foldedQ) ||
        fold(item.categoryLabel).includes(foldedQ)
    );
    const mergedSearch = new Map<string, ChristianShort>();
    for (const item of combinedItems) {
      if (!baseItems.some((b) => b.id === item.id)) {
        mergedSearch.set(item.id, item);
      }
    }
    for (const item of matchedCached) {
      if (!mergedSearch.has(item.id)) mergedSearch.set(item.id, item);
    }
    const orderedSearch = buildDiverseFeed([...mergedSearch.values()], false);
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      biblia: 0,
      louvores: 0,
      testemunhos: 0,
    };
    for (const item of orderedSearch) counts[item.category] += 1;
    const filtered =
      category === 'all' ? orderedSearch : orderedSearch.filter((i) => i.category === category);

    return {
      items: filtered,
      sourceMode,
      apiKeyConfigured,
      fetchedAt,
      category,
      totalBeforeCategoryFilter: orderedSearch.length,
      categoryCounts: counts,
      hasMore: Boolean(searchToken),
      nextCursor: searchToken ? cursor : null,
    };
  }

  return formatFilteredResponse(
    combinedItems,
    sourceMode,
    apiKeyConfigured,
    fetchedAt,
    options.category,
    options.q,
    true,
    cursor
  );
}

export async function getMoreChristianShorts(options: {
  category?: string;
  q?: string;
  cursor?: string;
  excludeIds?: string[];
}): Promise<ShortsApiResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const apiKeyConfigured = apiKey.length > 0;
  const fetchedAt = new Date().toISOString();
  const validCat =
    options.category === 'pregacoes' ||
    options.category === 'biblia' ||
    options.category === 'louvores' ||
    options.category === 'testemunhos'
      ? options.category
      : undefined;
  const trimmedQuery = (options.q || '').trim();

  let cursor = options.cursor?.trim() || '';
  let state = cursor ? paginationSessions.get(cursor) : undefined;
  if (!state) {
    cursor = createPaginationCursor(options.excludeIds ?? []);
    state = paginationSessions.get(cursor)!;
  }
  for (const id of options.excludeIds ?? []) {
    state.seenIds.add(id);
  }

  // Paginated live YouTube search when query is active
  if (trimmedQuery.length >= 2 && apiKeyConfigured) {
    if (!state.searchToken) {
      return formatFilteredResponse(
        [],
        'youtube_api',
        true,
        fetchedAt,
        options.category,
        '',
        false,
        null
      );
    }

    const page = await fetchLiveYoutubeSearch(
      apiKey,
      trimmedQuery,
      options.category,
      state.searchToken
    );
    state.searchToken = page.nextPageToken;

    const fresh = page.items.filter((item) => {
      if (state!.seenIds.has(item.id)) return false;
      if (validCat && item.category !== validCat) return false;
      state!.seenIds.add(item.id);
      return true;
    });

    const diverse = buildDiverseFeed(fresh, false);
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      biblia: 0,
      louvores: 0,
      testemunhos: 0,
    };
    for (const item of diverse) counts[item.category] += 1;

    return {
      items: diverse,
      sourceMode: 'youtube_api',
      apiKeyConfigured: true,
      fetchedAt,
      category: options.category || 'all',
      totalBeforeCategoryFilter: diverse.length,
      categoryCounts: counts,
      hasMore: Boolean(state.searchToken),
      nextCursor: state.searchToken ? cursor : null,
    };
  }

  // Unlimited YouTube Channel Uploads Archive pagination via playlistItems.list (1 quota unit per channel page)
  if (apiKeyConfigured) {
    const eligibleChannels = validCat
      ? ALL_CURATED_CHANNELS.filter(
          (ch) => ch.defaultCategory === validCat || ch.allowInCategories.includes(validCat)
        )
      : ALL_CURATED_CHANNELS;

    const collected: ChristianShort[] = [];
    let anyPlaylistRemaining = false;

    for (let attempt = 0; attempt < 2 && collected.length < 18; attempt++) {
      const batchTargets: Array<{
        playlistId: string;
        hintCategory: ContentCategory;
      }> = [];

      const total = eligibleChannels.length;
      const batchSize = Math.min(10, total);
      for (let i = 0; i < total && batchTargets.length < batchSize; i++) {
        const ch = eligibleChannels[(state.round * batchSize + i) % total];
        const suffix = ch.id.slice(2);
        const hint = validCat || ch.defaultCategory;
        const playlistId =
          hint === 'biblia' && ch.defaultCategory === 'biblia'
            ? `UUSH${suffix}`
            : `UU${suffix}`;
        const pState = state.playlistStates[playlistId];
        if (pState?.done) continue;
        batchTargets.push({ playlistId, hintCategory: hint });
      }
      state.round += 1;

      if (batchTargets.length === 0) break;

      const pageResults = await Promise.allSettled(
        batchTargets.map(async (target) => {
          const prevToken = state!.playlistStates[target.playlistId]?.nextPageToken ?? null;
          const res = await fetchChannelPlaylistPage(
            apiKey,
            target.playlistId,
            target.hintCategory,
            prevToken
          );
          if (res.nextPageToken) {
            state!.playlistStates[target.playlistId] = {
              nextPageToken: res.nextPageToken,
              done: false,
            };
          } else {
            state!.playlistStates[target.playlistId] = {
              nextPageToken: null,
              done: true,
            };
          }
          return res.candidates;
        })
      );

      const candidateMap = new Map<string, CandidateVideo>();
      for (const r of pageResults) {
        if (r.status !== 'fulfilled') continue;
        for (const c of r.value) {
          if (!state.seenIds.has(c.id) && !candidateMap.has(c.id)) {
            candidateMap.set(c.id, c);
          }
        }
      }

      const verified = await hydrateAndVerifyCandidates(apiKey, candidateMap);
      for (const item of verified) {
        if (!state.seenIds.has(item.id)) {
          state.seenIds.add(item.id);
          collected.push(item);
        }
      }
    }

    for (const ch of eligibleChannels) {
      const suffix = ch.id.slice(2);
      const hint = validCat || ch.defaultCategory;
      const pid =
        hint === 'biblia' && ch.defaultCategory === 'biblia'
          ? `UUSH${suffix}`
          : `UU${suffix}`;
      if (!state.playlistStates[pid]?.done) {
        anyPlaylistRemaining = true;
        break;
      }
    }

    const diverse = buildDiverseFeed(collected, true);
    return formatFilteredResponse(
      diverse,
      'youtube_api',
      true,
      fetchedAt,
      options.category,
      '',
      anyPlaylistRemaining,
      anyPlaylistRemaining ? cursor : null
    );
  }

  // RSS archive fallback pagination
  const rssPage = state.rssPage;
  state.rssPage += 1;
  const rssItems = await fetchFromCuratedRss(rssPage);
  const fresh = rssItems.filter((item) => {
    if (state!.seenIds.has(item.id)) return false;
    state!.seenIds.add(item.id);
    return true;
  });
  const diverse = buildDiverseFeed(fresh, true);
  const hasMoreRss = rssPage < 2;

  return formatFilteredResponse(
    diverse,
    'curated_rss',
    false,
    fetchedAt,
    options.category,
    '',
    hasMoreRss,
    hasMoreRss ? cursor : null
  );
}

export async function lookupSingleShort(videoId: string): Promise<ChristianShort | null> {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  if (cachedCatalog) {
    const found = cachedCatalog.items.find((item) => item.id === videoId);
    if (found) return found;
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  if (apiKey) {
    try {
      const params = new URLSearchParams({
        key: apiKey,
        part: 'snippet,contentDetails,statistics,status',
        id: videoId,
      });
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`,
        { signal: AbortSignal.timeout(7000) }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          items?: Array<{
            id: string;
            snippet?: {
              title?: string;
              description?: string;
              channelId?: string;
              channelTitle?: string;
              publishedAt?: string;
              thumbnails?: { high?: { url?: string } };
            };
            contentDetails?: { duration?: string };
            statistics?: { viewCount?: string };
            status?: { embeddable?: boolean };
          }>;
        };
        const v = data.items?.[0];
        if (v && v.snippet && v.status?.embeddable !== false) {
          const classified = classifyShort(
            v.snippet.channelId || '',
            v.snippet.channelTitle || '',
            v.snippet.title || '',
            v.snippet.description || ''
          );
          if (!classified) return null;
          return buildShortRecord({
            id: v.id,
            title: v.snippet.title || 'Vídeo Cristão',
            description: v.snippet.description || '',
            channelId: v.snippet.channelId || '',
            channelTitle: v.snippet.channelTitle || '',
            publishedAt: v.snippet.publishedAt || new Date().toISOString(),
            thumbnailUrl: v.snippet.thumbnails?.high?.url,
            category: classified.category,
            doctrineScope: classified.doctrineScope,
            durationSeconds: parseIso8601DurationSeconds(v.contentDetails?.duration),
            viewCount: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
          });
        }
      }
    } catch {
      // Fall through to oEmbed check
    }
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(7000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    const title = data.title || '';
    const author = data.author_name || '';
    const classified = classifyShort('', author, title, '');
    if (!classified) return null;

    return buildShortRecord({
      id: videoId,
      title,
      description: '',
      channelId: '',
      channelTitle: author,
      publishedAt: new Date().toISOString(),
      thumbnailUrl: data.thumbnail_url,
      category: classified.category,
      doctrineScope: classified.doctrineScope,
    });
  } catch {
    return null;
  }
}
