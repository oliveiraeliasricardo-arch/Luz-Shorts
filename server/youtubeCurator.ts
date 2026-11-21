import type {
  ChristianShort,
  ContentCategory,
  ShortsApiResponse,
} from '../src/types/shorts.ts';
import {
  buildDiverseFeed,
  buildShortRecord,
  classifyShort,
  decodeXmlEntities,
  fetchCuratedRssWithAdapter,
  formatFilteredResponse,
  parseIso8601DurationSeconds,
} from '../src/shared/curatorCore.ts';

const CACHE_TTL_MS = 15 * 60 * 1000;
let cachedCatalog: {
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  fetchedAt: string;
  fetchedAtMs: number;
} | null = null;

async function fetchFromCuratedRss(): Promise<ChristianShort[]> {
  return fetchCuratedRssWithAdapter(async (url) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LuzShorts/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.text();
  });
}

async function fetchFromYoutubeApi(
  apiKey: string,
  forceRefresh = false
): Promise<ChristianShort[]> {
  const searchPlans: Array<{
    q: string;
    channelId?: string;
    hintCategory: ContentCategory;
    order?: 'relevance' | 'date';
  }> = [
    { q: 'pregação adventista #shorts', hintCategory: 'pregacoes', order: forceRefresh ? 'date' : 'relevance' },
    { q: 'sermão esperança novo tempo #shorts', channelId: 'UC_OaSsAydgSIjUtjYn9qLog', hintCategory: 'pregacoes' },
    { q: 'mensagem adventista #shorts', channelId: 'UCJAO3KgZdEhCqwpkZyAYY6A', hintCategory: 'pregacoes' },
    { q: 'reflexão bíblica pastor adventista #shorts', hintCategory: 'pregacoes', order: 'date' },
    { q: 'estudo bíblico adventista #shorts', hintCategory: 'biblia', order: forceRefresh ? 'date' : 'relevance' },
    { q: 'na mira da verdade #shorts', channelId: 'UCIa6p9HWw1hEEfHzfJOcSbA', hintCategory: 'biblia' },
    { q: 'rodrigo silva arqueologia bíblia #shorts', channelId: 'UCn4M9vLHegNuqM8tnL872cA', hintCategory: 'biblia' },
    { q: 'lições da bíblia escola sabatina #shorts', channelId: 'UCLb09BPgh7xrswJRgYQthuw', hintCategory: 'biblia' },
    { q: 'louvor cristão adoração #shorts', hintCategory: 'louvores', order: forceRefresh ? 'date' : 'relevance' },
    { q: 'música gospel louvor ao vivo #shorts', hintCategory: 'louvores', order: 'date' },
    { q: 'arautos do rei gravadora nt #shorts', hintCategory: 'louvores' },
    { q: 'testemunho cristão fé milagre #shorts', hintCategory: 'testemunhos', order: forceRefresh ? 'date' : 'relevance' },
    { q: 'testemunho evangelho conversão #shorts', hintCategory: 'testemunhos', order: 'date' },
  ];

  const searchResponses = await Promise.allSettled(
    searchPlans.map(async (plan) => {
      const params = new URLSearchParams({
        key: apiKey,
        part: 'snippet',
        type: 'video',
        videoDuration: 'short',
        videoEmbeddable: 'true',
        safeSearch: 'strict',
        relevanceLanguage: 'pt',
        regionCode: 'BR',
        maxResults: '15',
        order: plan.order || 'relevance',
        q: plan.q,
      });
      if (plan.channelId) {
        params.set('channelId', plan.channelId);
      }

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
        { signal: AbortSignal.timeout(9000) }
      );
      if (!res.ok) {
        throw new Error(`YouTube search HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
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
      return { items: data.items ?? [], hintCategory: plan.hintCategory };
    })
  );

  const candidates = new Map<
    string,
    {
      id: string;
      title: string;
      description: string;
      channelId: string;
      channelTitle: string;
      publishedAt: string;
      thumbnailUrl?: string;
      hintCategory: ContentCategory;
    }
  >();

  let anyFulfilled = false;
  for (const res of searchResponses) {
    if (res.status !== 'fulfilled') continue;
    anyFulfilled = true;
    for (const item of res.value.items) {
      const id = item.id?.videoId;
      const s = item.snippet;
      if (!id || !s || s.liveBroadcastContent === 'live') continue;
      if (!candidates.has(id)) {
        candidates.set(id, {
          id,
          title: decodeXmlEntities(s.title || ''),
          description: decodeXmlEntities(s.description || ''),
          channelId: s.channelId || '',
          channelTitle: decodeXmlEntities(s.channelTitle || ''),
          publishedAt: s.publishedAt || new Date().toISOString(),
          thumbnailUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url,
          hintCategory: res.value.hintCategory,
        });
      }
    }
  }

  if (!anyFulfilled || candidates.size === 0) {
    throw new Error('YouTube API search returned no results');
  }

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
    if (meta?.durationSeconds && meta.durationSeconds > 185) continue;

    const fullDesc = meta?.fullDescription || c.description;
    const classified = classifyShort(
      c.channelId,
      c.channelTitle,
      c.title,
      fullDesc,
      c.hintCategory
    );
    if (!classified) continue;

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

export async function getCuratedChristianShorts(options: {
  category?: string;
  q?: string;
  forceRefresh?: boolean;
}): Promise<ShortsApiResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const apiKeyConfigured = apiKey.length > 0;
  const nowMs = Date.now();

  if (!options.forceRefresh && cachedCatalog && nowMs - cachedCatalog.fetchedAtMs < CACHE_TTL_MS) {
    return formatFilteredResponse(
      cachedCatalog.items,
      cachedCatalog.sourceMode,
      apiKeyConfigured,
      cachedCatalog.fetchedAt,
      options.category,
      options.q
    );
  }

  let items: ChristianShort[] = [];
  let sourceMode: 'youtube_api' | 'curated_rss' = 'curated_rss';
  const randomize = Boolean(options.forceRefresh);

  if (apiKeyConfigured) {
    try {
      const apiItems = await fetchFromYoutubeApi(apiKey, randomize);
      const rssItems = await fetchFromCuratedRss();
      const merged = new Map<string, ChristianShort>();
      for (const item of apiItems) merged.set(item.id, item);
      for (const item of rssItems) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }
      items = buildDiverseFeed([...merged.values()], randomize);
      sourceMode = 'youtube_api';
    } catch {
      items = buildDiverseFeed(await fetchFromCuratedRss(), randomize);
      sourceMode = 'curated_rss';
    }
  } else {
    items = buildDiverseFeed(await fetchFromCuratedRss(), randomize);
    sourceMode = 'curated_rss';
  }

  const fetchedAt = new Date().toISOString();
  cachedCatalog = {
    items,
    sourceMode,
    fetchedAt,
    fetchedAtMs: nowMs,
  };

  return formatFilteredResponse(
    items,
    sourceMode,
    apiKeyConfigured,
    fetchedAt,
    options.category,
    options.q
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
