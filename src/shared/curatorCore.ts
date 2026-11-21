import type {
  ChristianShort,
  ContentCategory,
  DoctrineScope,
  ShortsApiResponse,
} from '../types/shorts.ts';

export interface CuratedChannelSpec {
  id: string;
  title: string;
  doctrineScope: DoctrineScope;
  defaultCategory: ContentCategory;
  allowInCategories: ContentCategory[];
}

export const ADVENTIST_CHANNELS: CuratedChannelSpec[] = [
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
  {
    id: 'UC_w2igv5oCWmO9gG0TE-Lag',
    title: 'Pedro Valença',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCaguCXr6xlC5ytGAloOrR5A',
    title: 'Desbravadores DSA',
    doctrineScope: 'adventista',
    defaultCategory: 'testemunhos',
    allowInCategories: ['testemunhos', 'pregacoes', 'biblia'],
  },
];

export const CHRISTIAN_GENERAL_CHANNELS: CuratedChannelSpec[] = [
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
  {
    id: 'UCQp4yrRCGdGWi4TrF6xJyfg',
    title: 'Morada Oficial',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCHBbuIdm7UZ2t6iVhMihBIw',
    title: 'Fhop Music',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UC8Ni3V6ZtpGJiFTqxjHjPAw',
    title: 'Ministério Zoe',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCz47owLttsWIx5b9PX3itHg',
    title: 'Theo Rubia',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCYsFmUXbwaq-8XMJOdtFK2w',
    title: 'Eli Soares',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCAHUhfptduo5zq102PC9jew',
    title: 'Sarah Farias',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCgxdaV6GyDg-WxXU7yMzrYA',
    title: 'Jefferson & Suellen',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
];

export const ALL_CURATED_CHANNELS = [...ADVENTIST_CHANNELS, ...CHRISTIAN_GENERAL_CHANNELS];
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

export function decodeXmlEntities(str: string): string {
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

function isAdventistVerified(
  channelId: string,
  channelTitle: string,
  title: string,
  description: string
): boolean {
  if (ADVENTIST_CHANNEL_IDS.has(channelId)) return true;
  const combined = `${channelTitle} ${title} ${description}`;
  return ADVENTIST_IDENTITY_PATTERNS.some((re) => re.test(combined));
}

function hasChristianRelevance(
  title: string,
  description: string,
  channelTitle: string,
  channelId: string
): boolean {
  if (CHANNEL_BY_ID.has(channelId)) return true;
  const combined = `${channelTitle} ${title} ${description}`;
  return CHRISTIAN_RELEVANCE_PATTERNS.some((re) => re.test(combined));
}

export function classifyShort(
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

  let detectedCategory: ContentCategory =
    hintCategory ?? channelSpec?.defaultCategory ?? 'pregacoes';

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

export function parseIso8601DurationSeconds(iso: string | undefined): number | null {
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

export function buildShortRecord(params: {
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

export function parseChannelRssXml(
  xml: string,
  spec: CuratedChannelSpec,
  isDedicatedShortsPlaylist: boolean
): ChristianShort[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const results: ChristianShort[] = [];

  for (const entry of entries) {
    const videoId = extractXmlTag(entry, 'yt:videoId');
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue;

    const linkMatch = entry.match(/<link\s+rel="alternate"\s+href="([^"]+)"/i);
    const linkHref = linkMatch ? linkMatch[1] : '';

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

export async function fetchCuratedRssWithAdapter(
  fetchXml: (url: string) => Promise<string | null>
): Promise<ChristianShort[]> {
  const responses = await Promise.allSettled(
    ALL_CURATED_CHANNELS.map(async (spec) => {
      const uushPlaylistId = `UUSH${spec.id.slice(2)}`;
      const urls = [
        `https://www.youtube.com/feeds/videos.xml?playlist_id=${uushPlaylistId}`,
        `https://www.youtube.com/feeds/videos.xml?channel_id=${spec.id}`,
      ];

      for (let i = 0; i < urls.length; i++) {
        try {
          const text = await fetchXml(urls[i]);
          if (text && text.includes('<entry>')) {
            return parseChannelRssXml(text, spec, i === 0);
          }
        } catch {
          // Try fallback feed URL
        }
      }
      return [] as ChristianShort[];
    })
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

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeTitleKey(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/#[a-z0-9_]+/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function deduplicateShorts(items: ChristianShort[]): ChristianShort[] {
  const seenIds = new Set<string>();
  const seenGlobalTitles = new Set<string>();
  const seenChannelTitles = new Set<string>();
  const unique: ChristianShort[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;

    const titleKey = normalizeTitleKey(item.title);
    const channelTitleKey = `${item.channelId}:${titleKey}`;

    if (titleKey.length >= 14 && seenGlobalTitles.has(titleKey)) continue;
    if (titleKey.length >= 6 && seenChannelTitles.has(channelTitleKey)) continue;

    seenIds.add(item.id);
    if (titleKey.length >= 14) seenGlobalTitles.add(titleKey);
    if (titleKey.length >= 6) seenChannelTitles.add(channelTitleKey);
    unique.push(item);
  }

  return unique;
}

export function buildDiverseFeed(
  items: ChristianShort[],
  randomize: boolean
): ChristianShort[] {
  const uniqueItems = deduplicateShorts(items);
  const categories: ContentCategory[] = ['pregacoes', 'biblia', 'louvores', 'testemunhos'];
  if (randomize) {
    shuffleInPlace(categories);
  }

  const categoryStreams: Record<ContentCategory, ChristianShort[]> = {
    pregacoes: [],
    biblia: [],
    louvores: [],
    testemunhos: [],
  };

  for (const cat of categories) {
    const catItems = uniqueItems.filter((item) => item.category === cat);
    const byChannel = new Map<string, ChristianShort[]>();

    for (const item of catItems) {
      const list = byChannel.get(item.channelId) ?? [];
      list.push(item);
      byChannel.set(item.channelId, list);
    }

    const channelQueues = [...byChannel.values()].map((list) => {
      const ordered = [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      return randomize ? shuffleInPlace(ordered) : ordered;
    });

    if (randomize) {
      shuffleInPlace(channelQueues);
    } else {
      channelQueues.sort((a, b) =>
        (b[0]?.publishedAt || '').localeCompare(a[0]?.publishedAt || '')
      );
    }

    let added = true;
    while (added) {
      added = false;
      for (const queue of channelQueues) {
        const next = queue.shift();
        if (next) {
          categoryStreams[cat].push(next);
          added = true;
        }
      }
    }
  }

  const interleaved: ChristianShort[] = [];
  let lastChannelId: string | null = null;
  let remaining = true;

  while (remaining) {
    remaining = false;
    for (const cat of categories) {
      const stream = categoryStreams[cat];
      if (stream.length === 0) continue;
      remaining = true;

      let pickIdx = stream.findIndex((item) => item.channelId !== lastChannelId);
      if (pickIdx === -1) pickIdx = 0;

      const [picked] = stream.splice(pickIdx, 1);
      if (picked) {
        interleaved.push(picked);
        lastChannelId = picked.channelId;
      }
    }
  }

  return interleaved;
}

export function formatFilteredResponse(
  allItems: ChristianShort[],
  sourceMode: 'youtube_api' | 'curated_rss',
  apiKeyConfigured: boolean,
  fetchedAt: string,
  rawCategory?: string,
  rawQuery?: string
): ShortsApiResponse {
  const validCategories = new Set(['all', 'pregacoes', 'biblia', 'louvores', 'testemunhos']);
  const category = rawCategory && validCategories.has(rawCategory) ? rawCategory : 'all';
  const sanitizedQuery = (rawQuery || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 80)
    .toLowerCase();

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
