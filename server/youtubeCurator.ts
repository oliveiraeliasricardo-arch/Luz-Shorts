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
  deduplicateShorts,
  fetchCuratedRssWithAdapter,
  formatFilteredResponse,
  isUpcomingOrPremiereEntry,
  parseIso8601DurationSeconds,
} from '../src/shared/curatorCore.ts';

const CACHE_TTL_MS = 15 * 60 * 1000;
const CURSOR_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_CURSORS = 60;

const DISCOVERY_QUERIES_BY_CATEGORY: Record<ContentCategory, string[]> = {
  pregacoes: [
    'pregação adventista culto',
    'sermão adventista completo',
    'culto divino adventista pregação',
    'semana de oração adventista pregação',
    'pr alejandro bullon pregação',
    'pr arilton oliveira pregação',
    'pr ivan saraiva pregação',
    'pr odailson fonseca pregação',
    'pr rafael rossi pregação',
    'pr gilson brito pregação',
    'pr kleber gonçalves pregação',
    'pr luís gonçalves evangelismo pregação',
    'pr stanley arco pregação adventista',
    'unasp igreja culto pregação adventista',
    'mensagem adventista sábado culto',
    'pr rafael santos pregação adventista',
    'pr michelson borges pregação adventista',
    'novo tempo pregação sábado adventista',
    'pr erton köhler sermão adventista',
    'pr gustavo marques pregação adventista',
    'meditação pôr do sol adventista mensagem',
    'evangelismo adventista colheita pregação',
  ],
  biblia: [
    'estudo bíblico adventista',
    'rodrigo silva arqueologia bíblica',
    'na mira da verdade bíblia',
    'arilton oliveira estudo bíblico',
    'novo tempo apocalipse profecia',
    'escola sabatina lição bíblia',
    'terceiro anjo profecias bíblicas',
    'michelson borges bíblia criação',
    'sábado na bíblia adventista',
    'ivan saraiva bíblia versículo',
    'daniel apocalipse adventista profecia',
    'evangelho adventista reflexão bíblica',
    'comtexto diário bíblia adventista',
    'adventistas brasil estudo bíblico',
    'evidências bíblicas rodrigo silva',
    'curiosidades bíblicas adventista',
    'santuário na bíblia adventista',
    'volta de jesus profecia adventista',
  ],
  louvores: [
    'novo hinário adventista oficial',
    'novo hinário adventista hino letra',
    'novo hinário adventista hinos 1 a 600',
    'hinário adventista cantado com letra',
    'coletânea adoradores novo tempo',
    'adoradores 5 gravadora novo tempo',
    'adoradores 4 gravadora novo tempo',
    'cd jovem adventista ministério jovem',
    'cd jovem menos um adventista',
    'cd jovem 2025 venha o teu reino ministério jovem',
    'cd jovem 2024 ministério jovem adventista',
    'cd jovem 2022 ministério jovem adventista',
    'cd jovem 2020 ministério jovem adventista',
    'cd jovem 2018 ministério jovem adventista',
    'cd jovem 2015 ministério jovem adventista',
    'cd jovem 2012 ministério jovem adventista',
    'cd jovem 2010 ministério jovem adventista',
    'cd jovem 2005 ministério jovem adventista',
    'cd jovem coletânea adventista anos 2000',
    'adoradores 3 gravadora novo tempo',
    'adoradores 2 gravadora novo tempo',
    'adoradores 1 gravadora novo tempo',
    '1 hora de adoradores novo tempo',
    'coletânea novo hinário adventista',
    'louvor gospel clipe oficial',
    'música gospel adoração ao vivo',
    'arautos do rei música oficial',
    'novo tom gravadora nt clipe oficial',
    'daniel ludtke louvor oficial',
    'pedro valença música oficial',
    'fernandinho louvor ao vivo',
    'aline barros música oficial',
    'gabriela rocha clipe oficial',
    'fhop music acústico adoração',
    'casa worship louvor ao vivo',
    'isadora pompeo música oficial',
    'morada música gospel ao vivo',
    'laura souguellis louvor ao vivo',
    'ministério mergulhar adoração ao vivo',
    'coral jovens adventistas música oficial',
    'art trio louvor adventista oficial',
    'theo rubia música gospel ao vivo',
    'sarah farias clipe oficial louvor',
  ],
  testemunhos: [
    'testemunho cristão conversão',
    'testemunho evangélico forte conversão',
    'meu testemunho jesus mudou minha vida',
    'testemunho igreja batista conversão',
    'testemunho igreja presbiteriana conversão',
    'testemunho assembleia de deus conversão',
    'testemunho congregação cristã ccb fé',
    'testemunho católico conversão jesus',
    'testemunho de milagre e cura cristão',
    'testemunho ex ateu conheci jesus',
    'testemunho libertação drogas jesus',
    'testemunho de fé e batismo igreja cristã',
    'depoimento cristão milagre de deus',
    'como conheci jesus meu testemunho',
    'história real de conversão cristã',
    'testemunho adventista conversão',
    'deus salvou minha vida testemunho real',
    'como deus mudou minha família testemunho',
  ],
  feliz7play: [
    'feliz7play série filme adventista',
    'feliz7play defensores da bíblia',
    'feliz7play camelo na agulha animação bíblica',
    'feliz7play comtexto bíblico episódio',
    'feliz7play apocalipse série',
    'feliz7play documentário adventista',
    'animação bíblica adventista novo tempo',
    'nt kids desenho bíblico adventista',
    'nosso amiguinho meu herói da bíblia desenho',
    'minha vida é uma viagem história bíblica',
    'feliz7kids desenho animado adventista',
    'desenho bíblico infantil adventista história da bíblia',
  ],
};

const NOVO_HINARIO_PLAYLISTS: string[] = [
  'PLAPpcKnpMfeO9Fydpl1tTKC9CRRnIMMSK', // Novo Hinário Adventista 1-100
  'PLAPpcKnpMfeOsWzlaY0bXm1Q5pnQQxn_y', // Novo Hinário Adventista 101-200
  'PLAPpcKnpMfeMnCMuGcdWKVkgpi2P_sRkE', // Novo Hinário Adventista 201-300
  'PLAPpcKnpMfeNIrE1nk3w2OkcUdxuY6y1l', // Novo Hinário Adventista 301-400
  'PLAPpcKnpMfePvD6DLI-Y5TR-RVVo62s6Z', // Novo Hinário Adventista 401-500
  'PLAPpcKnpMfePWEOuIu4B4F3PVljyD8DoO', // Novo Hinário Adventista 501-600
];

const ADORADORES_PLAYLISTS: string[] = [
  'PLGd1LrnOTfcu_5cTv_hXG2NhMb1CfULoK', // Adoradores Novo Tempo - Coletânea Completa
  'PLyTP3IYISkzDLs4oQg6GFBFpPa6HyByZb', // ADORADORES 1, 2, 3, 4 e 5
  'PLpcvYkqB-HJFgYQEjkdxBPpzQ6Xk5s8nr', // Adoradores 1 | Gravadora Novo Tempo
  'PLpcvYkqB-HJE78QiaOqlmjK4HH_AiL78j', // Adoradores 2 | Gravadora Novo Tempo
  'PLyTP3IYISkzC-3rY1yHEZJttVW81XsgfT', // Adoradores 2 - Português (Congregacional)
  'PLpcvYkqB-HJEcQ1SbmDoi8NQ5wnD-yQqz', // Adoradores 3 | Gravadora Novo Tempo
  'PLyTP3IYISkzDFW5GQowKB2HPyBTlAmMDU', // Adoradores 3 - Português (Congregacional)
  'PLnjYWXTXSkDrri7WFuBCYB5Ljo9uhbOUG', // Adoradores 4 Ao Vivo
  'PLnjYWXTXSkDqUHHAprAtUaoj-u_cOO_iq', // Adoradores 4 Congregacional
  'PLnjYWXTXSkDpfADeUa3LJkhdzzXwsqD_P', // Adoradores 5
  'PLnjYWXTXSkDr-jo4daf3ZOkzccvMxsrb1', // Adoradores 5 Congregacional
];

const CD_JOVEM_PLAYLISTS: string[] = [
  'PL4sNlZt4GK2gdDHuCLJo7zbBrAgrejKgZ', // CD Jovem 2025 - Venha o Teu Reino
  'PLbVEebfqK46x3MZ9MSjtSy8Z7p8lUIblW', // Tema Jovem 2021-2026
  'PLJL3zUYFtkP_UhdQDQ3qIqAeHQtahqbkP', // CD Jovem 2020
  'PL-EHuXADFVigifAI3blR0zMp163K7GfIM', // CD Jovem 2018
  'PLdKdSz4_lV0psVHoo6-hquHfyTKu7O-Gl', // Coletânea Jovem 2018 (Menos Um)
  'PLcR_3qk8j1yxdV5q-zBcojO5MCUufzz7E', // CD Jovem 2016/2017
  'PL4sNlZt4GK2hONK721JkhSvIBYSk1xO7z', // CD Jovem 2014 - A Única Esperança
  'PL4sNlZt4GK2hrCEY0pAyXvLMnDpa9EOrK', // CD Jovem 2012 - A Grande Esperança
  'PLMfYI5C08mSV9YpRRSsQexPUHAQnXRoti', // CD Jovem 2010
  'PL4sNlZt4GK2ieNVMyoEWFpJ1zftJXLcj-', // CD Jovem 2008 - Vivo Por Jesus
  'PLMfYI5C08mSXbcjjZmVBHaJvVedK156l7', // CD Jovem 2006
  'PL4sNlZt4GK2jISkKyc2RdLSWqzMLkqk3C', // CD Jovem 2002 - Você Me Pertence
  'PL4sNlZt4GK2icCEOA5pAtNztbdP6ro_-6', // CD Jovem 2001 - Quase no Lar
  'PL4sNlZt4GK2jyMHUzZ3RJ2tf9suE3DKuZ', // CD Jovem 1999 - Rumo ao Porto Seguro
  'PL4sNlZt4GK2iD-NaMcmKFOkuCfsXUF1t2', // CD Jovem 1998 - Missão
  'PL4sNlZt4GK2i4JnzCuLEODNUYDnq3bXBA', // CD Jovem 1996 - A Diferença é Cristo
  'PL4sNlZt4GK2il6ONQag8PeZgwjbpNoKeI', // Ministério Jovem - Adoração & Louvor
  'PL4sNlZt4GK2jgaK_KX3BUMZaAzYhkuv7V', // Ministério Jovem - Creio
  'PLdKdSz4_lV0pHU80h21bq3uNR07-KaROd', // CD Jovem / CD JA (Menos Um)
  'PLdKdSz4_lV0rcBygal6Pb4CYL2YQDpNGK', // Ministério Jovem Novo (Menos Um)
];

interface CandidateVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl?: string;
  hintCategory?: ContentCategory;
  durationSeconds?: number | null;
}

interface CategoryDiscoveryCursor {
  queryIdx: number;
  pageToken: string | null;
}

interface PaginationSessionState {
  createdAtMs: number;
  playlistStates: Record<string, { nextPageToken?: string | null; done?: boolean }>;
  round: number;
  seenIds: Set<string>;
  searchToken?: string | null;
  rssPage: number;
  discoveryByCategory: Partial<Record<ContentCategory, CategoryDiscoveryCursor>>;
  allCycleIdx: number;
}

const MAX_CACHED_CATALOG_ITEMS = 1200;

let cachedCatalog: {
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  fetchedAt: string;
  fetchedAtMs: number;
  playlistTokens: Record<string, string | null>;
} | null = null;

// Persistent server-side rotation cursors so new sessions and refreshes dig deeper
// into YouTube rather than returning the exact same page-1 results every time.
const persistentPlaylistTokens: Record<string, string | null> = {};
const globalDiscoveryOffsets: Record<ContentCategory, number> = {
  pregacoes: 0,
  biblia: 0,
  louvores: 0,
  testemunhos: 0,
  feliz7play: 0,
};

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

function createPaginationCursor(
  initialIds: string[],
  searchToken: string | null = null,
  seedPlaylistTokens: Record<string, string | null> = {}
): string {
  prunePaginationSessions();
  const cursor = crypto.randomUUID();

  const seededPlaylists: Record<string, { nextPageToken?: string | null; done?: boolean }> = {};
  for (const [pid, token] of Object.entries(seedPlaylistTokens)) {
    seededPlaylists[pid] = token
      ? { nextPageToken: token, done: false }
      : { nextPageToken: null, done: true };
  }

  const discoveryByCategory: Partial<Record<ContentCategory, CategoryDiscoveryCursor>> = {};
  const cats: ContentCategory[] = [
    'pregacoes',
    'biblia',
    'louvores',
    'testemunhos',
    'feliz7play',
  ];
  for (const cat of cats) {
    const qLen = DISCOVERY_QUERIES_BY_CATEGORY[cat].length;
    const offset = globalDiscoveryOffsets[cat] % qLen;
    globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % qLen;
    discoveryByCategory[cat] = { queryIdx: offset, pageToken: null };
  }

  paginationSessions.set(cursor, {
    createdAtMs: Date.now(),
    playlistStates: seededPlaylists,
    round: 0,
    seenIds: new Set(initialIds),
    searchToken,
    rssPage: 1,
    discoveryByCategory,
    allCycleIdx: Math.floor(Math.random() * 5),
  });
  return cursor;
}

async function fetchFromCuratedRss(pageIndex = 0): Promise<ChristianShort[]> {
  return fetchCuratedRssWithAdapter(async (url) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GracaPlay/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.text();
  }, pageIndex);
}

function isYouTubeVideoPlayable(v: {
  snippet?: { liveBroadcastContent?: string; publishedAt?: string };
  contentDetails?: { duration?: string };
  status?: {
    embeddable?: boolean;
    privacyStatus?: string;
    publishAt?: string;
    uploadStatus?: string;
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
  };
}): { playable: boolean; durationSeconds: number | null } {
  const durationSeconds = parseIso8601DurationSeconds(v.contentDetails?.duration);
  const embeddable =
    v.status?.embeddable !== false &&
    v.status?.privacyStatus !== 'private' &&
    v.status?.privacyStatus !== 'unlisted';
  if (!embeddable) {
    return { playable: false, durationSeconds };
  }

  if (v.status?.uploadStatus && v.status.uploadStatus !== 'processed') {
    return { playable: false, durationSeconds };
  }

  const broadcast = v.snippet?.liveBroadcastContent;
  if (broadcast && broadcast !== 'none') {
    return { playable: false, durationSeconds };
  }

  const live = v.liveStreamingDetails;
  if (live) {
    const schedMs = live.scheduledStartTime ? Date.parse(live.scheduledStartTime) : NaN;
    if (Number.isFinite(schedMs) && schedMs > Date.now()) {
      return { playable: false, durationSeconds };
    }
    if (!live.actualStartTime || !live.actualEndTime) {
      return { playable: false, durationSeconds };
    }
  }

  const publishAtMs = v.status?.publishAt ? Date.parse(v.status.publishAt) : NaN;
  if (Number.isFinite(publishAtMs) && publishAtMs > Date.now()) {
    return { playable: false, durationSeconds };
  }

  const snippetPubMs = v.snippet?.publishedAt ? Date.parse(v.snippet.publishedAt) : NaN;
  if (Number.isFinite(snippetPubMs) && snippetPubMs > Date.now() + 60_000) {
    return { playable: false, durationSeconds };
  }

  if (durationSeconds === null || durationSeconds <= 0) {
    return { playable: false, durationSeconds };
  }

  return { playable: true, durationSeconds };
}

async function hydrateAndVerifyCandidates(
  apiKey: string,
  candidates: Map<string, CandidateVideo>,
  options?: { searchMode?: boolean }
): Promise<ChristianShort[]> {
  if (candidates.size === 0) return [];
  const searchMode = Boolean(options?.searchMode);

  const candidateIds = [...candidates.keys()];
  const videoMeta = new Map<
    string,
    {
      playable: boolean;
      durationSeconds: number | null;
      viewCount: number | null;
      fullDescription: string;
      publishedAt: string | null;
    }
  >();

  for (let i = 0; i < candidateIds.length; i += 50) {
    const chunk = candidateIds.slice(i, i + 50);
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet,contentDetails,statistics,status,liveStreamingDetails',
      id: chunk.join(','),
    });
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`,
        { signal: AbortSignal.timeout(9000) }
      );
      if (!res.ok) continue;

      const data = (await res.json()) as {
        items?: Array<{
          id: string;
          snippet?: {
            description?: string;
            liveBroadcastContent?: string;
            publishedAt?: string;
          };
          contentDetails?: { duration?: string };
          statistics?: { viewCount?: string };
          status?: {
            embeddable?: boolean;
            privacyStatus?: string;
            publishAt?: string;
            uploadStatus?: string;
          };
          liveStreamingDetails?: {
            scheduledStartTime?: string;
            actualStartTime?: string;
            actualEndTime?: string;
          };
        }>;
      };
      for (const v of data.items ?? []) {
        const check = isYouTubeVideoPlayable(v);
        videoMeta.set(v.id, {
          playable: check.playable,
          durationSeconds: check.durationSeconds,
          viewCount: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
          fullDescription: decodeXmlEntities(v.snippet?.description || ''),
          publishedAt: v.snippet?.publishedAt || null,
        });
      }
    } catch {
      // Unverified chunks are excluded below rather than crashing or letting premieres leak
    }
  }

  const verifiedShorts: ChristianShort[] = [];
  for (const c of candidates.values()) {
    const meta = videoMeta.get(c.id);
    // Strict API verification: never allow unverified, upcoming, or premiere candidates
    if (!meta || !meta.playable) continue;

    const fullDesc = meta.fullDescription || c.description;
    const effectivePublishedAt = meta.publishedAt || c.publishedAt;
    if (isUpcomingOrPremiereEntry(c.title, fullDesc, effectivePublishedAt)) {
      continue;
    }

    const classified = classifyShort(
      c.channelId,
      c.channelTitle,
      c.title,
      fullDesc,
      c.hintCategory,
      { searchMode }
    );
    if (!classified) continue;

    if (
      !isWithinCategoryDuration(
        classified.category,
        meta?.durationSeconds ?? null,
        c.title,
        c.channelId,
        searchMode
      )
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
        durationSeconds: meta?.durationSeconds ?? c.durationSeconds ?? null,
        viewCount: meta?.viewCount ?? null,
      })
    );
  }

  return verifiedShorts;
}

function isWithinCategoryDuration(
  category: ContentCategory,
  durationSeconds: number | null | undefined,
  title: string,
  channelId = '',
  searchMode = false
): boolean {
  if (durationSeconds == null) return true;
  if (searchMode) {
    // Live search allows broader durations across all categories (including full albums & 3h worship sets)
    if (category === 'louvores') return durationSeconds >= 20 && durationSeconds <= 14400;
    if (category === 'pregacoes') return durationSeconds >= 25 && durationSeconds <= 10800;
    if (category === 'biblia') return durationSeconds >= 15 && durationSeconds <= 10800;
    if (category === 'testemunhos') return durationSeconds >= 15 && durationSeconds <= 10800;
    if (category === 'feliz7play') return durationSeconds >= 20 && durationSeconds <= 10800;
    return true;
  }
  if (category === 'feliz7play') {
    return durationSeconds >= 30 && durationSeconds <= 10800;
  }
  if (category === 'louvores') {
    const isHinarioOrYouth =
      channelId === 'UCQhkLOO40bmTMeLcbspKW8A' ||
      channelId === 'UCIvT_5iKmxPksHRqv4g_GZQ' ||
      channelId === 'UCFTFFVStluyIusWi71Yc0sA' ||
      /\b(n(o|ô)vo hin[aá]rio|hin[aá]rio adventista|hino\s*\d+|cd\s*jovem|minist[eé]rio jovem)\b/i.test(
        title
      );
    const isColetanea =
      channelId === 'UCQhkLOO40bmTMeLcbspKW8A' ||
      /\b(adoradores|colet[aâ]nea|n(o|ô)vo hin[aá]rio|hin[aá]rio adventista|cd\s*jovem|minist[eé]rio jovem|1\s*hora\s+de)\b/i.test(
        title
      );
    const minSec = isHinarioOrYouth ? 30 : 75;
    const maxSec = isColetanea ? 7200 : 1200;
    return durationSeconds >= minSec && durationSeconds <= maxSec;
  }
  if (category === 'pregacoes') {
    return durationSeconds >= 45;
  }
  if (category === 'testemunhos') {
    return durationSeconds >= 15 && durationSeconds <= 3600;
  }
  if (category === 'biblia') {
    return durationSeconds <= 185;
  }
  return true;
}

function pickRotatedPlaylists(list: string[], count: number): string[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

async function fetchFromYoutubeApi(
  apiKey: string,
  advancePlaylists = false
): Promise<{
  items: ChristianShort[];
  evaluatedIds: Set<string>;
  playlistTokens: Record<string, string | null>;
}> {
  // Fetch initial catalog using playlistItems.list (1 quota unit per call)
  // across all curated verified channels + guaranteed Novo Hinário, CD Jovem, and Adoradores playlists,
  // rotating saved page tokens so reopening/refreshing continuously discovers deeper songs & hymns.
  const channels = [...ALL_CURATED_CHANNELS];
  for (let i = channels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [channels[i], channels[j]] = [channels[j], channels[i]];
  }

  const requestMeta: Array<{
    playlistId: string;
    hintCategory: ContentCategory;
    pageToken: string | null;
    maxResults?: number;
  }> = channels.map((spec) => {
    const suffix = spec.id.slice(2);
    const playlistId =
      spec.defaultCategory === 'biblia'
        ? `UUSH${suffix}`
        : advancePlaylists && Math.random() < 0.35
        ? `UUPV${suffix}`
        : spec.defaultCategory === 'pregacoes' || spec.defaultCategory === 'feliz7play'
        ? `UULF${suffix}`
        : `UU${suffix}`;
    const savedToken = persistentPlaylistTokens[playlistId] ?? null;
    const pageToken =
      savedToken && (advancePlaylists || Math.random() < 0.78) ? savedToken : null;
    return { hintCategory: spec.defaultCategory, playlistId, pageToken, maxResults: 25 };
  });

  // Always guarantee rich representation of Novo Hinário Adventista (all 600 hymns),
  // CD Jovem / Ministério Jovem (1996-2026), and Adoradores (1-5) on every catalog build.
  const specialBatch = [
    ...pickRotatedPlaylists(NOVO_HINARIO_PLAYLISTS, NOVO_HINARIO_PLAYLISTS.length),
    ...pickRotatedPlaylists(CD_JOVEM_PLAYLISTS, 7),
    ...pickRotatedPlaylists(ADORADORES_PLAYLISTS, 5),
  ];
  for (const playlistId of specialBatch) {
    const savedToken = persistentPlaylistTokens[playlistId] ?? null;
    const pageToken = savedToken && (advancePlaylists || Math.random() < 0.78) ? savedToken : null;
    requestMeta.push({ hintCategory: 'louvores', playlistId, pageToken, maxResults: 45 });
  }

  const responses = await Promise.allSettled(
    requestMeta.map((m) =>
      fetchChannelPlaylistPage(apiKey, m.playlistId, m.hintCategory, m.pageToken, m.maxResults ?? 25)
    )
  );
  const candidates = new Map<string, CandidateVideo>();
  const playlistTokens: Record<string, string | null> = {};
  let anyFulfilled = false;

  for (let idx = 0; idx < responses.length; idx++) {
    const res = responses[idx];
    const { playlistId } = requestMeta[idx];
    if (res.status !== 'fulfilled') continue;
    if (res.value.candidates.length > 0) anyFulfilled = true;
    playlistTokens[playlistId] = res.value.nextPageToken;
    persistentPlaylistTokens[playlistId] = res.value.nextPageToken;
    for (const c of res.value.candidates) {
      if (!candidates.has(c.id)) {
        candidates.set(c.id, c);
      }
    }
  }

  if (!anyFulfilled || candidates.size === 0) {
    throw new Error('YouTube API playlistItems returned no results');
  }

  const evaluatedIds = new Set(candidates.keys());
  const items = await hydrateAndVerifyCandidates(apiKey, candidates);
  return { items, evaluatedIds, playlistTokens };
}

async function fetchChannelPlaylistPage(
  apiKey: string,
  playlistId: string,
  hintCategory: ContentCategory,
  pageToken?: string | null,
  maxResults = 25
): Promise<{ candidates: CandidateVideo[]; nextPageToken: string | null }> {
  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: String(Math.min(50, Math.max(10, maxResults))),
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

function parseDisplayDurationToSeconds(raw: string | undefined): number | null {
  if (!raw) return null;
  const parts = raw
    .trim()
    .split(':')
    .map((p) => Number(p.replace(/[^\d]/g, '')));
  if (parts.some((n) => !Number.isFinite(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

async function fetchYoutubeWebSearch(
  apiKey: string,
  query: string,
  hintCategory?: ContentCategory,
  sortByDate = false,
  excludeIds?: Set<string>,
  searchMode = false
): Promise<ChristianShort[]> {
  try {
    const spParam = sortByDate ? '&sp=CAISAhAB' : '';
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${spParam}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
    if (!match) return [];

    type WebVideoRenderer = {
      videoId?: string;
      title?: { runs?: Array<{ text?: string }> };
      ownerText?: {
        runs?: Array<{
          text?: string;
          navigationEndpoint?: { browseEndpoint?: { browseId?: string } };
        }>;
      };
      lengthText?: { simpleText?: string };
      thumbnail?: { thumbnails?: Array<{ url?: string }> };
      detailedMetadataSnippets?: Array<{
        snippetText?: { runs?: Array<{ text?: string }> };
      }>;
      upcomingEventData?: unknown;
      publishedTimeText?: { simpleText?: string };
      badges?: Array<{ metadataBadgeRenderer?: { label?: string; style?: string } }>;
      thumbnailOverlays?: Array<{
        thumbnailOverlayTimeStatusRenderer?: {
          style?: string;
          text?: { simpleText?: string; runs?: Array<{ text?: string }> };
        };
      }>;
    };

    const data = JSON.parse(match[1]) as {
      contents?: {
        twoColumnSearchResultsRenderer?: {
          primaryContents?: {
            sectionListRenderer?: {
              contents?: Array<{
                itemSectionRenderer?: {
                  contents?: Array<{
                    videoRenderer?: WebVideoRenderer;
                    shelfRenderer?: {
                      content?: {
                        verticalListRenderer?: { items?: Array<{ videoRenderer?: WebVideoRenderer }> };
                        horizontalListRenderer?: { items?: Array<{ videoRenderer?: WebVideoRenderer }> };
                      };
                    };
                  }>;
                };
              }>;
            };
          };
        };
      };
    };

    const sections =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
        ?.contents ?? [];
    const candidates = new Map<string, CandidateVideo>();

    const extractedRenderers: WebVideoRenderer[] = [];
    for (const sec of sections) {
      for (const item of sec.itemSectionRenderer?.contents ?? []) {
        if (item.videoRenderer) extractedRenderers.push(item.videoRenderer);
        const shelfItems = item.shelfRenderer?.content;
        for (const sItem of shelfItems?.verticalListRenderer?.items ?? []) {
          if (sItem.videoRenderer) extractedRenderers.push(sItem.videoRenderer);
        }
        for (const hItem of shelfItems?.horizontalListRenderer?.items ?? []) {
          if (hItem.videoRenderer) extractedRenderers.push(hItem.videoRenderer);
        }
      }
    }

    for (const vr of extractedRenderers) {
        if (!vr?.videoId) continue;
        if (excludeIds?.has(vr.videoId)) continue;
        if (vr.upcomingEventData) continue;

        const badges = (vr.badges ?? []).map((b) =>
          (b.metadataBadgeRenderer?.label || '').toLowerCase()
        );
        if (
          badges.some(
            (b) =>
              b.includes('ao vivo') ||
              b === 'live' ||
              b.includes('estreia') ||
              b.includes('estr') ||
              b.includes('em breve') ||
              b.includes('premiere') ||
              b.includes('upcoming') ||
              b.includes('aguardando')
          )
        ) {
          continue;
        }

        const hasUpcomingOverlay = (vr.thumbnailOverlays ?? []).some((ov) => {
          const renderer = ov.thumbnailOverlayTimeStatusRenderer;
          if (!renderer) return false;
          if (renderer.style === 'UPCOMING' || renderer.style === 'LIVE') return true;
          const ovText = (
            renderer.text?.simpleText ||
            (renderer.text?.runs ?? []).map((r) => r.text || '').join('')
          ).toLowerCase();
          return (
            ovText.includes('estreia') ||
            ovText.includes('em breve') ||
            ovText.includes('ao vivo') ||
            ovText.includes('premiere') ||
            ovText.includes('upcoming')
          );
        });
        if (hasUpcomingOverlay) continue;

        const pubTimeText = (vr.publishedTimeText?.simpleText || '').toLowerCase();
        if (
          /\b(estreia|em breve|premieres|aguardando|scheduled)\b/i.test(pubTimeText)
        ) {
          continue;
        }

        const durationSeconds = parseDisplayDurationToSeconds(vr.lengthText?.simpleText);
        if (durationSeconds === null || durationSeconds <= 0) continue;

        const title = decodeXmlEntities(
          (vr.title?.runs ?? []).map((r) => r.text || '').join('')
        );
        if (!title) continue;

        const ownerRun = vr.ownerText?.runs?.[0];
        const channelTitle = decodeXmlEntities(ownerRun?.text || '');
        const channelId = ownerRun?.navigationEndpoint?.browseEndpoint?.browseId || '';
        const description = decodeXmlEntities(
          (vr.detailedMetadataSnippets?.[0]?.snippetText?.runs ?? [])
            .map((r) => r.text || '')
            .join('')
        );
        if (isUpcomingOrPremiereEntry(title, description, '')) {
          continue;
        }

        const thumbs = vr.thumbnail?.thumbnails ?? [];
        const thumbnailUrl = thumbs[thumbs.length - 1]?.url;

        candidates.set(vr.videoId, {
          id: vr.videoId,
          title,
          description,
          channelId,
          channelTitle,
          publishedAt: new Date().toISOString(),
          thumbnailUrl,
          hintCategory,
          durationSeconds,
        });
    }

    if (candidates.size === 0) return [];
    if (apiKey) {
      return hydrateAndVerifyCandidates(apiKey, candidates, { searchMode });
    }

    const fallback: ChristianShort[] = [];
    for (const c of candidates.values()) {
      const classified = classifyShort(
        c.channelId,
        c.channelTitle,
        c.title,
        c.description,
        c.hintCategory,
        { searchMode }
      );
      if (!classified) continue;
      if (
        !isWithinCategoryDuration(
          classified.category,
          c.durationSeconds,
          c.title,
          c.channelId,
          searchMode
        )
      ) {
        continue;
      }
      fallback.push(
        buildShortRecord({
          id: c.id,
          title: c.title,
          description: c.description,
          channelId: c.channelId,
          channelTitle: c.channelTitle,
          publishedAt: c.publishedAt,
          thumbnailUrl: c.thumbnailUrl,
          category: classified.category,
          doctrineScope: classified.doctrineScope,
          durationSeconds: c.durationSeconds ?? null,
        })
      );
    }
    return fallback;
  } catch {
    return [];
  }
}

function foldSearchText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const SEARCH_STOPWORDS = new Set([
  'a', 'o', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'para', 'por', 'com', 'sem', 'sobre', 'que', 'seu', 'sua', 'os', 'as',
]);

function hasQueryTokenInItem(item: ChristianShort, rawQuery: string): boolean {
  const tokens = foldSearchText(rawQuery.trim())
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !SEARCH_STOPWORDS.has(t));
  if (tokens.length === 0) return true;
  const meaningful = tokens.filter((t) => t.length >= 3);
  const checkTokens = meaningful.length > 0 ? meaningful : tokens;
  const haystack = foldSearchText(`${item.title} ${item.channelTitle} ${item.description}`);
  return checkTokens.some((tok) => haystack.includes(tok));
}

function rankSearchResults(
  items: ChristianShort[],
  rawQuery: string,
  preferredCategory?: ContentCategory
): ChristianShort[] {
  const foldedQuery = foldSearchText(rawQuery.trim());
  const tokens = foldedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return items;

  const relevantItems = items.filter((item) => hasQueryTokenInItem(item, rawQuery));

  const scored = relevantItems.map((item, idx) => {
    const fTitle = foldSearchText(item.title);
    const fChannel = foldSearchText(item.channelTitle);
    const fDesc = foldSearchText(item.description);
    let score = 0;

    if (fTitle.includes(foldedQuery)) score += 140;
    if (fChannel.includes(foldedQuery)) score += 95;
    if (fDesc.includes(foldedQuery)) score += 35;

    let titleTokenHits = 0;
    let totalTokenHits = 0;
    for (const tok of tokens) {
      if (fTitle.includes(tok)) {
        titleTokenHits += 1;
        totalTokenHits += 1;
        score += 32;
      } else if (fChannel.includes(tok)) {
        totalTokenHits += 1;
        score += 24;
      } else if (fDesc.includes(tok)) {
        totalTokenHits += 1;
        score += 10;
      }
    }
    if (titleTokenHits === tokens.length) score += 70;
    else if (totalTokenHits === tokens.length) score += 35;

    if (preferredCategory && item.category === preferredCategory) score += 30;
    if (ALL_CURATED_CHANNELS.some((ch) => ch.id === item.channelId)) score += 25;
    // Slight preference for direct YouTube hits early in list when scores tie
    score -= idx * 0.05;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.item);
}

const WEB_SEARCH_EXPANSIONS = [
  '',
  'completo',
  'oficial',
  'ao vivo',
  'letra',
  'estudo',
  'culto',
  'novo',
  'adventista',
  'testemunho',
];

async function fetchLiveYoutubeSearch(
  apiKey: string,
  rawQuery: string,
  rawCategory?: string,
  pageToken?: string | null,
  excludeIds?: Set<string>
): Promise<{ items: ChristianShort[]; nextPageToken: string | null }> {
  const cleanQuery = rawQuery.trim();
  if (!cleanQuery) return { items: [], nextPageToken: null };

  const validCat =
    rawCategory === 'pregacoes' ||
    rawCategory === 'biblia' ||
    rawCategory === 'louvores' ||
    rawCategory === 'testemunhos' ||
    rawCategory === 'feliz7play'
      ? rawCategory
      : undefined;

  let effectiveQuery = cleanQuery;
  if (validCat === 'pregacoes') {
    const hasAdvWord = /\b(adventista|iasd|novo tempo|arilton|bullon|ivan saraiva|odailson|rafael rossi|stanley arco|gilson brito|rodrigo silva)\b/i.test(
      cleanQuery
    );
    if (!hasAdvWord) {
      effectiveQuery = `${cleanQuery} adventista`;
    }
  } else if (
    validCat === 'biblia' &&
    !/\b(adventista|iasd|novo tempo|rodrigo silva|na mira|terceiro anjo|arilton)\b/i.test(
      cleanQuery
    )
  ) {
    effectiveQuery = `${cleanQuery} adventista`;
  } else if (
    validCat === 'feliz7play' &&
    !/\b(feliz7play|feliz7kids|nt kids|nosso amiguinho|adventista|novo tempo|camelo na agulha|defensores da b[ií]blia)\b/i.test(
      cleanQuery
    )
  ) {
    effectiveQuery = `${cleanQuery} feliz7play`;
  }

  // Handle web search continuation tokens for deep multi-page reach
  if (pageToken && pageToken.startsWith('web:')) {
    const step = Number(pageToken.slice(4)) || 1;
    const modifier = WEB_SEARCH_EXPANSIONS[(step - 1) % WEB_SEARCH_EXPANSIONS.length];
    const subQuery = modifier ? `${effectiveQuery} ${modifier}` : effectiveQuery;
    const items = await fetchYoutubeWebSearch(
      apiKey,
      subQuery,
      validCat,
      step % 3 === 0,
      excludeIds,
      true
    );
    const nextWebToken = step < WEB_SEARCH_EXPANSIONS.length ? `web:${step + 1}` : null;
    return { items: rankSearchResults(items, cleanQuery, validCat), nextPageToken: nextWebToken };
  }

  // Page 1 (or API continuation): run API search.list AND complementary zero-quota web searches
  // in parallel so search results have maximum reach across YouTube within app guidelines.
  const hasAppContextKeyword =
    /\b(deus|jesus|cristo|b[ií]bli|evangelho|gospel|louvor|adora[cç][aã]o|hino|hin[aá]rio|adoradores|cd\s*jovem|minist[eé]rio\s+jovem|adventista|iasd|novo\s+tempo|prega[cç][aã]o|serm[aã]o|culto|testemunho|milagre|ora[cç][aã]o|salmo|profecia|apocalipse|feliz7play|feliz7kids|nt\s*kids|harpa|arautos|novo\s+tom|daniel\s+l[uü]dtke|pedro\s+valen[cç]a|rodrigo\s+silva|ivan\s+saraiva|arilton|bull[oó]n|gabriel\s+guedes|anderson\s+freire|aline\s+barros|fernandinho|gabriela\s+rocha|isadora\s+pompeo|morada|fhop|casa\s+worship|diante\s+do\s+trono|davi\s+sacer|kemuel|mk\s+music|todah|musile)\b/i.test(
      cleanQuery
    );

  const webFanQueries: Array<{ q: string; hint?: ContentCategory; sortByDate: boolean }> = [];
  if (!pageToken) {
    if (validCat === 'louvores') {
      if (hasAppContextKeyword) {
        webFanQueries.push({ q: cleanQuery, hint: 'louvores', sortByDate: false });
      }
      webFanQueries.push({ q: `${cleanQuery} louvor gospel`, hint: 'louvores', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} louvor adventista`, hint: 'louvores', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} música cristã`, hint: 'louvores', sortByDate: false });
    } else if (validCat === 'testemunhos') {
      webFanQueries.push({ q: `${cleanQuery} testemunho cristão`, hint: 'testemunhos', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} testemunho conversão`, hint: 'testemunhos', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} testemunho`, hint: 'testemunhos', sortByDate: true });
    } else if (validCat === 'pregacoes') {
      webFanQueries.push({ q: `${cleanQuery} pregação adventista`, hint: 'pregacoes', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} sermão adventista`, hint: 'pregacoes', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} adventista`, hint: 'pregacoes', sortByDate: false });
    } else if (validCat === 'biblia') {
      webFanQueries.push({ q: `${cleanQuery} estudo bíblico adventista`, hint: 'biblia', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} bíblia adventista`, hint: 'biblia', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} rodrigo silva na mira`, hint: 'biblia', sortByDate: false });
    } else if (validCat === 'feliz7play') {
      webFanQueries.push({ q: `${cleanQuery} feliz7play`, hint: 'feliz7play', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} animação bíblica adventista`, hint: 'feliz7play', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} nt kids desenho bíblico`, hint: 'feliz7play', sortByDate: false });
    } else {
      // "Todos": Christian worship + Adventist + Testimonies (+ direct query when query already has app context)
      webFanQueries.push({ q: `${cleanQuery} louvor gospel`, hint: 'louvores', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} adventista`, hint: undefined, sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} testemunho cristão`, hint: 'testemunhos', sortByDate: false });
      if (hasAppContextKeyword) {
        webFanQueries.push({ q: cleanQuery, hint: undefined, sortByDate: false });
      } else {
        webFanQueries.push({ q: `${cleanQuery} música cristã`, hint: 'louvores', sortByDate: false });
      }
    }
  }

  const apiPromise = apiKey
    ? (async () => {
        const params = new URLSearchParams({
          key: apiKey,
          part: 'snippet',
          type: 'video',
          videoEmbeddable: 'true',
          safeSearch: 'strict',
          relevanceLanguage: 'pt',
          regionCode: 'BR',
          maxResults: '50',
          q: effectiveQuery,
        });
        if (pageToken) {
          params.set('pageToken', pageToken);
        }
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
          { signal: AbortSignal.timeout(9000) }
        );
        if (!res.ok) return null;
        return (await res.json()) as {
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
      })().catch(() => null)
    : Promise.resolve(null);

  const webPromises = Promise.allSettled(
    webFanQueries.map((wf) =>
      fetchYoutubeWebSearch(apiKey, wf.q, wf.hint, wf.sortByDate, excludeIds, true)
    )
  );

  const [apiData, webResults] = await Promise.all([apiPromise, webPromises]);
  const apiCandidates = new Map<string, CandidateVideo>();

  if (apiData) {
    for (const item of apiData.items ?? []) {
      const id = item.id?.videoId;
      const s = item.snippet;
      if (
        !id ||
        !s ||
        excludeIds?.has(id) ||
        s.liveBroadcastContent === 'live' ||
        s.liveBroadcastContent === 'upcoming'
      ) {
        continue;
      }
      apiCandidates.set(id, {
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
  }

  const verifiedApi =
    apiCandidates.size > 0
      ? await hydrateAndVerifyCandidates(apiKey, apiCandidates, { searchMode: true })
      : [];

  const merged = new Map<string, ChristianShort>();
  for (const item of verifiedApi) merged.set(item.id, item);
  for (const r of webResults) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      if (!merged.has(item.id)) merged.set(item.id, item);
    }
  }

  const nextToken = apiData?.nextPageToken || (merged.size > 0 ? 'web:2' : null);
  return {
    items: rankSearchResults([...merged.values()], cleanQuery, validCat),
    nextPageToken: nextToken,
  };
}

async function fetchCategoryDiscoveryPage(
  apiKey: string,
  targetCategory: ContentCategory,
  state: PaginationSessionState
): Promise<ChristianShort[]> {
  const queries = DISCOVERY_QUERIES_BY_CATEGORY[targetCategory];
  const initialIdx = globalDiscoveryOffsets[targetCategory] % queries.length;
  const cursorEntry = state.discoveryByCategory[targetCategory] ?? {
    queryIdx: initialIdx,
    pageToken: null,
  };
  state.discoveryByCategory[targetCategory] = cursorEntry;

  const queryIdx = cursorEntry.queryIdx;
  const query = queries[queryIdx % queries.length];
  const orderCycle: Array<'date' | 'relevance' | 'viewCount'> = ['date', 'relevance', 'viewCount'];
  const orderMode = orderCycle[queryIdx % orderCycle.length];
  const sortByDate = queryIdx % 2 === 0;

  if (apiKey) {
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet',
      type: 'video',
      videoEmbeddable: 'true',
      safeSearch: 'strict',
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      maxResults: '30',
      order: orderMode,
      q: query,
    });
    if (targetCategory === 'biblia') {
      params.set('videoDuration', 'short');
    }
    if (cursorEntry.pageToken) {
      params.set('pageToken', cursorEntry.pageToken);
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (res.ok) {
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

      if (data.nextPageToken) {
        cursorEntry.pageToken = data.nextPageToken;
      } else {
        cursorEntry.queryIdx += 1;
        cursorEntry.pageToken = null;
        globalDiscoveryOffsets[targetCategory] =
          (globalDiscoveryOffsets[targetCategory] + 1) % queries.length;
      }

      const candidates = new Map<string, CandidateVideo>();
      for (const item of data.items ?? []) {
        const id = item.id?.videoId;
        const s = item.snippet;
        if (!id || !s || s.liveBroadcastContent === 'live' || s.liveBroadcastContent === 'upcoming') {
          continue;
        }
        if (state.seenIds.has(id)) continue;
        candidates.set(id, {
          id,
          title: decodeXmlEntities(s.title || ''),
          description: decodeXmlEntities(s.description || ''),
          channelId: s.channelId || '',
          channelTitle: decodeXmlEntities(s.channelTitle || ''),
          publishedAt: s.publishedAt || new Date().toISOString(),
          thumbnailUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url,
          hintCategory: targetCategory,
        });
      }

      const verified = await hydrateAndVerifyCandidates(apiKey, candidates);
      return verified.filter((item) => item.category === targetCategory);
    }
  }

  // Advance query index and fall back to zero-quota YouTube web search
  cursorEntry.queryIdx += 1;
  cursorEntry.pageToken = null;
  globalDiscoveryOffsets[targetCategory] =
    (globalDiscoveryOffsets[targetCategory] + 1) % queries.length;
  const webFound = await fetchYoutubeWebSearch(
    apiKey,
    query,
    targetCategory,
    sortByDate,
    state.seenIds
  );
  return webFound.filter((item) => item.category === targetCategory);
}

async function fetchInitialDiscoveryExtras(
  apiKey: string,
  excludeIds: Set<string>
): Promise<ChristianShort[]> {
  const categories: ContentCategory[] = [
    'pregacoes',
    'biblia',
    'louvores',
    'testemunhos',
    'feliz7play',
  ];
  const tempState: PaginationSessionState = {
    createdAtMs: Date.now(),
    playlistStates: {},
    round: 0,
    seenIds: excludeIds,
    rssPage: 1,
    discoveryByCategory: {},
    allCycleIdx: 0,
  };

  const discoveryJobs: Array<{ cat: ContentCategory; query: string; sortByDate: boolean }> = [];
  for (const cat of categories) {
    const queries = DISCOVERY_QUERIES_BY_CATEGORY[cat];
    const extraCount = cat === 'testemunhos' ? 3 : 1;
    for (let k = 0; k < extraCount; k++) {
      const idx = globalDiscoveryOffsets[cat] % queries.length;
      globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % queries.length;
      discoveryJobs.push({
        cat,
        query: queries[idx],
        sortByDate: idx % 2 === 0,
      });
    }
  }

  const results = await Promise.allSettled(
    discoveryJobs.map((job) =>
      fetchYoutubeWebSearch(apiKey, job.query, job.cat, job.sortByDate, tempState.seenIds)
    )
  );

  const discovered: ChristianShort[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const targetCat = discoveryJobs[i].cat;
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      if (item.category === targetCat) {
        discovered.push(item);
      }
    }
  }
  return discovered;
}

export async function getCuratedChristianShorts(options: {
  category?: string;
  q?: string;
  forceRefresh?: boolean;
  excludeIds?: string[];
}): Promise<ShortsApiResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const apiKeyConfigured = apiKey.length > 0;
  const nowMs = Date.now();
  const trimmedQuery = (options.q || '').trim();
  const clientExcludeSet = new Set(options.excludeIds ?? []);

  let poolItems: ChristianShort[] = [];
  let sourceMode: 'youtube_api' | 'curated_rss' = 'curated_rss';
  let fetchedAt = new Date().toISOString();
  let seedPlaylistTokens: Record<string, string | null> = cachedCatalog?.playlistTokens ?? {};

  const cacheValid =
    !options.forceRefresh &&
    cachedCatalog !== null &&
    nowMs - cachedCatalog.fetchedAtMs < CACHE_TTL_MS;

  if (cacheValid && cachedCatalog) {
    poolItems = cachedCatalog.items;
    sourceMode = cachedCatalog.sourceMode;
    fetchedAt = cachedCatalog.fetchedAt;
  } else {
    if (apiKeyConfigured) {
      try {
        const [{ items: apiItems, evaluatedIds, playlistTokens }, rssItems] = await Promise.all([
          fetchFromYoutubeApi(apiKey, Boolean(options.forceRefresh)),
          fetchFromCuratedRss(0),
        ]);

        // Hydrate any extra RSS-discovered IDs through videos.list so upcoming premieres,
        // live streams, or out-of-range durations can never bypass API verification.
        const rssExtraCandidates = new Map<string, CandidateVideo>();
        for (const item of rssItems) {
          if (!evaluatedIds.has(item.id) && !rssExtraCandidates.has(item.id)) {
            rssExtraCandidates.set(item.id, {
              id: item.id,
              title: item.title,
              description: item.description,
              channelId: item.channelId,
              channelTitle: item.channelTitle,
              publishedAt: item.publishedAt,
              thumbnailUrl: item.thumbnailUrl,
              hintCategory: item.category,
            });
          }
        }
        const verifiedRssExtras =
          rssExtraCandidates.size > 0
            ? await hydrateAndVerifyCandidates(apiKey, rssExtraCandidates)
            : [];

        const combinedIds = new Set<string>([
          ...apiItems.map((i) => i.id),
          ...verifiedRssExtras.map((i) => i.id),
          ...(cachedCatalog?.items ?? []).map((i) => i.id),
        ]);
        const webDiscoveryExtras = await fetchInitialDiscoveryExtras(apiKey, combinedIds);

        // Merge new items with previously discovered catalog items (capped cleanly)
        // so refreshing grows variety instead of recycling only the same 25 latest uploads.
        const merged = new Map<string, ChristianShort>();
        for (const item of webDiscoveryExtras) merged.set(item.id, item);
        for (const item of apiItems) {
          if (!merged.has(item.id)) merged.set(item.id, item);
        }
        for (const item of verifiedRssExtras) {
          if (!merged.has(item.id)) merged.set(item.id, item);
        }
        if (cachedCatalog) {
          for (const item of cachedCatalog.items) {
            if (!merged.has(item.id)) merged.set(item.id, item);
          }
        }

        poolItems = [...merged.values()].slice(0, MAX_CACHED_CATALOG_ITEMS);
        seedPlaylistTokens = { ...seedPlaylistTokens, ...playlistTokens };
        sourceMode = 'youtube_api';
      } catch {
        const rssFallback = await fetchFromCuratedRss(0);
        if (rssFallback.length > 0) {
          const rssCandidates = new Map<string, CandidateVideo>(
            rssFallback.map((item) => [
              item.id,
              {
                id: item.id,
                title: item.title,
                description: item.description,
                channelId: item.channelId,
                channelTitle: item.channelTitle,
                publishedAt: item.publishedAt,
                thumbnailUrl: item.thumbnailUrl,
                hintCategory: item.category,
              },
            ])
          );
          const verifiedFallback = await hydrateAndVerifyCandidates(apiKey, rssCandidates);
          poolItems = verifiedFallback.length > 0 ? verifiedFallback : rssFallback;
          sourceMode = verifiedFallback.length > 0 ? 'youtube_api' : 'curated_rss';
        } else {
          poolItems = cachedCatalog?.items ?? [];
          sourceMode = cachedCatalog?.sourceMode ?? 'curated_rss';
        }
      }
    } else {
      const rssPage0 = await fetchFromCuratedRss(0);
      const webDiscoveryExtras = await fetchInitialDiscoveryExtras(
        '',
        new Set(rssPage0.map((i) => i.id))
      );
      const merged = new Map<string, ChristianShort>();
      for (const item of webDiscoveryExtras) merged.set(item.id, item);
      for (const item of rssPage0) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }
      poolItems = [...merged.values()].slice(0, MAX_CACHED_CATALOG_ITEMS);
      sourceMode = 'curated_rss';
    }

    fetchedAt = new Date().toISOString();
    cachedCatalog = {
      items: poolItems,
      sourceMode,
      fetchedAt,
      fetchedAtMs: nowMs,
      playlistTokens: seedPlaylistTokens,
    };
  }

  // On app reopen (with seen history) across ALL categories, pull deeper playlist pages
  // (sermons, Bible, louvores, testimonies, Feliz7Play) & fresh YouTube discovery batches
  // so reopening the app always brings unseen fresh videos to the top in every category.
  if (!trimmedQuery && clientExcludeSet.size > 0) {
    const cats: ContentCategory[] = [
      'pregacoes',
      'biblia',
      'louvores',
      'testemunhos',
      'feliz7play',
    ];
    const lowUnseenCats = cats.filter((c) => {
      const minNeeded = c === 'louvores' ? 45 : 24;
      return poolItems.filter((i) => i.category === c && !clientExcludeSet.has(i.id)).length < minNeeded;
    });
    // Guarantee at least 2 rotating categories pull fresh web discovery on every reopen
    const reopenDiscoveryCats = new Set<ContentCategory>(lowUnseenCats);
    const startRotate = Math.floor(Math.random() * cats.length);
    for (let k = 0; k < cats.length && reopenDiscoveryCats.size < 3; k++) {
      reopenDiscoveryCats.add(cats[(startRotate + k) % cats.length]);
    }
    const discoveryTargets = [...reopenDiscoveryCats];

    const reopenAdditions: ChristianShort[] = [];
    const reopenPlaylistPromises: Array<Promise<CandidateVideo[]>> = [];
    if (apiKeyConfigured) {
      const rotateTargets: Array<{ pid: string; hint: ContentCategory; token: string }> = [];
      const rotateSpecial = [
        ...pickRotatedPlaylists(NOVO_HINARIO_PLAYLISTS, 3),
        ...pickRotatedPlaylists(CD_JOVEM_PLAYLISTS, 4),
        ...pickRotatedPlaylists(ADORADORES_PLAYLISTS, 3),
      ];
      for (const pid of rotateSpecial) {
        const tok = persistentPlaylistTokens[pid];
        if (tok) rotateTargets.push({ pid, hint: 'louvores', token: tok });
      }
      // Also advance 1–2 curated channels per other category (pregacoes, biblia, testemunhos, feliz7play)
      for (const cat of ['pregacoes', 'biblia', 'testemunhos', 'feliz7play'] as ContentCategory[]) {
        const matchingChannels = ALL_CURATED_CHANNELS.filter(
          (ch) => ch.defaultCategory === cat || ch.allowInCategories.includes(cat)
        );
        const shuffledCh = pickRotatedPlaylists(
          matchingChannels.map((c) => c.id),
          3
        );
        let pickedForCat = 0;
        for (const chId of shuffledCh) {
          if (pickedForCat >= 2) break;
          const suffix = chId.slice(2);
          const candidatePids =
            cat === 'biblia'
              ? [`UUSH${suffix}`, `UU${suffix}`]
              : cat === 'pregacoes' || cat === 'feliz7play'
              ? [`UULF${suffix}`, `UU${suffix}`, `UUPV${suffix}`]
              : [`UU${suffix}`, `UUPV${suffix}`];
          for (const pid of candidatePids) {
            const tok = persistentPlaylistTokens[pid];
            if (tok) {
              rotateTargets.push({ pid, hint: cat, token: tok });
              pickedForCat += 1;
              break;
            }
          }
        }
      }

      for (const t of rotateTargets) {
        reopenPlaylistPromises.push(
          fetchChannelPlaylistPage(apiKey, t.pid, t.hint, t.token, 35).then((r) => {
            persistentPlaylistTokens[t.pid] = r.nextPageToken;
            seedPlaylistTokens[t.pid] = r.nextPageToken;
            return r.candidates;
          })
        );
      }
    }

    if (discoveryTargets.length > 0 || reopenPlaylistPromises.length > 0) {
      try {
        const [playlistRes, discoveryRes] = await Promise.all([
          reopenPlaylistPromises.length > 0
            ? Promise.allSettled(reopenPlaylistPromises)
            : Promise.resolve([]),
          discoveryTargets.length > 0
            ? Promise.allSettled(
                discoveryTargets.map((cat) => {
                  const queries = DISCOVERY_QUERIES_BY_CATEGORY[cat];
                  const idx = globalDiscoveryOffsets[cat] % queries.length;
                  globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % queries.length;
                  return fetchYoutubeWebSearch(
                    apiKey,
                    queries[idx],
                    cat,
                    idx % 2 === 0,
                    new Set([...clientExcludeSet, ...poolItems.map((i) => i.id)])
                  );
                })
              )
            : Promise.resolve([]),
        ]);

        const extraCandidates = new Map<string, CandidateVideo>();
        const existingIds = new Set(poolItems.map((i) => i.id));
        for (const r of playlistRes) {
          if (r.status !== 'fulfilled') continue;
          for (const c of r.value) {
            if (!existingIds.has(c.id) && !clientExcludeSet.has(c.id) && !extraCandidates.has(c.id)) {
              extraCandidates.set(c.id, c);
            }
          }
        }
        const hydratedPlaylists =
          apiKeyConfigured && extraCandidates.size > 0
            ? await hydrateAndVerifyCandidates(apiKey, extraCandidates)
            : [];

        for (const item of hydratedPlaylists) {
          if (!existingIds.has(item.id)) {
            existingIds.add(item.id);
            reopenAdditions.push(item);
          }
        }
        for (let i = 0; i < discoveryRes.length; i++) {
          const r = discoveryRes[i];
          const targetCat = discoveryTargets[i];
          if (r.status !== 'fulfilled') continue;
          for (const item of r.value) {
            if (item.category === targetCat && !existingIds.has(item.id)) {
              existingIds.add(item.id);
              reopenAdditions.push(item);
            }
          }
        }

        if (reopenAdditions.length > 0 && cachedCatalog) {
          poolItems = [...reopenAdditions, ...poolItems].slice(0, MAX_CACHED_CATALOG_ITEMS);
          cachedCatalog.items = poolItems;
          cachedCatalog.playlistTokens = seedPlaylistTokens;
        }
      } catch {
        // Keep existing pool on transient discovery errors
      }
    }

    const freshIds = new Set(reopenAdditions.map((i) => i.id));
    const freshUnseen = reopenAdditions.filter((item) => !clientExcludeSet.has(item.id));
    const olderUnseen = poolItems.filter(
      (item) => !clientExcludeSet.has(item.id) && !freshIds.has(item.id)
    );
    const seenPool = poolItems.filter((item) => clientExcludeSet.has(item.id));
    poolItems = [
      ...buildDiverseFeed(freshUnseen, true),
      ...buildDiverseFeed(olderUnseen, true),
      ...buildDiverseFeed(seenPool, true),
    ];
  }

  // Always vary the opening order across categories and channels on every entry,
  // and place unseen videos ahead of anything the user already watched.
  const baseItems =
    !trimmedQuery && clientExcludeSet.size > 0
      ? poolItems
      : [
          ...buildDiverseFeed(
            poolItems.filter((item) => !clientExcludeSet.has(item.id)),
            true
          ),
          ...buildDiverseFeed(
            poolItems.filter((item) => clientExcludeSet.has(item.id)),
            true
          ),
        ];

  // If user searches with a query, query YouTube live (API search.list + multi-angle web search)
  let searchToken: string | null = null;
  let combinedItems = baseItems;
  if (trimmedQuery.length >= 2) {
    try {
      const liveSearch = await fetchLiveYoutubeSearch(
        apiKey,
        trimmedQuery,
        options.category,
        null,
        clientExcludeSet
      );
      searchToken = liveSearch.nextPageToken;
      const liveCollected = [...liveSearch.items];
      const validCat =
        options.category === 'pregacoes' ||
        options.category === 'biblia' ||
        options.category === 'louvores' ||
        options.category === 'testemunhos' ||
        options.category === 'feliz7play'
          ? options.category
          : null;
      const catHits = validCat
        ? liveCollected.filter((i) => i.category === validCat).length
        : liveCollected.length;

      if (catHits < 20 && searchToken) {
        const secondPage = await fetchLiveYoutubeSearch(
          apiKey,
          trimmedQuery,
          options.category,
          searchToken,
          clientExcludeSet
        );
        searchToken = secondPage.nextPageToken;
        liveCollected.push(...secondPage.items);
      }

      if (liveCollected.length > 0) {
        const merged = new Map<string, ChristianShort>();
        for (const item of liveCollected) merged.set(item.id, item);
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
    searchToken,
    seedPlaylistTokens
  );

  // When searching live on YouTube, merge live YouTube hits + accent-folded token catalog matches,
  // ranked by direct relevance to the user's query (not scrambled by channel publish date).
  if (trimmedQuery.length >= 2) {
    const validCategories = new Set([
      'all',
      'pregacoes',
      'biblia',
      'louvores',
      'testemunhos',
      'feliz7play',
    ]);
    const category =
      options.category && validCategories.has(options.category) ? options.category : 'all';
    const queryTokens = foldSearchText(trimmedQuery).split(/\s+/).filter(Boolean);
    const matchedCached = baseItems.filter((item) => {
      const haystack = foldSearchText(
        `${item.title} ${item.channelTitle} ${item.description} ${item.categoryLabel}`
      );
      return queryTokens.every((tok) => haystack.includes(tok));
    });

    const baseIdSet = new Set(baseItems.map((b) => b.id));
    const mergedSearch = new Map<string, ChristianShort>();
    for (const item of combinedItems) {
      if (!baseIdSet.has(item.id)) {
        mergedSearch.set(item.id, item);
      }
    }
    for (const item of matchedCached) {
      if (!mergedSearch.has(item.id)) mergedSearch.set(item.id, item);
    }

    const validPrefCat =
      category === 'pregacoes' ||
      category === 'biblia' ||
      category === 'louvores' ||
      category === 'testemunhos' ||
      category === 'feliz7play'
        ? (category as ContentCategory)
        : undefined;
    const orderedSearch = deduplicateShorts(
      rankSearchResults([...mergedSearch.values()], trimmedQuery, validPrefCat),
      { allowSameSongVariants: true }
    );
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      biblia: 0,
      louvores: 0,
      testemunhos: 0,
      feliz7play: 0,
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
    options.category === 'testemunhos' ||
    options.category === 'feliz7play'
      ? options.category
      : undefined;
  const trimmedQuery = (options.q || '').trim();

  let cursor = options.cursor?.trim() || '';
  let state = cursor ? paginationSessions.get(cursor) : undefined;
  if (!state) {
    cursor = createPaginationCursor(
      options.excludeIds ?? [],
      null,
      cachedCatalog?.playlistTokens ?? {}
    );
    state = paginationSessions.get(cursor)!;
  }
  for (const id of options.excludeIds ?? []) {
    state.seenIds.add(id);
  }

  // Paginated live YouTube search when query is active
  if (trimmedQuery.length >= 2) {
    if (!state.searchToken) {
      return formatFilteredResponse(
        [],
        apiKeyConfigured ? 'youtube_api' : 'curated_rss',
        apiKeyConfigured,
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
      state.searchToken,
      state.seenIds
    );
    state.searchToken = page.nextPageToken;

    const fresh = page.items.filter((item) => {
      if (state!.seenIds.has(item.id)) return false;
      if (validCat && item.category !== validCat) return false;
      state!.seenIds.add(item.id);
      return true;
    });

    const orderedPage = deduplicateShorts(
      rankSearchResults(fresh, trimmedQuery, validCat),
      { allowSameSongVariants: true }
    );
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      biblia: 0,
      louvores: 0,
      testemunhos: 0,
      feliz7play: 0,
    };
    for (const item of orderedPage) counts[item.category] += 1;

    return {
      items: orderedPage,
      sourceMode: apiKeyConfigured ? 'youtube_api' : 'curated_rss',
      apiKeyConfigured,
      fetchedAt,
      category: options.category || 'all',
      totalBeforeCategoryFilter: orderedPage.length,
      categoryCounts: counts,
      hasMore: Boolean(state.searchToken),
      nextCursor: state.searchToken ? cursor : null,
    };
  }

  const ALL_DISCOVERY_ROTATION: ContentCategory[] = [
    'pregacoes',
    'louvores',
    'biblia',
    'testemunhos',
    'feliz7play',
  ];

  // Unlimited YouTube pagination via playlistItems.list + YouTube-wide discovery for EVERY category
  if (apiKeyConfigured) {
    const eligibleChannels = validCat
      ? ALL_CURATED_CHANNELS.filter(
          (ch) => ch.defaultCategory === validCat || ch.allowInCategories.includes(validCat)
        )
      : ALL_CURATED_CHANNELS;

    const getPlaylistIdForChannel = (ch: (typeof ALL_CURATED_CHANNELS)[number]): string => {
      const suffix = ch.id.slice(2);
      const hint = validCat || ch.defaultCategory;
      if (hint === 'pregacoes' || hint === 'feliz7play') return `UULF${suffix}`;
      if (hint === 'biblia' && ch.defaultCategory === 'biblia') return `UUSH${suffix}`;
      return `UU${suffix}`;
    };

    const playlistPool: Array<{ playlistId: string; hintCategory: ContentCategory }> = [];
    if (!validCat || validCat === 'louvores') {
      // Interleave Novo Hinário, CD Jovem, Adoradores & general channels in playlistPool
      const maxSpecial = Math.max(
        NOVO_HINARIO_PLAYLISTS.length,
        CD_JOVEM_PLAYLISTS.length,
        ADORADORES_PLAYLISTS.length
      );
      for (let i = 0; i < maxSpecial; i++) {
        if (i < NOVO_HINARIO_PLAYLISTS.length) {
          playlistPool.push({ playlistId: NOVO_HINARIO_PLAYLISTS[i], hintCategory: 'louvores' });
        }
        if (i < CD_JOVEM_PLAYLISTS.length) {
          playlistPool.push({ playlistId: CD_JOVEM_PLAYLISTS[i], hintCategory: 'louvores' });
        }
        if (i < ADORADORES_PLAYLISTS.length) {
          playlistPool.push({ playlistId: ADORADORES_PLAYLISTS[i], hintCategory: 'louvores' });
        }
      }
    }
    for (const ch of eligibleChannels) {
      playlistPool.push({
        playlistId: getPlaylistIdForChannel(ch),
        hintCategory: validCat || ch.defaultCategory,
      });
    }

    const collected: ChristianShort[] = [];
    const maxAttempts = validCat ? 2 : 2;
    const targetMin = validCat === 'pregacoes' || validCat === 'testemunhos' ? 12 : 18;

    for (let attempt = 0; attempt < maxAttempts && collected.length < targetMin; attempt++) {
      const batchTargets: Array<{
        playlistId: string;
        hintCategory: ContentCategory;
      }> = [];

      const total = playlistPool.length;
      const batchSize = Math.min(10, total);
      for (let i = 0; i < total && batchTargets.length < batchSize; i++) {
        const entry = playlistPool[(state.round * batchSize + i) % total];
        const pState = state.playlistStates[entry.playlistId];
        if (pState?.done) continue;
        batchTargets.push(entry);
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
        if (validCat && item.category !== validCat) continue;
        if (!state.seenIds.has(item.id)) {
          state.seenIds.add(item.id);
          collected.push(item);
        }
      }
    }

    let anyPlaylistRemaining = false;
    for (const ch of eligibleChannels) {
      const pid = getPlaylistIdForChannel(ch);
      if (!state.playlistStates[pid]?.done) {
        anyPlaylistRemaining = true;
        break;
      }
    }

    // Run unlimited YouTube-wide discovery for EVERY category (always keeping strict category rules)
    const shouldSearchYoutube =
      collected.length < 12 || !anyPlaylistRemaining || state.round % 2 === 1;
    if (shouldSearchYoutube) {
      const searchTries = collected.length === 0 ? 3 : collected.length < 6 ? 2 : 1;
      for (let sTry = 0; sTry < searchTries && collected.length < 18; sTry++) {
        const discoveryCat =
          validCat ??
          ALL_DISCOVERY_ROTATION[state.allCycleIdx++ % ALL_DISCOVERY_ROTATION.length];
        const discovered = await fetchCategoryDiscoveryPage(apiKey, discoveryCat, state);
        for (const item of discovered) {
          if (validCat && item.category !== validCat) continue;
          if (!state.seenIds.has(item.id)) {
            state.seenIds.add(item.id);
            collected.push(item);
          }
        }
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
      true,
      cursor
    );
  }

  // RSS archive fallback pagination + unlimited YouTube web discovery for EVERY category
  const rssPage = state.rssPage;
  state.rssPage += 1;
  const fresh: ChristianShort[] = [];
  if (rssPage <= 2) {
    const rssItems = await fetchFromCuratedRss(rssPage);
    for (const item of rssItems) {
      if (validCat && item.category !== validCat) continue;
      if (state.seenIds.has(item.id)) continue;
      state.seenIds.add(item.id);
      fresh.push(item);
    }
  }
  if (fresh.length < 10 || rssPage > 2) {
    const tries = fresh.length === 0 ? 2 : 1;
    for (let t = 0; t < tries && fresh.length < 16; t++) {
      const discoveryCat =
        validCat ??
        ALL_DISCOVERY_ROTATION[state.allCycleIdx++ % ALL_DISCOVERY_ROTATION.length];
      const discovered = await fetchCategoryDiscoveryPage('', discoveryCat, state);
      for (const item of discovered) {
        if (validCat && item.category !== validCat) continue;
        if (state.seenIds.has(item.id)) continue;
        state.seenIds.add(item.id);
        fresh.push(item);
      }
    }
  }
  const diverse = buildDiverseFeed(fresh, true);

  return formatFilteredResponse(
    diverse,
    'curated_rss',
    false,
    fetchedAt,
    options.category,
    '',
    true,
    cursor
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
        part: 'snippet,contentDetails,statistics,status,liveStreamingDetails',
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
            liveBroadcastContent?: string;
            thumbnails?: { high?: { url?: string } };
          };
          contentDetails?: { duration?: string };
          statistics?: { viewCount?: string };
          status?: {
            embeddable?: boolean;
            privacyStatus?: string;
            publishAt?: string;
            uploadStatus?: string;
          };
          liveStreamingDetails?: {
            scheduledStartTime?: string;
            actualStartTime?: string;
            actualEndTime?: string;
          };
        }>;
      };
      const v = data.items?.[0];
      if (!v || !v.snippet) return null;
      const check = isYouTubeVideoPlayable(v);
      if (!check.playable) return null;
      const pubAt = v.snippet.publishedAt || new Date().toISOString();
      if (isUpcomingOrPremiereEntry(v.snippet.title || '', v.snippet.description || '', pubAt)) {
        return null;
      }

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
        publishedAt: pubAt,
        thumbnailUrl: v.snippet.thumbnails?.high?.url,
        category: classified.category,
        doctrineScope: classified.doctrineScope,
        durationSeconds: check.durationSeconds,
        viewCount: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
      });
    }
    return null;
    } catch {
      return null;
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
    if (isUpcomingOrPremiereEntry(title, '', '')) return null;
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
