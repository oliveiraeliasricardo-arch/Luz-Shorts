import React from 'react';
import { ArrowLeft, Play, RefreshCw, Search } from 'lucide-react';
import type { ChristianShort, ContentCategory, ShortCategory } from '../types/shorts';

interface SearchResultsViewProps {
  query: string;
  items: ChristianShort[];
  activeCategory: ShortCategory;
  categoryCounts: Record<ContentCategory, number>;
  todosCount: number;
  isSearching: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onSelectCategory: (cat: ShortCategory) => void;
  onSelectVideo: (index: number) => void;
  onLoadMore: () => void;
  onExitSearch: () => void;
}

const FILTER_TABS: Array<{ id: ShortCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'pregacoes', label: 'Pregações e Bíblia' },
  { id: 'escola_sabatina', label: 'Escola Sabatina' },
  { id: 'louvores', label: 'Louvores' },
  { id: 'testemunhos', label: 'Testemunhos' },
  { id: 'feliz7play', label: 'Feliz7Play' },
];

function formatCompactViews(views: number | null): string | null {
  if (views === null || !Number.isFinite(views) || views <= 0) return null;
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace('.', ',')} mi de visualizações`;
  }
  if (views >= 1_000) {
    return `${Math.round(views / 1_000)} mil visualizações`;
  }
  return `${views} visualizações`;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = React.memo(({
  query,
  items,
  activeCategory,
  categoryCounts,
  todosCount,
  isSearching,
  isLoadingMore,
  hasMore,
  onSelectCategory,
  onSelectVideo,
  onLoadMore,
  onExitSearch,
}) => {
  const getTabCount = (id: ShortCategory): number => {
    if (id === 'all') return todosCount;
    if (id === 'salvos') return 0;
    return categoryCounts[id] ?? 0;
  };

  return (
    <div className="flex-1 min-w-0 h-full lg:h-auto flex flex-col bg-black text-zinc-100">
      {/* Top Bar of Search Results */}
      <div className="shrink-0 bg-black/70 backdrop-blur-md border-b border-white/[0.06] px-3 sm:px-5 pt-2 sm:pt-3 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onExitSearch}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:bg-white/[0.1] hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Feed</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-display font-bold text-white truncate">
                Resultados para “{query}”
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0 tabular-nums">
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" aria-hidden="true" />
            )}
            <span>{items.length} vídeos</span>
          </div>
        </div>

        {/* Clean transparent category filter bar */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectCategory(tab.id)}
                className={`relative px-2.5 py-2 text-xs bg-transparent whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 font-medium hover:text-zinc-100'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="ml-1 text-[11px] opacity-65 tabular-nums">
                    {count}
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-2 right-2 bottom-0 h-0.5 bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3">
        {isSearching && items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-300 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
            <p className="text-sm font-medium">Buscando vídeos no YouTube...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-center px-4">
            <Search className="w-8 h-8 text-zinc-600" aria-hidden="true" />
            <p className="text-sm font-medium text-zinc-300">
              Nenhum vídeo encontrado para “{query}” neste filtro.
            </p>
            <div className="flex items-center gap-2">
              {activeCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white hover:bg-zinc-800 cursor-pointer"
                >
                  Buscar em Todos
                </button>
              )}
              <button
                type="button"
                onClick={onExitSearch}
                className="px-3.5 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 cursor-pointer"
              >
                Voltar ao feed
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-w-4xl">
              {items.map((item, index) => {
                const viewsLabel = formatCompactViews(item.viewCount);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectVideo(index)}
                    className="w-full group flex items-start gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-900/90 border border-zinc-900 hover:border-zinc-700/80 text-left transition-colors cursor-pointer"
                  >
                    {/* 16:9 YouTube Thumbnail + Duration Badge */}
                    <div className="relative w-[148px] sm:w-[240px] aspect-video rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800/70">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-lg bg-black/80 text-white flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white ml-0.5" aria-hidden="true" />
                        </span>
                      </div>
                      {item.durationLabel && (
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/85 text-[11px] font-mono font-semibold text-white tabular-nums">
                          {item.durationLabel}
                        </span>
                      )}
                    </div>

                    {/* Video Metadata */}
                    <div className="min-w-0 flex-1 py-0.5 space-y-1.5">
                      <h3 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-white line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-400">
                        <span className="font-medium text-zinc-300 truncate max-w-[180px] sm:max-w-none">
                          {item.channelTitle}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.categoryLabel}</span>
                        {viewsLabel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{viewsLabel}</span>
                          </>
                        )}
                      </div>

                      {item.description && (
                        <p className="hidden sm:line-clamp-2 text-xs text-zinc-500 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {hasMore && (
              <div className="pt-2 pb-6 flex justify-center max-w-4xl">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-xs font-semibold text-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isLoadingMore && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  )}
                  <span>{isLoadingMore ? 'Carregando mais vídeos...' : 'Carregar mais resultados'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
