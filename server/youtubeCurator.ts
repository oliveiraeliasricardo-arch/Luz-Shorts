import type {
  ChristianShort,
  ContentCategory,
  DoctrineScope,
  ShortsApiResponse,
} from '../src/types/shorts.ts';

interface CuratedChannelSpec {
  id: string;
  title: string;
  doctrineScope: DoctrineScope;
  defaultCategory: ContentCategory;
  allowInCategories: ContentCategory[];
}

const ADVENTIST_CHANNELS: CuratedChannelSpec[] = [
  {
    id: 'UC_OaSsAydgSIjUtjYn9qLog',
    title: 'Rede Novo Tempo de Comunicação',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos'],
  },
  {
    id: 'UCJAO3KgZdEhCqwpkZyAYY6A',
    title: 'Adventistas Brasil',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos'],
  },
  {
    id: 'UCIa6p9HWw1hEEfHzfJOcSbA',
    title: 'Na Mira da Verdade',
    doctrineScope: 'adventista',
    defaultCategory: 'biblia',
    allowInCategories: ['biblia', 'pregacoes'],
  },
  {
    id: 'UCn4M9vLHegNuqM8tnL872cA',
    title: 'Rodrigo Silva Arqueologia',
    doctrineScope: 'adventista',
    defaultCategory: 'biblia',
    allowInCategories: ['biblia', 'pregacoes'],
  },
  {
    id: 'UCLb09BPgh7xrswJRgYQthuw',
    title: 'Lições da Bíblia',
    doctrineScope: 'adventista',
    defaultCategory: 'biblia',
    allowInCategories: ['biblia'],
  },
  {
    id: 'UCQ62PZK_94Rr8i96vJkYNXw',
    title: 'Adventistas Sudeste',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos'],
  },
  {
    id: 'UCwR4Dq46B1a0Ce2RnahKLDw',
    title: 'Adventistas Sul',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos'],
  },
  {
    id: 'UCoWb0aR2SIR4UnizdQ37tiw',
    title: 'Adventistas Nordeste',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos'],
  },
  {
    id: 'UCXgUPYQ33A2ZI6WZja6uFBw',
    title: 'Adventistas Centro-Oeste',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos'],
  },
  {
    id: 'UCtHb-m1Jb5ZZoFb33husTBA',
    title: 'Adventistas Norte',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos'],
  },
  {
    id: 'UCkSu5ibA15OcBWTjop72dPA',
    title: 'Terceiro Anjo',
    doctrineScope: 'adventista',
    defaultCategory: 'biblia',
    allowInCategories: ['biblia', 'pregacoes'],
  },
  {
    id: 'UCxDYiN3jS_3EuPSjhj1utbg',
    title: 'Gravadora Novo Tempo',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCldCtvi4dAqZvd5-QLf5QvQ',
    title: 'Arautos do Rei',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores'],
  },
];

const CHRISTIAN_GENERAL_CHANNELS: CuratedChannelSpec[] = [
  {
    id: 'UCK_FvuzJN7rP4k2Ppwnvj5g',
    title: 'Aline Barros',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCH1U29foC-5RyAa4ZgkuQYA',
    title: 'Fernandinho',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UC4t2mdI8uAiJDJSRjiWJT1Q',
    title: 'Gabriela Rocha',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCAcbgThZJ4Iq-f1oPl4p8jw',
    title: 'Isadora Pompeo',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UC9OxCWIzoGYYKNcRpEYBH3g',
    title: 'Ministério Mergulhar',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCvD2SL774HBW1YOracUjlqw',
    title: 'Dunamis Music',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores'],
  },
];

const ALL_CURATED_CHANNELS = [...ADVENTIST_CHANNELS, ...CHRISTIAN_GENERAL_CHANNELS];
const ADVENTIST_CHANNEL_IDS = new Set(ADVENTIST_CHANNELS.map((c) => c.id));
const CHANNEL_BY_ID = new Map(ALL_CURATED_CHANNELS.map((c) => [c.id, c]));

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  pregacoes: 'Pregação',
  biblia: 'Bíblia e Evangelho',
  louvores: 'Louvor',
  testemunhos: 'Testemunho',
};

const DOCTRINE_LABELS: Record<DoctrineScope, string> = {
  adventista: 'Doutrina Adventista',
  cristao_geral: 'Cristão Livre',
};

const BLOCKED_GENERAL_TERMS = [
  'tigrinho',
  'betano',
  'blaze',
  'aposta',
  'cassino',
  'tarot',
  'horóscopo',
  'horoscopo',
  'astrologia',
  'signo',
  'bbb',
  'fofoca',
  'política partidária',
  'candidato',
  'eleição',
  'funk proibidão',
  'sertanejo universitário',
  'paródia',
  'parodia',
  'pegadinha',
  'react polêmico',
  'escândalo',
  'escandalo',
  'jogos de azar',
];

const BLOCKED_DOCTRINAL_CONFLICT_TERMS = [
  'teologia da prosperidade',
  'sessão do descarrego',
  'descarrego',
  'fogueira santa',
  'manto sagrado',
  'água ungida',
  'rosa ungida',
  'voto financeiro',
  'oração forte para enriquecer',
  'salmo da riqueza',
  'imortalidade da alma',
  'alma penada',
  'purgatório',
  'purgatorio',
  'oração aos santos',
  'oracao aos santos',
  'ave maria',
  'nossa senhora',
  'reencarnação',
  'reencarnacao',
  'espiritismo',
  'kardec',
  'umbanda',
  'candomblé',
  'candomble',
];

const ADVENTIST_IDENTITY_PATTERNS = [
  /\badventista/i,
  /\biasd\b/i,
  /\bnovo tempo\b/i,
  /\btv novo tempo\b/i,
  /\best[aá] escrito\b/i,
  /\bna mira da verdade\b/i,
  /\bescola sabatina\b/i,
  /\bli[cç][oõ]es da b[ií]blia\b/i,
  /\brodrigo silva\b/i,
  /\bterceiro anjo\b/i,
  /\bleandro quadros\b/i,
  /\bivan saraiva\b/i,
  /\blu[ií]s gon[cç]alves\b/i,
  /\balejandro bull[oó]n\b/i,
  /\barilton oliveira\b/i,
  /\brafael rossi\b/i,
  /\bmichelson borges\b/i,
  /\bgilson brito\b/i,
  /\bodailson fonseca\b/i,
  /\btito rocha\b/i,
  /\b1844\b/i,
  /\bs[aá]bado\b.*\b(selo|senhor|quarto mandamento|bíblia|deus)\b/i,
  /\barautos do rei\b/i,
  /\bgravadora nt\b/i,
];

const CHRISTIAN_RELEVANCE_PATTERNS = [
  /\bdeus\b/i,
  /\bjesus\b/i,
  /\bcristo\b/i,
  /\besp[ií]rito santo\b/i,
  /\bb[ií]blia\b/i,
  /\bevangelho\b/i,
  /\blouvor/i,
  /\badora[cç][aã]o\b/i,
  /\bhino\b/i,
  /\bora[cç][aã]o\b/i,
  /\bf[eé]\b/i,
  /\btestemunho\b/i,
  /\bmilagre\b/i,
  /\bgospel\b/i,
  /\bigreja\b/i,
  /\bsalmo\b/i,
  /\bsalva[cç][aã]o\b/i,
  /\besperan[cç]a\b/i,
  /\bprega[cç][aã]o\b/i,
  /\bserm[aã]o\b/i,
  /\bs[aá]bado\b/i,
  /\bprofecia\b/i,
];

const TESTIMONY_PATTERNS = [
  /\btestemunh/i,
  /\bmilagre/i,
  /\bcura(do|da|r)?\b/i,
  /\bconvers[aã]o\b/i,
  /\bbatism/i,
  /\bmudou (a )?minha vida\b/i,
  /\bdeus me (salvou|curou|resgatou|livrou)\b/i,
  /\blivramento\b/i,
  /\bhist[oó]ria real\b/i,
  /\bhist[oó]ria de f[eé]\b/i,
  /\benxergue milagres\b/i,
  /\btoda ora[cç][aã]o tem um rosto\b/i,
  /\baposentadoria com prop[oó]sito\b/i,
  /\bimpacto esperan[cç]a\b/i,
  /\bmiss[aã]o\b/i,
];

const WORSHIP_PATTERNS = [
  /\blouvor/i,
  /\badora[cç][aã]o\b/i,
  /\bhino\b/i,
  /\bm[uú]sica/i,
  /\bcantar|can[cç][aã]o\b/i,
  /\bcoral\b/i,
  /\bclipe\b/i,
  /\bac[uú]stic/i,
  /\bgravadora\b/i,
  /\barautos\b/i,
  /\badoradores\b/i,
  /\bplayback\b/i,
  /\bmedley\b/i,
  /\bsess[aã]o\b/i,
  /\baovivo|ao vivo\b/i,
];

const BIBLE_GOSPEL_PATTERNS = [
  /\bb[ií]bli/i,
  /\bvers[ií]culo\b/i,
  /\bevangelho\b/i,
  /\bprofecia\b/i,
  /\bapocalipse\b/i,
  /\bdaniel\b/i,
  /\bg[eê]nesis\b/i,
  /\bsalmos?\b/i,
  /\barqueologia\b/i,
  /\bs[aá]bado\b/i,
  /\b1844\b/i,
  /\bsantu[aá]rio\b/i,
  /\bestudo\b/i,
  /\bdoutrina\b/i,
  /\bmandamento/i,
  /\bvolta de jesus\b/i,
  /\bna mira\b/i,
  /\brodrigo silva\b/i,
  /\bpor que\b/i,
  /\bo que jesus falou\b/i,
  /\bdeus criou\b/i,
];

const NON_SPIRITUAL_NOISE_PATTERNS = [
  /\binscri[cç][oõ]es (na|para)\b/i,
  /\bmatricule-se\b/i,
  /\bgyd25\b/i,
  /\baviso importante\b/i,
  /\btrailer oficial\b/i,
  /\bsorteio\b/i,
  /\bcupom\b/i,
];

const CACHE_TTL_MS = 15 * 60 * 1000;
let cachedCatalog: {
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  fetchedAt: string;
  fetchedAtMs: number;
} | null = null;

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function containsBlockedTerms(text: string, blocked: string[]): boolean {
  const lower = text.toLowerCase();
  return blocked.some((term) => lower.includes(term));
}

function isAdventistVerified(channelId: string, channelTitle: string, title: string, description: string): boolean {
  if (ADVENTIST_CHANNEL_IDS.has(channelId)) return true;
  const combined = `${channelTitle} ${title} ${description}`;
  return ADVENTIST_IDENTITY_PATTERNS.some((re) => re.test(combined));
}

function hasChristianRelevance(title: string, description: string, channelTitle: string, channelId: string): boolean {
  if (CHANNEL_BY_ID.has(channelId)) return true;
  const combined = `${channelTitle} ${title} ${description}`;
  return CHRISTIAN_RELEVANCE_PATTERNS.some((re) => re.test(combined));
}

function classifyShort(
  channelId: string,
  channelTitle: string,
  title: string,
  description: string,
  hintCategory?: ContentCategory
): { category: ContentCategory; doctrineScope: DoctrineScope } | null {
  const combined = `${title} ${description}`;

  if (containsBlockedTerms(combined, BLOCKED_GENERAL_TERMS)) {
    return null;
  }
  if (NON_SPIRITUAL_NOISE_PATTERNS.some((re) => re.test(title))) {
    return null;
  }

  const channelSpec = CHANNEL_BY_ID.get(channelId);
  const adventist = isAdventistVerified(channelId, channelTitle, title, description);

  if (!hasChristianRelevance(title, description, channelTitle, channelId)) {
    return null;
  }

  // Determine natural category from text + channel role
  let detectedCategory: ContentCategory = hintCategory ?? channelSpec?.defaultCategory ?? 'pregacoes';

  const titleIndicatesTestimony = TESTIMONY_PATTERNS.some((re) => re.test(title));
  const titleIndicatesWorship = WORSHIP_PATTERNS.some((re) => re.test(title));
  const titleIndicatesBible = BIBLE_GOSPEL_PATTERNS.some((re) => re.test(title));

  if (titleIndicatesTestimony && !titleIndicatesWorship) {
    detectedCategory = 'testemunhos';
  } else if (titleIndicatesWorship) {
    detectedCategory = 'louvores';
  } else if (titleIndicatesBible) {
    detectedCategory = 'biblia';
  } else if (channelSpec?.defaultCategory === 'louvores') {
    detectedCategory = 'louvores';
  } else if (TESTIMONY_PATTERNS.some((re) => re.test(combined))) {
    detectedCategory = 'testemunhos';
  } else if (channelSpec) {
    detectedCategory = channelSpec.defaultCategory;
  }

  // Enforce strict doctrinal rule:
  // Sermons (pregacoes) & Bible/Gospel (biblia) MUST adhere to Seventh-day Adventist doctrine
  if (detectedCategory === 'pregacoes' || detectedCategory === 'biblia') {
    if (!adventist) {
      return null;
    }
    if (containsBlockedTerms(combined, BLOCKED_DOCTRINAL_CONFLICT_TERMS)) {
      return null;
    }
    return {
      category: detectedCategory,
      doctrineScope: 'adventista',
    };
  }

  // Worship (louvores) & Testimonies (testemunhos) may be from any Christian denomination
  return {
    category: detectedCategory,
    doctrineScope: adventist ? 'adventista' : 'cristao_geral',
  };
}

function parseIso8601DurationSeconds(iso: string | undefined): number | null {
  if (!iso) return null;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const hours = Number(m[1] || 0);
  const mins = Number(m[2] || 0);
  const secs = Number(m[3] || 0);
  return hours * 3600 + mins * 60 + secs;
}

function formatDurationLabel(totalSeconds: number | null): string | null {
  if (totalSeconds === null || totalSeconds <= 0) return null;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function buildShortRecord(params: {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl?: string;
  category: ContentCategory;
  doctrineScope: DoctrineScope;
  durationSeconds?: number | null;
  viewCount?: number | null;
}): ChristianShort {
  const durationSeconds = params.durationSeconds ?? null;
  return {
    id: params.id,
    title: normalizeText(params.title),
    description: normalizeText(params.description).slice(0, 320),
    channelId: params.channelId,
    channelTitle: normalizeText(params.channelTitle),
    publishedAt: params.publishedAt,
    thumbnailUrl:
      params.thumbnailUrl || `https://i.ytimg.com/vi/${params.id}/hqdefault.jpg`,
    category: params.category,
    categoryLabel: CATEGORY_LABELS[params.category],
    doctrineScope: params.doctrineScope,
    doctrineLabel: DOCTRINE_LABELS[params.doctrineScope],
    durationSeconds,
    durationLabel: formatDurationLabel(durationSeconds),
    viewCount: params.viewCount ?? null,
    youtubeUrl: `https://www.youtube.com/watch?v=${params.id}`,
    shortsUrl: `https://www.youtube.com/shorts/${params.id}`,
  };
}

function extractXmlTag(block: string, tag: string): string {
  const escaped = tag.replace(':', '\\:');
  const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
  return match ? decodeXmlEntities(match[1].trim()) : '';
}

async function fetchChannelRssShorts(spec: CuratedChannelSpec): Promise<ChristianShort[]> {
  const uushPlaylistId = `UUSH${spec.id.slice(2)}`;
  const urls = [
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${uushPlaylistId}`,
    `https://www.youtube.com/feeds/videos.xml?channel_id=${spec.id}`,
  ];

  let xml = '';
  let isDedicatedShortsPlaylist = false;

  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LuzShorts/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const text = await res.text();
        if (text.includes('<entry>')) {
          xml = text;
          isDedicatedShortsPlaylist = i === 0;
          break;
        }
      }
    } catch {
      // Try next URL
    }
  }

  if (!xml) return [];

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const results: ChristianShort[] = [];

  for (const entry of entries) {
    const videoId = extractXmlTag(entry, 'yt:videoId');
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue;

    const linkMatch = entry.match(/<link\s+rel="alternate"\s+href="([^"]+)"/i);
    const linkHref = linkMatch ? linkMatch[1] : '';

    // When reading the general channel feed (not UUSH), keep only true Shorts links
    if (!isDedicatedShortsPlaylist && !linkHref.includes('/shorts/')) {
      continue;
    }

    const title = extractXmlTag(entry, 'title');
    if (!title) continue;

    const description = extractXmlTag(entry, 'media:description');
    const publishedAt = extractXmlTag(entry, 'published') || new Date().toISOString();
    const authorName = extractXmlTag(entry, 'name') || spec.title;

    const thumbMatch = entry.match(/<media:thumbnail\s+url="([^"]+)"/i);
    const viewsMatch = entry.match(/<media:statistics\s+views="(\d+)"/i);
    const viewCount = viewsMatch ? Number(viewsMatch[1]) : null;

    const classified = classifyShort(spec.id, authorName, title, description);
    if (!classified) continue;

    results.push(
      buildShortRecord({
        id: videoId,
        title,
        description,
        channelId: spec.id,
        channelTitle: authorName,
        publishedAt,
        thumbnailUrl: thumbMatch ? thumbMatch[1] : undefined,
        category: classified.category,
        doctrineScope: classified.doctrineScope,
        viewCount,
      })
    );
  }

  return results;
}

async function fetchFromYoutubeApi(apiKey: string): Promise<ChristianShort[]> {
  const searchPlans: Array<{
    q: string;
    channelId?: string;
    hintCategory: ContentCategory;
  }> = [
    // Adventist sermons & gospel preaching
    { q: 'pregação adventista #shorts', hintCategory: 'pregacoes' },
    { q: 'sermão esperança novo tempo #shorts', channelId: 'UC_OaSsAydgSIjUtjYn9qLog', hintCategory: 'pregacoes' },
    { q: 'mensagem adventista #shorts', channelId: 'UCJAO3KgZdEhCqwpkZyAYY6A', hintCategory: 'pregacoes' },
    // Adventist Bible & Prophecy studies
    { q: 'estudo bíblico adventista #shorts', hintCategory: 'biblia' },
    { q: 'na mira da verdade #shorts', channelId: 'UCIa6p9HWw1hEEfHzfJOcSbA', hintCategory: 'biblia' },
    { q: 'rodrigo silva arqueologia bíblia #shorts', channelId: 'UCn4M9vLHegNuqM8tnL872cA', hintCategory: 'biblia' },
    // Christian worship (any denomination)
    { q: 'louvor cristão adoração #shorts', hintCategory: 'louvores' },
    { q: 'música gospel louvor #shorts', hintCategory: 'louvores' },
    { q: 'arautos do rei gravadora nt #shorts', hintCategory: 'louvores' },
    // Christian testimonies (any denomination)
    { q: 'testemunho cristão fé milagre #shorts', hintCategory: 'testemunhos' },
    { q: 'testemunho evangelho conversão #shorts', hintCategory: 'testemunhos' },
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
        maxResults: '10',
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

  // Enrich and verify embeddability + exact duration via videos.list (batches of 50)
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

async function fetchFromCuratedRss(): Promise<ChristianShort[]> {
  const responses = await Promise.allSettled(
    ALL_CURATED_CHANNELS.map((spec) => fetchChannelRssShorts(spec))
  );

  const deduped = new Map<string, ChristianShort>();
  for (const res of responses) {
    if (res.status !== 'fulfilled') continue;
    for (const item of res.value) {
      if (!deduped.has(item.id)) {
        deduped.set(item.id, item);
      }
    }
  }

  return [...deduped.values()];
}

function interleaveByCategoryAndRecency(items: ChristianShort[]): ChristianShort[] {
  const sorted = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const buckets: Record<ContentCategory, ChristianShort[]> = {
    pregacoes: [],
    biblia: [],
    louvores: [],
    testemunhos: [],
  };

  for (const item of sorted) {
    buckets[item.category].push(item);
  }

  const order: ContentCategory[] = ['pregacoes', 'biblia', 'louvores', 'testemunhos'];
  const interleaved: ChristianShort[] = [];
  let added = true;

  while (added) {
    added = false;
    for (const cat of order) {
      const next = buckets[cat].shift();
      if (next) {
        interleaved.push(next);
        added = true;
      }
    }
  }

  return interleaved;
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

  if (apiKeyConfigured) {
    try {
      const apiItems = await fetchFromYoutubeApi(apiKey);
      // Merge with RSS curated Adventist & worship Shorts to guarantee rich category depth
      const rssItems = await fetchFromCuratedRss();
      const merged = new Map<string, ChristianShort>();
      for (const item of apiItems) merged.set(item.id, item);
      for (const item of rssItems) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }
      items = interleaveByCategoryAndRecency([...merged.values()]);
      sourceMode = 'youtube_api';
    } catch {
      items = interleaveByCategoryAndRecency(await fetchFromCuratedRss());
      sourceMode = 'curated_rss';
    }
  } else {
    items = interleaveByCategoryAndRecency(await fetchFromCuratedRss());
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

function formatFilteredResponse(
  allItems: ChristianShort[],
  sourceMode: 'youtube_api' | 'curated_rss',
  apiKeyConfigured: boolean,
  fetchedAt: string,
  rawCategory?: string,
  rawQuery?: string
): ShortsApiResponse {
  const validCategories = new Set(['all', 'pregacoes', 'biblia', 'louvores', 'testemunhos']);
  const category = rawCategory && validCategories.has(rawCategory) ? rawCategory : 'all';
  const sanitizedQuery = (rawQuery || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80).toLowerCase();

  const queryFiltered = sanitizedQuery
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(sanitizedQuery) ||
          item.channelTitle.toLowerCase().includes(sanitizedQuery) ||
          item.description.toLowerCase().includes(sanitizedQuery) ||
          item.categoryLabel.toLowerCase().includes(sanitizedQuery)
      )
    : allItems;

  const categoryCounts: Record<ContentCategory, number> = {
    pregacoes: 0,
    biblia: 0,
    louvores: 0,
    testemunhos: 0,
  };
  for (const item of queryFiltered) {
    categoryCounts[item.category] += 1;
  }

  const items =
    category === 'all'
      ? queryFiltered
      : queryFiltered.filter((item) => item.category === category);

  return {
    items,
    sourceMode,
    apiKeyConfigured,
    fetchedAt,
    category,
    totalBeforeCategoryFilter: queryFiltered.length,
    categoryCounts,
  };
}

export async function lookupSingleShort(videoId: string): Promise<ChristianShort | null> {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  // First check cached catalog
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

  // Fallback to YouTube oEmbed (strictly constructed URL from validated 11-char ID)
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
