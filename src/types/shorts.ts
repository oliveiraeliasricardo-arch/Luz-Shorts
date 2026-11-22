export type ContentCategory = 'pregacoes' | 'biblia' | 'louvores' | 'testemunhos';

export type ShortCategory = 'all' | ContentCategory | 'salvos';

export type DoctrineScope = 'adventista' | 'cristao_geral';

export interface ChristianShort {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  category: ContentCategory;
  categoryLabel: string;
  doctrineScope: DoctrineScope;
  doctrineLabel: string;
  durationSeconds: number | null;
  durationLabel: string | null;
  viewCount: number | null;
  youtubeUrl: string;
  shortsUrl: string;
}

export interface ShortsApiResponse {
  items: ChristianShort[];
  sourceMode: 'youtube_api' | 'curated_rss';
  apiKeyConfigured: boolean;
  fetchedAt: string;
  category: string;
  totalBeforeCategoryFilter: number;
  categoryCounts: Record<ContentCategory, number>;
  hasMore?: boolean;
  nextCursor?: string | null;
}
