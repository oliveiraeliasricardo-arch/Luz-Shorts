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
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos', 'louvores'],
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
    id: 'UC5O76sK8ffuQBHuPlB0QmeA',
    title: 'Adventistas SP',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos', 'louvores'],
  },
  {
    id: 'UC8PS8EsZsWXOQ1YmlJwCaYw',
    title: 'Feliz7Play',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia', 'testemunhos', 'louvores'],
  },
  {
    id: 'UC03Y0ieYROxw1FxCoDaSF9g',
    title: 'Arilton Oliveira - Oficial',
    doctrineScope: 'adventista',
    defaultCategory: 'biblia',
    allowInCategories: ['biblia', 'pregacoes'],
  },
  {
    id: 'UCBm5ycqxuqK-UVs54-xA_2w',
    title: 'ComTexto Diário',
    doctrineScope: 'adventista',
    defaultCategory: 'biblia',
    allowInCategories: ['biblia', 'pregacoes'],
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
    id: 'UCPlmObuWWQegQCgLkTlS2cw',
    title: 'Daniel Lüdtke',
    doctrineScope: 'adventista',
    defaultCategory: 'louvores',
    allowInCategories: ['louvores', 'testemunhos'],
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

const NON_PORTUGUESE_PATTERNS = [
  /[¿¡]/,
  /\b(despierta am[eé]rica|univision|semana del pa[ñn]uelo|reina para siempre|mil gracias|conquistadores)\b/i,
  /\b(la llama|cristo y nada m[aá]s|en tu presencia|te alabamos)\b/i,
  /\bgozo\s*[–-]\s*aline barros\b/i,
];

const AI_GENERATED_PATTERNS = [
  /\b(gerad[oa]|criad[oa]|feit[oa]|produzid[oa]|cantad[oa]|narrad[oa]|compost[oa]|anima[cç][aã]o|m[uú]sica|can[cç][aã]o|v[ií]deo|clipe|voz|arte)\s+(por|com|via|em|de)\s+(ia|intelig[eê]ncia artificial)\b/i,
  /\b(ia\s+gospel|gospel\s+(com\s+|de\s+|em\s+)?ia|louvor\s+(com\s+|de\s+|em\s+)?ia)\b/i,
  /\b(made with ai|ai[- ]generated|ai[- ]music|ai[- ]cover|ai[- ]animation|ai[- ]video|ai[- ]voice|synthetic content)\b/i,
  /\b(suno\.?ai|suno|udio|elevenlabs|midjourney|runwayml|heygen|kling ai|sora ai|hailuo|leonardo\.ai)\b/i,
  /#(ia|aiart|aivideo|aimusic|aicover|suno|sunoai|udio|runway|sora|kling|veo|midjourney|elevenlabs|heygen)\b/i,
  /♫\s*♪\s*♬|\bt[ií]tulo:\s*["“]?|vers[aã]o adaptada\b/i,
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
  /\bcolet[aâ]nea\b/i,
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
  /\b(aprovados|aceitaram o desafio|3[ªa]\s*fase|top\s*10|partiu\s+portugal|amanh[aã]\s*-\s*\d{2}h|lan[cç]a sua primeira m[uú]sica|teaser)\b/i,
];

const STRICT_TESTIMONY_TITLE_PATTERNS = [
  /\btestemunh/i,
  /\bdepoimento\b/i,
  /\bconvers[aã]o\b/i,
  /\bmudou (a )?minha vida\b/i,
  /\bdeus me (salvou|curou|resgatou|livrou|transformou)\b/i,
  /\bsalvou (a )?minha vida\b/i,
  /\bhist[oó]ria (real|de f[eé]|de vida|de supera[cç][aã]o)\b/i,
  /\bcomo (conheci|encontrei) (a )?(deus|jesus|igreja|verdade)\b/i,
  /\bpor que (me tornei|voltei|aceitei)\b/i,
  /\bex-?\s*(traficante|ateu|atriz|cantor|usu[aá]rio|l[ií]der)\b/i,
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
  /\badora[cç][aã]o\b/i,
  /\bhino\b/i,
  /\bnova m[uú]sica\b/i,
  /\bm[uú]sica\b/i,
  /\bc[aâ]ntico\b/i,
  /\bcoral\b/i,
  /\bclipe( oficial)?\b/i,
  /\bv[ií]deo oficial\b/i,
  /\bvideo oficial\b/i,
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
  /\bcom coral\b/i,
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
  /\bep\.?\s*\d+\b/i,
  /\bepis[oó]dio\b/i,
  /\bfam[ií]lia\b/i,
  /\b(mensagem|reflex[aã]o|estudo|rea[cç][aã]o)\b/i,
  /\bvoz da profecia\b/i,
  /\ba palavra que voc[eê] precisa\b/i,
  /\best[aá] escrito adora[cç][aã]o\b/i,
];

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
  /\bescola sabatina\b/i,
  /\bli[cç][oõ]es da b[ií]blia\b/i,
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

const SERMON_SPIRITUAL_PATTERNS = [
  /\bdeus\b/i,
  /\bjesus\b/i,
  /\bcristo\b/i,
  /\besp[ií]rito santo\b/i,
  /\bora[cç][aã]o\b/i,
  /\borar\b/i,
  /\bf[eé]\b/i,
  /\besperan[cç]a\b/i,
  /\bpaz\b/i,
  /\bamor\b/i,
  /\bgra[cç]a\b/i,
  /\bperd[aã]o\b/i,
  /\bperdoar\b/i,
  /\bsalva[cç][aã]o\b/i,
  /\bcruz\b/i,
  /\bc[eé]u\b/i,
  /\beternidade\b/i,
  /\bmilagre\b/i,
  /\bserm[aã]o\b/i,
  /\bprega[cç][aã]o\b/i,
  /\bpastor\b/i,
  /\bpalavra\b/i,
  /\bevangelho\b/i,
  /\bcora[cç][aã]o\b/i,
  /\bconfian[cç]a\b/i,
  /\bprop[oó]sito\b/i,
  /\bvida saud[aá]vel\b/i,
  /\bpecado/i,
  /\buniverso\b/i,
  /\bpagou o pre[cç]o\b/i,
  /\bmission[aá]rio\b/i,
  /\bculto\b/i,
  /\bmedita[cç][aã]o\b/i,
  /\bp[oô]r do sol\b/i,
  /\bevangelismo\b/i,
  /\barmagedom\b/i,
  /\bdoug batchelor\b/i,
  /\bhander heim\b/i,
  /\bvoz da profecia\b/i,
  /\bpr\.\s*[a-záéíóúâêôãõç]+/i,
  /\bnao se preocupe\b|\bn[aã]o se preocupe\b/i,
  /\bsegue jesus\b/i,
  /\bmestre da tempestade\b/i,
  /\bmachuca voc[eê]\b/i,
  /\bconfiando\b/i,
  /\banjos\b/i,
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

function looksLikeWorshipSong(title: string, description: string, isWorshipChannel: boolean): boolean {
  if (NON_SONG_TALK_PATTERNS.some((re) => re.test(title))) {
    return false;
  }
  if (WORSHIP_SONG_POSITIVE_PATTERNS.some((re) => re.test(title))) {
    return true;
  }
  if (isWorshipChannel) {
    // Require song/music title structure ("Artist - Song" / "Song | Tag" / music keywords)
    // or explicit songwriting/composition credits in the description (avoiding generic social footer text)
    if (/[^|–-]+\s[-–|]\s[^|–-]+/.test(title) && !/\b(vlog|tour|agenda|convite|aviso)\b/i.test(title)) {
      return true;
    }
    return /\b(letra:|composi[cç][aã]o:|compositor|arranjo musical|ficha t[eé]cnica)\b/i.test(
      description
    );
  }
  return false;
}

export function classifyShort(
  channelId: string,
  channelTitle: string,
  title: string,
  description: string,
  hintCategory?: ContentCategory
): { category: ContentCategory; doctrineScope: DoctrineScope } | null {
  const combined = `${title} ${description}`;
  const fullContext = `${channelTitle} ${combined}`;

  if (containsBlockedTerms(combined, BLOCKED_GENERAL_TERMS)) {
    return null;
  }
  if (AI_GENERATED_PATTERNS.some((re) => re.test(fullContext))) {
    return null;
  }
  if (NON_PORTUGUESE_PATTERNS.some((re) => re.test(title))) {
    return null;
  }
  if (NOISE_AND_PROMO_PATTERNS.some((re) => re.test(title))) {
    return null;
  }

  const channelSpec = CHANNEL_BY_ID.get(channelId);
  const adventist = isAdventistVerified(channelId, channelTitle, title, description);

  if (!hasChristianRelevance(title, description, channelTitle, channelId)) {
    return null;
  }

  const isWorshipChannel = channelSpec?.defaultCategory === 'louvores';
  const isBibleChannel = channelSpec?.defaultCategory === 'biblia';

  const isExplicitTestimony =
    STRICT_TESTIMONY_TITLE_PATTERNS.some((re) => re.test(title)) ||
    STRICT_TESTIMONY_DESC_PATTERNS.some((re) => re.test(description));
  const isSong = looksLikeWorshipSong(title, description, isWorshipChannel);
  const isBibleTitle = STRICT_BIBLE_TITLE_PATTERNS.some((re) => re.test(title));

  let detectedCategory: ContentCategory | null = null;

  if (isWorshipChannel) {
    // Worship channels only enter 'louvores' (when actual music) or 'testemunhos' (only if explicit spoken testimony)
    if (isSong) {
      detectedCategory = 'louvores';
    } else if (isExplicitTestimony && !isSong) {
      detectedCategory = 'testemunhos';
    } else {
      return null;
    }
  } else if (isExplicitTestimony) {
    detectedCategory = 'testemunhos';
  } else if (isSong) {
    detectedCategory = 'louvores';
  } else if (isBibleTitle || isBibleChannel) {
    detectedCategory = 'biblia';
  } else if (hintCategory === 'biblia') {
    detectedCategory = 'biblia';
  } else if (hintCategory === 'louvores') {
    return null;
  } else if (hintCategory === 'testemunhos') {
    return null;
  } else {
    // Default for preaching / Adventist general channels: require clear spiritual/sermon relevance
    if (!SERMON_SPIRITUAL_PATTERNS.some((re) => re.test(combined))) {
      return null;
    }
    detectedCategory = 'pregacoes';
  }

  // Sermons (pregacoes) & Bible/Gospel (biblia) MUST adhere strictly to Seventh-day Adventist doctrine
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
    const authorName = extractXmlTag(entry, 'name') || spec.title;

    const classified = classifyShort(spec.id, authorName, title, description);
    if (!classified) continue;

    // Allow full-length videos for Louvores, Pregações, and explicit Testemunhos;
    // reject /shorts/ links on Louvores RSS so 15s promo reels never slip in.
    const isShortLink = linkHref.includes('/shorts/');
    if (classified.category === 'louvores' && isShortLink) {
      continue;
    }
    if (!isDedicatedShortsPlaylist && !isShortLink) {
      const canIncludeFullVideo =
        (allowFullLengthCategories &&
          (classified.category === 'louvores' || classified.category === 'pregacoes')) ||
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

export async function fetchCuratedRssWithAdapter(
  fetchXml: (url: string) => Promise<string | null>
): Promise<ChristianShort[]> {
  const tasks: Array<Promise<ChristianShort[]>> = [];

  for (const spec of ALL_CURATED_CHANNELS) {
    const uushPlaylistId = `UUSH${spec.id.slice(2)}`;

    if (spec.defaultCategory === 'louvores') {
      // Worship channels: fetch full-length music uploads (channel_id) only,
      // skipping UUSH promo Shorts reels (15s countdowns/tour clips).
      tasks.push(
        (async () => {
          const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${spec.id}`;
          const xml = await fetchXml(url);
          if (!xml || !xml.includes('<entry>')) return [];
          return parseChannelRssXml(xml, spec, false, true);
        })()
      );
    } else {
      // Sermons, Bible, Testimonies: Shorts feed + main channel feed for full-length Adventist sermons & testimonies
      tasks.push(
        (async () => {
          const collected: ChristianShort[] = [];
          const uushUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${uushPlaylistId}`;
          const channelUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${spec.id}`;
          const includeFullSermons = spec.allowInCategories.includes('pregacoes');

          const [uushRes, chRes] = await Promise.allSettled([
            fetchXml(uushUrl),
            includeFullSermons || spec.allowInCategories.includes('testemunhos')
              ? fetchXml(channelUrl)
              : Promise.resolve(null),
          ]);

          let gotUush = false;
          if (uushRes.status === 'fulfilled' && uushRes.value && uushRes.value.includes('<entry>')) {
            collected.push(...parseChannelRssXml(uushRes.value, spec, true, false));
            gotUush = true;
          }

          if (chRes.status === 'fulfilled' && chRes.value && chRes.value.includes('<entry>')) {
            const parsed = parseChannelRssXml(chRes.value, spec, false, includeFullSermons);
            for (const item of parsed) {
              if (
                !gotUush ||
                item.category === 'pregacoes' ||
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

const SONG_ARTIST_OR_TAG_RE =
  /\b(arautos do rei|art\s*trio|novo tom|novo tempo|live sessions?|dvd|hinos\s*\d*|clipe oficial|video oficial|acustico|ao vivo|gravadora nt|aline barros|isadora pompeo|gabriela rocha|fernandinho|sarah farias|pedro valenca|eli soares|theo rubia|fhop music|morada|mergulhar|dunamis|daniel ludtke|midian lima|sued silva|valesca mayssa|maria marcal|julliany souza|diante do trono|eyshila|ana paula valadao|carol tauber|casa worship|preto no branco|kemuel|paulo cesar baruk|laura souguellis|voz com letra|com letra|video letra|ministerio|coral|feat|ft)\b/i;

function normalizeSongKey(title: string): string {
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
    .split(/\s+[-–]\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (dashParts.length >= 2) {
    const firstIsMeta = SONG_ARTIST_OR_TAG_RE.test(dashParts[0]);
    const secondIsMeta = SONG_ARTIST_OR_TAG_RE.test(dashParts[1]);
    if (firstIsMeta && !secondIsMeta) {
      cleaned = dashParts.slice(1).join(' ');
    } else if (!firstIsMeta && secondIsMeta) {
      cleaned = dashParts[0];
    } else {
      cleaned = dashParts[dashParts.length - 1];
    }
  }

  cleaned = cleaned
    .replace(/\b(feat|ft)\.?\s+.*$/i, '')
    .replace(
      /\b(clipe oficial|video oficial|ao vivo|acustico|lyric video|playback|com letra|live session|dvd)\b/gi,
      ' '
    )
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

export function deduplicateShorts(items: ChristianShort[]): ChristianShort[] {
  const seenIds = new Set<string>();
  const seenGlobalTitles = new Set<string>();
  const seenChannelTitles = new Set<string>();
  const seenLouvorSongs = new Set<string>();
  const unique: ChristianShort[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;

    const titleKey = normalizeTitleKey(item.title);
    const channelTitleKey = `${item.channelId}:${titleKey}`;

    if (titleKey.length >= 14 && seenGlobalTitles.has(titleKey)) continue;
    if (titleKey.length >= 6 && seenChannelTitles.has(channelTitleKey)) continue;

    if (item.category === 'louvores') {
      const songKey = normalizeSongKey(item.title);
      if (songKey.length >= 6 && seenLouvorSongs.has(songKey)) continue;
      if (songKey.length >= 6) seenLouvorSongs.add(songKey);
    }

    seenIds.add(item.id);
    if (titleKey.length >= 14) seenGlobalTitles.add(titleKey);
    if (titleKey.length >= 6) seenChannelTitles.add(channelTitleKey);
    unique.push(item);
  }

  return unique;
}

const MAX_ITEMS_PER_CHANNEL: Record<ContentCategory, number> = {
  louvores: 5,
  pregacoes: 8,
  biblia: 8,
  testemunhos: 8,
};

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

    const perChannelCap = MAX_ITEMS_PER_CHANNEL[cat];
    const channelQueues = [...byChannel.values()].map((list) => {
      const ordered = [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      const varied = randomize ? shuffleInPlace(ordered) : ordered;
      return varied.slice(0, perChannelCap);
    });

    if (randomize) {
      shuffleInPlace(channelQueues);
    } else {
      channelQueues.sort((a, b) =>
        (b[0]?.publishedAt || '').localeCompare(a[0]?.publishedAt || '')
      );
    }

    let lastStreamChannelId: string | null = null;
    let added = true;
    while (added) {
      added = false;
      for (const queue of channelQueues) {
        if (queue.length === 0) continue;
        // Avoid consecutive videos from the same channel inside category tabs (especially louvores)
        const onlyThisChannelLeft =
          channelQueues.filter((q) => q.length > 0).length === 1;
        if (onlyThisChannelLeft && queue[0].channelId === lastStreamChannelId) {
          continue;
        }
        const next = queue.shift();
        if (next) {
          categoryStreams[cat].push(next);
          lastStreamChannelId = next.channelId;
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
