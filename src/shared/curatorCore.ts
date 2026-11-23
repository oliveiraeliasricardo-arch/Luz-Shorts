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
    defaultCategory: 'biblia',
    allowInCategories: ['biblia', 'testemunhos', 'louvores'],
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
    id: 'UCs5jiNO6fntcZcCn7sUO6VA',
    title: 'Pastor Bullón em Português - Canal Oficial',
    doctrineScope: 'adventista',
    defaultCategory: 'pregacoes',
    allowInCategories: ['pregacoes', 'biblia'],
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
  /\bcd\s*jovem\b/i,
  /\bminist[eé]rio jovem\b/i,
];

const NON_PORTUGUESE_PATTERNS = [
  /[¿¡]/,
  /\b(despierta am[eé]rica|univision|semana del pa[ñn]uelo|reina para siempre|mil gracias|conquistadores)\b/i,
  /\b(la llama|cristo y nada m[aá]s|en tu presencia|te alabamos)\b/i,
  /\b(educaci[oó]n|predicaci[oó]n|oraci[oó]n|salvaci[oó]n|bendici[oó]n|coraz[oó]n|deja de|en espa[ñn]ol|iglesia adventista del)\b/i,
  /\b(d[ií]a\s*\d+\s*\|.*(semana|adventista)|\(esp\))\b/i,
  /\bgozo\s*[–-]\s*aline barros\b/i,
];

const AI_GENERATED_PATTERNS = [
  /\b(gerad[oa]|criad[oa]|feit[oa]|produzid[oa]|cantad[oa]|narrad[oa]|compost[oa]|anima[cç][aã]o|m[uú]sica|can[cç][aã]o|v[ií]deo|clipe|voz|arte)\s+(por|com|via|em|de)\s+(ia|intelig[eê]ncia artificial)\b/i,
  /\b(ia\s+gospel|gospel\s+(com\s+|de\s+|em\s+)?ia|louvor\s+(adventista\s+)?(com\s+|de\s+|em\s+)?ia|adventista\s+ia)\b/i,
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
  /\bm[uú]sica de adora[cç][aã]o\b/i,
  /\bc[aâ]ntico de adora[cç][aã]o\b/i,
  /\bhino oficial\b/i,
  /\bhino\s+\d+\b/i,
  /\bnova m[uú]sica\b/i,
  /\bm[uú]sica oficial\b/i,
  /\bm[uú]sica\s+(crist[aã]|gospel|adventista|in[eé]dita|nova)\b/i,
  /\bc[aâ]ntico\b/i,
  /\bcom coral\b/i,
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

const NON_SERMON_PATTERNS = [
  /\b(podcast|inverso|bastidores|t\d+ep#?\d+|ep\.?\s*\d+|mesa redonda|bate-?papo|entrevista|c[oó]digo aberto)\b/i,
  /\b(momento da sa[uú]de|luz solar|alimenta[cç][aã]o|nutri[cç][aã]o|nutra seu corpo|vida saud[aá]vel|equil[ií]brio|exerc[ií]cio f[ií]sico|descanso:\s*seu corpo|[aá]gua:\s*a ess[eê]ncia|8 rem[eé]dios)\b/i,
  /\b(in concert|hin[aá]rio|clipe|canta|coral|express[aã]o de vida|horas benditas|a cruz n[aã]o [eé] o fim)\b/i,
  /\b(treinamento|coordenador de interessados|aula\s*\d+|ciclo do evangelismo|trimestral|aposentadoria|quebrando o sil[eê]ncio|dia dos namorados|dia mundial dos desbravadores|feliz dia|lan[cç]amento do #|quem [eé] voc[eê] no|eu j[aá] fui|hist[oó]rias de volunt[aá]rios|pe[cç]a agora|revista esperan[cç]a|anos dos anjos|tv novo tempo\s*-\s*ao vivo|super lupa|em ingl[eê]s|filme|curta-metragem|bom dia mulher|o drama da paix[aã]o|allen, mission[aá]rio|pais conectados|evangelismo feminino|criadores e mission[aá]rios|encontro de evangelistas|onevoice27|bora fazer uma semana de ora[cç][aã]o|homenagem|guia de pg)\b/i,
];

const STRICT_SERMON_TITLE_PATTERNS = [
  /\b(prega[cç][aã]o|pregando|serm[aã]o|serm[oõ]es)\b/i,
  /\bculto\b/i,
  /\bmensagem\b/i,
  /\b(pr\.\s*[a-záéíóúâêôãõç]{2,}|pr\s+[a-záéíóúâêôãõç]{2,}|pastor\s+[a-záéíóúâêôãõç]{2,})\b/i,
  /\b(alejandro bull[oó]n|bull[oó]n|ivan saraiva|arilton oliveira|lu[ií]s gon[cç]alves|kleber gon[cç]alves|erton k[oö]hler|odailson fonseca|robson aleixo|mark finley|doug batchelor|gilson brito|tito rocha|michelson borges|ronaldo de oliveira|rafael santos|gustavo marques|stanley arco|felippe amorim)\b/i,
  /\b(semana (especial|de ora[cç][aã]o|santa|de jejum|evangel[ií]stica)|s[aá]bado de jejum|movidos pela esperan[cç]a|jesus,?\s*nossa esperan[cç]a|vida que eleva|f[eé] para hoje|est[aá] escrito)\b/i,
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
  const descHead = description.slice(0, 260);
  if (
    /#shorts?\b|\b(podcast|devocional|entrevista|reportagem|homenagem|bastidores|making of|document[aá]rio|react|reagindo|vlog|tutorial|como tocar)\b/i.test(
      descHead
    )
  ) {
    return false;
  }
  if (WORSHIP_SONG_POSITIVE_PATTERNS.some((re) => re.test(title))) {
    return true;
  }
  if (/\b(letra,\s*m[uú]sica e arranjo|letra e m[uú]sica:|arranjo musical:)\b/i.test(description)) {
    return true;
  }
  if (isWorshipChannel) {
    // Require song/music title structure ("Artist - Song" / "Song | Tag" / music keywords)
    // or explicit songwriting/composition credits in the description (avoiding generic social footer text)
    if (
      /[^|–-]+\s[-–|]\s[^|–-]+/.test(title) &&
      !/\b(vlog|tour|agenda|convite|aviso|homenagem|anivers[aá]rio|15 anos|fatos|curiosidades)\b/i.test(
        title
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
  const isBibleChannel =
    channelSpec?.defaultCategory === 'biblia' &&
    channelId !== 'UC03Y0ieYROxw1FxCoDaSF9g' &&
    channelId !== 'UC8PS8EsZsWXOQ1YmlJwCaYw';

  const isSong = looksLikeWorshipSong(title, description, isWorshipChannel);
  const isExplicitTestimony =
    !isSong &&
    !/\b(podcast|trailer|teaser|inscri[cç][oõ]es|convite|agenda|prega[cç][aã]o completa|ao vivo agora|verso da semana|vers[ií]culo do dia)\b/i.test(
      title
    ) &&
    (STRICT_TESTIMONY_TITLE_PATTERNS.some((re) => re.test(title)) ||
      STRICT_TESTIMONY_DESC_PATTERNS.some((re) => re.test(description.slice(0, 260))));
  const isBibleTitle = STRICT_BIBLE_TITLE_PATTERNS.some((re) => re.test(title));
  const isBibleDesc =
    /\b(estudo b[ií]blico|escola sabatina|na mira da verdade|arqueologia b[ií]blica|vers[ií]culo|apocalipse|profecia|evangelho|palavra de deus|b[ií]blia sagrada|li[cç][aã]o da b[ií]blia|santu[aá]rio|mandamentos|s[aá]bado)\b/i.test(
      description.slice(0, 320)
    );
  const isStrictSermon =
    !NON_SERMON_PATTERNS.some((re) => re.test(title)) &&
    !NON_SERMON_PATTERNS.some((re) => re.test(description.slice(0, 220))) &&
    STRICT_SERMON_TITLE_PATTERNS.some((re) => re.test(title));

  let detectedCategory: ContentCategory | null = null;

  if (isWorshipChannel) {
    // Worship channels only enter 'louvores' (when actual music) or 'testemunhos' (only if explicit spoken testimony)
    if (isSong) {
      detectedCategory = 'louvores';
    } else if (isExplicitTestimony) {
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
  } else if (isStrictSermon) {
    detectedCategory = 'pregacoes';
  } else if (
    hintCategory === 'biblia' &&
    !NON_SERMON_PATTERNS.some((re) => re.test(title)) &&
    isBibleDesc
  ) {
    detectedCategory = 'biblia';
  } else {
    return null;
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

  const descHead = description.slice(0, 300);
  const text = `${title} ${descHead}`;
  if (
    /\b(aguardando estreia|estreia em breve|estreia hoje|estreia amanh[ãa]|estreia dia \d|estreia [àa]s \d|estr[eé]ia em|vai estrear|estrear[áa]|assista [àa] estreia|come[cç]a em breve|dispon[ií]vel em \d|dispon[ií]vel dia \d|lan[cç]amento dia \d|live especial .* neste (domingo|s[aá]bado|sexta)|premieres in|premiere at|upcoming premiere|scheduled for)\b/i.test(
      text
    )
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
          ? spec.defaultCategory === 'louvores' || spec.defaultCategory === 'pregacoes'
            ? uulfPlaylistId
            : uupvPlaylistId
          : spec.defaultCategory === 'louvores'
          ? uupvPlaylistId
          : uuPlaylistId;
      const allowFull =
        spec.defaultCategory === 'louvores' ||
        spec.allowInCategories.includes('pregacoes') ||
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
  /\b(arautos do rei|art\s*trio|novo tom|novo tempo|adoradores\s*[1-5]?|cd jovem|ministerio jovem|menos um|remaster|audio|live sessions?|dvd|hinos\s*\d*|clipe oficial|video oficial|acustico|ao vivo|gravadora nt|aline barros|isadora pompeo|gabriela rocha|fernandinho|sarah farias|pedro valenca|eli soares|theo rubia|fhop music|morada|mergulhar|dunamis|daniel ludtke|midian lima|sued silva|valesca mayssa|maria marcal|julliany souza|diante do trono|eyshila|ana paula valadao|carol tauber|casa worship|preto no branco|kemuel|paulo cesar baruk|laura souguellis|voz com letra|com letra|video letra|ministerio|coral|feat|ft)\b/i;

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

    // Round-robin through every channel queue until all unique items are placed,
    // without discarding videos at an arbitrary cap.
    let lastStreamChannelId: string | null = null;
    let added = true;
    while (added) {
      added = false;
      for (const queue of channelQueues) {
        if (queue.length === 0) continue;
        const activeQueues = channelQueues.filter((q) => q.length > 0);
        if (activeQueues.length > 1 && queue[0].channelId === lastStreamChannelId) {
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
  const validCategories = new Set(['all', 'pregacoes', 'biblia', 'louvores', 'testemunhos']);
  const category = rawCategory && validCategories.has(rawCategory) ? rawCategory : 'all';
  const sanitizedQuery = normalizeSearchFold(
    (rawQuery || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80)
  );

  const queryFiltered = sanitizedQuery
    ? allItems.filter(
        (item) =>
          normalizeSearchFold(item.title).includes(sanitizedQuery) ||
          normalizeSearchFold(item.channelTitle).includes(sanitizedQuery) ||
          normalizeSearchFold(item.description).includes(sanitizedQuery) ||
          normalizeSearchFold(item.categoryLabel).includes(sanitizedQuery)
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
    hasMore,
    nextCursor,
  };
}
