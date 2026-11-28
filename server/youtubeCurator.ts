import crypto from 'node:crypto';
import type {
  ChristianShort,
  ContentCategory,
  ShortsApiResponse,
} from '../src/types/shorts.ts';
import {
  ALL_CURATED_CHANNELS,
  buildDiverseFeed,
  buildTieredDiverseFeed,
  buildShortRecord,
  classifyShort,
  createSeededRng,
  decodeXmlEntities,
  deduplicateShorts,
  fetchCuratedRssWithAdapter,
  formatFilteredResponse,
  getDiversityActorKey,
  getSaoPauloDateInfo,
  isEligibleSabbathSchoolShort,
  isNovoHinarioAdventistaItem,
  isSearchSuggestionSafe,
  isUpcomingOrPremiereEntry,
  normalizeContentCategory,
  parseIso8601DurationSeconds,
} from '../src/shared/curatorCore.ts';

const CACHE_TTL_MS = 15 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 3 * 60 * 1000;
const SUGGEST_CACHE_TTL_MS = 5 * 60 * 1000;
const CURSOR_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_CURSORS = 60;

const DISCOVERY_QUERIES_BY_CATEGORY: Record<ContentCategory, string[]> = {
  pregacoes: [
    'pregação adventista 2026 culto',
    'estudo bíblico adventista 2026',
    'sermão adventista novo tempo 2026',
    'na mira da verdade 2026',
    'culto adventista recente sábado',
    'rodrigo silva arqueologia bíblica',
    'pregação adventista culto',
    'sermão adventista completo',
    'arilton oliveira estudo bíblico',
    'novo tempo apocalipse profecia',
    'culto divino adventista pregação',
    'semana de oração adventista pregação',
    'terceiro anjo profecias bíblicas',
    'pr alejandro bullon pregação',
    'pr arilton oliveira pregação',
    'pr ivan saraiva pregação',
    'pr odailson fonseca pregação',
    'pr rafael rossi pregação',
    'pr gilson brito pregação',
    'pr kleber gonçalves pregação',
    'pr luís gonçalves evangelismo pregação',
    'pr stanley arco pregação adventista',
    'michelson borges bíblia criação',
    'daniel apocalipse adventista profecia',
    'sábado na bíblia adventista',
    'leandro quadros resposta bíblica',
    'unasp igreja culto pregação adventista',
    'mensagem adventista sábado culto',
    'pr rafael santos pregação adventista',
    'pr michelson borges pregação adventista',
    'novo tempo pregação sábado adventista',
    'pr erton köhler sermão adventista',
    'pr gustavo marques pregação adventista',
    'meditação pôr do sol adventista mensagem',
    'santuário na bíblia adventista',
    'evidências bíblicas rodrigo silva',
    'evangelismo adventista colheita pregação',
    'igreja adventista culto jovem pregação',
    'pastor adventista mensagem bíblica culto',
    'pr henrique gonçalves pregação adventista',
    'pr lucas alves pregação adventista',
    'pr marcelo cardoso pregação adventista',
    'pr amilton menezes sermão adventista',
    'pr josé carlos lima pregação adventista',
    'volta de jesus profecia adventista',
    'salmo 91 reflexão adventista',
    'parábolas de jesus estudo adventista',
  ],
  escola_sabatina: [
    'pr dudu batista lição escola sabatina adultos 2026',
    'pr dudu batista lição escola sabatina jovens 2026',
    'pr diego trindade lição jovem escola sabatina 2026',
    'pr samuel camilo estudo da lição escola sabatina 2026',
    'pr stina lições da bíblia rádio novo tempo 2026',
    'pr arilton oliveira resumo da lição escola sabatina',
    'pr lucio bergamo lição escola sabatina 2026',
    'pr helio carnassale safeliz escola sabatina 2026',
    'pr paulo dresch escola sabatina adventista 2026',
    'pr samuel ramos escola sabatina adventista 2026',
    'pastor adventista lição escola sabatina adultos hoje',
    'pastor adventista lição jovens escola sabatina hoje',
  ],
  louvores: [
    'lançamento gospel 2026 clipe oficial',
    'louvor adventista 2026 novo tempo',
    'cd jovem 2026 ministério jovem adventista',
    'adoradores 5 gravadora novo tempo',
    'novo hinário adventista oficial',
    'novo hinário adventista hino letra',
    'coletânea adoradores novo tempo',
    'adoradores 4 gravadora novo tempo',
    'cd jovem adventista ministério jovem',
    'cd jovem 2025 venha o teu reino ministério jovem',
    'cd jovem menos um adventista',
    'louvor gospel lançamento clipe oficial',
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
    'eli soares louvor ao vivo oficial',
    'gabriel guedes clipe oficial louvor',
    'julliany souza louvor ao vivo',
    'kemuel louvor oficial',
    'leonardo gonçalves música oficial',
  ],
  testemunhos: [
    'testemunho cristão 2026 conversão',
    'testemunho novo tempo 2026 conversão',
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
    'testemunho novo tempo conversão',
    'batismo testemunho de fé cristão',
    'testemunho casamento restaurado por deus',
    'testemunho cura depressão ansiedade jesus',
    'testemunho ex bandido convertido jesus',
    'testemunho livramento de morte milagre deus',
    'testemunho jovem cristão conversão',
    'testemunho missionário milagre deus',
    'revista novo tempo testemunho real',
    'está escrito novo tempo testemunho',
    'testemunho ex espirita umbanda convertido jesus',
    'testemunho médico cura milagre fé em jesus',
    'testemunho mãe oração filho convertido',
    'testemunho superação câncer milagre deus',
    'história de fé e superação cristã',
    'testemunho igreja evangelho pleno conversão',
    'como deus respondeu minha oração testemunho',
    'testemunho transformação de vida cristo',
    'meu encontro com cristo testemunho',
    'testemunho guarda do sábado adventista',
    'testemunho dízimo fidelidade milagre deus',
    'testemunho prisão conversão jesus cristo',
  ],
  feliz7play: [
    'feliz7play lançamento 2026',
    'feliz7play episódio novo 2025 2026',
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
    'feliz7play lançamento episódio novo',
    'feliz7play filme completo cristão',
    'feliz7play curta metragem adventista',
    'turma do nosso amiguinho aventura bíblica',
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
  'PLnjYWXTXSkDpfADeUa3LJkhdzzXwsqD_P', // Adoradores 5
  'PLnjYWXTXSkDr-jo4daf3ZOkzccvMxsrb1', // Adoradores 5 Congregacional
  'PLnjYWXTXSkDrri7WFuBCYB5Ljo9uhbOUG', // Adoradores 4 Ao Vivo
  'PLnjYWXTXSkDqUHHAprAtUaoj-u_cOO_iq', // Adoradores 4 Congregacional
  'PLGd1LrnOTfcu_5cTv_hXG2NhMb1CfULoK', // Adoradores Novo Tempo - Coletânea Completa
  'PLyTP3IYISkzDLs4oQg6GFBFpPa6HyByZb', // ADORADORES 1, 2, 3, 4 e 5
  'PLpcvYkqB-HJEcQ1SbmDoi8NQ5wnD-yQqz', // Adoradores 3 | Gravadora Novo Tempo
  'PLyTP3IYISkzDFW5GQowKB2HPyBTlAmMDU', // Adoradores 3 - Português (Congregacional)
  'PLpcvYkqB-HJE78QiaOqlmjK4HH_AiL78j', // Adoradores 2 | Gravadora Novo Tempo
  'PLyTP3IYISkzC-3rY1yHEZJttVW81XsgfT', // Adoradores 2 - Português (Congregacional)
  'PLpcvYkqB-HJFgYQEjkdxBPpzQ6Xk5s8nr', // Adoradores 1 | Gravadora Novo Tempo
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

const MAX_CACHED_CATALOG_ITEMS = 5000;

let cachedCatalog: {
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  fetchedAt: string;
  fetchedAtMs: number;
  playlistTokens: Record<string, string | null>;
} | null = null;
let inFlightCatalogPromise: Promise<{
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  fetchedAt: string;
  playlistTokens: Record<string, string | null>;
}> | null = null;
let lastReopenReplenishAtMs = 0;
let lastApiSearchDiscoveryAtMs = 0;
let depthEnrichmentStarted = false;
let youtubeApiBlockedUntilMs = 0;

function isYoutubeApiUsable(apiKey: string): boolean {
  return Boolean(apiKey) && Date.now() >= youtubeApiBlockedUntilMs;
}

function markYoutubeApiHttpError(status: number, bodyText = ''): void {
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 429 ||
    /quotaExceeded|dailyLimitExceeded|keyInvalid|forbidden/i.test(bodyText)
  ) {
    youtubeApiBlockedUntilMs = Date.now() + 10 * 60 * 1000;
  }
}

// Persistent server-side rotation cursors so new sessions and refreshes dig deeper
// into YouTube rather than returning the exact same page-1 results every time.
const persistentPlaylistTokens: Record<string, string | null> = {};
const exhaustedPlaylistIds = new Set<string>();
const globalDiscoveryOffsets: Record<ContentCategory, number> = {
  pregacoes: Math.floor(Math.random() * DISCOVERY_QUERIES_BY_CATEGORY.pregacoes.length),
  escola_sabatina: 0,
  louvores: Math.floor(Math.random() * DISCOVERY_QUERIES_BY_CATEGORY.louvores.length),
  testemunhos: Math.floor(Math.random() * DISCOVERY_QUERIES_BY_CATEGORY.testemunhos.length),
  feliz7play: Math.floor(Math.random() * DISCOVERY_QUERIES_BY_CATEGORY.feliz7play.length),
};

const persistentDiscoveryCursors: Record<ContentCategory, CategoryDiscoveryCursor> = {
  pregacoes: { queryIdx: globalDiscoveryOffsets.pregacoes, pageToken: null },
  escola_sabatina: { queryIdx: 0, pageToken: null },
  louvores: { queryIdx: globalDiscoveryOffsets.louvores, pageToken: null },
  testemunhos: { queryIdx: globalDiscoveryOffsets.testemunhos, pageToken: null },
  feliz7play: { queryIdx: globalDiscoveryOffsets.feliz7play, pageToken: null },
};

function getDiscoveryQueriesForCategory(category: ContentCategory): string[] {
  if (category !== 'escola_sabatina') {
    return DISCOVERY_QUERIES_BY_CATEGORY[category];
  }
  const today = getSaoPauloDateInfo();
  const dd = String(today.day).padStart(2, '0');
  const mm = String(today.month).padStart(2, '0');
  const yyyy = String(today.year);
  const wd = today.weekdaySearchPt;
  const mes = today.monthNamePt;
  const extraStudyHint =
    today.weekdayIdx === 5
      ? [`estudo adicional ${wd} ${dd} de ${mes} licoes da biblia`]
      : [];

  return [
    `pr dudu batista ${wd} ${dd}/${mm}/${yyyy}`,
    `pr diego trindade licao jovem ${wd} ${dd}/${mm}`,
    `pr samuel camilo ${wd} ${dd} de ${mes}`,
    `pr stina licoes da biblia ${wd} ${dd}`,
    `pr arilton licao ${wd} ${dd}/${mm}`,
    `pr lucio bergamo licao ${wd}`,
    `safeliz pr helio carnassale ${wd} ${dd}.${mm}`,
    `pr paulo dresch escola sabatina ${wd} ${dd}/${mm}`,
    `pr samuel ramos escola sabatina ${wd} ${dd}/${mm}`,
    `pastor escola sabatina ${wd} ${dd}/${mm}/${yyyy}`,
    `pr escola sabatina ${dd}/${mm}/${yyyy}`,
    `pastor licao jovens ${wd} ${dd}/${mm}`,
    ...extraStudyHint,
    `pastor escola sabatina ${wd} feira ${dd} de ${mes} ${yyyy}`,
    `pr dudu batista licao adultos ${dd} de ${mes}`,
    `pastor comentario licao escola sabatina ${wd} ${dd}/${mm}`,
  ];
}

const UPCOMING_WATCH_TRUE_TTL_MS = 15 * 60 * 1000;
const UPCOMING_WATCH_FALSE_TTL_MS = 60 * 60 * 1000;
const MAX_UPCOMING_WATCH_CACHE_SIZE = 3000;
const upcomingWatchCheckCache = new Map<
  string,
  { upcoming: boolean; checkedAtMs: number }
>();
const inFlightWatchChecks = new Map<string, Promise<boolean>>();

function isCurrentDayEligibleItem(item: ChristianShort): boolean {
  if (isUpcomingOrPremiereEntry(item.title, item.description, item.publishedAt)) {
    return false;
  }
  const watchEntry = upcomingWatchCheckCache.get(item.id);
  if (
    watchEntry &&
    watchEntry.upcoming &&
    Date.now() - watchEntry.checkedAtMs < UPCOMING_WATCH_TRUE_TTL_MS
  ) {
    return false;
  }
  return (
    item.category !== 'escola_sabatina' ||
    isEligibleSabbathSchoolShort({
      title: item.title,
      description: item.description,
      channelId: item.channelId,
      channelTitle: item.channelTitle,
      publishedAt: item.publishedAt,
    })
  );
}

function getFreshWatchUpcomingCached(videoId: string): boolean | null {
  const entry = upcomingWatchCheckCache.get(videoId);
  if (!entry) return null;
  const ttl = entry.upcoming ? UPCOMING_WATCH_TRUE_TTL_MS : UPCOMING_WATCH_FALSE_TTL_MS;
  if (Date.now() - entry.checkedAtMs >= ttl) {
    upcomingWatchCheckCache.delete(videoId);
    return null;
  }
  return entry.upcoming;
}

async function isWatchPageUpcomingPremiere(videoId: string): Promise<boolean> {
  const cached = getFreshWatchUpcomingCached(videoId);
  if (cached !== null) return cached;

  const existingPromise = inFlightWatchChecks.get(videoId);
  if (existingPromise) return existingPromise;

  const checkPromise = (async () => {
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GracaPlay/1.0)',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return false;
      const html = await res.text();
      const upcoming =
        /"isUpcoming"\s*:\s*true/i.test(html) ||
        /"status"\s*:\s*"LIVE_STREAM_OFFLINE"/i.test(html) ||
        /"liveBroadcastContent"\s*:\s*"(?:upcoming|live)"/i.test(html) ||
        /"lengthSeconds"\s*:\s*"0"/i.test(html) ||
        /"reason"\s*:\s*"[^"]*(?:Estreia\s+em|Premieres?\s+in|Acontece\s+em|Come[cç]a\s+em|Em\s+breve|Scheduled\s+for)[^"]*"/i.test(
          html
        );

      if (upcomingWatchCheckCache.size >= MAX_UPCOMING_WATCH_CACHE_SIZE) {
        const oldest = upcomingWatchCheckCache.keys().next().value;
        if (oldest) upcomingWatchCheckCache.delete(oldest);
      }
      upcomingWatchCheckCache.set(videoId, {
        upcoming,
        checkedAtMs: Date.now(),
      });
      return upcoming;
    } catch {
      return false;
    } finally {
      inFlightWatchChecks.delete(videoId);
    }
  })();

  inFlightWatchChecks.set(videoId, checkPromise);
  return checkPromise;
}

async function filterOutUpcomingUnverifiedItems(
  items: ChristianShort[],
  options?: { maxChecks?: number; checkNullDurationOnly?: boolean }
): Promise<ChristianShort[]> {
  if (items.length === 0) return [];
  const checkNullOnly = options?.checkNullDurationOnly ?? true;
  const maxChecks = options?.maxChecks ?? 80;

  const preFiltered = items.filter(isCurrentDayEligibleItem);
  const toVerify: ChristianShort[] = [];
  for (const item of preFiltered) {
    if (checkNullOnly && item.durationSeconds != null && item.durationSeconds > 0) {
      continue;
    }
    const cached = getFreshWatchUpcomingCached(item.id);
    if (cached === null && toVerify.length < maxChecks) {
      toVerify.push(item);
    }
  }

  if (toVerify.length > 0) {
    let cursor = 0;
    const workerCount = Math.min(10, toVerify.length);
    await Promise.all(
      Array.from({ length: workerCount }, async () => {
        while (cursor < toVerify.length) {
          const current = toVerify[cursor++];
          await isWatchPageUpcomingPremiere(current.id);
        }
      })
    );
  }

  const upcomingIds = new Set<string>();
  const clean: ChristianShort[] = [];
  for (const item of preFiltered) {
    if (getFreshWatchUpcomingCached(item.id) === true) {
      upcomingIds.add(item.id);
      continue;
    }
    clean.push(item);
  }

  if (upcomingIds.size > 0 && cachedCatalog) {
    cachedCatalog.items = cachedCatalog.items.filter((item) => !upcomingIds.has(item.id));
  }

  return clean;
}

function mergeIntoCatalogPool(
  freshAdditions: ChristianShort[],
  existingPool: ChristianShort[]
): ChristianShort[] {
  const byId = new Map<string, ChristianShort>();
  for (const item of freshAdditions) {
    if (isCurrentDayEligibleItem(item)) byId.set(item.id, item);
  }
  for (const item of existingPool) {
    if (!byId.has(item.id) && isCurrentDayEligibleItem(item)) {
      byId.set(item.id, item);
    }
  }
  const all = [...byId.values()];
  if (all.length <= MAX_CACHED_CATALOG_ITEMS) {
    return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  // Keep newest half by date AND newest half by discovery order so deep playlist finds
  // from 2023-2025 aren't immediately evicted by newer entries.
  const freshIds = new Set(freshAdditions.map((i) => i.id));
  const preservedFresh = all.filter((i) => freshIds.has(i.id));
  const byDate = [...all]
    .filter((i) => !freshIds.has(i.id))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const maxDateBudget = Math.max(0, MAX_CACHED_CATALOG_ITEMS - preservedFresh.length);
  return [...preservedFresh, ...byDate.slice(0, maxDateBudget)].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

function selectBalancedFeedSlice(
  orderedItems: ChristianShort[],
  excludeSet: Set<string>,
  perCategoryLimit = 45,
  randomOffset = 0,
  seed?: number
): ChristianShort[] {
  const categories: ContentCategory[] = [
    'pregacoes',
    'escola_sabatina',
    'louvores',
    'testemunhos',
    'feliz7play',
  ];
  const byCategory: Record<ContentCategory, ChristianShort[]> = {
    pregacoes: [],
    escola_sabatina: [],
    louvores: [],
    testemunhos: [],
    feliz7play: [],
  };

  for (const item of orderedItems) {
    if (excludeSet.has(item.id)) continue;
    byCategory[item.category].push(item);
  }

  const entropy = Math.abs((randomOffset || 0) + (seed ?? 0));
  const rotatedByCat: Record<ContentCategory, ChristianShort[]> = {
    pregacoes: [],
    escola_sabatina: [],
    louvores: [],
    testemunhos: [],
    feliz7play: [],
  };

  categories.forEach((cat, catIdx) => {
    const list = byCategory[cat];
    if (list.length === 0) {
      rotatedByCat[cat] = [];
      return;
    }

    // Reserve a balanced slice of Novo Hinário Adventista hymns inside Louvores (~15%)
    // so official hymns always appear alongside diverse contemporary & Adventist worship
    const reservedHinario: ChristianShort[] = [];
    let workingList = list;
    if (cat === 'louvores') {
      const officialHinarioCandidates = list.filter(
        (item) => isNovoHinarioAdventistaItem(item) && item.channelId === 'UCQhkLOO40bmTMeLcbspKW8A'
      );
      const otherHinarioCandidates = list.filter(
        (item) => isNovoHinarioAdventistaItem(item) && item.channelId !== 'UCQhkLOO40bmTMeLcbspKW8A'
      );
      const targetHinarioQuota = Math.min(7, officialHinarioCandidates.length + otherHinarioCandidates.length);
      if (targetHinarioQuota > 0) {
        const rotatedOfficial = [...officialHinarioCandidates];
        if (rotatedOfficial.length > 1 && entropy > 0) {
          const shift = entropy % rotatedOfficial.length;
          rotatedOfficial.push(...rotatedOfficial.splice(0, shift));
        }
        const rotatedOther = [...otherHinarioCandidates];
        if (rotatedOther.length > 1 && entropy > 0) {
          const shift = (entropy * 3) % rotatedOther.length;
          rotatedOther.push(...rotatedOther.splice(0, shift));
        }
        const officialTarget = Math.min(rotatedOfficial.length, Math.max(4, Math.ceil(targetHinarioQuota * 0.7)));
        reservedHinario.push(...rotatedOfficial.slice(0, officialTarget));
        if (reservedHinario.length < targetHinarioQuota) {
          reservedHinario.push(...rotatedOther.slice(0, targetHinarioQuota - reservedHinario.length));
        }
        const reservedIds = new Set(reservedHinario.map((i) => i.id));
        workingList = list.filter((i) => !reservedIds.has(i.id));
      }
    }

    // Group by speaker/channel so no single pastor or channel monopolizes a 45-item slice
    const byActor = new Map<string, ChristianShort[]>();
    for (const item of workingList) {
      const actorKey = getDiversityActorKey(item);
      const bucket = byActor.get(actorKey) ?? [];
      bucket.push(item);
      byActor.set(actorKey, bucket);
    }

    const nowSliceMs = Date.now();
    const recentThresholdMs = nowSliceMs - 60 * 24 * 60 * 60 * 1000;
    const actorBuckets = [...byActor.values()].map((b) =>
      [...b].sort((a, bItem) => bItem.publishedAt.localeCompare(a.publishedAt))
    );
    // Keep freshest channels/actors at the front and vary ONLY within same recency tier & recent window
    actorBuckets.sort((a, b) =>
      (b[0]?.publishedAt || '').localeCompare(a[0]?.publishedAt || '')
    );
    if (actorBuckets.length > 1 && entropy > 0) {
      const freshTierEnd = actorBuckets.findIndex((b) => {
        const ms = Date.parse(b[0]?.publishedAt || '');
        return !Number.isFinite(ms) || ms < recentThresholdMs;
      });
      const rotateActorLimit =
        freshTierEnd > 1 ? freshTierEnd : Math.min(actorBuckets.length, 8);
      if (rotateActorLimit > 1) {
        const shift = (entropy + catIdx * 13) % rotateActorLimit;
        const head = actorBuckets.slice(0, rotateActorLimit);
        head.push(...head.splice(0, shift));
        actorBuckets.splice(0, rotateActorLimit, ...head);
      }
      for (let bIdx = 0; bIdx < actorBuckets.length; bIdx++) {
        const b = actorBuckets[bIdx];
        if (b.length > 1) {
          let recentCount = 0;
          for (const item of b) {
            const ms = Date.parse(item.publishedAt);
            if (Number.isFinite(ms) && ms >= recentThresholdMs) recentCount += 1;
            else break;
          }
          const windowSize = Math.min(
            b.length,
            Math.max(recentCount > 0 ? recentCount : 2, Math.min(b.length, 4))
          );
          if (windowSize > 1) {
            const itemShift = (entropy + catIdx * 7 + bIdx * 5) % windowSize;
            const win = b.slice(0, windowSize);
            win.push(...win.splice(0, itemShift));
            b.splice(0, windowSize, ...win);
          }
        }
      }
    }

    const maxPrimaryPerActor =
      cat === 'pregacoes'
        ? actorBuckets.length >= 10
          ? 3
          : actorBuckets.length >= 5
          ? 4
          : 6
        : actorBuckets.length >= 8
        ? 5
        : 7;

    const picked: ChristianShort[] = [];
    const overflow: ChristianShort[] = [];
    const actorPickedCounts = new Map<number, number>();
    const channelPickedCounts = new Map<string, number>();
    const maxPrimaryPerChannel = cat === 'pregacoes' ? 4 : 7;

    const targetSliceLimit = Math.max(0, perCategoryLimit - reservedHinario.length);
    let addedRound = true;
    while (picked.length < targetSliceLimit && addedRound) {
      addedRound = false;
      for (let bIdx = 0; bIdx < actorBuckets.length && picked.length < targetSliceLimit; bIdx++) {
        const bucket = actorBuckets[bIdx];
        const countForActor = actorPickedCounts.get(bIdx) ?? 0;
        if (countForActor >= maxPrimaryPerActor) continue;
        while (bucket.length > 0) {
          const cand = bucket.shift()!;
          const chKey = cand.channelId || cand.channelTitle;
          const chCount = channelPickedCounts.get(chKey) ?? 0;
          if (chCount >= maxPrimaryPerChannel && actorBuckets.length >= 6) {
            overflow.push(cand);
            continue;
          }
          picked.push(cand);
          actorPickedCounts.set(bIdx, countForActor + 1);
          channelPickedCounts.set(chKey, chCount + 1);
          addedRound = true;
          break;
        }
      }
    }

    // Drain unused bucket items round-robin only if primary fair pass didn't fill the slice,
    // while keeping a ceiling per actor in pregacoes when multiple speakers exist so one pastor never dominates.
    const maxTotalPerActor =
      cat === 'pregacoes' && actorBuckets.length >= 6 ? 5 : targetSliceLimit;
    if (picked.length < targetSliceLimit) {
      let extraAdded = true;
      while (picked.length < targetSliceLimit && extraAdded) {
        extraAdded = false;
        for (let bIdx = 0; bIdx < actorBuckets.length && picked.length < targetSliceLimit; bIdx++) {
          const countForActor = actorPickedCounts.get(bIdx) ?? 0;
          if (countForActor >= maxTotalPerActor) continue;
          const bucket = actorBuckets[bIdx];
          const next = bucket.shift();
          if (next) {
            picked.push(next);
            actorPickedCounts.set(bIdx, countForActor + 1);
            extraAdded = true;
          }
        }
      }
      if (picked.length < 18) {
        for (const item of overflow) {
          if (picked.length >= Math.min(targetSliceLimit, 24)) break;
          picked.push(item);
        }
      }
    }

    if (reservedHinario.length > 0) {
      picked.push(...reservedHinario);
    }

    rotatedByCat[cat] = buildDiverseFeed(
      picked,
      true,
      seed !== undefined ? seed + catIdx * 31 : undefined
    );
  });

  // Preserve the interleaved flow of categories with rotated/seeded subsets
  const selected: ChristianShort[] = [];
  const cursors: Record<ContentCategory, number> = {
    pregacoes: 0,
    escola_sabatina: 0,
    louvores: 0,
    testemunhos: 0,
    feliz7play: 0,
  };
  const catOrder = [...categories];
  if (entropy > 0) {
    const shift = entropy % catOrder.length;
    catOrder.push(...catOrder.splice(0, shift));
  }

  let added = true;
  while (added) {
    added = false;
    for (const cat of catOrder) {
      const idx = cursors[cat];
      if (idx < rotatedByCat[cat].length) {
        selected.push(rotatedByCat[cat][idx]);
        cursors[cat] = idx + 1;
        added = true;
      }
    }
  }
  return selected;
}

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
  seedPlaylistTokens: Record<string, string | null> = {},
  seedOffset = 0
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
    'escola_sabatina',
    'louvores',
    'testemunhos',
    'feliz7play',
  ];
  const normalizedOffset = Math.abs(Math.trunc(seedOffset || 0));
  for (const cat of cats) {
    const qLen = getDiscoveryQueriesForCategory(cat).length;
    const offset = (globalDiscoveryOffsets[cat] + normalizedOffset) % qLen;
    globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % qLen;
    discoveryByCategory[cat] = { queryIdx: offset, pageToken: null };
  }

  paginationSessions.set(cursor, {
    createdAtMs: Date.now(),
    playlistStates: seededPlaylists,
    round: normalizedOffset % 7,
    seenIds: new Set(initialIds),
    searchToken,
    rssPage: 1,
    discoveryByCategory,
    allCycleIdx: (Math.floor(Math.random() * 5) + normalizedOffset) % 4,
  });
  return cursor;
}

async function fetchFromCuratedRss(pageIndex = 0, timeoutMs = 4200): Promise<ChristianShort[]> {
  const rssItems = await fetchCuratedRssWithAdapter(async (url) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GracaPlay/1.0)' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return res.text();
  }, pageIndex);

  const recentCutoffMs = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const recentOrFeliz: ChristianShort[] = [];
  const olderOther: ChristianShort[] = [];
  for (const item of rssItems) {
    if (!isCurrentDayEligibleItem(item)) continue;
    const pubMs = Date.parse(item.publishedAt);
    if (
      item.category === 'feliz7play' ||
      (Number.isFinite(pubMs) && pubMs >= recentCutoffMs)
    ) {
      recentOrFeliz.push(item);
    } else {
      olderOther.push(item);
    }
  }
  const verifiedRecent = await filterOutUpcomingUnverifiedItems(recentOrFeliz, {
    maxChecks: 90,
  });
  return [...verifiedRecent, ...olderOther];
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

  let apiFallbackMode = !isYoutubeApiUsable(apiKey);

  if (!apiFallbackMode) {
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
          { signal: AbortSignal.timeout(searchMode ? 6000 : 8500) }
        );
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          markYoutubeApiHttpError(res.status, errBody);
          if (!isYoutubeApiUsable(apiKey)) {
            apiFallbackMode = true;
            break;
          }
          continue;
        }

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
        // Unverified chunks are excluded below unless API quota is blocked
      }
    }
  }

  const verifiedShorts: ChristianShort[] = [];
  for (const c of candidates.values()) {
    const meta = videoMeta.get(c.id);
    if (meta) {
      if (!meta.playable) continue;
    } else if (!apiFallbackMode) {
      // Strict API verification when API is healthy
      continue;
    }

    const fullDesc = meta?.fullDescription || c.description;
    const effectivePublishedAt = meta?.publishedAt || c.publishedAt;
    if (isUpcomingOrPremiereEntry(c.title, fullDesc, effectivePublishedAt)) {
      continue;
    }

    const classified = classifyShort(
      c.channelId,
      c.channelTitle,
      c.title,
      fullDesc,
      c.hintCategory,
      { searchMode, publishedAt: effectivePublishedAt }
    );
    if (!classified) continue;

    const effectiveDuration = meta?.durationSeconds ?? c.durationSeconds ?? null;
    if (
      !isWithinCategoryDuration(
        classified.category,
        effectiveDuration,
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
        publishedAt: effectivePublishedAt,
        thumbnailUrl: c.thumbnailUrl,
        category: classified.category,
        doctrineScope: classified.doctrineScope,
        durationSeconds: effectiveDuration,
        viewCount: meta?.viewCount ?? null,
      })
    );
  }

  const hasUnverified = verifiedShorts.some((item) => item.durationSeconds == null);
  if (hasUnverified) {
    return filterOutUpcomingUnverifiedItems(verifiedShorts, { maxChecks: 80 });
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
    if (category === 'pregacoes') return durationSeconds >= 20 && durationSeconds <= 10800;
    if (category === 'escola_sabatina') return durationSeconds >= 15 && durationSeconds <= 10800;
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
    return durationSeconds >= 30;
  }
  if (category === 'testemunhos') {
    return durationSeconds >= 15 && durationSeconds <= 3600;
  }
  if (category === 'escola_sabatina') {
    return durationSeconds >= 20 && durationSeconds <= 7200;
  }
  return true;
}

function pickRotatedPlaylists(
  list: string[],
  count: number,
  rng: () => number = Math.random
): string[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
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
  if (!isYoutubeApiUsable(apiKey)) {
    throw new Error('YouTube API temporarily cooling down after quota/auth error');
  }

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
  }> = [];

  for (const spec of channels) {
    const suffix = spec.id.slice(2);
    const primaryPid =
      spec.defaultCategory === 'escola_sabatina'
        ? `UU${suffix}`
        : spec.defaultCategory === 'pregacoes' || spec.defaultCategory === 'feliz7play'
        ? `UULF${suffix}`
        : `UU${suffix}`;
    const altPid =
      primaryPid === `UULF${suffix}`
        ? `UU${suffix}`
        : primaryPid === `UUPV${suffix}`
        ? `UU${suffix}`
        : `UULF${suffix}`;
    const playlistId =
      exhaustedPlaylistIds.has(primaryPid) || (advancePlaylists && Math.random() < 0.35)
        ? altPid
        : primaryPid;
    if (exhaustedPlaylistIds.has(playlistId)) continue;
    const pageToken =
      advancePlaylists && Math.random() < 0.7 ? (persistentPlaylistTokens[playlistId] ?? null) : null;
    requestMeta.push({
      hintCategory: spec.defaultCategory,
      playlistId,
      pageToken,
      maxResults: advancePlaylists ? 25 : 14,
    });
  }

  // Prioritize newest releases (Adoradores 5/4, recent CD Jovem) on initial load,
  // while rotating deeper into classic albums during pagination/refresh.
  const hinarioPool = NOVO_HINARIO_PLAYLISTS.filter((p) => !exhaustedPlaylistIds.has(p));
  const cdJovemFresh = CD_JOVEM_PLAYLISTS.slice(0, advancePlaylists ? 10 : 3).filter(
    (p) => !exhaustedPlaylistIds.has(p)
  );
  const adoradoresFresh = ADORADORES_PLAYLISTS.slice(0, advancePlaylists ? 8 : 4).filter(
    (p) => !exhaustedPlaylistIds.has(p)
  );
  const specialBatch = [
    ...pickRotatedPlaylists(hinarioPool, 2),
    ...pickRotatedPlaylists(cdJovemFresh.length > 0 ? cdJovemFresh : CD_JOVEM_PLAYLISTS, advancePlaylists ? 3 : 2),
    ...pickRotatedPlaylists(adoradoresFresh.length > 0 ? adoradoresFresh : ADORADORES_PLAYLISTS, advancePlaylists ? 3 : 2),
  ];
  for (const playlistId of specialBatch) {
    const pageToken = advancePlaylists ? (persistentPlaylistTokens[playlistId] ?? null) : null;
    requestMeta.push({
      hintCategory: 'louvores',
      playlistId,
      pageToken,
      maxResults: advancePlaylists ? 25 : 15,
    });
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
    const { playlistId, pageToken: usedToken } = requestMeta[idx];
    if (res.status !== 'fulfilled') continue;
    if (res.value.candidates.length > 0) anyFulfilled = true;
    playlistTokens[playlistId] = res.value.nextPageToken;
    persistentPlaylistTokens[playlistId] = res.value.nextPageToken;
    if (usedToken && !res.value.nextPageToken) {
      exhaustedPlaylistIds.add(playlistId);
    }
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
  if (!isYoutubeApiUsable(apiKey)) {
    return { candidates: [], nextPageToken: null };
  }
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
    const errBody = await res.text().catch(() => '');
    markYoutubeApiHttpError(res.status, errBody);
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

type YoutubeWebDateFilter = boolean | 'week' | 'month' | 'year' | 'latest' | 'relevance';

function parseRelativePublishedAt(
  rawText: string | undefined,
  sortByDateOrFilter: YoutubeWebDateFilter = false
): string {
  const nowMs = Date.now();
  const fallbackDays =
    sortByDateOrFilter === 'week'
      ? 4
      : sortByDateOrFilter === 'latest' || sortByDateOrFilter === true
      ? 10
      : sortByDateOrFilter === 'month'
      ? 18
      : sortByDateOrFilter === 'year'
      ? 160
      : 120;
  const fallbackIso = new Date(nowMs - fallbackDays * 24 * 60 * 60 * 1000).toISOString();
  if (!rawText) return fallbackIso;
  const text = rawText.toLowerCase();
  const m = text.match(
    /(\d+)\s*(segund[oa]s?|seconds?|minut[oa]s?|minutes?|horas?|hours?|dias?|days?|semanas?|weeks?|m[eê]s(?:es)?|months?|anos?|years?)/i
  );
  if (!m) return fallbackIso;
  const amount = Math.max(1, Number(m[1]) || 1);
  const unit = m[2];
  let msOffset = 0;
  if (/^(segund|second)/.test(unit)) msOffset = amount * 1000;
  else if (/^minut/.test(unit)) msOffset = amount * 60 * 1000;
  else if (/^(hora|hour)/.test(unit)) msOffset = amount * 3600 * 1000;
  else if (/^(dia|day)/.test(unit)) msOffset = amount * 24 * 3600 * 1000;
  else if (/^(semana|week)/.test(unit)) msOffset = amount * 7 * 24 * 3600 * 1000;
  else if (/^(m[eê]s|month)/.test(unit)) msOffset = amount * 30 * 24 * 3600 * 1000;
  else if (/^(ano|year)/.test(unit)) msOffset = amount * 365 * 24 * 3600 * 1000;
  return msOffset > 0 ? new Date(nowMs - msOffset).toISOString() : fallbackIso;
}

async function fetchYoutubeWebSearch(
  apiKey: string,
  query: string,
  hintCategory?: ContentCategory,
  sortByDateOrFilter: YoutubeWebDateFilter = false,
  excludeIds?: Set<string>,
  searchMode = false
): Promise<ChristianShort[]> {
  try {
    const spParam =
      sortByDateOrFilter === 'week'
        ? '&sp=EgIIAw%253D%253D'
        : sortByDateOrFilter === 'month'
          ? '&sp=EgIIBA%253D%253D'
          : sortByDateOrFilter === 'year'
            ? '&sp=EgIIBQ%253D%253D'
            : sortByDateOrFilter === 'latest' || sortByDateOrFilter === true
              ? '&sp=CAISAhAB'
              : '';
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${spParam}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal: AbortSignal.timeout(searchMode ? 6000 : 8500),
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

    type WebShortsLockup = {
      onTap?: {
        innertubeCommand?: {
          reelWatchEndpoint?: { videoId?: string };
        };
      };
      accessibilityText?: string;
      overlayMetadata?: {
        primaryText?: { content?: string };
      };
      thumbnailViewModel?: {
        thumbnailViewModel?: {
          image?: { sources?: Array<{ url?: string }> };
        };
      };
    };

    type WebVideoLockup = {
      contentId?: string;
      contentType?: string;
      contentImage?: {
        thumbnailViewModel?: {
          image?: { sources?: Array<{ url?: string }> };
          overlays?: Array<{
            thumbnailOverlayBadgeViewModel?: {
              thumbnailBadges?: Array<{
                thumbnailBadgeViewModel?: { text?: string; badgeStyle?: string };
              }>;
            };
            thumbnailBottomOverlayViewModel?: {
              badges?: Array<{
                thumbnailBadgeViewModel?: { text?: string; badgeStyle?: string };
              }>;
            };
            thumbnailOverlayTimeStatusRenderer?: {
              style?: string;
              text?: { simpleText?: string; runs?: Array<{ text?: string }> };
            };
          }>;
        };
      };
      metadata?: {
        lockupMetadataViewModel?: {
          title?: { content?: string };
          metadata?: {
            contentMetadataViewModel?: {
              metadataRows?: Array<{
                metadataParts?: Array<{ text?: { content?: string } }>;
              }>;
            };
          };
        };
      };
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
                    lockupViewModel?: WebVideoLockup;
                    gridShelfViewModel?: {
                      contents?: Array<{ shortsLockupViewModel?: WebShortsLockup }>;
                    };
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
        if (item.gridShelfViewModel?.contents) {
          for (const gItem of item.gridShelfViewModel.contents) {
            const sl = gItem.shortsLockupViewModel;
            const vid = sl?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
            if (!vid || excludeIds?.has(vid) || candidates.has(vid)) continue;
            const a11y = decodeXmlEntities(sl.accessibilityText || '');
            const rawTitle = decodeXmlEntities(
              sl.overlayMetadata?.primaryText?.content || a11y
            );
            if (
              !rawTitle ||
              isUpcomingOrPremiereEntry(rawTitle, a11y, '') ||
              /\b(estr[eé]ia|em breve|premieres?|upcoming|programad[oa]|aguardando|ao vivo)\b/i.test(
                a11y
              )
            ) {
              continue;
            }
            const sources = sl.thumbnailViewModel?.thumbnailViewModel?.image?.sources ?? [];
            candidates.set(vid, {
              id: vid,
              title: rawTitle,
              description: a11y,
              channelId: '',
              channelTitle: '',
              publishedAt: parseRelativePublishedAt(undefined, sortByDateOrFilter),
              thumbnailUrl: sources[sources.length - 1]?.url,
              hintCategory,
              durationSeconds: 45,
            });
          }
        }
        const lv = item.lockupViewModel;
        if (lv?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO' && lv.contentId) {
          const vid = lv.contentId;
          if (!excludeIds?.has(vid) && !candidates.has(vid)) {
            const lm = lv.metadata?.lockupMetadataViewModel;
            const title = decodeXmlEntities(lm?.title?.content || '');
            const rows = lm?.metadata?.contentMetadataViewModel?.metadataRows ?? [];
            const channelTitle = decodeXmlEntities(
              rows[0]?.metadataParts?.[0]?.text?.content || ''
            );
            const allMetaTexts = rows.flatMap((r) =>
              (r.metadataParts ?? []).map((p) => p.text?.content || '')
            );
            const hasUpcomingMeta = allMetaTexts.some((t) =>
              /\b(estr[eé]ia|em breve|premieres?|upcoming|programad[oa]|aguardando|ao vivo|scheduled|notificar)\b/i.test(
                t
              )
            );
            let durText = '';
            let hasUpcomingBadge = false;
            for (const ov of lv.contentImage?.thumbnailViewModel?.overlays ?? []) {
              const overlayBadges = [
                ...(ov.thumbnailOverlayBadgeViewModel?.thumbnailBadges ?? []),
                ...(ov.thumbnailBottomOverlayViewModel?.badges ?? []),
              ];
              for (const b of overlayBadges) {
                const badge = b.thumbnailBadgeViewModel;
                const t = badge?.text || '';
                if (
                  badge?.badgeStyle === 'THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE' ||
                  badge?.badgeStyle === 'THUMBNAIL_OVERLAY_BADGE_STYLE_UPCOMING' ||
                  /\b(estr[eé]ia|em breve|premieres?|upcoming|programad[oa]|aguardando|ao vivo|live|notificar)\b/i.test(
                    t
                  )
                ) {
                  hasUpcomingBadge = true;
                  break;
                }
                if (t && /\d+:\d+/.test(t)) {
                  durText = t;
                }
              }
              if (hasUpcomingBadge) break;
              const ts = ov.thumbnailOverlayTimeStatusRenderer;
              if (ts?.style === 'UPCOMING' || ts?.style === 'LIVE') {
                hasUpcomingBadge = true;
                break;
              }
            }
            const relPubText = allMetaTexts.find((t) => /\b(h[aá]\s+\d+|\d+\s+\w+\s+ago)\b/i.test(t));
            const durSec = parseDisplayDurationToSeconds(durText);
            const sources = lv.contentImage?.thumbnailViewModel?.image?.sources ?? [];
            if (
              title &&
              durSec &&
              durSec > 0 &&
              !hasUpcomingMeta &&
              !hasUpcomingBadge &&
              !isUpcomingOrPremiereEntry(title, allMetaTexts.join(' '), '')
            ) {
              candidates.set(vid, {
                id: vid,
                title,
                description: '',
                channelId: '',
                channelTitle,
                publishedAt: parseRelativePublishedAt(relPubText, sortByDateOrFilter),
                thumbnailUrl: sources[sources.length - 1]?.url,
                hintCategory,
                durationSeconds: durSec,
              });
            }
          }
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
              b.includes('estrei') ||
              b.includes('estréi') ||
              b.includes('em breve') ||
              b.includes('premiere') ||
              b.includes('upcoming') ||
              b.includes('aguardando') ||
              b.includes('programad')
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
            ovText.includes('estrei') ||
            ovText.includes('estréi') ||
            ovText.includes('em breve') ||
            ovText.includes('ao vivo') ||
            ovText.includes('premiere') ||
            ovText.includes('upcoming') ||
            ovText.includes('programad')
          );
        });
        if (hasUpcomingOverlay) continue;

        const pubTimeText = (vr.publishedTimeText?.simpleText || '').toLowerCase();
        if (
          /\b(estr[eé]ia|em breve|premieres?|aguardando|scheduled|programad[oa]|ao vivo|upcoming)\b/i.test(
            pubTimeText
          )
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
          publishedAt: parseRelativePublishedAt(pubTimeText, sortByDateOrFilter),
          thumbnailUrl,
          hintCategory,
          durationSeconds,
        });
    }

    if (candidates.size === 0) return [];
    if (isYoutubeApiUsable(apiKey)) {
      return hydrateAndVerifyCandidates(apiKey, candidates, { searchMode });
    }

    const fallback: ChristianShort[] = [];
    for (const c of candidates.values()) {
      if (isUpcomingOrPremiereEntry(c.title, c.description, c.publishedAt)) continue;
      const classified = classifyShort(
        c.channelId,
        c.channelTitle,
        c.title,
        c.description,
        c.hintCategory,
        { searchMode, publishedAt: c.publishedAt }
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
  const haystack = foldSearchText(
    `${item.title} ${item.channelTitle} ${item.description} ${item.categoryLabel}`
  );
  return checkTokens.some((tok) => haystack.includes(tok));
}

function rankSearchResults(
  items: ChristianShort[],
  rawQuery: string,
  preferredCategory?: ContentCategory
): ChristianShort[] {
  const foldedQuery = foldSearchText(rawQuery.trim());
  const rawTokens = foldedQuery.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter((t) => t.length >= 2 && !SEARCH_STOPWORDS.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
  if (tokens.length === 0) return items;

  const relevantItems = items.filter((item) => hasQueryTokenInItem(item, rawQuery));

  const scored = relevantItems.map((item, idx) => {
    const fTitle = foldSearchText(item.title);
    const fChannel = foldSearchText(item.channelTitle);
    const fCategory = foldSearchText(item.categoryLabel);
    const fDesc = foldSearchText(item.description);
    let score = 0;

    if (fTitle === foldedQuery) score += 320;
    else if (fTitle.startsWith(foldedQuery)) score += 260;
    else if (fTitle.includes(foldedQuery)) score += 190;

    if (fChannel === foldedQuery) score += 240;
    else if (fChannel.includes(foldedQuery)) score += 150;

    if (fDesc.includes(foldedQuery)) score += 45;

    let titleTokenHits = 0;
    let totalTokenHits = 0;
    for (const tok of tokens) {
      if (fTitle.includes(tok)) {
        titleTokenHits += 1;
        totalTokenHits += 1;
        score += 36;
      } else if (fChannel.includes(tok)) {
        totalTokenHits += 1;
        score += 26;
      } else if (fCategory.includes(tok)) {
        totalTokenHits += 1;
        score += 14;
      } else if (fDesc.includes(tok)) {
        totalTokenHits += 1;
        score += 10;
      }
    }
    if (titleTokenHits === tokens.length) score += 140;
    else if (totalTokenHits === tokens.length) score += 80;

    if (preferredCategory && item.category === preferredCategory) score += 35;
    if (ALL_CURATED_CHANNELS.some((ch) => ch.id === item.channelId)) score += 25;
    if (item.viewCount && item.viewCount > 0) {
      score += Math.min(28, Math.log10(Math.max(10, item.viewCount)) * 4.2);
    }
    // Slight preference for direct YouTube top results when relevance ties
    score -= idx * 0.04;
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

  const validCat = normalizeContentCategory(rawCategory);

  let effectiveQuery = cleanQuery;
  if (validCat === 'pregacoes') {
    const hasAdvWord = /\b(adventista|iasd|novo tempo|arilton|bullon|ivan saraiva|odailson|rafael rossi|stanley arco|gilson brito|rodrigo silva|na mira|terceiro anjo)\b/i.test(
      cleanQuery
    );
    if (!hasAdvWord) {
      effectiveQuery = `${cleanQuery} adventista`;
    }
  } else if (
    validCat === 'escola_sabatina' &&
    !/\b(escola sabatina|li[cç][oõ]es da b[ií]blia|comtexto|nocomtexto|adventista|iasd|novo tempo|arilton|dudu)\b/i.test(
      cleanQuery
    )
  ) {
    effectiveQuery = `${cleanQuery} escola sabatina adventista`;
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

  // Page 1 (or API continuation): run API search.list AND direct + contextual YouTube searches
  // in parallel so every query returns YouTube-quality top hits while enforcing app guidelines.
  const webFanQueries: Array<{ q: string; hint?: ContentCategory; sortByDate: boolean }> = [];
  if (!pageToken) {
    if (validCat === 'louvores') {
      webFanQueries.push({ q: cleanQuery, hint: 'louvores', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} louvor gospel`, hint: 'louvores', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} louvor adventista`, hint: 'louvores', sortByDate: false });
    } else if (validCat === 'testemunhos') {
      webFanQueries.push({ q: `${cleanQuery} testemunho cristão`, hint: 'testemunhos', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} testemunho conversão`, hint: 'testemunhos', sortByDate: false });
      webFanQueries.push({ q: cleanQuery, hint: 'testemunhos', sortByDate: false });
    } else if (validCat === 'pregacoes') {
      webFanQueries.push({ q: `${cleanQuery} pregação adventista`, hint: 'pregacoes', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} estudo bíblico adventista`, hint: 'pregacoes', sortByDate: false });
      webFanQueries.push({ q: effectiveQuery, hint: 'pregacoes', sortByDate: false });
    } else if (validCat === 'escola_sabatina') {
      webFanQueries.push({ q: `${cleanQuery} pastor escola sabatina adventista`, hint: 'escola_sabatina', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} pr escola sabatina`, hint: 'escola_sabatina', sortByDate: false });
      webFanQueries.push({ q: effectiveQuery, hint: 'escola_sabatina', sortByDate: false });
    } else if (validCat === 'feliz7play') {
      webFanQueries.push({ q: `${cleanQuery} feliz7play`, hint: 'feliz7play', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} animação bíblica adventista`, hint: 'feliz7play', sortByDate: false });
      webFanQueries.push({ q: effectiveQuery, hint: 'feliz7play', sortByDate: false });
    } else {
      // "Todos": always include direct YouTube query + Christian/Adventist/Testimony fan-out
      webFanQueries.push({ q: cleanQuery, hint: undefined, sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} louvor gospel`, hint: 'louvores', sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} adventista`, hint: undefined, sortByDate: false });
      webFanQueries.push({ q: `${cleanQuery} testemunho cristão`, hint: 'testemunhos', sortByDate: false });
    }
  }

  const apiPromise = isYoutubeApiUsable(apiKey)
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
          { signal: AbortSignal.timeout(5500) }
        );
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          markYoutubeApiHttpError(res.status, errBody);
          return null;
        }
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

async function fetchPersistentApiDiscoveryPage(
  apiKey: string,
  targetCategory: ContentCategory,
  excludeIds: Set<string>
): Promise<ChristianShort[]> {
  const queries = getDiscoveryQueriesForCategory(targetCategory);
  const cursor = persistentDiscoveryCursors[targetCategory];
  const query = queries[cursor.queryIdx % queries.length];
  const orderCycle: Array<'date' | 'relevance' | 'viewCount'> =
    targetCategory === 'escola_sabatina'
      ? ['date', 'relevance', 'date']
      : ['relevance', 'date', 'viewCount'];
  const orderMode = orderCycle[cursor.queryIdx % orderCycle.length];

  if (!isYoutubeApiUsable(apiKey)) {
    cursor.queryIdx = (cursor.queryIdx + 1) % queries.length;
    cursor.pageToken = null;
    globalDiscoveryOffsets[targetCategory] = cursor.queryIdx;
    return fetchYoutubeWebSearch(
      '',
      query,
      targetCategory,
      targetCategory === 'escola_sabatina' ? 'week' : 'month',
      excludeIds
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
    safeSearch: 'strict',
    relevanceLanguage: 'pt',
    regionCode: 'BR',
    maxResults: '40',
    order: orderMode,
    q: query,
  });
  if (cursor.pageToken) {
    params.set('pageToken', cursor.pageToken);
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { signal: AbortSignal.timeout(7000) }
    );
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      markYoutubeApiHttpError(res.status, errBody);
      cursor.queryIdx = (cursor.queryIdx + 1) % queries.length;
      cursor.pageToken = null;
      globalDiscoveryOffsets[targetCategory] = cursor.queryIdx;
      return fetchYoutubeWebSearch('', query, targetCategory, 'month', excludeIds);
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

    if (data.nextPageToken) {
      cursor.pageToken = data.nextPageToken;
    } else {
      cursor.queryIdx = (cursor.queryIdx + 1) % queries.length;
      cursor.pageToken = null;
      globalDiscoveryOffsets[targetCategory] = cursor.queryIdx;
    }

    const candidates = new Map<string, CandidateVideo>();
    for (const item of data.items ?? []) {
      const id = item.id?.videoId;
      const s = item.snippet;
      if (!id || !s || s.liveBroadcastContent === 'live' || s.liveBroadcastContent === 'upcoming') {
        continue;
      }
      if (excludeIds.has(id)) continue;
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
    const matching = verified.filter((item) => item.category === targetCategory);
    if (matching.length > 0) return matching;
    return fetchYoutubeWebSearch(
      isYoutubeApiUsable(apiKey) ? apiKey : '',
      query,
      targetCategory,
      'month',
      excludeIds
    );
  } catch {
    return fetchYoutubeWebSearch('', query, targetCategory, 'month', excludeIds);
  }
}

async function fetchCategoryDiscoveryPage(
  apiKey: string,
  targetCategory: ContentCategory,
  state: PaginationSessionState
): Promise<ChristianShort[]> {
  const queries = getDiscoveryQueriesForCategory(targetCategory);
  const initialIdx = globalDiscoveryOffsets[targetCategory] % queries.length;
  const cursorEntry = state.discoveryByCategory[targetCategory] ?? {
    queryIdx: initialIdx,
    pageToken: persistentDiscoveryCursors[targetCategory]?.pageToken ?? null,
  };
  state.discoveryByCategory[targetCategory] = cursorEntry;

  const queryIdx = cursorEntry.queryIdx;
  const query = queries[queryIdx % queries.length];
  const orderCycle: Array<'date' | 'relevance' | 'viewCount'> =
    targetCategory === 'escola_sabatina'
      ? ['date', 'relevance', 'date']
      : ['date', 'date', 'relevance', 'date', 'viewCount'];
  const orderMode = orderCycle[queryIdx % orderCycle.length];
  const webFilterCycle: YoutubeWebDateFilter[] =
    targetCategory === 'escola_sabatina'
      ? ['week', 'latest', 'week', 'relevance']
      : ['week', 'month', 'latest', 'month', 'year', 'relevance'];
  const webFilter = webFilterCycle[queryIdx % webFilterCycle.length];

  if (isYoutubeApiUsable(apiKey)) {
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet',
      type: 'video',
      videoEmbeddable: 'true',
      safeSearch: 'strict',
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      maxResults: '40',
      order: orderMode,
      q: query,
    });
    if (cursorEntry.pageToken) {
      params.set('pageToken', cursorEntry.pageToken);
    }

    try {
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
          persistentDiscoveryCursors[targetCategory].pageToken = data.nextPageToken;
          persistentDiscoveryCursors[targetCategory].queryIdx = queryIdx % queries.length;
        } else {
          cursorEntry.queryIdx += 1;
          cursorEntry.pageToken = null;
          globalDiscoveryOffsets[targetCategory] =
            (globalDiscoveryOffsets[targetCategory] + 1) % queries.length;
          persistentDiscoveryCursors[targetCategory].queryIdx = globalDiscoveryOffsets[targetCategory];
          persistentDiscoveryCursors[targetCategory].pageToken = null;
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
        const matching = verified.filter((item) => item.category === targetCategory);
        if (matching.length > 0) {
          return matching;
        }
      } else {
        const errBody = await res.text().catch(() => '');
        markYoutubeApiHttpError(res.status, errBody);
      }
    } catch {
      // Fall through cleanly to zero-quota web discovery
    }
  }

  // Advance query index and fall back to zero-quota YouTube web search
  cursorEntry.queryIdx += 1;
  cursorEntry.pageToken = null;
  globalDiscoveryOffsets[targetCategory] =
    (globalDiscoveryOffsets[targetCategory] + 1) % queries.length;
  const webFound = await fetchYoutubeWebSearch(
    isYoutubeApiUsable(apiKey) ? apiKey : '',
    query,
    targetCategory,
    webFilter,
    state.seenIds
  );
  let matched = webFound.filter((item) => item.category === targetCategory);
  if (matched.length < 4 && webFilter !== 'relevance') {
    const relFound = await fetchYoutubeWebSearch(
      isYoutubeApiUsable(apiKey) ? apiKey : '',
      query,
      targetCategory,
      'relevance',
      state.seenIds
    );
    const seenIdsInMatched = new Set(matched.map((m) => m.id));
    for (const item of relFound) {
      if (item.category === targetCategory && !seenIdsInMatched.has(item.id)) {
        seenIdsInMatched.add(item.id);
        matched.push(item);
      }
    }
  }
  return matched;
}

async function fetchRecentApiDiscovery(
  apiKey: string,
  categories: ContentCategory[],
  excludeIds: Set<string>
): Promise<ChristianShort[]> {
  if (!apiKey || categories.length === 0) return [];
  const publishedAfter = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
  const tasks = categories.map(async (cat) => {
    const queries = getDiscoveryQueriesForCategory(cat);
    const idx = globalDiscoveryOffsets[cat] % queries.length;
    globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % queries.length;
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet',
      type: 'video',
      videoEmbeddable: 'true',
      safeSearch: 'strict',
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      maxResults: '25',
      order: 'date',
      publishedAfter,
      q: queries[idx],
    });
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { signal: AbortSignal.timeout(6500) }
    );
    if (!res.ok) return [] as ChristianShort[];
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
    const candidates = new Map<string, CandidateVideo>();
    for (const item of data.items ?? []) {
      const id = item.id?.videoId;
      const s = item.snippet;
      if (
        !id ||
        !s ||
        excludeIds.has(id) ||
        s.liveBroadcastContent === 'live' ||
        s.liveBroadcastContent === 'upcoming'
      ) {
        continue;
      }
      candidates.set(id, {
        id,
        title: decodeXmlEntities(s.title || ''),
        description: decodeXmlEntities(s.description || ''),
        channelId: s.channelId || '',
        channelTitle: decodeXmlEntities(s.channelTitle || ''),
        publishedAt: s.publishedAt || new Date().toISOString(),
        thumbnailUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url,
        hintCategory: cat,
      });
    }
    const verified = await hydrateAndVerifyCandidates(apiKey, candidates);
    return verified.filter((item) => item.category === cat);
  });

  const settled = await Promise.allSettled(tasks);
  const collected: ChristianShort[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') collected.push(...r.value);
  }
  return collected;
}

async function fetchInitialDiscoveryExtras(
  apiKey: string,
  excludeIds: Set<string>
): Promise<ChristianShort[]> {
  const categories: ContentCategory[] = [
    'pregacoes',
    'escola_sabatina',
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

  const discoveryJobs: Array<{
    cat: ContentCategory;
    query: string;
    dateFilter: YoutubeWebDateFilter;
  }> = [];
  const recencyCycle: YoutubeWebDateFilter[] = ['week', 'month', 'latest'];
  const sabbathRecencyCycle: YoutubeWebDateFilter[] = ['week', 'latest', 'week', 'relevance'];
  for (const cat of categories) {
    const queries = getDiscoveryQueriesForCategory(cat);
    const extraCount = cat === 'pregacoes' ? 4 : cat === 'escola_sabatina' ? 5 : cat === 'testemunhos' ? 3 : 2;
    const cycle = cat === 'escola_sabatina' ? sabbathRecencyCycle : recencyCycle;
    for (let k = 0; k < extraCount; k++) {
      const idx = globalDiscoveryOffsets[cat] % queries.length;
      globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % queries.length;
      discoveryJobs.push({
        cat,
        query: queries[idx],
        dateFilter: cycle[(idx + k) % cycle.length],
      });
    }
  }

  const results = await Promise.allSettled(
    discoveryJobs.map((job) =>
      fetchYoutubeWebSearch(apiKey, job.query, job.cat, job.dateFilter, tempState.seenIds)
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

const searchResponseCache = new Map<
  string,
  { expiresAt: number; payload: ShortsApiResponse }
>();
const suggestResponseCache = new Map<
  string,
  { expiresAt: number; suggestions: string[] }
>();

const CURATED_SUGGEST_SEEDS = [
  'Escola Sabatina Adultos',
  'Escola Sabatina Jovens',
  'ComTexto Bíblico',
  'Lições da Bíblia',
  'Novo Hinário Adventista',
  'CD Jovem Adventista',
  'Adoradores Novo Tempo',
  'Pr. Alejandro Bullón',
  'Pr. Arilton Oliveira',
  'Pr. Ivan Saraiva',
  'Rodrigo Silva Arqueologia',
  'Na Mira da Verdade',
  'Feliz7Play',
  'Defensores da Bíblia',
  'Arautos do Rei',
  'Daniel Lüdtke',
  'Pedro Valença',
  'Aline Barros',
  'Fernandinho',
  'Gabriela Rocha',
  'Voz da Verdade',
  'Harpa Cristã',
  'Salmo 23',
  'Salmo 91',
  'Testemunho de conversão',
  'Estudo bíblico Apocalipse',
];

export async function getSearchSuggestions(rawQuery: string): Promise<string[]> {
  const cleanQuery = rawQuery.trim().slice(0, 60);
  if (!cleanQuery) return [];

  const folded = foldSearchText(cleanQuery);
  const cached = suggestResponseCache.get(folded);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.suggestions;
  }

  const localMatches: string[] = [];
  for (const seed of CURATED_SUGGEST_SEEDS) {
    if (foldSearchText(seed).includes(folded)) {
      localMatches.push(seed);
    }
  }
  for (const ch of ALL_CURATED_CHANNELS) {
    if (foldSearchText(ch.title).includes(folded)) {
      localMatches.push(ch.title);
    }
  }

  let ytSuggestions: string[] = [];
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=pt&gl=BR&q=${encodeURIComponent(
        cleanQuery
      )}`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (res.ok) {
      const parsed = (await res.json()) as [string, string[]];
      if (Array.isArray(parsed?.[1])) {
        ytSuggestions = parsed[1].filter((s): s is string => typeof s === 'string');
      }
    }
  } catch {
    // Use local curated suggestions if network suggest times out
  }

  const seenFolded = new Set<string>();
  const combined: string[] = [];
  for (const candidate of [...localMatches, ...ytSuggestions]) {
    const trimmed = candidate.trim();
    const key = foldSearchText(trimmed);
    if (!key || seenFolded.has(key)) continue;
    if (!isSearchSuggestionSafe(trimmed)) continue;
    seenFolded.add(key);
    combined.push(trimmed);
    if (combined.length >= 8) break;
  }

  if (suggestResponseCache.size >= 100) {
    const oldest = suggestResponseCache.keys().next().value;
    if (oldest) suggestResponseCache.delete(oldest);
  }
  suggestResponseCache.set(folded, {
    expiresAt: Date.now() + SUGGEST_CACHE_TTL_MS,
    suggestions: combined,
  });
  return combined;
}

function raceWithTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(fallbackValue);
      }
    }, ms);
    promise
      .then((val) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(val);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(fallbackValue);
        }
      });
  });
}

async function buildBaseCatalog(
  apiKey: string,
  apiKeyConfigured: boolean,
  forceRefresh: boolean
): Promise<{
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  fetchedAt: string;
  playlistTokens: Record<string, string | null>;
}> {
  const nowMs = Date.now();
  let poolItems: ChristianShort[] = [];
  let sourceMode: 'youtube_api' | 'curated_rss' = 'curated_rss';
  let seedPlaylistTokens: Record<string, string | null> = cachedCatalog?.playlistTokens ?? {};

  if (isYoutubeApiUsable(apiKey)) {
    try {
      const existingCatalogIds = new Set((cachedCatalog?.items ?? []).map((i) => i.id));
      const discoveryPromise = fetchInitialDiscoveryExtras(apiKey, existingCatalogIds);
      const recentApiPromise = fetchRecentApiDiscovery(
        apiKey,
        ['pregacoes', 'escola_sabatina', 'louvores', 'testemunhos', 'feliz7play'],
        existingCatalogIds
      );
      const rssPromise = fetchFromCuratedRss(0, 2200);
      const [
        { items: apiItems, evaluatedIds, playlistTokens },
        fastRssItems,
        fastDiscoveryExtras,
        fastRecentApi,
      ] = await Promise.all([
        fetchFromYoutubeApi(apiKey, forceRefresh || cachedCatalog !== null),
        raceWithTimeout(rssPromise, 1200, [] as ChristianShort[]),
        raceWithTimeout(discoveryPromise, 1200, [] as ChristianShort[]),
        raceWithTimeout(recentApiPromise, 1300, [] as ChristianShort[]),
      ]);

      const buildRssExtraMap = (items: ChristianShort[]) => {
        const map = new Map<string, CandidateVideo>();
        for (const item of items) {
          if (!evaluatedIds.has(item.id) && !map.has(item.id)) {
            map.set(item.id, {
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
        return map;
      };

      const verifiedRssExtras =
        apiItems.length < 40 && fastRssItems.length > 0
          ? await hydrateAndVerifyCandidates(apiKey, buildRssExtraMap(fastRssItems))
          : [];

      const merged = new Map<string, ChristianShort>();
      for (const item of fastRecentApi) merged.set(item.id, item);
      for (const item of fastDiscoveryExtras) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }
      for (const item of apiItems) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }
      for (const item of verifiedRssExtras) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }
      poolItems = mergeIntoCatalogPool([...merged.values()], cachedCatalog?.items ?? []);
      seedPlaylistTokens = { ...seedPlaylistTokens, ...playlistTokens };
      sourceMode = 'youtube_api';

      void recentApiPromise
        .then((allRecent) => {
          if (!cachedCatalog || allRecent.length === 0) return;
          const existing = new Set(cachedCatalog.items.map((i) => i.id));
          const extra = allRecent.filter((i) => !existing.has(i.id));
          if (extra.length > 0) {
            cachedCatalog.items = mergeIntoCatalogPool(extra, cachedCatalog.items);
          }
        })
        .catch(() => {});

      // Merge any slower discovery & RSS results asynchronously once settled
      void discoveryPromise
        .then((allDiscovery) => {
          if (!cachedCatalog || allDiscovery.length === 0) return;
          const existing = new Set(cachedCatalog.items.map((i) => i.id));
          const extra = allDiscovery.filter((i) => !existing.has(i.id));
          if (extra.length > 0) {
            cachedCatalog.items = mergeIntoCatalogPool(extra, cachedCatalog.items);
          }
        })
        .catch(() => {});

      if (apiItems.length >= 40) {
        void rssPromise
          .then(async (allRss) => {
            if (!cachedCatalog || allRss.length === 0) return;
            const existing = new Set(cachedCatalog.items.map((i) => i.id));
            const extraMap = buildRssExtraMap(allRss.filter((i) => !existing.has(i.id)));
            if (extraMap.size === 0) return;
            const verified = await hydrateAndVerifyCandidates(apiKey, extraMap);
            if (cachedCatalog && verified.length > 0) {
              cachedCatalog.items = mergeIntoCatalogPool(verified, cachedCatalog.items);
            }
          })
          .catch(() => {});
      }
    } catch {
      const discoveryPromise = fetchInitialDiscoveryExtras(
        '',
        new Set((cachedCatalog?.items ?? []).map((i) => i.id))
      );
      const [rssFallback, fastDiscoveryExtras] = await Promise.all([
        fetchFromCuratedRss(0, 2200),
        raceWithTimeout(discoveryPromise, 1400, [] as ChristianShort[]),
      ]);
      const merged = new Map<string, ChristianShort>();
      for (const item of fastDiscoveryExtras) merged.set(item.id, item);
      for (const item of rssFallback) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }
      poolItems = mergeIntoCatalogPool([...merged.values()], cachedCatalog?.items ?? []);
      sourceMode = 'curated_rss';

      void discoveryPromise
        .then((allDiscovery) => {
          if (!cachedCatalog || allDiscovery.length === 0) return;
          const existing = new Set(cachedCatalog.items.map((i) => i.id));
          const extra = allDiscovery.filter((i) => !existing.has(i.id));
          if (extra.length > 0) {
            cachedCatalog.items = mergeIntoCatalogPool(extra, cachedCatalog.items);
          }
        })
        .catch(() => {});
    }
  } else {
    const rssPromise = fetchFromCuratedRss(0, 2200);
    const discoveryPromise = fetchInitialDiscoveryExtras('', new Set());
    const [rssPage0, fastDiscoveryExtras] = await Promise.all([
      rssPromise,
      raceWithTimeout(discoveryPromise, 1400, [] as ChristianShort[]),
    ]);

    const merged = new Map<string, ChristianShort>();
    for (const item of fastDiscoveryExtras) merged.set(item.id, item);
    for (const item of rssPage0) {
      if (!merged.has(item.id)) merged.set(item.id, item);
    }
    poolItems = mergeIntoCatalogPool([...merged.values()], cachedCatalog?.items ?? []);
    sourceMode = 'curated_rss';

    void discoveryPromise
      .then((allDiscovery) => {
        if (!cachedCatalog || allDiscovery.length === 0) return;
        const existing = new Set(cachedCatalog.items.map((i) => i.id));
        const extra = allDiscovery.filter((i) => !existing.has(i.id));
        if (extra.length > 0) {
          cachedCatalog.items = mergeIntoCatalogPool(extra, cachedCatalog.items);
        }
      })
      .catch(() => {});
  }

  const fetchedAt = new Date().toISOString();
  cachedCatalog = {
    items: poolItems,
    sourceMode,
    fetchedAt,
    fetchedAtMs: nowMs,
    playlistTokens: seedPlaylistTokens,
  };
  return {
    items: poolItems,
    sourceMode,
    fetchedAt,
    playlistTokens: seedPlaylistTokens,
  };
}

async function enrichCatalogDepth(
  apiKey: string,
  apiKeyConfigured: boolean
): Promise<void> {
  if (!cachedCatalog) return;
  try {
    const existingIds = new Set(cachedCatalog.items.map((i) => i.id));
    const additions: ChristianShort[] = [];

    const rssArchivePromise = Promise.allSettled([
      fetchFromCuratedRss(1, 4500),
      fetchFromCuratedRss(2, 4500),
    ]);

    const extraDiscoveryCats: ContentCategory[] = [
      'escola_sabatina',
      'testemunhos',
      'pregacoes',
      'feliz7play',
      'louvores',
    ];
    const extraQueries: Array<{
      cat: ContentCategory;
      query: string;
      dateFilter: YoutubeWebDateFilter;
    }> = [];
    const filterCycle: YoutubeWebDateFilter[] = ['week', 'month', 'latest'];
    const sabbathCycle: YoutubeWebDateFilter[] = ['week', 'latest', 'week', 'relevance'];
    for (const cat of extraDiscoveryCats) {
      const queries = getDiscoveryQueriesForCategory(cat);
      const count = cat === 'escola_sabatina' ? 4 : cat === 'testemunhos' || cat === 'pregacoes' ? 3 : 2;
      const cycle = cat === 'escola_sabatina' ? sabbathCycle : filterCycle;
      for (let k = 0; k < count; k++) {
        const idx = globalDiscoveryOffsets[cat] % queries.length;
        globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % queries.length;
        extraQueries.push({
          cat,
          query: queries[idx],
          dateFilter: cycle[(idx + k) % cycle.length],
        });
      }
    }

    const canRunApiRecentSearch =
      isYoutubeApiUsable(apiKey) && Date.now() - lastApiSearchDiscoveryAtMs > 30 * 60 * 1000;
    if (canRunApiRecentSearch) {
      lastApiSearchDiscoveryAtMs = Date.now();
    }

    const effectiveKey = isYoutubeApiUsable(apiKey) ? apiKey : '';
    const [rssArchiveResults, discoveryResults, deeperApiResult, apiRecentDiscovery] =
      await Promise.all([
        rssArchivePromise,
        Promise.allSettled(
          extraQueries.map((job) =>
            fetchYoutubeWebSearch(effectiveKey, job.query, job.cat, job.dateFilter, existingIds)
          )
        ),
        isYoutubeApiUsable(apiKey)
          ? fetchFromYoutubeApi(apiKey, true).catch(() => null)
          : Promise.resolve(null),
        canRunApiRecentSearch
          ? fetchRecentApiDiscovery(apiKey, ['pregacoes', 'escola_sabatina', 'louvores'], existingIds).catch(
              () => [] as ChristianShort[]
            )
          : Promise.resolve([] as ChristianShort[]),
      ]);

    for (const item of apiRecentDiscovery) {
      if (!existingIds.has(item.id)) {
        existingIds.add(item.id);
        additions.push(item);
      }
    }

    if (deeperApiResult) {
      for (const item of deeperApiResult.items) {
        if (!existingIds.has(item.id)) {
          existingIds.add(item.id);
          additions.push(item);
        }
      }
      if (cachedCatalog) {
        cachedCatalog.playlistTokens = {
          ...cachedCatalog.playlistTokens,
          ...deeperApiResult.playlistTokens,
        };
      }
    }

    for (let i = 0; i < discoveryResults.length; i++) {
      const res = discoveryResults[i];
      const targetCat = extraQueries[i].cat;
      if (res.status !== 'fulfilled') continue;
      for (const item of res.value) {
        if (item.category === targetCat && !existingIds.has(item.id)) {
          existingIds.add(item.id);
          additions.push(item);
        }
      }
    }

    const rssArchiveCandidates = new Map<string, CandidateVideo>();
    for (const r of rssArchiveResults) {
      if (r.status !== 'fulfilled') continue;
      for (const item of r.value) {
        if (existingIds.has(item.id)) continue;
        if (apiKeyConfigured) {
          rssArchiveCandidates.set(item.id, {
            id: item.id,
            title: item.title,
            description: item.description,
            channelId: item.channelId,
            channelTitle: item.channelTitle,
            publishedAt: item.publishedAt,
            thumbnailUrl: item.thumbnailUrl,
            hintCategory: item.category,
          });
        } else {
          existingIds.add(item.id);
          additions.push(item);
        }
      }
    }

    if (apiKeyConfigured && rssArchiveCandidates.size > 0) {
      const verifiedArchive = await hydrateAndVerifyCandidates(apiKey, rssArchiveCandidates);
      for (const item of verifiedArchive) {
        if (!existingIds.has(item.id)) {
          existingIds.add(item.id);
          additions.push(item);
        }
      }
    }

    if (additions.length > 0 && cachedCatalog) {
      cachedCatalog.items = mergeIntoCatalogPool(additions, cachedCatalog.items);
    }
  } catch {
    // Non-fatal background depth enrichment
  }
}

export function warmCatalogInBackground(): void {
  if (cachedCatalog && Date.now() - cachedCatalog.fetchedAtMs < CACHE_TTL_MS) {
    return;
  }
  if (inFlightCatalogPromise) return;
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const apiKeyConfigured = apiKey.length > 0;
  inFlightCatalogPromise = buildBaseCatalog(apiKey, apiKeyConfigured, false)
    .then((result) => {
      if (!depthEnrichmentStarted) {
        depthEnrichmentStarted = true;
        void enrichCatalogDepth(apiKey, apiKeyConfigured);
      }
      return result;
    })
    .finally(() => {
      inFlightCatalogPromise = null;
    });
}

export async function fetchLatestNewVideoCandidates(): Promise<ChristianShort[]> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const rssLatest = await fetchFromCuratedRss(0, 4500).catch(() => [] as ChristianShort[]);
  const catalogById = new Map<string, ChristianShort>();
  for (const item of cachedCatalog?.items ?? []) {
    catalogById.set(item.id, item);
  }

  let verifiedRss: ChristianShort[] = [];
  if (isYoutubeApiUsable(apiKey) && rssLatest.length > 0) {
    const unverifiedMap = new Map<string, CandidateVideo>();
    for (const item of rssLatest) {
      const existing = catalogById.get(item.id);
      if (existing) {
        verifiedRss.push(existing);
      } else if (!unverifiedMap.has(item.id)) {
        unverifiedMap.set(item.id, {
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
    if (unverifiedMap.size > 0) {
      const newlyVerified = await hydrateAndVerifyCandidates(apiKey, unverifiedMap).catch(
        () => [] as ChristianShort[]
      );
      verifiedRss.push(...newlyVerified);
      if (cachedCatalog && newlyVerified.length > 0) {
        cachedCatalog.items = mergeIntoCatalogPool(newlyVerified, cachedCatalog.items);
      }
    }
  } else {
    verifiedRss = rssLatest;
  }

  const merged = new Map<string, ChristianShort>();
  for (const item of verifiedRss) {
    merged.set(item.id, item);
  }
  const recentCutoffMs = Date.now() - 48 * 60 * 60 * 1000;
  for (const item of cachedCatalog?.items ?? []) {
    const pubMs = Date.parse(item.publishedAt);
    if (!merged.has(item.id) && Number.isFinite(pubMs) && pubMs >= recentCutoffMs) {
      merged.set(item.id, item);
    }
  }

  const sortedCandidates = [...merged.values()]
    .filter(isCurrentDayEligibleItem)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return filterOutUpcomingUnverifiedItems(sortedCandidates, { maxChecks: 40 });
}

export async function getCuratedChristianShorts(options: {
  category?: string;
  q?: string;
  forceRefresh?: boolean;
  excludeIds?: string[];
  seed?: number;
  randomOffset?: number;
}): Promise<ShortsApiResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const apiKeyConfigured = apiKey.length > 0;
  const nowMs = Date.now();
  const trimmedQuery = (options.q || '').trim();
  const clientExcludeSet = new Set(options.excludeIds ?? []);
  const seedParam = options.seed;
  const randomOffsetParam = options.randomOffset ?? 0;
  const requestEntropy = Math.abs((seedParam ?? 0) + randomOffsetParam);
  const effectiveSeed =
    seedParam !== undefined || randomOffsetParam !== 0
      ? (seedParam ?? 0) ^ (randomOffsetParam * 2654435761)
      : undefined;
  const requestRng = effectiveSeed !== undefined ? createSeededRng(effectiveSeed) : Math.random;

  if (trimmedQuery.length >= 2 && !options.forceRefresh) {
    const searchCacheKey = `${options.category || 'all'}::${foldSearchText(trimmedQuery)}`;
    const cachedSearch = searchResponseCache.get(searchCacheKey);
    if (cachedSearch && cachedSearch.expiresAt > nowMs) {
      return cachedSearch.payload;
    }
  }

  let poolItems: ChristianShort[] = [];
  let sourceMode: 'youtube_api' | 'curated_rss' = 'curated_rss';
  let fetchedAt = new Date().toISOString();
  let seedPlaylistTokens: Record<string, string | null> = cachedCatalog?.playlistTokens ?? {};

  const hasWarmCatalog = cachedCatalog !== null && cachedCatalog.items.length >= 40;
  const cacheFresh = hasWarmCatalog && nowMs - cachedCatalog!.fetchedAtMs < CACHE_TTL_MS;

  if (hasWarmCatalog && cachedCatalog) {
    // Always serve instantaneously from warm in-memory catalog and refresh stale base catalog in background
    // instead of blocking user pulls/reopens for 6-8 seconds on a full 58-channel rebuild.
    poolItems = cachedCatalog.items;
    sourceMode = cachedCatalog.sourceMode;
    fetchedAt = cachedCatalog.fetchedAt;
    if (!cacheFresh && !inFlightCatalogPromise) {
      warmCatalogInBackground();
    }
  } else {
    if (!inFlightCatalogPromise) {
      inFlightCatalogPromise = buildBaseCatalog(
        apiKey,
        apiKeyConfigured,
        Boolean(options.forceRefresh)
      ).finally(() => {
        inFlightCatalogPromise = null;
      });
    }
    const built = await inFlightCatalogPromise;
    poolItems = built.items;
    sourceMode = built.sourceMode;
    fetchedAt = built.fetchedAt;
    seedPlaylistTokens = built.playlistTokens;
    if (!depthEnrichmentStarted) {
      depthEnrichmentStarted = true;
      void enrichCatalogDepth(apiKey, isYoutubeApiUsable(apiKey));
    }
  }

  poolItems = poolItems.filter(isCurrentDayEligibleItem);

  const validReqCat: ContentCategory | null =
    normalizeContentCategory(options.category) ?? null;

  // On app reopen or pull-to-refresh, pull fresh rotated deep playlist pages + web discovery
  // within a tight latency budget (<=2.8s when sparse, <=1.6s on normal refresh).
  if (!trimmedQuery && (clientExcludeSet.size > 0 || options.forceRefresh || validReqCat)) {
    const cats: ContentCategory[] = [
      'pregacoes',
      'escola_sabatina',
      'louvores',
      'testemunhos',
      'feliz7play',
    ];
    const totalUnseenInPool = poolItems.filter((i) => !clientExcludeSet.has(i.id)).length;
    const unseenCountByCat = cats.reduce(
      (acc, c) => {
        acc[c] = poolItems.filter((i) => i.category === c && !clientExcludeSet.has(i.id)).length;
        return acc;
      },
      {} as Record<ContentCategory, number>
    );
    const unseenPregacoesActors = new Set(
      poolItems
        .filter((i) => i.category === 'pregacoes' && !clientExcludeSet.has(i.id))
        .map(getDiversityActorKey)
    ).size;
    const lowPreacherDiversity = unseenPregacoesActors < 8;
    const lowUnseenCats = cats.filter((c) => {
      const minNeeded = c === 'louvores' ? 45 : 28;
      return unseenCountByCat[c] < minNeeded || (c === 'pregacoes' && lowPreacherDiversity);
    });
    const reopenDiscoveryCats = new Set<ContentCategory>(
      validReqCat
        ? [validReqCat]
        : options.forceRefresh
        ? cats
        : lowUnseenCats
    );
    const startRotate = (Math.floor(requestRng() * cats.length) + requestEntropy) % cats.length;
    if (!validReqCat) {
      for (let k = 0; k < cats.length && reopenDiscoveryCats.size < 3; k++) {
        reopenDiscoveryCats.add(cats[(startRotate + k) % cats.length]);
      }
    }
    const discoveryTargets = [...reopenDiscoveryCats];
    const sparseApiCats = validReqCat
      ? unseenCountByCat[validReqCat] < 24
        ? [validReqCat]
        : []
      : lowUnseenCats.filter(
          (c) => unseenCountByCat[c] < 24 || (c === 'pregacoes' && lowPreacherDiversity)
        );

    const runReopenReplenish = async (): Promise<ChristianShort[]> => {
      const reopenAdditions: ChristianShort[] = [];
      const reopenPlaylistPromises: Array<Promise<CandidateVideo[]>> = [];
      const canUseApi = isYoutubeApiUsable(apiKey);
      if (canUseApi) {
        const rotateTargets: Array<{ pid: string; hint: ContentCategory; token: string | null }> = [];
        const rotateSpecial = [
          ...pickRotatedPlaylists(
            NOVO_HINARIO_PLAYLISTS.filter((p) => !exhaustedPlaylistIds.has(p)),
            1,
            requestRng
          ),
          ...pickRotatedPlaylists(
            CD_JOVEM_PLAYLISTS.filter((p) => !exhaustedPlaylistIds.has(p)),
            2,
            requestRng
          ),
          ...pickRotatedPlaylists(
            ADORADORES_PLAYLISTS.filter((p) => !exhaustedPlaylistIds.has(p)),
            2,
            requestRng
          ),
        ];
        for (const pid of rotateSpecial) {
          const tok = persistentPlaylistTokens[pid] ?? null;
          if (tok) rotateTargets.push({ pid, hint: 'louvores', token: tok });
        }
        const targetCats = validReqCat
          ? ([validReqCat].filter((c) => c !== 'louvores') as ContentCategory[])
          : (['pregacoes', 'escola_sabatina', 'testemunhos', 'feliz7play'] as ContentCategory[]);
        for (const cat of targetCats) {
          const matchingChannels = ALL_CURATED_CHANNELS.filter(
            (ch) => ch.defaultCategory === cat || ch.allowInCategories.includes(cat)
          );
          const targetForCat = validReqCat ? 5 : options.forceRefresh ? 2 : cat === 'feliz7play' ? 2 : 3;
          const shuffledCh = pickRotatedPlaylists(
            matchingChannels.map((c) => c.id),
            targetForCat + 3,
            requestRng
          );
          let pickedForCat = 0;
          for (const chId of shuffledCh) {
            if (pickedForCat >= targetForCat) break;
            const suffix = chId.slice(2);
            const candidatePids =
              cat === 'escola_sabatina'
                ? [`UU${suffix}`, `UULF${suffix}`, `UUPV${suffix}`]
                : cat === 'pregacoes' || cat === 'feliz7play'
                ? [`UULF${suffix}`, `UUPV${suffix}`, `UU${suffix}`]
                : [`UU${suffix}`, `UUPV${suffix}`];
            for (const pid of candidatePids) {
              if (exhaustedPlaylistIds.has(pid)) continue;
              const tok = persistentPlaylistTokens[pid];
              if (tok || (validReqCat === 'escola_sabatina' && pid === `UU${suffix}` && tok === undefined)) {
                rotateTargets.push({ pid, hint: cat, token: tok ?? null });
                pickedForCat += 1;
                break;
              }
            }
          }
        }

        for (const t of rotateTargets) {
          reopenPlaylistPromises.push(
            fetchChannelPlaylistPage(apiKey, t.pid, t.hint, t.token, 30).then((r) => {
              persistentPlaylistTokens[t.pid] = r.nextPageToken;
              seedPlaylistTokens[t.pid] = r.nextPageToken;
              if (t.token && !r.nextPageToken) {
                exhaustedPlaylistIds.add(t.pid);
              }
              return r.candidates;
            })
          );
        }
      }

      if (discoveryTargets.length > 0 || reopenPlaylistPromises.length > 0 || sparseApiCats.length > 0) {
        try {
          const poolIdSet = new Set(poolItems.map((i) => i.id));
          const webSearchJobs: Array<{
            cat: ContentCategory;
            query: string;
            filter: YoutubeWebDateFilter;
          }> = [];
          const filters: YoutubeWebDateFilter[] = [
            'week',
            'month',
            'latest',
            'month',
            'year',
            'relevance',
          ];
          const sabbathFilters: YoutubeWebDateFilter[] = ['week', 'latest', 'week', 'relevance'];
          for (let dIdx = 0; dIdx < discoveryTargets.length; dIdx++) {
            const cat = discoveryTargets[dIdx];
            const queries = getDiscoveryQueriesForCategory(cat);
            const activeFilters = cat === 'escola_sabatina' ? sabbathFilters : filters;
            const jobCount =
              cat === 'pregacoes' && lowPreacherDiversity
                ? 3
                : cat === 'escola_sabatina' && unseenCountByCat[cat] < 12
                ? 4
                : unseenCountByCat[cat] < 16
                ? 2
                : 1;
            for (let j = 0; j < jobCount; j++) {
              const idx = (globalDiscoveryOffsets[cat] + requestEntropy + j) % queries.length;
              globalDiscoveryOffsets[cat] = (globalDiscoveryOffsets[cat] + 1) % queries.length;
              webSearchJobs.push({
                cat,
                query: queries[idx],
                filter: activeFilters[(idx + dIdx + j + requestEntropy) % activeFilters.length],
              });
            }
          }

          const combinedExcludeForDiscovery = new Set([...clientExcludeSet, ...poolIdSet]);
          const webApiKey = isYoutubeApiUsable(apiKey) ? apiKey : '';
          const [playlistRes, discoveryRes, sparseApiRes] = await Promise.all([
            reopenPlaylistPromises.length > 0
              ? Promise.allSettled(reopenPlaylistPromises)
              : Promise.resolve([]),
            webSearchJobs.length > 0
              ? Promise.allSettled(
                  webSearchJobs.map((job) =>
                    fetchYoutubeWebSearch(
                      webApiKey,
                      job.query,
                      job.cat,
                      job.filter,
                      combinedExcludeForDiscovery
                    )
                  )
                )
              : Promise.resolve([]),
            isYoutubeApiUsable(apiKey) && sparseApiCats.length > 0
              ? Promise.allSettled(
                  sparseApiCats.map((cat) =>
                    fetchPersistentApiDiscoveryPage(apiKey, cat, combinedExcludeForDiscovery)
                  )
                )
              : Promise.resolve([]),
          ]);

          const extraCandidates = new Map<string, CandidateVideo>();
          for (const r of playlistRes) {
            if (r.status !== 'fulfilled') continue;
            for (const c of r.value) {
              if (!poolIdSet.has(c.id) && !clientExcludeSet.has(c.id) && !extraCandidates.has(c.id)) {
                extraCandidates.set(c.id, c);
              }
            }
          }
          const hydratedPlaylists =
            isYoutubeApiUsable(apiKey) && extraCandidates.size > 0
              ? await hydrateAndVerifyCandidates(apiKey, extraCandidates)
              : [];

          for (const item of hydratedPlaylists) {
            if (!poolIdSet.has(item.id)) {
              poolIdSet.add(item.id);
              reopenAdditions.push(item);
            }
          }
          for (let i = 0; i < discoveryRes.length; i++) {
            const r = discoveryRes[i];
            const targetCat = webSearchJobs[i].cat;
            if (r.status !== 'fulfilled') continue;
            for (const item of r.value) {
              if (item.category === targetCat && !poolIdSet.has(item.id)) {
                poolIdSet.add(item.id);
                reopenAdditions.push(item);
              }
            }
          }
          for (let i = 0; i < sparseApiRes.length; i++) {
            const r = sparseApiRes[i];
            const targetCat = sparseApiCats[i];
            if (r.status !== 'fulfilled') continue;
            for (const item of r.value) {
              if (item.category === targetCat && !poolIdSet.has(item.id)) {
                poolIdSet.add(item.id);
                reopenAdditions.push(item);
              }
            }
          }

          if (reopenAdditions.length > 0 && cachedCatalog) {
            const existingCatIds = new Set(cachedCatalog.items.map((i) => i.id));
            const uniqueNew = reopenAdditions.filter((i) => !existingCatIds.has(i.id));
            if (uniqueNew.length > 0) {
              cachedCatalog.items = mergeIntoCatalogPool(uniqueNew, cachedCatalog.items);
              cachedCatalog.playlistTokens = seedPlaylistTokens;
            }
          }
        } catch {
          // Keep existing pool on transient discovery errors
        }
      }

      return reopenAdditions;
    };

    const mainAllCats: ContentCategory[] = ['pregacoes', 'escola_sabatina', 'louvores', 'testemunhos'];
    const lowMainCategoryStock = validReqCat
      ? unseenCountByCat[validReqCat] < 18
      : mainAllCats.some((c) => unseenCountByCat[c] < 16);
    const hasImmediateFeed = validReqCat
      ? !options.forceRefresh && unseenCountByCat[validReqCat] >= 12
      : !options.forceRefresh &&
        totalUnseenInPool >= 24 &&
        mainAllCats.every((c) => unseenCountByCat[c] >= (c === 'testemunhos' ? 2 : 5)) &&
        unseenPregacoesActors >= 5;

    let reopenAdditions: ChristianShort[] = [];
    if (!hasImmediateFeed && (totalUnseenInPool < 60 || lowMainCategoryStock || lowPreacherDiversity || options.forceRefresh)) {
      const waitBudgetMs =
        validReqCat && unseenCountByCat[validReqCat] < 8
          ? 3200
          : options.forceRefresh && totalUnseenInPool >= 80
          ? 1100
          : lowMainCategoryStock || lowPreacherDiversity
          ? 2000
          : 1400;
      reopenAdditions = await raceWithTimeout(
        runReopenReplenish(),
        waitBudgetMs,
        [] as ChristianShort[]
      );
      if (cachedCatalog) {
        poolItems = cachedCatalog.items;
      }
    } else if (
      lowMainCategoryStock ||
      lowPreacherDiversity ||
      totalUnseenInPool < 80 ||
      Date.now() - lastReopenReplenishAtMs > 4_000
    ) {
      lastReopenReplenishAtMs = Date.now();
      void runReopenReplenish();
    }

    const recentCutoffMs = Date.now() - 45 * 24 * 60 * 60 * 1000;
    const combinedUnseenMap = new Map<string, ChristianShort>();
    for (const item of reopenAdditions) {
      if (!clientExcludeSet.has(item.id)) combinedUnseenMap.set(item.id, item);
    }
    for (const item of poolItems) {
      if (!clientExcludeSet.has(item.id) && !combinedUnseenMap.has(item.id)) {
        combinedUnseenMap.set(item.id, item);
      }
    }
    const recentUnseen: ChristianShort[] = [];
    const archiveUnseen: ChristianShort[] = [];
    const hinarioArchiveCandidates: ChristianShort[] = [];
    for (const item of combinedUnseenMap.values()) {
      const pubMs = Date.parse(item.publishedAt);
      if (Number.isFinite(pubMs) && pubMs >= recentCutoffMs) {
        recentUnseen.push(item);
      } else if (item.category === 'louvores' && isNovoHinarioAdventistaItem(item)) {
        hinarioArchiveCandidates.push(item);
      } else {
        archiveUnseen.push(item);
      }
    }
    if (hinarioArchiveCandidates.length > 0) {
      const officialHinario = hinarioArchiveCandidates.filter(
        (i) => i.channelId === 'UCQhkLOO40bmTMeLcbspKW8A'
      );
      const otherHinario = hinarioArchiveCandidates.filter(
        (i) => i.channelId !== 'UCQhkLOO40bmTMeLcbspKW8A'
      );
      const shiftOfficial =
        officialHinario.length > 1 ? Math.abs(requestEntropy) % officialHinario.length : 0;
      if (shiftOfficial > 0) {
        officialHinario.push(...officialHinario.splice(0, shiftOfficial));
      }
      const orderedHinarioArchive = [...officialHinario, ...otherHinario];
      const promoteCount = Math.min(9, orderedHinarioArchive.length);
      recentUnseen.push(...orderedHinarioArchive.slice(0, promoteCount));
      archiveUnseen.push(...orderedHinarioArchive.slice(promoteCount));
    }
    poolItems = buildTieredDiverseFeed([recentUnseen, archiveUnseen], true, effectiveSeed);
  }

  // Always vary the opening order across categories and channels on every entry,
  // strictly exclude anything already displayed/watched, and filter any premiere/upcoming entry.
  const sanitizedPoolItems = poolItems.filter(
    (item) =>
      !isUpcomingOrPremiereEntry(item.title, item.description, item.publishedAt) &&
      isCurrentDayEligibleItem(item)
  );
  const baseItems =
    !trimmedQuery && (clientExcludeSet.size > 0 || options.forceRefresh)
      ? sanitizedPoolItems
      : buildDiverseFeed(
          trimmedQuery.length >= 2
            ? sanitizedPoolItems
            : sanitizedPoolItems.filter((item) => !clientExcludeSet.has(item.id)),
          true,
          effectiveSeed
        );

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
      const validCat = normalizeContentCategory(options.category) ?? null;
      const catHits = validCat
        ? liveCollected.filter((i) => i.category === validCat).length
        : liveCollected.length;

      if (catHits < 5 && searchToken) {
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
    seedPlaylistTokens,
    requestEntropy
  );

  // When searching live on YouTube, merge live YouTube hits + accent-folded token catalog matches,
  // ranked by direct relevance to the user's query (not scrambled by channel publish date).
  if (trimmedQuery.length >= 2) {
    const normalizedSearchCat = normalizeContentCategory(options.category);
    const category = options.category === 'all' ? 'all' : normalizedSearchCat ?? 'all';
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

    const validPrefCat = normalizedSearchCat;
    const orderedSearch = deduplicateShorts(
      rankSearchResults(
        await filterOutUpcomingUnverifiedItems(
          [...mergedSearch.values()].filter(isCurrentDayEligibleItem),
          { maxChecks: 30 }
        ),
        trimmedQuery,
        validPrefCat
      ),
      { allowSameSongVariants: true }
    );
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      escola_sabatina: 0,
      louvores: 0,
      testemunhos: 0,
      feliz7play: 0,
    };
    for (const item of orderedSearch) counts[item.category] += 1;
    const filtered =
      category === 'all' ? orderedSearch : orderedSearch.filter((i) => i.category === category);

    const searchPayload: ShortsApiResponse = {
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

    const searchCacheKey = `${category}::${foldSearchText(trimmedQuery)}`;
    if (searchResponseCache.size >= 50) {
      const oldestKey = searchResponseCache.keys().next().value;
      if (oldestKey) searchResponseCache.delete(oldestKey);
    }
    searchResponseCache.set(searchCacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      payload: searchPayload,
    });
    return searchPayload;
  }

  const candidatePoolForSlice =
    validReqCat === 'feliz7play'
      ? await filterOutUpcomingUnverifiedItems(
          combinedItems.filter((item) => item.category === 'feliz7play'),
          { maxChecks: 60 }
        )
      : combinedItems;

  let leanFeedItems = selectBalancedFeedSlice(
    candidatePoolForSlice,
    clientExcludeSet,
    45,
    randomOffsetParam,
    effectiveSeed
  );
  if (leanFeedItems.some((item) => item.durationSeconds == null)) {
    leanFeedItems = await filterOutUpcomingUnverifiedItems(leanFeedItems, { maxChecks: 50 });
  }
  return formatFilteredResponse(
    leanFeedItems,
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
  seed?: number;
  randomOffset?: number;
}): Promise<ShortsApiResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const apiKeyConfigured = apiKey.length > 0;
  const fetchedAt = new Date().toISOString();
  const validCat = normalizeContentCategory(options.category);
  const trimmedQuery = (options.q || '').trim();
  const seedParam = options.seed;
  const randomOffsetParam = options.randomOffset ?? 0;
  const requestEntropy = Math.abs((seedParam ?? 0) + randomOffsetParam);
  const effectiveSeed =
    seedParam !== undefined || randomOffsetParam !== 0
      ? (seedParam ?? 0) ^ (randomOffsetParam * 2654435761)
      : undefined;

  let cursor = options.cursor?.trim() || '';
  let state = cursor ? paginationSessions.get(cursor) : undefined;
  if (!state) {
    cursor = createPaginationCursor(
      options.excludeIds ?? [],
      null,
      cachedCatalog?.playlistTokens ?? {},
      requestEntropy
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
      if (!isCurrentDayEligibleItem(item)) return false;
      state!.seenIds.add(item.id);
      return true;
    });

    const orderedPage = deduplicateShorts(
      rankSearchResults(fresh, trimmedQuery, validCat),
      { allowSameSongVariants: true }
    );
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      escola_sabatina: 0,
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
    'escola_sabatina',
    'testemunhos',
    'louvores',
  ];
  const isAllFeed = !validCat;

  // Unlimited YouTube pagination via playlistItems.list + YouTube-wide discovery for EVERY category
  if (isYoutubeApiUsable(apiKey)) {
    const MAIN_ALL_CATS: Array<'pregacoes' | 'escola_sabatina' | 'testemunhos' | 'louvores'> = [
      'pregacoes',
      'escola_sabatina',
      'testemunhos',
      'louvores',
    ];
    const eligibleChannels = validCat
      ? ALL_CURATED_CHANNELS.filter(
          (ch) => ch.defaultCategory === validCat || ch.allowInCategories.includes(validCat)
        )
      : ALL_CURATED_CHANNELS.filter(
          (ch) =>
            ch.defaultCategory !== 'feliz7play' ||
            ch.allowInCategories.some((c) => c !== 'feliz7play')
        );

    const getPlaylistIdForChannel = (
      ch: (typeof ALL_CURATED_CHANNELS)[number],
      hintCat: ContentCategory
    ): string => {
      const suffix = ch.id.slice(2);
      if (hintCat === 'pregacoes' || hintCat === 'feliz7play') return `UULF${suffix}`;
      if (hintCat === 'escola_sabatina') return `UU${suffix}`;
      return `UU${suffix}`;
    };

    const specialLouvorEntries: Array<{ playlistId: string; hintCategory: ContentCategory }> = [];
    if (!validCat || validCat === 'louvores') {
      // Interleave Novo Hinário, CD Jovem, Adoradores in specialLouvorEntries
      const maxSpecial = Math.max(
        NOVO_HINARIO_PLAYLISTS.length,
        CD_JOVEM_PLAYLISTS.length,
        ADORADORES_PLAYLISTS.length
      );
      for (let i = 0; i < maxSpecial; i++) {
        if (i < NOVO_HINARIO_PLAYLISTS.length) {
          specialLouvorEntries.push({
            playlistId: NOVO_HINARIO_PLAYLISTS[i],
            hintCategory: 'louvores',
          });
        }
        if (i < CD_JOVEM_PLAYLISTS.length) {
          specialLouvorEntries.push({
            playlistId: CD_JOVEM_PLAYLISTS[i],
            hintCategory: 'louvores',
          });
        }
        if (i < ADORADORES_PLAYLISTS.length) {
          specialLouvorEntries.push({
            playlistId: ADORADORES_PLAYLISTS[i],
            hintCategory: 'louvores',
          });
        }
      }
    }

    const playlistPool: Array<{ playlistId: string; hintCategory: ContentCategory }> = [];
    if (validCat) {
      for (const entry of specialLouvorEntries) {
        playlistPool.push(entry);
      }
      for (const ch of eligibleChannels) {
        playlistPool.push({
          playlistId: getPlaylistIdForChannel(ch, validCat),
          hintCategory: validCat,
        });
        if (validCat === 'escola_sabatina') {
          const uulfPid = `UULF${ch.id.slice(2)}`;
          if (!state.playlistStates[uulfPid]?.done && !exhaustedPlaylistIds.has(uulfPid)) {
            playlistPool.push({
              playlistId: uulfPid,
              hintCategory: 'escola_sabatina',
            });
          }
        }
      }
    } else {
      // Interleave playlists across pregacoes, escola_sabatina, testemunhos, louvores so every batch
      // of 'all' pagination fetches balanced content from all 4 categories (excluding feliz7play).
      const perCatPools: Record<
        'pregacoes' | 'escola_sabatina' | 'testemunhos' | 'louvores',
        Array<{ playlistId: string; hintCategory: ContentCategory }>
      > = {
        pregacoes: [],
        escola_sabatina: [],
        testemunhos: [],
        louvores: [],
      };
      for (const ch of eligibleChannels) {
        const effectiveHint: 'pregacoes' | 'escola_sabatina' | 'testemunhos' | 'louvores' =
          ch.defaultCategory === 'feliz7play'
            ? (ch.allowInCategories.find((c) => c !== 'feliz7play') as
                | 'pregacoes'
                | 'escola_sabatina'
                | 'testemunhos'
                | 'louvores') || 'pregacoes'
            : ch.defaultCategory;
        perCatPools[effectiveHint].push({
          playlistId: getPlaylistIdForChannel(ch, effectiveHint),
          hintCategory: effectiveHint,
        });
      }
      // Interleave special louvor playlists with channel louvor playlists
      const louvorChannels = perCatPools.louvores;
      const mergedLouvor: Array<{ playlistId: string; hintCategory: ContentCategory }> = [];
      const maxL = Math.max(specialLouvorEntries.length, louvorChannels.length);
      for (let i = 0; i < maxL; i++) {
        if (i < louvorChannels.length) mergedLouvor.push(louvorChannels[i]);
        if (i < specialLouvorEntries.length) mergedLouvor.push(specialLouvorEntries[i]);
      }
      perCatPools.louvores = mergedLouvor;

      const maxPerCat = Math.max(
        perCatPools.pregacoes.length,
        perCatPools.escola_sabatina.length,
        perCatPools.testemunhos.length,
        perCatPools.louvores.length
      );
      for (let i = 0; i < maxPerCat; i++) {
        for (const cat of MAIN_ALL_CATS) {
          const list = perCatPools[cat];
          if (list.length > 0) {
            playlistPool.push(list[i % list.length]);
          }
        }
      }
    }

    const collected: ChristianShort[] = [];
    const overflowCollected: ChristianShort[] = [];
    const actorCountsInBatch = new Map<string, number>();
    const channelCountsInBatch = new Map<string, number>();
    const maxActorPerPage = validCat === 'pregacoes' ? 3 : 6;
    const maxChannelPerPage = validCat === 'pregacoes' ? 4 : 8;

    const pushDiversifiedItem = (item: ChristianShort) => {
      if (validCat && item.category !== validCat) return;
      if (isAllFeed && item.category === 'feliz7play') return;
      if (!isCurrentDayEligibleItem(item)) return;
      if (state!.seenIds.has(item.id)) return;
      const actorKey = getDiversityActorKey(item);
      const chKey = item.channelId || item.channelTitle;
      const actorCount = actorCountsInBatch.get(actorKey) ?? 0;
      const chCount = channelCountsInBatch.get(chKey) ?? 0;
      if (actorCount < maxActorPerPage && chCount < maxChannelPerPage) {
        state!.seenIds.add(item.id);
        collected.push(item);
        actorCountsInBatch.set(actorKey, actorCount + 1);
        channelCountsInBatch.set(chKey, chCount + 1);
      } else {
        overflowCollected.push(item);
      }
    };

    const maxAttempts = validCat === 'pregacoes' ? 3 : 2;
    const targetMin = validCat === 'pregacoes' ? 20 : validCat === 'testemunhos' ? 14 : 18;
    const minActorsTarget = validCat === 'pregacoes' ? 7 : 4;

    for (
      let attempt = 0;
      attempt < maxAttempts &&
      (collected.length < targetMin ||
        (validCat === 'pregacoes' && actorCountsInBatch.size < minActorsTarget));
      attempt++
    ) {
      if (!isYoutubeApiUsable(apiKey)) break;
      const batchTargets: Array<{
        playlistId: string;
        hintCategory: ContentCategory;
      }> = [];

      const total = playlistPool.length;
      const batchSize = Math.min(10, total);
      const batchOffset = (state.round * batchSize + (requestEntropy % Math.max(1, total))) % Math.max(1, total);
      for (let i = 0; i < total && batchTargets.length < batchSize; i++) {
        const entry = playlistPool[(batchOffset + i) % total];
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
          } else if (isYoutubeApiUsable(apiKey)) {
            state!.playlistStates[target.playlistId] = {
              nextPageToken: null,
              done: true,
            };
          }
          return res.candidates;
        })
      );

      if (!isYoutubeApiUsable(apiKey)) break;

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
        pushDiversifiedItem(item);
      }
    }

    let anyPlaylistRemaining = false;
    for (const entry of playlistPool) {
      if (!state.playlistStates[entry.playlistId]?.done) {
        anyPlaylistRemaining = true;
        break;
      }
    }

    const missingAllCategories = isAllFeed
      ? MAIN_ALL_CATS.filter((cat) => !collected.some((item) => item.category === cat))
      : [];

    // Run unlimited YouTube-wide discovery for EVERY category (always keeping strict category rules)
    const needsSpeakerDiversity =
      validCat === 'pregacoes' && actorCountsInBatch.size < minActorsTarget;
    const shouldSearchYoutube =
      collected.length < 18 ||
      needsSpeakerDiversity ||
      missingAllCategories.length > 0 ||
      !anyPlaylistRemaining ||
      state.round % 2 === 1;
    if (shouldSearchYoutube) {
      if (isAllFeed && missingAllCategories.length > 0) {
        const missingDiscovered = await Promise.allSettled(
          missingAllCategories.map((cat) => fetchCategoryDiscoveryPage(apiKey, cat, state))
        );
        for (const res of missingDiscovered) {
          if (res.status !== 'fulfilled') continue;
          for (const item of res.value) {
            pushDiversifiedItem(item);
          }
        }
      } else if (validCat === 'pregacoes' || validCat === 'escola_sabatina') {
        const parallelQueries =
          validCat === 'escola_sabatina' && collected.length < 12
            ? 4
            : (validCat === 'pregacoes' && needsSpeakerDiversity) || collected.length < 10
            ? 3
            : 2;
        const settledCategory = await Promise.allSettled(
          Array.from({ length: parallelQueries }, () =>
            fetchCategoryDiscoveryPage(apiKey, validCat, state)
          )
        );
        for (const res of settledCategory) {
          if (res.status !== 'fulfilled') continue;
          for (const item of res.value) {
            pushDiversifiedItem(item);
          }
        }
      } else {
        const searchTries = collected.length === 0 ? 4 : collected.length < 10 ? 3 : 2;
        for (let sTry = 0; sTry < searchTries && collected.length < 24; sTry++) {
          const discoveryCat =
            validCat ??
            ALL_DISCOVERY_ROTATION[(state.allCycleIdx++ + requestEntropy) % ALL_DISCOVERY_ROTATION.length];
          const discovered = await fetchCategoryDiscoveryPage(apiKey, discoveryCat, state);
          for (const item of discovered) {
            pushDiversifiedItem(item);
          }
        }
      }
    }

    if (overflowCollected.length > 0 && cachedCatalog) {
      cachedCatalog.items = mergeIntoCatalogPool(overflowCollected, cachedCatalog.items);
    }
    if (collected.length < 8 && overflowCollected.length > 0) {
      for (const item of overflowCollected) {
        if (collected.length >= 16) break;
        if (!state.seenIds.has(item.id)) {
          state.seenIds.add(item.id);
          collected.push(item);
        }
      }
    }

    if (collected.length > 0) {
      const diverse = buildDiverseFeed(collected, true, effectiveSeed);
      return formatFilteredResponse(
        diverse,
        isYoutubeApiUsable(apiKey) ? 'youtube_api' : 'curated_rss',
        apiKeyConfigured,
        fetchedAt,
        options.category,
        '',
        true,
        cursor
      );
    }
  }

  // RSS archive fallback pagination + parallel zero-quota YouTube web discovery for EVERY category
  const rssPage = state.rssPage;
  state.rssPage += 1;
  const fresh: ChristianShort[] = [];
  const fallbackOverflow: ChristianShort[] = [];
  const fallbackActorCounts = new Map<string, number>();
  const fallbackChannelCounts = new Map<string, number>();
  const fallbackMaxActor = validCat === 'pregacoes' ? 3 : 6;
  const fallbackMaxChannel = validCat === 'pregacoes' ? 4 : 8;

  const pushFallbackItem = (item: ChristianShort) => {
    if (validCat && item.category !== validCat) return;
    if (isAllFeed && item.category === 'feliz7play') return;
    if (!isCurrentDayEligibleItem(item)) return;
    if (state!.seenIds.has(item.id)) return;
    const actorKey = getDiversityActorKey(item);
    const chKey = item.channelId || item.channelTitle;
    const actorCount = fallbackActorCounts.get(actorKey) ?? 0;
    const chCount = fallbackChannelCounts.get(chKey) ?? 0;
    if (actorCount < fallbackMaxActor && chCount < fallbackMaxChannel) {
      state!.seenIds.add(item.id);
      fresh.push(item);
      fallbackActorCounts.set(actorKey, actorCount + 1);
      fallbackChannelCounts.set(chKey, chCount + 1);
    } else {
      fallbackOverflow.push(item);
    }
  };

  if (rssPage <= 2) {
    const rssItems = await fetchFromCuratedRss(rssPage);
    for (const item of rssItems) {
      pushFallbackItem(item);
    }
  }
  if (fresh.length < 18 || rssPage > 2 || (validCat === 'pregacoes' && fallbackActorCounts.size < 6)) {
    const discoveryCats: ContentCategory[] = validCat
      ? [validCat, validCat, validCat]
      : [...ALL_DISCOVERY_ROTATION];
    const settledDiscovery = await Promise.allSettled(
      discoveryCats.map((cat) => fetchCategoryDiscoveryPage('', cat, state))
    );
    for (const r of settledDiscovery) {
      if (r.status !== 'fulfilled') continue;
      for (const item of r.value) {
        pushFallbackItem(item);
      }
    }
    if (validCat && fresh.length < 8) {
      const targetWaveCats: ContentCategory[] = [validCat, validCat, validCat] as ContentCategory[];
      const secondWave = await Promise.allSettled(
        targetWaveCats.map((cat) => fetchCategoryDiscoveryPage('', cat, state))
      );
      for (const r of secondWave) {
        if (r.status !== 'fulfilled') continue;
        for (const item of r.value) {
          pushFallbackItem(item);
        }
      }
    }
  }
  if (fresh.length < 8 && fallbackOverflow.length > 0) {
    for (const item of fallbackOverflow) {
      if (fresh.length >= 16) break;
      if (!state.seenIds.has(item.id)) {
        state.seenIds.add(item.id);
        fresh.push(item);
      }
    }
  }
  const safeFresh = await filterOutUpcomingUnverifiedItems(
    fresh.filter(
      (item) =>
        !isUpcomingOrPremiereEntry(item.title, item.description, item.publishedAt) &&
        isCurrentDayEligibleItem(item)
    ),
    { maxChecks: 40 }
  );
  const diverse = buildDiverseFeed(safeFresh, true, effectiveSeed);

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
    if (found) {
      if (!isCurrentDayEligibleItem(found)) return null;
      if (found.durationSeconds == null && (await isWatchPageUpcomingPremiere(found.id))) {
        return null;
      }
      return found;
    }
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
        v.snippet.description || '',
        undefined,
        { publishedAt: pubAt }
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
    if (await isWatchPageUpcomingPremiere(videoId)) return null;
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
