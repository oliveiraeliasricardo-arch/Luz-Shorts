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
    allowInCategories: ['pregacoes', 'escola_sabatina', 'testemunhos'],
  },
  {
    id: 'UCJAO3KgZdEhCqwpkZyAYY6A',
    title: 'Adventistas Brasil',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'testemunhos'],
  },
  {
    id: 'UCIa6p9HWw1hEEfHzfJOcSbA',
    title: 'Na Mira da Verdade',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes'],
  },
  {
    id: 'UCn4M9vLHegNuqM8tnL872cA',
    title: 'Rodrigo Silva Arqueologia',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes'],
  },
  {
    id: 'UCLb09BPgh7xrswJRgYQthuw',
    title: 'Lições da Bíblia',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina'],
  },
  {
    id: 'UCSIjHSkAS_IpF7R-HIsn88Q',
    title: 'Pr Dudu Batista',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina', 'pregacoes'],
  },
  {
    id: 'UC0EqK_oNy4Gb7QThhcWlIgA',
    title: 'Pr. Diego Trindade',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina', 'pregacoes'],
  },
  {
    id: 'UCw6ZgfMHtcLn_O-YwRw27eA',
    title: 'Eu Estudo a Lição com Pr. Samuel Camilo',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina'],
  },
  {
    id: 'UCd_fEdecs3BaUMvsK6FZMww',
    title: 'Lúcio Bérgamo',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina', 'pregacoes'],
  },
  {
    id: 'UCLa0xeWUGdFlw4s2mZLwv0w',
    title: 'Pr Paulo Dresch',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina', 'pregacoes'],
  },
  {
    id: 'UCZ5izlUsz7UpZnQOcxN4_dQ',
    title: 'Pr Samuel Ramos',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina', 'pregacoes'],
  },
  {
    id: 'UCAUglmSESHH79_4vPjL_I-Q',
    title: 'Rádio Novo Tempo',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'escola_sabatina'],
  },
  {
    id: 'UCqBWNMZ4WSSOvCiC4qRhz7Q',
    title: 'Safeliz Português',
    doctrineScope: 'adventista',
    defaultCategory: 'escola_sabatina',
    allowInCategories: ['escola_sabatina'],
  },
  {
    id: 'UCyMzbdHJXABTxcHV7CHmKkQ',
    title: 'Adventismo Vivo',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes'],
  },
  {
    id: 'UCslQjMJUdi2CurBP0Fveqvw',
    title: 'Paulistasul',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes'],
  },
  {
    id: 'UCQ62PZK_94Rr8i96vJkYNXw',
    title: 'Adventistas Sudeste',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'testemunhos'],
  },
  {
    id: 'UCwR4Dq46B1a0Ce2RnahKLDw',
    title: 'Adventistas Sul',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'testemunhos', 'louvores'],
  },
  {
    id: 'UCoWb0aR2SIR4UnizdQ37tiw',
    title: 'Adventistas Nordeste',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'testemunhos'],
  },
  {
    id: 'UCXgUPYQ33A2ZI6WZja6uFBw',
    title: 'Adventistas Centro-Oeste',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'testemunhos'],
  },
  {
    id: 'UCtHb-m1Jb5ZZoFb33husTBA',
    title: 'Adventistas Norte',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'testemunhos'],
  },
  {
    id: 'UC5O76sK8ffuQBHuPlB0QmeA',
    title: 'Adventistas SP',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'testemunhos', 'louvores'],
  },
  {
    id: 'UC8PS8EsZsWXOQ1YmlJwCaYw',
    title: 'Feliz7Play',
    doctrineScope: 'adventista',
    defaultCategory: 'feliz7play',
    allowInCategories: ['feliz7play'],
  },
  {
    id: 'UC4E-81u6afu-KY14PPeg4VQ',
    title: 'Feliz7Kids',
    doctrineScope: 'adventista',
    defaultCategory: 'feliz7play',
    allowInCategories: ['feliz7play'],
  },
  {
    id: 'UCC_6_OXZRP5PVuzJLfINXLg',
    title: 'NT Kids',
    doctrineScope: 'adventista',
    defaultCategory: 'feliz7play',
    allowInCategories: ['feliz7play'],
  },
  {
    id: 'UCpYhv-j3DeaOYhPByA4-eLQ',
    title: 'Nosso Amiguinho Oficial',
    doctrineScope: 'adventista',
    defaultCategory: 'feliz7play',
    allowInCategories: ['feliz7play'],
  },
  {
    id: 'UCa0Nja57-8BPQn3C2e-qhhw',
    title: 'Minha Vida É Uma Viagem',
    doctrineScope: 'adventista',
    defaultCategory: 'feliz7play',
    allowInCategories: ['feliz7play'],
  },
  {
    id: 'UC03Y0ieYROxw1FxCoDaSF9g',
    title: 'Arilton Oliveira - Oficial',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'escola_sabatina'],
  },
  {
    id: 'UCkSu5ibA15OcBWTjop72dPA',
    title: 'Terceiro Anjo',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes'],
  },
  {
    id: 'UCs5jiNO6fntcZcCn7sUO6VA',
    title: 'Pastor Bullón em Português - Canal Oficial',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes'],
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
    id: 'UCPlmObuWWQegQCgLkTlS2cw',
    title: 'Daniel Lüdtke',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCj14fcdKiGxi2qQsqhPf9tg',
    title: 'Adoradores Novo Tempo',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores'],
  },
  {
    id: 'UCQhkLOO40bmTMeLcbspKW8A',
    title: 'Casa Publicadora Brasileira',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores'],
  },
  {
    id: 'UCIvT_5iKmxPksHRqv4g_GZQ',
    title: 'Ministério Jovem',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores'],
  },
  {
    id: 'UCFTFFVStluyIusWi71Yc0sA',
    title: 'MENOS UM',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores'],
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
    id: 'UCbVwJCxsVbmaP1PFmbGQDeQ',
    title: 'MK MUSIC',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCpf5YXmzGHC4m5uLCdlrrfA',
    title: 'Todah Music',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCkskLrHR3ga1AG_QS-trE6w',
    title: 'Musile Records',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UC8JmlV43Vtjtuhba8VT_FCg',
    title: 'CASA Worship',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UC52rxcnme1pYpUfRrC4WWfQ',
    title: 'Julliany Souza',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCo9xJDQC7M8mHavPh_BvXFA',
    title: 'Kemuel',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCwjkR1Md6fDeBd8Ad1VUhYg',
    title: 'Laura Souguellis',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
  },
  {
    id: 'UCHChf-4C1TocXXa__lffjpw',
    title: 'Igreja Presbiteriana do Brasil',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'testemunhos',
    allowInCategories: ['testemunhos'],
  },
  {
    id: 'UCKEM87jzVqdIfAdTr0xNBfA',
    title: 'Pastor Antônio Júnior',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'testemunhos',
    allowInCategories: ['testemunhos'],
  },
  {
    id: 'UCu3fo1sp7UN3M6pEXltEb3g',
    title: 'TV Evangélica Brasileira',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'testemunhos',
    allowInCategories: ['testemunhos'],
  },
  {
    id: 'UCm_nEAH7DCfjmXUbNkN6JFw',
    title: 'Instituto Hesed',
    doctrineScope: 'cristao_geral',
    defaultCategory: 'testemunhos',
    allowInCategories: ['testemunhos'],
  },
];

export const ALL_CURATED_CHANNELS = [...ADVENTIST_CHANNELS, ...CHRISTIAN_GENERAL_CHANNELS];
const ADVENTIST_CHANNEL_IDS = new Set(ADVENTIST_CHANNELS.map((c) => c.id));
const CHANNEL_BY_ID = new Map(ALL_CURATED_CHANNELS.map((c) => [c.id, c]));

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  pregacoes: 'Pregações e Bíblia',
  escola_sabatina: 'Escola Sabatina',
  louvores: 'Louvor',
  testemunhos: 'Testemunho',
  feliz7play: 'Feliz7Play',
};

export function normalizeContentCategory(raw?: string | null): ContentCategory | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (trimmed === 'biblia') return 'pregacoes';
  if (
    trimmed === 'pregacoes' ||
    trimmed === 'escola_sabatina' ||
    trimmed === 'louvores' ||
    trimmed === 'testemunhos' ||
    trimmed === 'feliz7play'
  ) {
    return trimmed;
  }
  return undefined;
}

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
  'igreja de deus todo-poderoso',
  'eastern lightning',
  'free fire',
  'minecraft',
  'roblox',
  'pk xd',
  'pkxd',
  'gameplay',
  'gta v',
  'campeonato brasileiro',
  'novela',
  'tutorial de maquiagem',
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

const NON_ADVENTIST_PREACHER_OR_DENOM_RE =
  /\b(silas malafaia|edir macedo|r\.?\s*r\.?\s*soares|valdemiro santiago|marco feliciano|deive leonardo|tiago brunet|andr[eé] valad[aã]o|cl[aá]udio duarte|felippe valad[aã]o|josu[eé] brand[aã]o|hernandes dias lopes|augustus nicodemus|paulo junior|luciano subir[aá]|yago martins|elizeu rodrigues|camila barros|rodrigo mocellin|renato cardoso|bruno leonardo|padres?\s+[a-záéíóúâêôãõç]+|frei\s+[a-záéíóúâêôãõç]+|can[cç][aã]o nova|tv aparecida|igreja cat[oó]lica|igreja universal|mundial do poder de deus|igreja da gra[cç]a|assembleia de deus|cpad|\bebd\b|escola b[ií]blica dominical|editora betel|lagoinha|congrega[cç][aã]o crist[aã]|testemunhas de jeov[aá]|m[oó]rmon|esp[ií]rita)\b/i;

const ADVENTIST_IDENTITY_PATTERNS = [
  /\badventista/i,
  /\biasd\b/i,
  /\b(tv novo tempo|r[aá]dio novo tempo|gravadora novo tempo|canal novo tempo|novo tempo oficial|rede novo tempo|adoradores novo tempo|nt kids|nt play|novo tempo\s*[-|•:])\b/i,
  /\b(programa est[aá] escrito|est[aá] escrito(\s+brasil)?\s*[-|•:])\b/i,
  /\bna mira da verdade\b/i,
  /\bescola sabatina\b/i,
  /\bli[cç][oõ]es da b[ií]blia\b/i,
  /\b(no)?comtexto(\s+(b[ií]blico|di[aá]rio))?\b/i,
  /\badventismo vivo\b/i,
  /\bpr\.?\s*dudu(\s+batista)?\b/i,
  /\bluan\s+fran[cç]a\b/i,
  /\bpaulistasul\b/i,
  /\bprovai\s+e\s+vede\b/i,
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
  /\bs[aá]bado\b.*\b(selo|senhor|quarto mandamento|b[ií]blia|deus)\b/i,
  /\barautos do rei\b/i,
  /\badoradores(\s*(novo tempo|[1-5]))?\b/i,
  /\bnovo hin[aá]rio\b/i,
  /\bcd\s*jovem\b/i,
  /\bminist[eé]rio jovem\b/i,
  /\bmenos um\b/i,
  /\bcasa publicadora brasileira\b/i,
  /\bgravadora nt\b/i,
  /\berton k[oö]hler\b/i,
  /\bstanley arco\b/i,
  /\bkleber gon[cç]alves\b/i,
  /\bfelippe amorim\b/i,
  /\bgustavo marques\b/i,
  /\bmark finley\b/i,
  /\bdoug batchelor\b/i,
  /\bunasp\b/i,
  /\bfadba\b|\biaene\b/i,
  /\bcanal esperan[cç]a\b/i,
  /\bfeliz7play\b/i,
  /\bfeliz7kids\b/i,
  /\bnt kids\b/i,
  /\bnosso amiguinho\b/i,
  /\bminha vida [eé] uma viagem\b/i,
  /\bdefensores da b[ií]blia\b/i,
  /\bcamelo na agulha\b/i,
  /\bellen(\s+g\.?)?\s+white\b/i,
];

const SECULAR_OFF_CONTEXT_TITLE_RE =
  /\b(receita(s)?\s+(de|f[aá]cil|caseira|t[ií]pica|simples)|receita:|como fazer bolo|bolo de (banana|milho|fub[aá]|cenoura|chocolate|laranja|lim[aã]o|coco|trigo|rolo|festa|pote|anivers[aá]rio)|bolo (simples|fofinho)|de liquidificador|receita de pudim|fa[cç]a\s+seu\s+bolo|modo\s+de\s+preparo|ingredientes|renda extra|#empreendedorismo|flamengo\s*tv|corinthians\s*tv|palmeiras\s*tv|vasco\s*tv|som do meng[aã]o|meng[aã]o|flamengo\s+tetra|sr\s+waldemar|gl[oó]ria\s+eterna|melhores\s+momentos|brasileir[aã]o|libertadores|copa\s+do\s+brasil|campeonato\s+(carioca|paulista|mineiro|ga[uú]cho|brasileiro)|\bnbb\b|coletiva\s+de\s+imprensa|hino\s+do\s+(flamengo|corinthians|palmeiras|s[aã]o\s+paulo|vasco|botafogo|gr[eê]mio|internacional|cruzeiro|atl[eé]tico|santos|bahia|fluminense|nacional)|funk\s+do\s+|peppa\s+pig|galinha\s+pintadinha|patrulha\s+canina|bolofofos|mundo\s+bita|onde\s+est[aá]\s+chicky|giramille|cavalinho\s+colorido|cocomelon|baby\s+shark|emmanuel\s+cortes|pabllo\s+vittar|anitta|ludmilla|lu[ií]sa\s+sonza|gloria\s+groove|gusttavo\s+lima|mar[ií]lia\s+mendon[cç]a|henrique\s+e\s+juliano|jorge\s+e\s+mateus|ana\s+castela|luan\s+santana|alok|matu[eê]|mc\s+(daniel|ryan|ig|hariel|kevin|poze|livinho|pedrinho|cabelinho)|kondzilla|gr6\s+explode|love\s+funk|par[oó]dia)\b|#flamengo\b/i;

const CHRISTIAN_RELEVANCE_PATTERNS = [
  /\bdeus\b/i,
  /\bjesus(\s+cristo)?\b/i,
  /\bcristo\b/i,
  /\besp[ií]rito santo\b/i,
  /\bb[ií]bli[ao]s?\b/i,
  /\bevangelho\b/i,
  /\bevangelic[oa]s?\b/i,
  /\badventista/i,
  /\biasd\b/i,
  /\blouvor(es)?\b/i,
  /\badora[cç][aã]o\b/i,
  /\bhino(s)?\s+(adventista|evang[eé]lic[oa]s?|crist[aã]o?s?|de\s+louvor|da\s+harpa|do\s+hin[aá]rio|iasd|\d{1,3}\b)/i,
  /\b(novo\s+)?hin[aá]rio(\s+adventista)?\b/i,
  /\bharpa crist[aã]\b/i,
  /\bora[cç][aã]o\b/i,
  /\b(f[eé]\s+(em\s+deus|em\s+cristo|em\s+jesus|crist[aã]|adventista)|homem\s+de\s+f[eé]|mulher\s+de\s+f[eé]|pela\s+f[eé]|poder\s+da\s+f[eé]|testemunho\s+de\s+f[eé])\b/i,
  /\btestemunho\b/i,
  /\bmilagre\b/i,
  /\bgospel\b/i,
  /\bigreja\b/i,
  /\bsalmo(s)?\b/i,
  /\bsalva[cç][aã]o\b/i,
  /\bprega[cç][aã]o\b/i,
  /\bserm[aã]o\b/i,
  /\b(feliz\s+s[aá]bado|s[aá]bado\s+(do\s+senhor|santo|b[ií]blia)|guarda\s+do\s+s[aá]bado|escola\s+sabatina|quarto\s+mandamento)\b/i,
  /\bprofecia\b/i,
  /\bapocalipse\b/i,
  /\b(livro\s+de\s+daniel|profeta\s+daniel|daniel\s+\d+|daniel\s+e\s+apocalipse|daniel\s+l[uü]dtke)\b/i,
  /\bg[eê]nesis\b/i,
  /\baleluia\b/i,
  /\bmaranata\b/i,
  /\bhosana\b/i,
  /\b(gra[cç]a\s+de\s+deus|gra[cç]a\s+divina|maravilhosa\s+gra[cç]a|gra[cç]a\s+music|pela\s+gra[cç]a)\b/i,
  /\bpastor\b/i,
  /\bcrist[aã]o?\b/i,
  /\bcd\s*jovem\b/i,
  /\bminist[eé]rio jovem\b/i,
  /\bfeliz7play\b/i,
  /\bfeliz7kids\b/i,
  /\bnt kids\b/i,
  /\bnosso amiguinho\b/i,
  /\bdefensores da b[ií]blia\b/i,
  /\b(mk music|todah music|musile records|onimusic|gra[cç]a music|central gospel|som livre gospel|universal music christian|sony music gospel|gravadora nt|casa publicadora brasileira|diante do trono|voz da verdade|aline barros|fernandinho|gabriela rocha|isadora pompeo|gabriel guedes|anderson freire|morada|fhop music|casa worship|thalles roberto|preto no branco|kleber lucas|bruna karla|cassiane|eyshila|elaine martins|damares|eli soares|sarah farias|julliany souza|theo rubia|paulo c[eé]sar baruk|leonardo gon[cç]alves|laura morena|arautos do rei|novo tom|pedro valen[cç]a|adoradores novo tempo|isa[ií]as saad|juliano son|livres para adorar|n[ií]vea soares|ana n[oó]brega|alessandro vilas boas|lukas agustinho|sued silva|midian lima|maria mar[cç]al|valesca mayssa|gerson rufino|kemuel|minist[eé]rio zoe|davi sacer|toque no altar|trazendo a arca|renascer praise|palavrantiga|oficina g3|rosa de saron|anjos de resgate|3\s*palavrinhas|turminha da promessa|reino kids)\b/i,
];

const NON_PORTUGUESE_PATTERNS = [
  /[¿¡]/,
  /\b(despierta am[eé]rica|univision|semana del pa[ñn]uelo|reina para siempre|mil gracias|conquistadores)\b/i,
  /\b(la llama|cristo y nada m[aá]s|en tu presencia|te alabamos)\b/i,
  /\b(educaci[oó]n|predicaci[oó]n|oraci[oó]n|salvaci[oó]n|bendici[oó]n|coraz[oó]n|lecci[oó]n|escuela sab[aá]tica|para j[oó]venes|deja de|en espa[ñn]ol|iglesia adventista del)\b/i,
  /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i,
  /\b(d[ií]a\s*\d+\s*\|.*(semana|adventista)|\(esp\))\b/i,
  /\bgozo\s*[–-]\s*aline barros\b/i,
  /\(espa[ñn]ol\)|\bun[ao]s chicos\b|\bel regalo de nick\b|\blos tres libros\b|\bbasta de l[aá]grimas\b|\bpertenecemos\b|\bdefensores de la biblia\b|\binvencibles\b|\bun mini villano\b|\b(el gran|los defensores|las aventuras|cap[ií]tulo \d+.*espa[ñn]ol|para ni[ñn]os)\b/i,
];

const AI_GENERATED_PATTERNS = [
  /\b(gerad[oa]|criad[oa]|feit[oa]|produzid[oa]|cantad[oa]|narrad[oa]|compost[oa]|anima[cç][aã]o|m[uú]sica|can[cç][aã]o|v[ií]deo|clipe|voz|arte)\s+(por|com|via|em|de)\s+(ia|intelig[eê]ncia artificial)\b/i,
  /\b(ia\s+gospel|gospel\s+(com\s+|de\s+|em\s+)?ia|louvor\s+(adventista\s+)?(com\s+|de\s+|em\s+)?ia|adventista\s+ia)\b/i,
  /\b(made with ai|ai[- ]generated|ai[- ]music|ai[- ]cover|ai[- ]animation|ai[- ]video|ai[- ]voice|synthetic content)\b/i,
  /\b(suno\.?ai|suno|udio|elevenlabs|midjourney|runwayml|heygen|kling ai|sora ai|hailuo|leonardo\.ai)\b/i,
  /#(ia|aiart|aivideo|aimusic|aicover|suno|sunoai|udio|runway|sora|kling|veo|midjourney|elevenlabs|heygen)\b/i,
  /♫\s*♪\s*♬|\bt[ií]tulo:\s*["“]?|vers[aã]o adaptada\b/i,
  /\bcd\s*jovem\s*(adventista\s*)?202[6-9]\s*(\|\s*)?vol\.?\s*\d+|\bkem7play\b/i,
];

const NOISE_AND_PROMO_PATTERNS = [
  /\binscri[cç][oõ]es (na|para|abertas)\b/i,
  /\bmatricule-se\b/i,
  /\bgyd25\b/i,
  /\baviso importante\b/i,
  /\btrailer oficial\b/i,
  /\bsorteio\b/i,
  /\bcupom\b/i,
  /\bskincare\b/i,
  /\brotina de\b/i,
  /\bmilh[oõ]es de inscritos\b/i,
  /\bmil visualiza[cç][oõ]es\b/i,
  /\bouvintes no spotify\b/i,
  /\bgaranta seu ingresso\b/i,
  /\bingressos?\b/i,
  /\bpromo\b/i,
  /\bfornalha tour\b/i,
  /\btour morada\b/i,
  /\bpreparando novidades\b/i,
  /\bn[aã]o perca o lan[cç]amento\b/i,
  /\bchega em \d+ dias\b/i,
  /\bcontagem regressiva\b/i,
  /\bfaltam \d+ dias\b/i,
  /\bno nosso canal\b/i,
  /\bassista (j[aá]|agora|ao|o) (meu )?(novo )?clipe\b/i,
  /\bessa semana t[aá] muito\b/i,
  /\bfiquem de olho\b/i,
  /\brecadinho\b/i,
  /\bvoc[eê]s pediram\b/i,
  /\bem breve\b/i,
  /\bchegamos\b/i,
  /\bbastidores\b/i,
  /\bentrevista\b/i,
  /\btchau portugal\b/i,
  /\b24\s*h(oras)?\b/i,
  /\besta[cç][aã]o\b.*\b(24h|melhores)\b/i,
  /\banos da tv\b/i,
  /\bvem correr\b/i,
  /\bsala da calma\b/i,
  /\bdia do pastor\b/i,
  /\bdia da(s)? mulher(es)?\b/i,
  /\bperfil da sua igreja\b/i,
  /\bredes sociais\b/i,
  /\bvoluntariado\b/i,
  /\bassista ao vivo aqui\b/i,
  /\bvoc[eê] n[aã]o conseguiu vir\b/i,
  /\bquem a[ií] est[aá] empolgado\b/i,
  /\bculto jovem especial\b/i,
  /\bgerac[aã]o mission[aá]ria\b/i,
  /\bganhou e ai\b/i,
  /\blouvor come[cç]a antes dos ensaios\b/i,
  /\bum registro especial\b/i,
  /\bexerc[ií]cio f[ií]sico:\s*movimento/i,
  /\b[aá]gua:\s*a ess[eê]ncia da vida\b/i,
  /\binformativo mundial\b/i,
  /\bconc[ií]lio anual\b/i,
  /\bprograma[cç][aã]o especial\b/i,
  /\btogether feel the mission\b/i,
  /\btogether cast\b/i,
  /\bresumo treinamentos\b/i,
  /\bvideo volunt[aá]rio\b/i,
  /\beu j[aá] fui:\b/i,
  /\bcelebra[cç][aã]o\s*\|\s*\d+\s*anos\b/i,
  /\beduca[cç][aã]o adventista\b/i,
  /\ba for[cç]a da igreja\b/i,
  /\bobra m[eé]dico-mission[aá]ria\b/i,
  /\bhist[oó]ria do adventismo\b/i,
  /\bhomenagem aos professores\b/i,
  /\bdesafio supera[cç][aã]o\b/i,
  /\bi will go 20\d{2}\b/i,
  /\bpodcrush\b/i,
  /\bimpacto esperan[cç]a no sul\b/i,
  /\bnovas gera[cç][oõ]es\b/i,
  /\bminuto miss[aã]o mulher\b/i,
  /\bc[oó]pia de\b/i,
  /\bsupermission[aá]rios\b/i,
  /\bplayback (sem|com) chamada\b/i,
  /\bdia de fotos\b/i,
  /\baninhos\b/i,
  /\bmaternidade\b/i,
  /\bse essa m[uú]sica n[aã]o tocar\b/i,
  /\bvoc[eê] reconhece essa m[uú]sica\b|\bvoce reconhece essa musica\b/i,
  /\bquem me conheceu com essa\b/i,
  /\bessa m[uú]sica nos faz chorar\b/i,
  /\bse um dia me acostumar\b/i,
  /^\s*#shorts\s*$/i,
  /\b(as melhores|mais tocadas|esta[cç][aã]o\/station|youtube station|\d+\s*horas?\s*de\s*(adora[cç][aã]o|louvor))\b/i,
  /\b(aprovados|aceitaram o desafio|3[ªa]\s*fase|top\s*10|partiu\s+portugal|amanh[aã]\s*-\s*\d{2}h|lan[cç]a sua primeira m[uú]sica|teaser(\s*\d+)?)\b/i,
];

const STRICT_TESTIMONY_TITLE_PATTERNS = [
  /\btestemunh/i,
  /\bdepoimento\b/i,
  /\bconvers[aã]o\b/i,
  /\bmudou (a )?minha vida\b/i,
  /\bdeus (me|nos|a|o) (salvou|curou|resgatou|livrou|transformou|libertou)\b/i,
  /\bjesus (me|nos) (salvou|curou|resgatou|livrou|transformou|libertou)\b/i,
  /\bsalvou (a )?minha vida\b/i,
  /\bhist[oó]ria (real|de f[eé]|de vida|de supera[cç][aã]o|de convers[aã]o)\b/i,
  /\bcomo (conheci|encontrei) (a )?(deus|jesus|cristo|igreja|verdade)\b/i,
  /\bpor que (me tornei|voltei|aceitei|sa[ií])\b/i,
  /\bex-?\s*(traficante|ateu|atriz|cantor|usu[aá]rio|l[ií]der|brux[oa]|bandido|viciado|ocultista|macumbeir[oa])\b/i,
  /\btestemunho de (liberta[cç][aã]o|cura|milagre|f[eé]|convers[aã]o|vida)\b/i,
  /\b(salvou|salva) dezenas de pessoas\b/i,
  /\bconheci .* aos \d+ anos\b/i,
  /\bmeu vizinho nem sabia que eu era pastor\b/i,
];

const STRICT_TESTIMONY_DESC_PATTERNS = [
  /\bmeu testemunho\b/i,
  /\bo testemunho de\b/i,
  /\btestemunho real\b/i,
  /\bhist[oó]ria de convers[aã]o\b/i,
];

const WORSHIP_SONG_POSITIVE_PATTERNS = [
  /\blouvor(es)?\b/i,
  /\bm[uú]sica de adora[cç][aã]o\b/i,
  /\bc[aâ]ntico de adora[cç][aã]o\b/i,
  /\bhino oficial\b/i,
  /\bhino\s+\d+\b/i,
  /\bnova m[uú]sica\b/i,
  /\bm[uú]sica oficial\b/i,
  /\bm[uú]sica\s+tema\b/i,
  /\bm[uú]sica\s+(crist[aã]|gospel|adventista|in[eé]dita|nova)\b/i,
  /\bc[aâ]ntico\b/i,
  /\bcom coral\b/i,
  /\bclipe( oficial)?\b/i,
  /\bm[uú]sica.*\bv[ií]deo oficial\b|\bcan[cç][aã]o.*\bv[ií]deo oficial\b/i,
  /\bac[uú]stic[oa]?\b/i,
  /\((ao vivo|live)\)|\[(ao vivo|live)\]/i,
  /\bao vivo\b.*\b(clipe|m[uú]sica|louvor|dvd|cd|session|ac[uú]stic|single)\b/i,
  /\b(clipe|m[uú]sica|louvor|dvd|cd|session|ac[uú]stic|single)\b.*\bao vivo\b/i,
  /\blyric(s)?\b/i,
  /\bletra\b/i,
  /\bplayback\b/i,
  /\bmedley\b/i,
  /\blive session\b/i,
  /\bsess[aã]o\b/i,
  /\bcanta\b/i,
  /\bnovo tom\b/i,
  /\barautos do rei\b/i,
  /\bfhop music\b/i,
  /\bmergulhar\b/i,
  /\bou[cç]a agora\b/i,
  /\bfeat\.?\b|\bft\.?\b/i,
  /\bharpa crist[aã]\b/i,
  /\brevela[cç][aã]o de jesus\b/i,
  /\bfeliz s[aá]bado\b/i,
  /\bcarruagem\b/i,
  /\bem meio a tua gl[oó]ria\b/i,
  /\bem meio a tua gra[cç]a\b/i,
  /\bnada al[eé]m de ti\b/i,
  /\bperdoa-me\b/i,
  /\bverdadeiro sentido\b/i,
  /\bencontro das mar[eé]s\b/i,
  /\b[uú]ltima can[cç][aã]o\b/i,
  /\bvoc[eê] [eé] luz\b/i,
  /\beu vi algu[eé]m mais belo\b/i,
  /\brenova minha mente\b/i,
  /\bos que olham para ti\b/i,
  /\bvaso de alabastro\b/i,
  /\bprimeiro milagre\b/i,
  /\bacontecer[aá]\b/i,
  /\bse ele n[aã]o for o primeiro\b/i,
  /\bem seu nome\b/i,
  /\bbrilhar por ti\b/i,
  /\bn(o|ô)vo hin[aá]rio(\s+adventista)?\b/i,
  /\bhin[aá]rio adventista\b/i,
  /\bhino\s*\d+\b/i,
  /\badoradores(\s*[1-5]|\s+novo tempo)?\b/i,
  /\bcd\s*jovem\b/i,
  /\bminist[eé]rio jovem\b/i,
  /\bmenos um\b/i,
  /\bremaster\b|\([aá]udio\)|-\s*[aá]udio\b/i,
  /\bcolet[aâ]nea\b.*\b(adoradores|hin[aá]rio|adventista|louvor|adora[cç][aã]o|jovem)\b/i,
  /\b1\s*hora\s+de\s+adoradores\b/i,
  /\bele vem\b/i,
];

const NON_SONG_TALK_PATTERNS = [
  /\bpol[ií]tica\b/i,
  /\bidolatrias\b/i,
  /\ba reforma\b/i,
  /\bprega[cç][aã]o\b/i,
  /\bserm[aã]o\b/i,
  /\bpodcast\b/i,
  /\bbate-?papo\b/i,
  /\bdevocional\b/i,
  /\b6am\b/i,
  /\bculto\b/i,
  /\br[aá]dio\b/i,
  /\bpr\.\s*[a-záéíóúâêôãõç]+/i,
  /\bpastor\b/i,
  /\bluis gon[cç]alves|lu[ií]s gon[cç]alves\b/i,
  /\bdia de fotos\b/i,
  /\baninhos\b/i,
  /\bmaternidade\b/i,
  /\bhomenagem\b/i,
  /\b15 anos\b|\banivers[aá]rio\b/i,
  /\bfatos sobre\b|\bcuriosidades\b/i,
  /\bhist[oó]ria d[ao] (hino|m[uú]sica|can[cç][aã]o)\b/i,
  /\bprioridades estrat[eé]gicas\b|\bidentidade adventista\b|\bleva a .* por onde passa\b/i,
  /\breportagem\b|\bnot[ií]cia\b|\bdesabafo\b|\bconversa\b/i,
  /\bbastidores\b|\bmaking of\b|\bpor tr[aá]s d[ao]\b/i,
  /\bqual m[uú]sica\b|\bqual o melhor\b|\branking\b|\btop\s*\d+\b/i,
  /\breact\b|\breagindo\b|\ban[aá]lise\b|\banalisando\b|\breview\b|\bresenha\b/i,
  /\bentrevista\b|\bdocument[aá]rio\b|\bvlog\b|\bdi[aá]rio de\b|\bperguntas\b/i,
  /\bcomo tocar\b|\baula de\b|\btutorial\b|\bcifra\b|\bv[ií]deo ?aula\b/i,
  /\bteologia\b|\bexplicando\b|\btrecho\b|\bresumo\b/i,
  /#shorts?\b/i,
  /\bep\.?\s*\d+\b/i,
  /\bepis[oó]dio\b/i,
  /\bfam[ií]lia\b/i,
  /\b(mensagem|reflex[aã]o|estudo|rea[cç][aã]o|palestra|ministra[cç][aã]o)\b/i,
  /\ba palavra que voc[eê] precisa\b/i,
  /\best[aá] escrito adora[cç][aã]o\b/i,
];

const SABBATH_SCHOOL_TITLE_PATTERNS = [
  /\bescola\s+sabatina\b/i,
  /\bli[cç][oõ]es\s+da\s+b[ií]blia\b/i,
  /\bresumo\s+da\s+li[cç][aã]o\b/i,
  /\bcoment[aá]rio\s+da\s+li[cç][aã]o\b/i,
  /\b(?:estudo|estudos)\s+(?:di[aá]rio\s+)?da\s+li[cç][aã]o\b/i,
  /\bli[cç][aã]o\s+(?:de\s+|dos\s+)?(?:adultos?|jovens?|jovem|\d{1,2})\b/i,
  /\b(?:no)?comtexto(?:\s+(?:b[ií]blico|di[aá]rio))?\b/i,
  /\b(?:segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado)\s*[-–|•:]\s*.*li[cç][aã]o\b/i,
  /\bli[cç][aã]o\s*\d{1,2}\s*[-–|•:]/i,
  /\b[1-4][º°o]?\s*trimestre\b.*\b(?:li[cç][aã]o|escola\s+sabatina)\b/i,
  /\bprovai\s+e\s+vede\b.*\bescola\s+sabatina\b/i,
];

const KIDS_SABBATH_SCHOOL_PATTERNS =
  /\b(rol do ber[cç]o|jardim da inf[aâ]ncia|prim[aá]rios|juvenis|adolescentes?|roteiro\s+teen|escola sabatina infantil|escola sabatina kids|adora[cç][aã]o infantil|hist[oó]ria infantil|desenho\s+da\s+li[cç][aã]o|li[cç][aã]o\s+(?:de\s+|dos?\s+)?(?:prim[aá]rios|juvenis|adolescentes?|jardim|rol|infantil|teen))\b/i;

const STRICT_BIBLE_TITLE_PATTERNS = [
  /\bb[ií]bli/i,
  /\bvers[ií]culo\b/i,
  /\bprofecia\b/i,
  /\bapocalipse\b/i,
  /\bdaniel\b/i,
  /\bg[eê]nesis\b/i,
  /\bsalmos?\b/i,
  /\barqueologia\b/i,
  /\bsantu[aá]rio\b/i,
  /\b1844\b/i,
  /\bmandamento/i,
  /\bestudo b[ií]blico\b/i,
  /\blei de deus\b/i,
  /\bs[aá]bado\b.*\b(deus|selo|mandamento|b[ií]blia|presente)\b/i,
  /\bvolta de jesus\b/i,
  /\bo que jesus falou\b/i,
  /\bna mira\b/i,
  /\brodrigo silva\b/i,
  /\bcrist[aã]o pode\b/i,
  /\bevangelho\b/i,
];

const NON_SERMON_PATTERNS = [
  /\b(podcast|inverso|bastidores|t\d+ep#?\d+|ep\.?\s*\d+|mesa redonda|bate-?papo|entrevista|c[oó]digo aberto)\b/i,
  /\b(momento da sa[uú]de|vida e sa[uú]de|receita:|luz solar|alimenta[cç][aã]o|nutri[cç][aã]o|nutra seu corpo|vida saud[aá]vel|equil[ií]brio|exerc[ií]cio f[ií]sico|descanso:\s*seu corpo|[aá]gua:\s*a ess[eê]ncia|8 rem[eé]dios)\b/i,
  /\b(in concert|hin[aá]rio|clipe|canta|coral|express[aã]o de vida|horas benditas|a cruz n[aã]o [eé] o fim)\b/i,
  /\b(treinamento|coordenador de interessados|aula\s*\d+|ciclo do evangelismo|trimestral|aposentadoria|quebrando o sil[eê]ncio|dia dos namorados|dia mundial dos desbravadores|feliz dia|lan[cç]amento do #|quem [eé] voc[eê] no|eu j[aá] fui|hist[oó]rias de volunt[aá]rios|pe[cç]a agora|revista esperan[cç]a|anos dos anjos|tv novo tempo\s*-\s*ao vivo|super lupa|em ingl[eê]s|filme|curta-metragem|bom dia mulher|o drama da paix[aã]o|allen, mission[aá]rio|pais conectados|evangelismo feminino|criadores e mission[aá]rios|encontro de evangelistas|onevoice27|bora fazer uma semana de ora[cç][aã]o|homenagem|guia de pg)\b/i,
];

const STRICT_SERMON_TITLE_PATTERNS = [
  /\b(prega[cç][aã]o|pregando|serm[aã]o|serm[oõ]es)\b/i,
  /\bculto\b/i,
  /\bmensagem\b/i,
  /\b(pr\.\s*[a-záéíóúâêôãõç]{2,}|pr\s+[a-záéíóúâêôãõç]{2,}|pastor\s+[a-záéíóúâêôãõç]{2,})\b/i,
  /\b(alejandro bull[oó]n|bull[oó]n|ivan saraiva|arilton oliveira|lu[ií]s gon[cç]alves|kleber gon[cç]alves|erton k[oö]hler|odailson fonseca|robson aleixo|mark finley|doug batchelor|gilson brito|tito rocha|michelson borges|ronaldo de oliveira|rafael santos|gustavo marques|stanley arco|felippe amorim)\b/i,
  /\b(semana (especial|de ora[cç][aã]o|santa|de jejum|evangel[ií]stica)|s[aá]bado de jejum|movidos pela esperan[cç]a|jesus,?\s*nossa esperan[cç]a|vida que eleva|f[eé] para hoje|est[a] escrito)\b/i,
  /\b(maranata\s*-\s*conven[cç][aã]o|together\s*-\s*culto|reavivamento)\b/i,
  /\b(medita[cç][aã]o do p[oô]r do sol|o poder da ora[cç][aã]o|como orar|queres ser curado|ele j[aá] pagou o pre[cç]o|sua f[eé] [eé] maior que o medo|verdadeiro jejum)\b/i,
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

export interface SaoPauloDateInfo {
  ymd: string;
  year: number;
  month: number;
  day: number;
  weekdayIdx: number; // 0=domingo .. 6=sabado
  weekdayShortPt: string;
  weekdaySearchPt: string;
  monthNamePt: string;
  monthAbbrPt: string;
}

const PT_WEEKDAYS_ACCENT = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
] as const;

const PT_WEEKDAYS_ASCII = [
  'domingo',
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
] as const;

const PT_MONTHS_FULL = [
  '',
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const PT_MONTHS_ABBR = [
  '',
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

const PT_MONTH_LOOKUP: Record<string, number> = {
  janeiro: 1,
  jan: 1,
  fevereiro: 2,
  fev: 2,
  marco: 3,
  mar: 3,
  abril: 4,
  abr: 4,
  maio: 5,
  mai: 5,
  junho: 6,
  jun: 6,
  julho: 7,
  jul: 7,
  agosto: 8,
  ago: 8,
  setembro: 9,
  set: 9,
  outubro: 10,
  out: 10,
  novembro: 11,
  nov: 11,
  dezembro: 12,
  dez: 12,
};

const EN_WEEKDAY_TO_IDX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getSaoPauloDateInfo(referenceDate: Date = new Date()): SaoPauloDateInfo {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    }).formatToParts(referenceDate);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
    const year = Number(get('year')) || referenceDate.getUTCFullYear();
    const month = Number(get('month')) || referenceDate.getUTCMonth() + 1;
    const day = Number(get('day')) || referenceDate.getUTCDate();
    const weekdayIdx = EN_WEEKDAY_TO_IDX[get('weekday')] ?? referenceDate.getUTCDay();
    return {
      ymd: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      year,
      month,
      day,
      weekdayIdx,
      weekdayShortPt: PT_WEEKDAYS_ACCENT[weekdayIdx] ?? 'sabado',
      weekdaySearchPt: PT_WEEKDAYS_ASCII[weekdayIdx] ?? 'sabado',
      monthNamePt: PT_MONTHS_FULL[month] ?? 'janeiro',
      monthAbbrPt: PT_MONTHS_ABBR[month] ?? 'jan',
    };
  } catch {
    const year = referenceDate.getUTCFullYear();
    const month = referenceDate.getUTCMonth() + 1;
    const day = referenceDate.getUTCDate();
    const weekdayIdx = referenceDate.getUTCDay();
    return {
      ymd: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      year,
      month,
      day,
      weekdayIdx,
      weekdayShortPt: PT_WEEKDAYS_ACCENT[weekdayIdx] ?? 'sabado',
      weekdaySearchPt: PT_WEEKDAYS_ASCII[weekdayIdx] ?? 'sabado',
      monthNamePt: PT_MONTHS_FULL[month] ?? 'janeiro',
      monthAbbrPt: PT_MONTHS_ABBR[month] ?? 'jan',
    };
  }
}

const WEEKLY_RANGE_DATE_PATTERNS = [
  /\b\d{1,2}\s*[/.]\s*\d{1,2}(?:\s*[/.]\s*\d{2,4})?\s*(?:a|ate|[-–—])\s*\d{1,2}\s*[/.]\s*\d{1,2}(?:\s*[/.]\s*\d{2,4})?\b/,
  /\b\d{1,2}\s*(?:a|ate|[-–—])\s*\d{1,2}\s*(?:de\s+)?(?:janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/,
  /\b\d{1,2}\s*(?:de\s+)?(?:janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s*(?:a|ate|[-–—])\s*\d{1,2}\s*(?:de\s+)?(?:janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/,
  /\b\d{1,2}\s*(?:a|ate|[-–—])\s*\d{1,2}\s*[/.]\s*\d{1,2}(?:\s*[/.]\s*\d{2,4})?\b/,
  /\b(?:de\s+)?(?:sabado|domingo|segunda|terca|quarta|quinta|sexta)(?:\s*-?\s*feira)?\s+(?:a|ate)\s+(?:sabado|domingo|segunda|terca|quarta|quinta|sexta)(?:\s*-?\s*feira)?\b/,
  /\b(resumo\s+(?:semanal|da\s+semana|completo)|resumao|toda\s+a\s+licao|licao\s+completa|visao\s+geral|desenho\s+da\s+licao|classe\s+dos?\s+professores)\b/,
];

const ORDINAL_NOUN_FOLLOW_RE =
  /^\s+(?:vinda|b[ií]blia|biblia|parte|pessoa|carta|ep[ií]stola|epistola|mensagem|chance|oportunidade|morte|vez|obra|etapa|fase|edi[cç][aã]o|edicao|temporada|alian[cç]a|alianca|metade|dimens[aã]o|dimensao|gerac[aã]o|geracao|guerra)\b/i;

function extractSabbathWeekdaysFromTitle(foldedTitle: string): Set<number> {
  const result = new Set<number>();
  const mapToken = (tok: string): number | null => {
    if (tok.startsWith('dom')) return 0;
    if (tok.startsWith('seg')) return 1;
    if (tok.startsWith('ter')) return 2;
    if (tok.startsWith('qua')) return 3;
    if (tok.startsWith('qui')) return 4;
    if (tok.startsWith('sex')) return 5;
    if (tok.startsWith('sab')) return 6;
    return null;
  };

  for (const m of foldedTitle.matchAll(
    /\b(domingo|segunda(?:\s*-?\s*feira)?|terca(?:\s*-?\s*feira)?|quarta(?:\s*-?\s*feira)?|quinta(?:\s*-?\s*feira)?|sexta(?:\s*-?\s*feira)?|sabado)\b/g
  )) {
    const token = m[1];
    const matchIndex = m.index ?? 0;
    const after = foldedTitle.slice(matchIndex + token.length);
    const before = foldedTitle.slice(Math.max(0, matchIndex - 12), matchIndex);
    const hasFeira = /feira/.test(token);
    if (!hasFeira && ORDINAL_NOUN_FOLLOW_RE.test(after)) {
      continue;
    }
    if (!hasFeira && /\b(?:sua|esta|essa|aquela|primeira\s+e)\s+$/.test(before)) {
      continue;
    }
    const idx = mapToken(token);
    if (idx !== null) result.add(idx);
  }
  for (const m of foldedTitle.matchAll(
    /\b(dom|seg|ter|qua|qui|sex|sab)\.?(?=\s*[-–/.,(]*\s*\d{1,2}\s*(?:[/.]|\s+de\s+(?:janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b))/g
  )) {
    const idx = mapToken(m[1]);
    if (idx !== null) result.add(idx);
  }
  return result;
}

interface ParsedTitleDate {
  day: number;
  month: number;
  year?: number;
}

function extractDatesFromTitle(foldedTitle: string): ParsedTitleDate[] {
  const dates: ParsedTitleDate[] = [];

  for (const m of foldedTitle.matchAll(
    /(?:^|[^\d])(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?(?!\d)/g
  )) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    let year = m[3] ? Number(m[3]) : undefined;
    if (year !== undefined && year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      dates.push({ day, month, year });
    }
  }

  for (const m of foldedTitle.matchAll(/(?:^|[^\d])(\d{1,2})-(\d{1,2})-(20\d{2}|\d{2})(?!\d)/g)) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    let year = Number(m[3]);
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      dates.push({ day, month, year });
    }
  }

  for (const m of foldedTitle.matchAll(/(?:^|[^\d])(\d{1,2})\s+(\d{1,2})\s+(20\d{2})(?!\d)/g)) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      dates.push({ day, month, year });
    }
  }

  for (const m of foldedTitle.matchAll(
    /(?:^|[^\d])(\d{1,2})\s+(?:de\s+)?(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)(?:\s+(?:de\s+)?(20\d{2}))?(?![a-z0-9])/g
  )) {
    const day = Number(m[1]);
    const month = PT_MONTH_LOOKUP[m[2]];
    const year = m[3] ? Number(m[3]) : undefined;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      dates.push({ day, month, year });
    }
  }

  return dates;
}

export function isCurrentSabbathSchoolLessonForToday(
  params: {
    title: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
  },
  referenceDate?: Date
): boolean {
  const ref = referenceDate ?? new Date();
  const today = getSaoPauloDateInfo(ref);
  const foldedTitle = normalizeSearchFold(params.title || '');
  if (!foldedTitle) return false;

  if (WEEKLY_RANGE_DATE_PATTERNS.some((re) => re.test(foldedTitle))) {
    return false;
  }

  const weekdaysInTitle = extractSabbathWeekdaysFromTitle(foldedTitle);
  if (weekdaysInTitle.size > 1) {
    return false;
  }
  if (weekdaysInTitle.size === 1 && !weekdaysInTitle.has(today.weekdayIdx)) {
    return false;
  }

  const pubMs = params.publishedAt ? Date.parse(params.publishedAt) : NaN;
  const nowMs = ref.getTime();
  const ageDays = Number.isFinite(pubMs) ? (nowMs - pubMs) / (24 * 3600 * 1000) : null;
  if (ageDays !== null && ageDays < -1.5) {
    return false;
  }

  const datesInTitle = extractDatesFromTitle(foldedTitle);
  if (datesInTitle.length > 0) {
    const allMatchToday = datesInTitle.every(
      (d) =>
        d.day === today.day &&
        d.month === today.month &&
        (d.year === undefined || d.year === today.year)
    );
    if (!allMatchToday) {
      return false;
    }
    const hasExplicitCurrentYear = datesInTitle.some((d) => d.year === today.year);
    if (hasExplicitCurrentYear) {
      return ageDays === null || ageDays <= 45;
    }
    return ageDays === null || (ageDays >= -1.5 && ageDays <= 21);
  }

  if (weekdaysInTitle.has(today.weekdayIdx)) {
    return ageDays !== null && ageDays >= -1.5 && ageDays <= 3.5;
  }

  return false;
}

const VERIFIED_ADVENTIST_PASTOR_CHANNEL_IDS = new Set([
  'UCSIjHSkAS_IpF7R-HIsn88Q', // Pr Dudu Batista
  'UC0EqK_oNy4Gb7QThhcWlIgA', // Pr. Diego Trindade
  'UC03Y0ieYROxw1FxCoDaSF9g', // Arilton Oliveira - Oficial
  'UCw6ZgfMHtcLn_O-YwRw27eA', // Eu Estudo a Lição com Pr. Samuel Camilo
  'UCd_fEdecs3BaUMvsK6FZMww', // Lúcio Bérgamo
  'UCLa0xeWUGdFlw4s2mZLwv0w', // Pr Paulo Dresch
  'UCZ5izlUsz7UpZnQOcxN4_dQ', // Pr Samuel Ramos
  'UCs5jiNO6fntcZcCn7sUO6VA', // Pastor Bullón em Português - Canal Oficial
  'UCHtEWyMDduwhd7XX4jptzkg', // Leandro Quadros
]);

const OFFICIAL_IASD_PASTOR_PROGRAM_CHANNEL_IDS = new Set([
  'UCAUglmSESHH79_4vPjL_I-Q', // Rádio Novo Tempo (Lições da Bíblia com Pr. Stina)
  'UCqBWNMZ4WSSOvCiC4qRhz7Q', // Safeliz Português (Escola Sabatina com Pr. Hélio Carnassale)
  'UC_OaSsAydgSIjUtjYn9qLog', // Rede Novo Tempo de Comunicação
  'UCLb09BPgh7xrswJRgYQthuw', // Lições da Bíblia
]);

const BLOCKED_LAY_OR_NON_PASTOR_SABBATH_CHANNEL_IDS = new Set([
  'UCBm5ycqxuqK-UVs54-xA_2w', // ComTexto Diário (canal independente, não pastor)
  'UCyMzbdHJXABTxcHV7CHmKkQ', // Adventismo Vivo (canal independente)
  'UCslQjMJUdi2CurBP0Fveqvw', // Paulistasul
  'UCGttfORvc1HVAImPW9Ga2Eg', // TURMINHA DO PAPAI DO CÉU
  'UCOnM0xOco8YOULVx6MjcHXw', // Lição e Salvação
  'UC--huWpF6aoqm7p3fE0W3qA', // Cristiano Israelita
  'UCmfc_7CzuMa5r-CFRtKmqyg', // João Carlos Pereira Amorim
  'UCvyXtNVypb1angvfmwXKgTg', // ADVEN Channel
  'UCjmcrgK2WgeXdXKINZ6wORA', // ENCONTROS COM DEUS
  'UCqpNyUF53j6GHYMDwPU16zw', // Chuvas de Esperança
  'UCJQJ9jD-DatmP9Jp-pKgN9g', // Estudiando EL VERBO
]);

const BLOCKED_SABBATH_NON_PASTOR_OR_FOREIGN_RE =
  /\b(turminha|papai\s+do\s+c[eé]u|li[cç][aã]o\s+e\s+salva[cç][aã]o|cristiano\s+israelita|adven\s+channel|chuvas\s+de\s+esperan[cç]a|encontros\s+com\s+deus|comtexto\s+di[aá]rio|adventismo\s+vivo|iglesia|advenimiento|s[eé]ptimo\s+d[ií]a|escuela\s+sab[aá]tica|estudiando|el\s+verbo|conference|church|ministry|ministries|broadcasting|3abn|hope\s*media|hopelives|hopetv|anthony\s+araujo|daniel\s+herrera|oscar.*mendoza|joel\s+flores|alejandro\s+medina)\b/i;

const EXPLICIT_PASTOR_ATTRIBUTION_RE =
  /\b(?:pr\.?(?=\s+[a-záéíóúâêôãõç]{2,})|pastor(?=\s+[a-záéíóúâêôãõç]{2,})|(?:h[eé]lio\s+carnassale|arilton\s+oliveira|alejandro\s+bull[oó]n|bull[oó]n|ivan\s+saraiva|rafael\s+rossi|odailson\s+fonseca|erton\s+k[oö]hler|michelson\s+borges|kleber\s+gon[cç]alves|lu[ií]s\s+gon[cç]alves|samuel\s+camilo|diego\s+trindade|dudu\s+batista|l[uú]cio\s+b[eé]rgamo|paulo\s+dresch|samuel\s+ramos|stina|leandro\s+quadros)\b)/i;

const NON_ADVENTIST_SABBATH_DENOM_RE =
  /\b(cpad|\bebd\b|escola\s+b[ií]blica\s+dominical|editora\s+betel|assembleia\s+de\s+deus|igreja\s+batista|conven[cç][aã]o\s+batista|igreja\s+presbiteriana|igreja\s+quadrangular|evangelho\s+quadrangular|igreja\s+universal|\biurd\b|igreja\s+mundial|lagoinha|igreja\s+renascer|can[cç][aã]o\s+nova|tv\s+aparecida|igreja\s+cat[oó]lica|testemunhas\s+de\s+jeov[aá]|m[oó]rmon|esp[ií]rita)\b/i;

export function isAdventistPastorSabbathChannel(params: {
  channelId?: string;
  channelTitle?: string;
  title?: string;
  description?: string;
}): boolean {
  const channelId = (params.channelId || '').trim();
  const channelTitle = (params.channelTitle || '').trim();
  const title = (params.title || '').trim();
  const descHead = (params.description || '').slice(0, 360);
  const fullHeader = `${channelTitle} ${title} ${descHead}`;

  if (BLOCKED_LAY_OR_NON_PASTOR_SABBATH_CHANNEL_IDS.has(channelId)) {
    return false;
  }
  if (NON_ADVENTIST_PREACHER_OR_DENOM_RE.test(fullHeader) || NON_ADVENTIST_SABBATH_DENOM_RE.test(fullHeader)) {
    return false;
  }
  if (BLOCKED_SABBATH_NON_PASTOR_OR_FOREIGN_RE.test(`${channelTitle} ${title}`)) {
    return false;
  }
  if (KIDS_SABBATH_SCHOOL_PATTERNS.test(title) && !/\b(adultos?|jovens?|jovem)\b/i.test(title)) {
    return false;
  }

  if (VERIFIED_ADVENTIST_PASTOR_CHANNEL_IDS.has(channelId)) {
    return true;
  }

  if (OFFICIAL_IASD_PASTOR_PROGRAM_CHANNEL_IDS.has(channelId)) {
    return EXPLICIT_PASTOR_ATTRIBUTION_RE.test(`${title} ${descHead}`);
  }

  // Require an explicit channel title indicating a pastor (reject empty/blank lockup extractions)
  if (!channelTitle) {
    return false;
  }

  const channelIsPastor = /\b(?:pr\.?(?=\s+[a-záéíóúâêôãõç]{2,})|pastor(?=\s+[a-záéíóúâêôãõç]{2,}))/i.test(
    channelTitle
  );
  if (!channelIsPastor) {
    return false;
  }

  // Must show clear Seventh-day Adventist Sabbath School identity (never generic evangelical EBD)
  return /\b(adventista|iasd|novo\s+tempo|escola\s+sabatina|li[cç][oõ]es\s+da\s+b[ií]blia|comtexto|cpb|casa\s+publicadora)\b/i.test(
    fullHeader
  );
}

export function isEligibleSabbathSchoolShort(
  params: {
    title: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
  },
  referenceDate?: Date
): boolean {
  return (
    isAdventistPastorSabbathChannel(params) &&
    isCurrentSabbathSchoolLessonForToday(params, referenceDate)
  );
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
  if (NON_ADVENTIST_PREACHER_OR_DENOM_RE.test(`${channelTitle} ${title}`)) {
    return false;
  }
  if (/\b(tv |r[aá]dio |gravadora )?novo tempo\b/i.test(channelTitle)) {
    return true;
  }
  return ADVENTIST_IDENTITY_PATTERNS.some((re) => re.test(combined));
}

const STRONG_DESC_CHRISTIAN_RE =
  /\b(m[uú]sica\s+(gospel|crist[aã])|louvor\s+e\s+adora[cç][aã]o|can[cç][aã]o\s+(gospel|crist[aã])|testemunho\s+(crist[aã]o|de\s+f[eé]|de\s+convers[aã]o)|igreja\s+(adventista|evang[eé]lica|batista|presbiteriana)|estudo\s+b[ií]blico|palavra\s+de\s+deus|evangelho\s+de\s+(cristo|jesus)|escola\s+sabatina|novo\s+tempo|feliz7play|gravadora\s+nt|mk\s+music|todah\s+music|musile\s+records|onimusic)\b/i;

function hasChristianRelevance(
  title: string,
  description: string,
  channelTitle: string,
  channelId: string
): boolean {
  if (CHANNEL_BY_ID.has(channelId)) return true;
  const header = `${channelTitle} ${title}`;
  if (CHRISTIAN_RELEVANCE_PATTERNS.some((re) => re.test(header))) {
    return true;
  }
  return STRONG_DESC_CHRISTIAN_RE.test(description);
}

const STRICT_TALK_BLOCK_RE =
  /\b(podcast|prega[cç][aã]o|serm[aã]o|devocional|medita[cç][aã]o|escola sabatina|li[cç][aã]o|fonte de alegria|sob suas asas|protagonistas|entrevista|bate-?papo|react|reagindo|como tocar|tutorial|aula|v[ií]deo ?aula|preceito|cifra|making of|bastidores|not[ií]cia|reportagem|relat[oó]rio|informativo|document[aá]rio|s[eé]ri[ae] b[ií]blica|crescimento espiritual|compartilheesperan[cç]a|epis[oó]dio|ep\.?\s*\d+|t\d+e\d+|retrospectiva)\b/i;

function looksLikeWorshipSong(
  title: string,
  description: string,
  isWorshipChannel: boolean,
  channelId = '',
  searchMode = false,
  hintCategory?: ContentCategory
): boolean {
  if (STRICT_TALK_BLOCK_RE.test(title)) {
    return false;
  }

  const isOfficialHymnOrYouthCollection =
    channelId === 'UCIvT_5iKmxPksHRqv4g_GZQ' ||
    channelId === 'UCFTFFVStluyIusWi71Yc0sA' ||
    channelId === 'UCj14fcdKiGxi2qQsqhPf9tg' ||
    /\b(n(o|ô)vo hin[aá]rio|hin[aá]rio adventista|hino\s*\d+|cd\s*jovem|minist[eé]rio jovem|adoradores(\s*[1-5])?|menos um)\b/i.test(
      title
    );

  if (isOfficialHymnOrYouthCollection) {
    return true;
  }

  if (NON_SONG_TALK_PATTERNS.some((re) => re.test(title))) {
    return false;
  }
  const descHead = description.slice(0, 260);
  if (
    !searchMode &&
    (/#shorts?\b|\b(podcast|devocional|entrevista|reportagem|homenagem|bastidores|making of|document[aá]rio|react|reagindo|vlog|tutorial|como tocar)\b/i.test(
      descHead
    ))
  ) {
    return false;
  }
  if (searchMode && STRICT_TALK_BLOCK_RE.test(descHead)) {
    return false;
  }
  if (WORSHIP_SONG_POSITIVE_PATTERNS.some((re) => re.test(title))) {
    return true;
  }
  if (/\b(letra,\s*m[uú]sica e arranjo|letra e m[uú]sica:|arranjo musical:)\b/i.test(description)) {
    return true;
  }
  const allowLooseHyphenStructure =
    isWorshipChannel ||
    (searchMode && (hintCategory === undefined || hintCategory === 'louvores'));
  if (allowLooseHyphenStructure) {
    // Require song/music title structure ("Artist - Song" / "Song | Tag" / music keywords)
    // or explicit songwriting/composition credits in the description (avoiding generic social footer text)
    if (
      /[^|–-]+\s[-–|]\s[^|–-]+/.test(title) &&
      !/\b(vlog|tour|agenda|convite|aviso|homenagem|anivers[aá]rio|15 anos|fatos|curiosidades|reencontro|together|estudo|b[ií]bli|prega[cç][aã]o|serm[aã]o|culto|testemunh|epis[oó]dio|temporada)\b/i.test(
        title
      )
    ) {
      return true;
    }
    if (
      searchMode &&
      /\b(m[uú]sica|can[cç][aã]o|hino|louvor|adora[cç][aã]o|gospel|harpa|coral|quarteto|cantor[a]?|voz|áudio|audio|álbum|album|single|cd|dvd)\b/i.test(
        `${title} ${descHead}`
      )
    ) {
      return true;
    }
    return /\b(letra:|composi[cç][aã]o:|compositor|arranjo musical|ficha t[eé]cnica)\b/i.test(
      description
    );
  }
  return false;
}

const FELIZ7PLAY_CHANNEL_ID = 'UC8PS8EsZsWXOQ1YmlJwCaYw';
const ADVENTIST_ANIMATION_CHANNEL_IDS = new Set([
  'UC4E-81u6afu-KY14PPeg4VQ', // Feliz7Kids
  'UCC_6_OXZRP5PVuzJLfINXLg', // NT Kids
  'UCpYhv-j3DeaOYhPByA4-eLQ', // Nosso Amiguinho Oficial
  'UCa0Nja57-8BPQn3C2e-qhhw', // Minha Vida É Uma Viagem
]);

const ANIMATION_MEDIUM_RE =
  /\b(anima[cç][aã]o|desenho(s)?( animados?)?|filme animado|maratona.*desenho|camelo na agulha|defensores da b[ií]blia|presente de nick|the tuis|meu her[oó]i da b[ií]blia|capit[aã]o do mar|anjinhos da esperan[cç]a|nt kids|feliz7kids|minha vida [eé] uma viagem|nosso amiguinho)\b/i;

const BIBLICAL_ANIMATION_TOPIC_RE =
  /\b(b[ií]bli[ao]s?|defensores da b[ií]blia|meu her[oó]i da b[ií]blia|camelo na agulha|hist[oó]rias? da b[ií]blia|a cria[cç][aã]o|arca de no[eé]|davi|golias|daniel|jonas|mois[eé]s|jos[eé]|abra[aã]o|ester|rute|sans[aã]o|gide[aã]o|raabe|elias|eliseu|ad[aã]o|jesus|milagres|par[aá]bola|apocalipse|anjos?|deus|cristo|natal.*jesus|p[aá]scoa.*jesus|salvador|salva[cç][aã]o)\b/i;

const NON_BIBLICAL_KIDS_NOISE_RE =
  /\b(como desenhar|desenhando com a letra|sinais de tr[aâ]nsito|alimenta[cç][aã]o saud[aá]vel|peso pesado|halloween|dia das m[aã]es fora|dia de fotos|escovar os dentes|reciclagem|brincadeira sem gra[cç]a|baita mal entendido|aventura das letras|visitante chique)\b/i;

export function classifyShort(
  channelId: string,
  channelTitle: string,
  title: string,
  description: string,
  hintCategory?: ContentCategory,
  options?: { searchMode?: boolean; publishedAt?: string }
): { category: ContentCategory; doctrineScope: DoctrineScope } | null {
  const searchMode = Boolean(options?.searchMode);
  const combined = `${title} ${description}`;
  const fullContext = `${channelTitle} ${combined}`;

  if (containsBlockedTerms(fullContext, BLOCKED_GENERAL_TERMS)) {
    return null;
  }
  if (SECULAR_OFF_CONTEXT_TITLE_RE.test(`${channelTitle} ${title} ${description.slice(0, 220)}`)) {
    return null;
  }
  if (AI_GENERATED_PATTERNS.some((re) => re.test(fullContext))) {
    return null;
  }
  if (
    NON_PORTUGUESE_PATTERNS.some((re) => re.test(title)) ||
    /\b(iglesia|advenimiento|s[eé]ptimo\s+d[ií]a|escuela\s+sab[aá]tica|ministerio\s+(?:de|del)|predicaciones)\b/i.test(
      channelTitle
    )
  ) {
    return null;
  }
  if (!searchMode && NOISE_AND_PROMO_PATTERNS.some((re) => re.test(title))) {
    return null;
  }
  if (
    searchMode &&
    /\b(sorteio|cupom|skincare|tigrinho|betano|blaze|ingressos?|garanta seu ingresso|trailer oficial|teaser)\b/i.test(
      title
    )
  ) {
    return null;
  }

  const channelSpec = CHANNEL_BY_ID.get(channelId);
  const adventist = isAdventistVerified(channelId, channelTitle, title, description);

  if (!hasChristianRelevance(title, description, channelTitle, channelId)) {
    return null;
  }

  const isWorshipChannel = channelSpec?.defaultCategory === 'louvores';
  const isTestimonyChannel = channelSpec?.defaultCategory === 'testemunhos';
  const isDedicatedSabbathSchoolChannel =
    channelId === 'UCLb09BPgh7xrswJRgYQthuw' || // Lições da Bíblia
    channelId === 'UCw6ZgfMHtcLn_O-YwRw27eA' || // Eu Estudo a Lição com Pr. Samuel Camilo
    channelId === 'UCqBWNMZ4WSSOvCiC4qRhz7Q'; // Safeliz Português
  const isSabbathSchoolChannel = channelSpec?.defaultCategory === 'escola_sabatina';
  const UNIFIED_SERMON_BIBLE_CHANNEL_IDS = new Set([
    'UCIa6p9HWw1hEEfHzfJOcSbA', // Na Mira da Verdade
    'UCn4M9vLHegNuqM8tnL872cA', // Rodrigo Silva Arqueologia
    'UC03Y0ieYROxw1FxCoDaSF9g', // Arilton Oliveira - Oficial
    'UCkSu5ibA15OcBWTjop72dPA', // Terceiro Anjo
    'UCs5jiNO6fntcZcCn7sUO6VA', // Pastor Bullón em Português
  ]);
  const isUnifiedPregacoesChannel = UNIFIED_SERMON_BIBLE_CHANNEL_IDS.has(channelId);
  const isFeliz7PlayChannel = channelId === FELIZ7PLAY_CHANNEL_ID;
  const isAdventistAnimationChannel =
    ADVENTIST_ANIMATION_CHANNEL_IDS.has(channelId) ||
    /\b(feliz7kids|nt kids|nosso amiguinho|minha vida [eé] uma viagem)\b/i.test(channelTitle);
  const titleAndChannel = `${channelTitle} ${title}`;
  const isBiblicalAnimation =
    !isWorshipChannel &&
    !NON_BIBLICAL_KIDS_NOISE_RE.test(title) &&
    !/\bkaraok[eê](?![a-záéíóúâêôãõç])/i.test(title) &&
    ANIMATION_MEDIUM_RE.test(titleAndChannel) &&
    BIBLICAL_ANIMATION_TOPIC_RE.test(`${title} ${description.slice(0, 220)}`);

  const isKidsSabbathLesson =
    KIDS_SABBATH_SCHOOL_PATTERNS.test(title) &&
    !/\b(adultos?|jovens?|comtexto|nocomtexto)\b/i.test(title);
  const isSabbathSchoolTitle =
    !isKidsSabbathLesson && SABBATH_SCHOOL_TITLE_PATTERNS.some((re) => re.test(title));
  const isSabbathSchoolDesc =
    !isKidsSabbathLesson &&
    /\b(escola sabatina|li[cç][oõ]es da b[ií]blia|comtexto b[ií]blico|comtexto di[aá]rio|nocomtexto|li[cç][aã]o d[ao]s?\s*(adultos?|jovens?)|estudo da li[cç][aã]o|resumo da li[cç][aã]o)\b/i.test(
      `${channelTitle} ${description.slice(0, 360)}`
    );

  const hasExplicitTestimonySignals =
    !/\b(podcast|trailer|teaser|inscri[cç][oõ]es|convite|agenda|prega[cç][aã]o completa|ao vivo agora|verso da semana|vers[ií]culo do dia|filme completo|filme crist[aã]o|clipe|playback|karaok[eê]|lyric)(?![a-záéíóúâêôãõç])/i.test(
      title
    ) &&
    !/\b(music|records|worship)\b/i.test(channelTitle) &&
    (STRICT_TESTIMONY_TITLE_PATTERNS.some((re) => re.test(title)) ||
      STRICT_TESTIMONY_DESC_PATTERNS.some((re) => re.test(description.slice(0, 260))) ||
      (searchMode &&
        /\b(testemunh|depoimento|hist[oó]ria real|hist[oó]ria de convers[aã]o|meu testemunho|como conheci (a deus|jesus|cristo)|deus (me|nos) (salvou|curou|libertou|resgatou))\b/i.test(
          `${title} ${description.slice(0, 220)}`
        )));
  const isBibleTitle = STRICT_BIBLE_TITLE_PATTERNS.some((re) => re.test(title));
  const isBibleDesc =
    /\b(estudo b[ií]blico|na mira da verdade|arqueologia b[ií]blica|vers[ií]culo|apocalipse|profecia|evangelho|palavra de deus|b[ií]blia sagrada|santu[aá]rio|mandamentos|s[aá]bado)\b/i.test(
      description.slice(0, 320)
    );
  const isSongRaw = looksLikeWorshipSong(
    title,
    description,
    isWorshipChannel,
    channelId,
    searchMode,
    hintCategory
  );
  const hasStrongMusicTag =
    isWorshipChannel ||
    (WORSHIP_SONG_POSITIVE_PATTERNS.some((re) => re.test(title)) && !STRICT_TALK_BLOCK_RE.test(title));
  const isSabbathSchoolStudy =
    !hasStrongMusicTag &&
    !isKidsSabbathLesson &&
    !isAdventistAnimationChannel &&
    (isSabbathSchoolTitle ||
      isDedicatedSabbathSchoolChannel ||
      (isSabbathSchoolChannel && (isSabbathSchoolDesc || hintCategory === 'escola_sabatina')) ||
      ((hintCategory === 'escola_sabatina' || searchMode) && isSabbathSchoolDesc));
  const isStrictSermon =
    !hasStrongMusicTag &&
    !isSabbathSchoolStudy &&
    !NON_SERMON_PATTERNS.some((re) => re.test(title)) &&
    !NON_SERMON_PATTERNS.some((re) => re.test(description.slice(0, 220))) &&
    (STRICT_SERMON_TITLE_PATTERNS.some((re) => re.test(title)) ||
      (searchMode &&
        adventist &&
        !hasStrongMusicTag &&
        /\b(prega[cç][aã]o|serm[aã]o|culto|mensagem|estudo|palavra|ora[cç][aã]o|cristo|jesus|deus|esperan[cç]a)\b/i.test(
          fullContext
        )));
  const isExplicitTestimony = hasExplicitTestimonySignals && !hasStrongMusicTag && !isSabbathSchoolStudy;
  const isSong =
    isSongRaw &&
    !isAdventistAnimationChannel &&
    !isSabbathSchoolStudy &&
    (!searchMode || hasStrongMusicTag || (!isExplicitTestimony && !isBibleTitle && !isStrictSermon && !isBiblicalAnimation));

  let detectedCategory: ContentCategory | null = null;

  if (isFeliz7PlayChannel) {
    detectedCategory = 'feliz7play';
  } else if (isAdventistAnimationChannel) {
    if (
      !NON_BIBLICAL_KIDS_NOISE_RE.test(title) &&
      !/\bkaraok[eê](?![a-záéíóúâêôãõç])/i.test(title) &&
      (BIBLICAL_ANIMATION_TOPIC_RE.test(combined) || isBiblicalAnimation || ANIMATION_MEDIUM_RE.test(title))
    ) {
      detectedCategory = 'feliz7play';
    } else {
      return null;
    }
  } else if (isBiblicalAnimation && adventist) {
    detectedCategory = 'feliz7play';
  } else if (isWorshipChannel && !searchMode) {
    // Worship channels only enter 'louvores' (when actual music) or 'testemunhos' (only if explicit spoken testimony)
    if (isSong) {
      detectedCategory = 'louvores';
    } else if (isExplicitTestimony) {
      detectedCategory = 'testemunhos';
    } else {
      return null;
    }
  } else if (isTestimonyChannel && !searchMode) {
    // Multi-congregation testimony channels only enter 'testemunhos' when the video is an explicit testimony
    if (isExplicitTestimony) {
      detectedCategory = 'testemunhos';
    } else {
      return null;
    }
  } else if (isSabbathSchoolStudy) {
    detectedCategory = 'escola_sabatina';
  } else if (isExplicitTestimony) {
    detectedCategory = 'testemunhos';
  } else if (
    isStrictSermon ||
    isBibleTitle ||
    (isUnifiedPregacoesChannel && !isSong && !NON_SERMON_PATTERNS.some((re) => re.test(title)))
  ) {
    detectedCategory = 'pregacoes';
  } else if (isSong) {
    detectedCategory = 'louvores';
  } else if (
    (hintCategory === 'pregacoes' || searchMode) &&
    !NON_SERMON_PATTERNS.some((re) => re.test(title)) &&
    isBibleDesc
  ) {
    detectedCategory = 'pregacoes';
  } else if (
    hintCategory === 'pregacoes' &&
    adventist &&
    !hasStrongMusicTag &&
    !NON_SERMON_PATTERNS.some((re) => re.test(title)) &&
    /\b(estudo|na mira|arqueologia|apocalipse|profecia|vers[ií]culo|b[ií]bli|salmo|g[eê]nesis|daniel|s[aá]bado|mandamento|santu[aá]rio|par[aá]bola|evangelho|mil[eê]nio|cristo|jesus|deus)\b/i.test(
      `${title} ${description.slice(0, 260)}`
    )
  ) {
    detectedCategory = 'pregacoes';
  } else if (searchMode && adventist && !NON_SERMON_PATTERNS.some((re) => re.test(title))) {
    detectedCategory = hintCategory === 'escola_sabatina' ? 'escola_sabatina' : 'pregacoes';
  } else {
    return null;
  }

  // Pregações e Bíblia (pregacoes), Escola Sabatina (escola_sabatina), and Feliz7Play MUST adhere strictly to Seventh-day Adventist doctrine
  if (
    detectedCategory === 'pregacoes' ||
    detectedCategory === 'escola_sabatina' ||
    detectedCategory === 'feliz7play'
  ) {
    if (!adventist) {
      return null;
    }
    if (containsBlockedTerms(combined, BLOCKED_DOCTRINAL_CONFLICT_TERMS)) {
      return null;
    }
    if (
      detectedCategory === 'escola_sabatina' &&
      !isEligibleSabbathSchoolShort({
        title,
        description,
        channelId,
        channelTitle,
        publishedAt: options?.publishedAt,
      })
    ) {
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

export function isSearchSuggestionSafe(rawText: string): boolean {
  const text = rawText.trim();
  if (text.length < 2 || text.length > 80) return false;
  if (containsBlockedTerms(text, BLOCKED_GENERAL_TERMS)) return false;
  if (containsBlockedTerms(text, BLOCKED_DOCTRINAL_CONFLICT_TERMS)) return false;
  if (SECULAR_OFF_CONTEXT_TITLE_RE.test(text)) return false;
  if (AI_GENERATED_PATTERNS.some((re) => re.test(text))) return false;
  if (NON_PORTUGUESE_PATTERNS.some((re) => re.test(text))) return false;
  if (
    /\b(karaok[eê]|playback|cifra|como tocar|pula-?pula|pol[eê]mic|fofoca|par[oó]dia|funk|sertanejo|tigrinho|betano|bullying|hino nacional|hino do brasil)\b/i.test(
      text
    )
  ) {
    return false;
  }
  return true;
}

export function parseIso8601DurationSeconds(iso: string | undefined): number | null {
  if (!iso) return null;
  if (iso === 'P0D') return 0;
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

function getTodaySaoPauloYmd(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function isUpcomingOrPremiereEntry(
  title: string,
  description: string,
  publishedAt: string
): boolean {
  const pubMs = Date.parse(publishedAt);
  if (Number.isFinite(pubMs) && pubMs > Date.now() + 60_000) {
    return true;
  }

  const descHead = description.slice(0, 350);
  const text = `${title} ${descHead}`;
  if (
    /^\s*(?:[\[({#]*\s*)?(?:pr[eé]-?)?estr[eé]ia\b/i.test(title) ||
    /(?:^|\s)(?:🔴|🚨)\s*(ao\s+vivo|culto|estr[eé]ia|live)/i.test(title) ||
    /\b(aguardando(\s+a)?\s*estr[eé]ia|pr[eé]-?estr[eé]ia|em\s+estr[eé]ia|vai\s+estrear|estrear[áa]|estreando|assista\s+[àa]\s+estr[eé]ia|come[cç]a\s+em\s+breve|dispon[ií]vel\s+(em|dia|a\s+partir)|lan[cç]amento\s+(dia|em)\s+\d|programad[oa]\s+(para|em)|ao\s+vivo\s+(em|hoje|amanh[ãa]|[àa]s|agora)|live\s+especial\s+.*\s+neste\s+(domingo|s[aá]bado|sexta)|definir\s+lembrete|notificar-me|upcoming\s+premiere|scheduled\s+for)\b/i.test(
      text
    ) ||
    /\bestr[eé]ia\s*(?:em\s+breve|hoje|amanh[ãa]|dia|às|[àa]s|no\s+youtube|oficial|exclusiva|nacional|mundial|[:|\-!])/i.test(
      text
    ) ||
    /\bpremieres?(?:\s+(?:in|on|at|soon)\b|\s*[:|\-!])/i.test(text)
  ) {
    return true;
  }

  const todayYmd = getTodaySaoPauloYmd();
  const dateMatches = text.matchAll(/\b(\d{2})\/(\d{2})\/(20\d{2})\b/g);
  for (const m of dateMatches) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const ymd = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (ymd > todayYmd) {
        return true;
      }
    }
  }

  return false;
}

export function parseChannelRssXml(
  xml: string,
  spec: CuratedChannelSpec,
  isDedicatedShortsPlaylist: boolean,
  allowFullLengthCategories = false
): ChristianShort[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const results: ChristianShort[] = [];

  for (const entry of entries) {
    const videoId = extractXmlTag(entry, 'yt:videoId');
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue;

    const linkMatch = entry.match(/<link\s+rel="alternate"\s+href="([^"]+)"/i);
    const linkHref = linkMatch ? linkMatch[1] : '';

    const title = extractXmlTag(entry, 'title');
    if (!title) continue;

    const description = extractXmlTag(entry, 'media:description');
    const publishedAt = extractXmlTag(entry, 'published') || new Date().toISOString();
    if (isUpcomingOrPremiereEntry(title, description, publishedAt)) continue;

    const authorName = extractXmlTag(entry, 'name') || spec.title;

    const classified = classifyShort(spec.id, authorName, title, description, undefined, {
      publishedAt,
    });
    if (!classified) continue;

    // Allow full-length videos for Louvores, Pregações, Feliz7Play, and explicit Testemunhos;
    // reject /shorts/ links on Louvores RSS so 15s promo reels never slip in.
    const isShortLink = linkHref.includes('/shorts/');
    if (classified.category === 'louvores' && isShortLink) {
      continue;
    }
    if (!isDedicatedShortsPlaylist && !isShortLink) {
      const canIncludeFullVideo =
        (allowFullLengthCategories &&
          (classified.category === 'louvores' ||
            classified.category === 'pregacoes' ||
            classified.category === 'escola_sabatina' ||
            classified.category === 'feliz7play')) ||
        classified.category === 'testemunhos';
      if (!canIncludeFullVideo) {
        continue;
      }
    }

    const thumbMatch = entry.match(/<media:thumbnail\s+url="([^"]+)"/i);
    const viewsMatch = entry.match(/<media:statistics\s+views="(\d+)"/i);
    const viewCount = viewsMatch ? Number(viewsMatch[1]) : null;

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

const RSS_LOUVOR_PLAYLISTS: Array<{
  playlistId: string;
  spec: CuratedChannelSpec;
}> = [
  // Novo Hinário Adventista (1-600)
  {
    playlistId: 'PLAPpcKnpMfeO9Fydpl1tTKC9CRRnIMMSK',
    spec: {
      id: 'UCQhkLOO40bmTMeLcbspKW8A',
      title: 'Novo Hinário Adventista',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLAPpcKnpMfeOsWzlaY0bXm1Q5pnQQxn_y',
    spec: {
      id: 'UCQhkLOO40bmTMeLcbspKW8A',
      title: 'Novo Hinário Adventista',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLAPpcKnpMfeMnCMuGcdWKVkgpi2P_sRkE',
    spec: {
      id: 'UCQhkLOO40bmTMeLcbspKW8A',
      title: 'Novo Hinário Adventista',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLAPpcKnpMfeNIrE1nk3w2OkcUdxuY6y1l',
    spec: {
      id: 'UCQhkLOO40bmTMeLcbspKW8A',
      title: 'Novo Hinário Adventista',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLAPpcKnpMfePvD6DLI-Y5TR-RVVo62s6Z',
    spec: {
      id: 'UCQhkLOO40bmTMeLcbspKW8A',
      title: 'Novo Hinário Adventista',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLAPpcKnpMfePWEOuIu4B4F3PVljyD8DoO',
    spec: {
      id: 'UCQhkLOO40bmTMeLcbspKW8A',
      title: 'Novo Hinário Adventista',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  // Adoradores Novo Tempo
  {
    playlistId: 'PLnjYWXTXSkDpfADeUa3LJkhdzzXwsqD_P',
    spec: {
      id: 'UCj14fcdKiGxi2qQsqhPf9tg',
      title: 'Adoradores Novo Tempo',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLnjYWXTXSkDrri7WFuBCYB5Ljo9uhbOUG',
    spec: {
      id: 'UCj14fcdKiGxi2qQsqhPf9tg',
      title: 'Adoradores Novo Tempo',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLGd1LrnOTfcu_5cTv_hXG2NhMb1CfULoK',
    spec: {
      id: 'UCj14fcdKiGxi2qQsqhPf9tg',
      title: 'Adoradores Novo Tempo',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  // CD Jovem / Ministério Jovem
  {
    playlistId: 'PL4sNlZt4GK2gdDHuCLJo7zbBrAgrejKgZ',
    spec: {
      id: 'UCIvT_5iKmxPksHRqv4g_GZQ',
      title: 'Ministério Jovem',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLbVEebfqK46x3MZ9MSjtSy8Z7p8lUIblW',
    spec: {
      id: 'UCIvT_5iKmxPksHRqv4g_GZQ',
      title: 'Ministério Jovem',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLJL3zUYFtkP_UhdQDQ3qIqAeHQtahqbkP',
    spec: {
      id: 'UCIvT_5iKmxPksHRqv4g_GZQ',
      title: 'Ministério Jovem',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PL-EHuXADFVigifAI3blR0zMp163K7GfIM',
    spec: {
      id: 'UCIvT_5iKmxPksHRqv4g_GZQ',
      title: 'Ministério Jovem',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PL4sNlZt4GK2hONK721JkhSvIBYSk1xO7z',
    spec: {
      id: 'UCIvT_5iKmxPksHRqv4g_GZQ',
      title: 'Ministério Jovem',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
  {
    playlistId: 'PLdKdSz4_lV0psVHoo6-hquHfyTKu7O-Gl',
    spec: {
      id: 'UCFTFFVStluyIusWi71Yc0sA',
      title: 'CD Jovem - Menos Um',
      doctrineScope: 'adventista',
      defaultCategory: 'louvores',
      allowInCategories: ['louvores'],
    },
  },
];

export async function fetchFastBootstrapRssWithAdapter(
  fetchXml: (url: string) => Promise<string | null>
): Promise<ChristianShort[]> {
  const categories: ContentCategory[] = [
    'pregacoes',
    'escola_sabatina',
    'louvores',
    'testemunhos',
    'feliz7play',
  ];
  const tasks: Array<Promise<ChristianShort[]>> = [];

  for (const cat of categories) {
    const spec = ALL_CURATED_CHANNELS.find((c) => c.defaultCategory === cat);
    if (!spec) continue;
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${spec.id}`;
    const allowFull =
      cat === 'louvores' ||
      cat === 'feliz7play' ||
      cat === 'pregacoes' ||
      cat === 'testemunhos' ||
      cat === 'escola_sabatina';
    tasks.push(
      (async () => {
        const xml = await fetchXml(url);
        if (!xml || !xml.includes('<entry>')) return [];
        return parseChannelRssXml(xml, spec, false, allowFull);
      })()
    );
  }

  const hinarioRssPlaylists = RSS_LOUVOR_PLAYLISTS.slice(0, 6);
  const extraPlaylist =
    hinarioRssPlaylists[Math.floor(Math.random() * hinarioRssPlaylists.length)] ??
    RSS_LOUVOR_PLAYLISTS[0];
  if (extraPlaylist) {
    tasks.push(
      (async () => {
        const xml = await fetchXml(
          `https://www.youtube.com/feeds/videos.xml?playlist_id=${extraPlaylist.playlistId}`
        );
        if (!xml || !xml.includes('<entry>')) return [];
        return parseChannelRssXml(xml, extraPlaylist.spec, false, true);
      })()
    );
  }

  const responses = await Promise.allSettled(tasks);
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

export async function fetchCuratedRssWithAdapter(
  fetchXml: (url: string) => Promise<string | null>,
  pageIndex = 0
): Promise<ChristianShort[]> {
  const tasks: Array<Promise<ChristianShort[]>> = [];

  for (const spec of ALL_CURATED_CHANNELS) {
    const suffix = spec.id.slice(2);
    const uushPlaylistId = `UUSH${suffix}`;
    const uulfPlaylistId = `UULF${suffix}`;
    const uupvPlaylistId = `UUPV${suffix}`;
    const uuPlaylistId = `UU${suffix}`;

    if (pageIndex > 0) {
      // Secondary archive pages for RSS / standalone APK pagination
      const archivePlaylistId =
        pageIndex === 1
          ? spec.defaultCategory === 'louvores' ||
            spec.defaultCategory === 'pregacoes' ||
            spec.defaultCategory === 'escola_sabatina' ||
            spec.defaultCategory === 'feliz7play'
            ? uulfPlaylistId
            : uupvPlaylistId
          : spec.defaultCategory === 'louvores' || spec.defaultCategory === 'feliz7play'
          ? uupvPlaylistId
          : uuPlaylistId;
      const allowFull =
        spec.defaultCategory === 'louvores' ||
        spec.defaultCategory === 'feliz7play' ||
        spec.defaultCategory === 'escola_sabatina' ||
        spec.allowInCategories.includes('pregacoes') ||
        spec.allowInCategories.includes('escola_sabatina') ||
        spec.allowInCategories.includes('testemunhos');

      tasks.push(
        (async () => {
          const xml = await fetchXml(
            `https://www.youtube.com/feeds/videos.xml?playlist_id=${archivePlaylistId}`
          );
          if (!xml || !xml.includes('<entry>')) return [];
          return parseChannelRssXml(xml, spec, false, allowFull);
        })()
      );
      continue;
    }

    if (
      spec.defaultCategory === 'louvores' ||
      spec.defaultCategory === 'feliz7play' ||
      spec.defaultCategory === 'escola_sabatina'
    ) {
      // Worship, Feliz7Play & Escola Sabatina channels: fetch full-length uploads (channel_id) directly
      tasks.push(
        (async () => {
          const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${spec.id}`;
          const xml = await fetchXml(url);
          if (!xml || !xml.includes('<entry>')) return [];
          return parseChannelRssXml(xml, spec, false, true);
        })()
      );
    } else {
      // Sermons, Bible Studies & Testimonies: Shorts feed + main channel feed for full-length Adventist studies, sermons & testimonies
      tasks.push(
        (async () => {
          const collected: ChristianShort[] = [];
          const uushUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${uushPlaylistId}`;
          const channelUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${spec.id}`;
          const includeFullStudiesOrSermons =
            spec.allowInCategories.includes('pregacoes') ||
            spec.allowInCategories.includes('escola_sabatina');

          const [uushRes, chRes] = await Promise.allSettled([
            fetchXml(uushUrl),
            includeFullStudiesOrSermons || spec.allowInCategories.includes('testemunhos')
              ? fetchXml(channelUrl)
              : Promise.resolve(null),
          ]);

          let gotUush = false;
          if (uushRes.status === 'fulfilled' && uushRes.value && uushRes.value.includes('<entry>')) {
            collected.push(...parseChannelRssXml(uushRes.value, spec, true, false));
            gotUush = true;
          }

          if (chRes.status === 'fulfilled' && chRes.value && chRes.value.includes('<entry>')) {
            const parsed = parseChannelRssXml(chRes.value, spec, false, includeFullStudiesOrSermons);
            for (const item of parsed) {
              if (
                !gotUush ||
                item.category === 'pregacoes' ||
                item.category === 'escola_sabatina' ||
                item.category === 'testemunhos'
              ) {
                collected.push(item);
              }
            }
          }

          return collected;
        })()
      );
    }
  }

  // Rotate across Novo Hinário Adventista, Adoradores, and CD Jovem playlist RSS feeds
  const playlistSliceSize = 6;
  const startOffset = (pageIndex * playlistSliceSize) % RSS_LOUVOR_PLAYLISTS.length;
  for (let i = 0; i < playlistSliceSize; i++) {
    const entry =
      RSS_LOUVOR_PLAYLISTS[(startOffset + i) % RSS_LOUVOR_PLAYLISTS.length];
    tasks.push(
      (async () => {
        const xml = await fetchXml(
          `https://www.youtube.com/feeds/videos.xml?playlist_id=${entry.playlistId}`
        );
        if (!xml || !xml.includes('<entry>')) return [];
        return parseChannelRssXml(xml, entry.spec, false, true);
      })()
    );
  }

  const responses = await Promise.allSettled(tasks);
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

export function createSeededRng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rng: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function normalizeTitleKey(title: string): string {
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

export function extractFuzzyContentKey(title: string): string {
  let cleaned = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/#[a-z0-9_]+/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ');

  const pipeIdx = cleaned.indexOf('|');
  if (pipeIdx >= 18) {
    cleaned = cleaned.slice(0, pipeIdx);
  }

  cleaned = cleaned
    .replace(/\b(parte|part|pt)\s*\d+\b/gi, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(' ').filter(Boolean);
  if (cleaned.length < 24 || words.length < 4) {
    return '';
  }
  return cleaned;
}

const SONG_ARTIST_OR_TAG_RE =
  /\b(arautos do rei|art\s*trio|novo tom|novo tempo|novo hinario( adventista)?|hinario( adventista)?|casa publicadora( brasileira)?|cpb|adoradores\s*[1-5]?|cd jovem|ministerio jovem|menos um|harpa crista|remaster|audio|live sessions?|dvd|hinos\s*\d*|clipe oficial|video oficial|acustico|ao vivo|gravadora nt|aline barros|isadora pompeo|gabriela rocha|fernandinho|sarah farias|pedro valenca|eli soares|theo rubia|fhop music|morada|mergulhar|dunamis|daniel ludtke|midian lima|sued silva|valesca mayssa|maria marcal|julliany souza|diante do trono|eyshila|ana paula valadao|carol tauber|casa worship|preto no branco|kemuel|paulo cesar baruk|laura souguellis|voz com letra|com letra|video letra|lyrics|ministerio|coral|feat|ft)\b/i;

function normalizeSongKey(title: string): string {
  const hymnMatch = title.match(/\bhino\s*0*(\d+)\b/i);
  const hymnPrefix = hymnMatch ? `hino ${hymnMatch[1]} ` : '';

  let cleaned = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/#[a-z0-9_]+/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/@[a-z0-9_]+\s*[-–|:]?\s*/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, ' ')
    .replace(/^(ouca agora|lancamento|clipe oficial|video oficial)\s*[-–:|]\s*/i, '');

  const pipeParts = cleaned
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
  if (pipeParts.length > 1) {
    const nonTagParts = pipeParts.filter((p) => !SONG_ARTIST_OR_TAG_RE.test(p));
    cleaned = nonTagParts[0] || pipeParts[0];
  }

  const dashParts = cleaned
    .split(/\s+[-–•]\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (dashParts.length >= 2) {
    const nonMetaParts = dashParts.filter((p) => !SONG_ARTIST_OR_TAG_RE.test(p));
    if (nonMetaParts.length > 0) {
      cleaned = nonMetaParts[0];
    } else {
      cleaned = dashParts[dashParts.length - 1];
    }
  }

  cleaned = cleaned
    .replace(/\b(feat|ft)\.?\s+.*$/i, '')
    .replace(
      /\b(clipe oficial|video oficial|ao vivo|acustico|lyric video|lyrics|playback|com letra|live session|dvd)\b/gi,
      ' '
    )
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return `${hymnPrefix}${cleaned}`.trim();
}

export function deduplicateShorts(
  items: ChristianShort[],
  options?: { allowSameSongVariants?: boolean }
): ChristianShort[] {
  const allowSameSongVariants = Boolean(options?.allowSameSongVariants);
  const seenIds = new Set<string>();
  const seenGlobalTitles = new Set<string>();
  const seenFuzzyTitles = new Set<string>();
  const seenChannelTitles = new Set<string>();
  const seenLouvorSongs = new Set<string>();
  const unique: ChristianShort[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;

    const titleKey = normalizeTitleKey(item.title);
    const fuzzyKey = extractFuzzyContentKey(item.title);
    const channelTitleKey = `${item.channelId}:${titleKey}`;

    if (titleKey.length >= 14 && seenGlobalTitles.has(titleKey)) continue;
    if (fuzzyKey && seenFuzzyTitles.has(fuzzyKey)) continue;
    if (titleKey.length >= 6 && seenChannelTitles.has(channelTitleKey)) continue;

    if (!allowSameSongVariants && item.category === 'louvores') {
      const songKey = normalizeSongKey(item.title);
      if (songKey.length >= 6 && seenLouvorSongs.has(songKey)) continue;
      if (songKey.length >= 6) seenLouvorSongs.add(songKey);
    }

    seenIds.add(item.id);
    if (titleKey.length >= 14) seenGlobalTitles.add(titleKey);
    if (fuzzyKey) seenFuzzyTitles.add(fuzzyKey);
    if (titleKey.length >= 6) seenChannelTitles.add(channelTitleKey);
    unique.push(item);
  }

  return unique;
}

type LouvorSubBucket = 'hinario' | 'cd_jovem' | 'adoradores_nt' | 'gospel_geral';

export function isNovoHinarioAdventistaItem(item: {
  channelId?: string;
  channelTitle?: string;
  title?: string;
}): boolean {
  if (item.channelId === 'UCQhkLOO40bmTMeLcbspKW8A') {
    return true;
  }
  const text = `${item.title || ''} ${item.channelTitle || ''}`;
  return /\b(n(o|ô)vo\s+hin[aá]rio|hin[aá]rio\s+adventista)\b/i.test(text);
}

function classifyLouvorSubBucket(item: ChristianShort): LouvorSubBucket {
  const text = `${item.title} ${item.channelTitle}`;
  if (isNovoHinarioAdventistaItem(item)) {
    return 'hinario';
  }
  if (
    item.channelId === 'UCIvT_5iKmxPksHRqv4g_GZQ' ||
    item.channelId === 'UCFTFFVStluyIusWi71Yc0sA' ||
    /\b(cd\s*jovem|minist[eé]rio jovem|menos um)\b/i.test(text)
  ) {
    return 'cd_jovem';
  }
  if (
    item.channelId === 'UCj14fcdKiGxi2qQsqhPf9tg' ||
    item.channelId === 'UCxDYiN3jS_3EuPSjhj1utbg' ||
    item.channelId === 'UCldCtvi4dAqZvd5-QLf5QvQ' ||
    item.channelId === 'UC_w2igv5oCWmO9gG0TE-Lag' ||
    item.channelId === 'UCPlmObuWWQegQCgLkTlS2cw' ||
    item.doctrineScope === 'adventista' ||
    /\b(adoradores|novo tom|arautos do rei)\b/i.test(text)
  ) {
    return 'adoradores_nt';
  }
  return 'gospel_geral';
}

const CANONICAL_PREACHER_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: 'alejandro_bullon', pattern: /\b(?:alejandro\s+)?bull[oó]n\b/ },
  { id: 'arilton_oliveira', pattern: /\barilton(?:\s+oliveira)?\b/ },
  { id: 'rodrigo_silva', pattern: /\brodrigo\s+silva\b/ },
  { id: 'ivan_saraiva', pattern: /\bivan\s+saraiva\b/ },
  { id: 'rafael_rossi', pattern: /\brafael\s+rossi\b/ },
  { id: 'odailson_fonseca', pattern: /\bodailson(?:\s+fonseca)?\b/ },
  { id: 'luis_goncalves', pattern: /\blu[ií]s\s+gon[cç]alves\b/ },
  { id: 'erton_kohler', pattern: /\berton\s+k[oö]hler\b/ },
  { id: 'michelson_borges', pattern: /\bmichelson\s+borges\b/ },
  { id: 'felippe_amorim', pattern: /\bfelippe\s+amorim\b/ },
  { id: 'manolo_damasio', pattern: /\bmanolo\s+dam[aá]sio\b/ },
  { id: 'gilson_brito', pattern: /\bgilson\s+brito\b/ },
  { id: 'kleber_goncalves', pattern: /\bkleber\s+gon[cç]alves\b/ },
  { id: 'stanley_arco', pattern: /\bstanley\s+arco\b/ },
  { id: 'henrique_goncalves', pattern: /\bhenrique\s+gon[cç]alves\b/ },
  { id: 'gustavo_marques', pattern: /\bgustavo\s+marques\b/ },
  { id: 'amilton_menezes', pattern: /\bamilton\s+menezes\b/ },
  { id: 'leandro_quadros', pattern: /\bleandro\s+quadros\b/ },
  { id: 'rafael_santos', pattern: /\brafael\s+santos\b/ },
  { id: 'diego_barros', pattern: /\bdiego\s+barros\b/ },
  { id: 'carlos_campitelli', pattern: /\bcarlos\s+campitelli\b/ },
  { id: 'igor_costa', pattern: /\bigor\s+costa\b/ },
  { id: 'alberto_timm', pattern: /\balberto\s+timm\b/ },
  { id: 'dudu_batista', pattern: /\bdudu\s+batista\b/ },
  { id: 'edmilson_nobreza', pattern: /\bedmilson\s+nobreza\b/ },
  { id: 'lucas_alves', pattern: /\blucas\s+alves\b/ },
  { id: 'marcelo_cardoso', pattern: /\bmarcelo\s+cardoso\b/ },
  { id: 'jose_carlos_lima', pattern: /\bjos[eé]\s+carlos\s+lima\b/ },
  { id: 'venefrides', pattern: /\bvenefrides\b/ },
  { id: 'mauricio_lima', pattern: /\bmaur[ií]cio\s+lima\b/ },
  { id: 'diogo_cavalcanti', pattern: /\bdiogo\s+cavalcanti\b/ },
  { id: 'davi_tavares', pattern: /\bdavi\s+tavares\b/ },
  { id: 'fernando_iglesias', pattern: /\bfernando\s+iglesias\b/ },
  { id: 'roberto_cruz', pattern: /\broberto\s+cruz\b/ },
  { id: 'pedro_penha', pattern: /\bpedro\s+penha\b/ },
];

const GENERIC_PREACHER_STOPWORDS = new Set([
  'adventista',
  'adventistas',
  'brasil',
  'canal',
  'oficial',
  'culto',
  'online',
  'jovem',
  'sabado',
  'live',
  'ao',
  'vivo',
  'do',
  'da',
  'de',
  'dos',
  'das',
  'em',
  'e',
]);

export function getDiversityActorKey(item: ChristianShort): string {
  const foldedChannelId = (item.channelId || '').trim();
  const foldedChannelTitle = normalizeSearchFold(item.channelTitle || '').trim();
  const fallbackChannelKey = foldedChannelId
    ? `channel:${foldedChannelId}`
    : `channel:${foldedChannelTitle || 'unknown'}`;

  if (item.category !== 'pregacoes' && item.category !== 'escola_sabatina') {
    return fallbackChannelKey;
  }

  const foldedTitle = normalizeSearchFold(item.title || '');
  const combined = `${foldedTitle} ${foldedChannelTitle}`;

  for (const entry of CANONICAL_PREACHER_PATTERNS) {
    if (entry.pattern.test(combined)) {
      return `speaker:${entry.id}`;
    }
  }

  const titleMatch = foldedTitle.match(
    /(?:^|[\s|\-:•/[(])(?:pr\.?|pastor(?:a)?)\s+([a-z]{3,}(?:\s+(?:de|da|do|dos|das)\s+[a-z]{2,}|\s+[a-z]{3,})?)/
  );
  if (titleMatch?.[1]) {
    const words = titleMatch[1]
      .trim()
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !GENERIC_PREACHER_STOPWORDS.has(w));
    if (words.length > 0) {
      return `speaker:${words.slice(0, 2).join('_')}`;
    }
  }

  return fallbackChannelKey;
}

function getFreshnessBand(publishedAt: string, nowMs: number): 0 | 1 | 2 | 3 | 4 {
  const pubMs = Date.parse(publishedAt);
  if (!Number.isFinite(pubMs)) return 3;
  const ageDays = (nowMs - pubMs) / (24 * 60 * 60 * 1000);
  if (ageDays <= 14) return 0; // Ultra-recent (last 2 weeks)
  if (ageDays <= 45) return 1; // Fresh (last ~1.5 months)
  if (ageDays <= 180) return 2; // Current (last 6 months)
  if (ageDays <= 540) return 3; // Recent archive (last ~18 months)
  return 4; // Older archive / classics
}

function roundRobinAcrossChannels(
  items: ChristianShort[],
  randomize: boolean,
  rng: () => number = Math.random
): ChristianShort[] {
  if (items.length <= 1) return [...items];
  const nowMs = Date.now();
  const byActor = new Map<string, ChristianShort[]>();
  const distinctChannels = new Set<string>();

  for (const item of items) {
    const actorKey = getDiversityActorKey(item);
    const list = byActor.get(actorKey) ?? [];
    list.push(item);
    byActor.set(actorKey, list);
    if (item.channelId) distinctChannels.add(item.channelId);
  }

  const totalLen = items.length;
  const actorEntries = [...byActor.entries()].map(([actorKey, list]) => {
    const bands: [
      ChristianShort[],
      ChristianShort[],
      ChristianShort[],
      ChristianShort[],
      ChristianShort[],
    ] = [[], [], [], [], []];
    let freshestBand: 0 | 1 | 2 | 3 | 4 = 4;
    for (const item of list) {
      const band = getFreshnessBand(item.publishedAt, nowMs);
      if (band < freshestBand) freshestBand = band;
      bands[band].push(item);
    }
    const ordered: ChristianShort[] = [];
    for (const b of bands) {
      b.sort((a, bItem) => bItem.publishedAt.localeCompare(a.publishedAt));
      if (randomize) shuffleInPlace(b, rng);
      ordered.push(...b);
    }
    return {
      actorKey,
      items: ordered,
      freshestBand,
      newestPublishedAt: ordered[0]?.publishedAt || '',
      phase: randomize ? rng() : 0.25,
    };
  });

  if (randomize) {
    // Shuffle actors ONLY within their freshest recency band so current 2026 creators
    // always stay ahead of archive-only channels while still varying per seed.
    const byFreshestBand: [
      typeof actorEntries,
      typeof actorEntries,
      typeof actorEntries,
      typeof actorEntries,
      typeof actorEntries,
    ] = [[], [], [], [], []];
    for (const entry of actorEntries) {
      byFreshestBand[entry.freshestBand].push(entry);
    }
    actorEntries.length = 0;
    for (const group of byFreshestBand) {
      shuffleInPlace(group, rng);
      actorEntries.push(...group);
    }
  } else {
    actorEntries.sort((a, b) => b.newestPublishedAt.localeCompare(a.newestPublishedAt));
  }

  // Proportional ideal-slot placement weighted strongly by freshness band:
  // keeps ultra-recent & current content leading ahead of older archive items while
  // evenly spacing dominant actors/channels.
  const scheduled: Array<{ item: ChristianShort; actorKey: string; slot: number }> = [];
  for (let aIdx = 0; aIdx < actorEntries.length; aIdx++) {
    const entry = actorEntries[aIdx];
    const count = entry.items.length;
    const step = 1 / count;
    const actorJitter = (aIdx / Math.max(1, actorEntries.length)) * step * 0.45;
    for (let k = 0; k < count; k++) {
      const item = entry.items[k];
      const bandBias = getFreshnessBand(item.publishedAt, nowMs) * 0.45;
      const randomJitter = randomize ? (rng() - 0.5) * step * 0.25 : 0;
      const slot = (k + entry.phase * 0.4) * step + actorJitter + bandBias + randomJitter;
      scheduled.push({ item, actorKey: entry.actorKey, slot });
    }
  }
  scheduled.sort((a, b) => a.slot - b.slot);

  // Cooldown greedy pass: avoids back-to-back or close-window repeats of the same
  // speaker/preacher OR same YouTube channel whenever any alternative exists.
  const distinctActorCount = byActor.size;
  const distinctChannelCount = Math.max(1, distinctChannels.size);
  const actorCooldownWindow = Math.min(4, Math.max(0, distinctActorCount - 1));
  const channelCooldownWindow = Math.min(3, Math.max(0, distinctChannelCount - 1));

  const remaining = scheduled;
  const stream: ChristianShort[] = [];
  const lastSeenActorPos = new Map<string, number>();
  const lastSeenChannelPos = new Map<string, number>();

  while (remaining.length > 0) {
    const pos = stream.length;
    let chosenIdx = -1;

    // 1) Respect both speaker/actor cooldown and channel cooldown
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      const prevActorPos = lastSeenActorPos.get(cand.actorKey);
      const prevChanPos = cand.item.channelId
        ? lastSeenChannelPos.get(cand.item.channelId)
        : undefined;
      const actorOk = prevActorPos === undefined || pos - prevActorPos > actorCooldownWindow;
      const chanOk = prevChanPos === undefined || pos - prevChanPos > channelCooldownWindow;
      if (actorOk && chanOk) {
        chosenIdx = i;
        break;
      }
    }

    // 2) Relax to non-adjacent actor + non-adjacent channel
    if (chosenIdx === -1) {
      for (let i = 0; i < remaining.length; i++) {
        const cand = remaining[i];
        const prevActorPos = lastSeenActorPos.get(cand.actorKey);
        const prevChanPos = cand.item.channelId
          ? lastSeenChannelPos.get(cand.item.channelId)
          : undefined;
        const actorOk = prevActorPos === undefined || pos - prevActorPos > 1;
        const chanOk = prevChanPos === undefined || pos - prevChanPos > 1;
        if (actorOk && chanOk) {
          chosenIdx = i;
          break;
        }
      }
    }

    // 3) Maximize distance since last appearance of actor (and channel tiebreaker)
    if (chosenIdx === -1) {
      let bestScore = -1;
      const scanLimit = Math.min(remaining.length, Math.max(24, totalLen));
      for (let i = 0; i < scanLimit; i++) {
        const cand = remaining[i];
        const prevActorPos = lastSeenActorPos.get(cand.actorKey);
        const prevChanPos = cand.item.channelId
          ? lastSeenChannelPos.get(cand.item.channelId)
          : undefined;
        const actorGap = prevActorPos === undefined ? 10000 : pos - prevActorPos;
        const chanGap = prevChanPos === undefined ? 10000 : pos - prevChanPos;
        const score = actorGap * 10 + Math.min(chanGap, 50) - i * 0.01;
        if (score > bestScore) {
          bestScore = score;
          chosenIdx = i;
        }
      }
    }

    if (chosenIdx < 0) chosenIdx = 0;
    const [picked] = remaining.splice(chosenIdx, 1);
    stream.push(picked.item);
    lastSeenActorPos.set(picked.actorKey, pos);
    if (picked.item.channelId) {
      lastSeenChannelPos.set(picked.item.channelId, pos);
    }
  }

  return stream;
}

function buildRoundRobinChannelQueue(
  items: ChristianShort[],
  randomize: boolean,
  rng: () => number = Math.random
): ChristianShort[] {
  return roundRobinAcrossChannels(items, randomize, rng);
}

function buildCategoryStream(
  cat: ContentCategory,
  catItems: ChristianShort[],
  randomize: boolean,
  rng: () => number = Math.random
): ChristianShort[] {
  if (catItems.length === 0) return [];
  if (cat !== 'louvores') {
    return buildRoundRobinChannelQueue(catItems, randomize, rng);
  }

  // Balance Louvores across Novo Hinário, CD Jovem, Adoradores/Adventist, and Gospel Geral
  // while letting current/fresh worship buckets open ahead of older archive-only buckets.
  const subBuckets: Record<LouvorSubBucket, ChristianShort[]> = {
    hinario: [],
    cd_jovem: [],
    adoradores_nt: [],
    gospel_geral: [],
  };
  for (const item of catItems) {
    subBuckets[classifyLouvorSubBucket(item)].push(item);
  }
  const freshSubQueues: ChristianShort[][] = [
    buildRoundRobinChannelQueue(subBuckets.cd_jovem, randomize, rng),
    buildRoundRobinChannelQueue(subBuckets.adoradores_nt, randomize, rng),
    buildRoundRobinChannelQueue(subBuckets.gospel_geral, randomize, rng),
  ];
  if (randomize) {
    shuffleInPlace(freshSubQueues, rng);
  }
  const hinarioQueue = buildRoundRobinChannelQueue(subBuckets.hinario, randomize, rng);
  // Prioritize official Casa Publicadora Brasileira Novo Hinário hymns ahead of third-party covers
  if (hinarioQueue.length > 1) {
    const officialHinario = hinarioQueue.filter((i) => i.channelId === 'UCQhkLOO40bmTMeLcbspKW8A');
    const coverHinario = hinarioQueue.filter((i) => i.channelId !== 'UCQhkLOO40bmTMeLcbspKW8A');
    hinarioQueue.length = 0;
    let oIdx = 0;
    let cIdx = 0;
    while (oIdx < officialHinario.length || cIdx < coverHinario.length) {
      if (oIdx < officialHinario.length) hinarioQueue.push(officialHinario[oIdx++]);
      if (oIdx < officialHinario.length) hinarioQueue.push(officialHinario[oIdx++]);
      if (cIdx < coverHinario.length) hinarioQueue.push(coverHinario[cIdx++]);
    }
  }

  const result: ChristianShort[] = [];
  let lastChannelId: string | null = null;
  let nonHinarioStreak = 0;
  // Place first Novo Hinário hymn around position 3-5 so it appears early while diverse worship leads
  const firstHinarioAfter = randomize ? 2 + Math.floor(rng() * 3) : 3;
  let hinarioInsertedCount = 0;

  const popNextFromQueue = (sq: ChristianShort[]): ChristianShort | undefined => {
    if (sq.length === 0) return undefined;
    const pickIdx = Math.max(0, sq.findIndex((i) => i.channelId !== lastChannelId));
    const [picked] = sq.splice(pickIdx, 1);
    return picked;
  };

  while (freshSubQueues.some((q) => q.length > 0) || hinarioQueue.length > 0) {
    let emittedInRound = false;
    for (const sq of freshSubQueues) {
      if (sq.length === 0) continue;
      const picked = popNextFromQueue(sq);
      if (picked) {
        result.push(picked);
        lastChannelId = picked.channelId;
        nonHinarioStreak += 1;
        emittedInRound = true;
      }

      const hinarioThreshold = hinarioInsertedCount === 0 ? firstHinarioAfter : 4;
      if (hinarioQueue.length > 0 && nonHinarioStreak >= hinarioThreshold) {
        const hinarioPick = popNextFromQueue(hinarioQueue);
        if (hinarioPick) {
          result.push(hinarioPick);
          lastChannelId = hinarioPick.channelId;
          nonHinarioStreak = 0;
          hinarioInsertedCount += 1;
        }
      }
    }

    if (!emittedInRound && hinarioQueue.length > 0) {
      const hinarioPick = popNextFromQueue(hinarioQueue);
      if (hinarioPick) {
        result.push(hinarioPick);
        lastChannelId = hinarioPick.channelId;
        hinarioInsertedCount += 1;
      }
    }
  }
  return result;
}

function interleaveCategoryStreams(
  categories: ContentCategory[],
  categoryStreams: Record<ContentCategory, ChristianShort[]>
): ChristianShort[] {
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

export function buildTieredDiverseFeed(
  tiers: ChristianShort[][],
  randomize: boolean,
  seed?: number
): ChristianShort[] {
  const rng = seed !== undefined ? createSeededRng(seed) : Math.random;
  const categories: ContentCategory[] = [
    'pregacoes',
    'escola_sabatina',
    'louvores',
    'testemunhos',
    'feliz7play',
  ];
  if (randomize) {
    shuffleInPlace(categories, rng);
  }

  const categoryStreams: Record<ContentCategory, ChristianShort[]> = {
    pregacoes: [],
    escola_sabatina: [],
    louvores: [],
    testemunhos: [],
    feliz7play: [],
  };

  const globalSeenIds = new Set<string>();
  for (const rawTier of tiers) {
    const uniqueTier = deduplicateShorts(rawTier).filter((item) => {
      if (globalSeenIds.has(item.id)) return false;
      globalSeenIds.add(item.id);
      return true;
    });
    for (const cat of categories) {
      const tierCatItems = uniqueTier.filter((item) => item.category === cat);
      if (tierCatItems.length > 0) {
        categoryStreams[cat].push(...buildCategoryStream(cat, tierCatItems, randomize, rng));
      }
    }
  }

  return interleaveCategoryStreams(categories, categoryStreams);
}

export function buildDiverseFeed(
  items: ChristianShort[],
  randomize: boolean,
  seed?: number
): ChristianShort[] {
  return buildTieredDiverseFeed([items], randomize, seed);
}

function normalizeSearchFold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function formatFilteredResponse(
  allItems: ChristianShort[],
  sourceMode: 'youtube_api' | 'curated_rss',
  apiKeyConfigured: boolean,
  fetchedAt: string,
  rawCategory?: string,
  rawQuery?: string,
  hasMore = false,
  nextCursor: string | null = null
): ShortsApiResponse {
  const normalizedCategory = normalizeContentCategory(rawCategory);
  const category = rawCategory === 'all' ? 'all' : normalizedCategory ?? 'all';
  const sanitizedQuery = normalizeSearchFold(
    (rawQuery || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80)
  );
  const queryTokens = sanitizedQuery.split(/\s+/).filter(Boolean);

  const currentDayPool = allItems.filter(
    (item) =>
      item.category !== 'escola_sabatina' ||
      isEligibleSabbathSchoolShort({
        title: item.title,
        description: item.description,
        channelId: item.channelId,
        channelTitle: item.channelTitle,
        publishedAt: item.publishedAt,
      })
  );

  const queryFiltered =
    queryTokens.length > 0
      ? currentDayPool.filter((item) => {
          const haystack = normalizeSearchFold(
            `${item.title} ${item.channelTitle} ${item.description} ${item.categoryLabel}`
          );
          return queryTokens.every((tok) => haystack.includes(tok));
        })
      : currentDayPool;

  const categoryCounts: Record<ContentCategory, number> = {
    pregacoes: 0,
    escola_sabatina: 0,
    louvores: 0,
    testemunhos: 0,
    feliz7play: 0,
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
    hasMore,
    nextCursor,
  };
}
