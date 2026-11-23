import React from 'react';
import { BookOpen, Bookmark, HeartHandshake, Mic, Music, Search, Sparkles, X } from 'lucide-react';
import type { ContentCategory, ShortCategory } from '../types/shorts';

interface ShortsSidebarProps {
  activeCategory: ShortCategory;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (category: ShortCategory) => void;
  categoryCounts: Record<ContentCategory, number>;
  totalCount: number;
  savedCount: number;
  sourceMode: 'youtube_api' | 'curated_rss';
  apiKeyConfigured: boolean;
}

const CATEGORIES: Array<{
  id: ShortCategory;
  label: string;
  subtitle: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'all',
    label: 'Todos os Shorts',
    subtitle: 'Fluxo cristão completo',
    Icon: Sparkles,
  },
  {
    id: 'pregacoes',
    label: 'Pregações',
    subtitle: 'Doutrina Adventista',
    Icon: Mic,
  },
  {
    id: 'biblia',
    label: 'Bíblia e Evangelho',
    subtitle: 'Doutrina Adventista',
    Icon: BookOpen,
  },
  {
    id: 'louvores',
    label: 'Louvores',
    subtitle: 'Todas as denominações',
    Icon: Music,
  },
  {
    id: 'testemunhos',
    label: 'Testemunhos',
    subtitle: 'Todas as congregações',
    Icon: HeartHandshake,
  },
  {
    id: 'salvos',
    label: 'Salvos',
    subtitle: 'Seus vídeos favoritos',
    Icon: Bookmark,
  },
];

export const ShortsSidebar: React.FC<ShortsSidebarProps> = ({
  activeCategory,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  categoryCounts,
  totalCount,
  savedCount,
  sourceMode,
  apiKeyConfigured,
}) => {
  const getCount = (id: ShortCategory): number => {
    if (id === 'all') return totalCount;
    if (id === 'salvos') return savedCount;
    return categoryCounts[id] ?? 0;
  };

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-[280px] shrink-0">
      {/* Search input */}
      <div className="relative">
        <Search
          className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar louvor, hino, pregação, bíblia ou testemunho"
          aria-label="Buscar vídeos cristãos"
          className="w-full h-11 pl-10 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 bg-zinc-950 border border-zinc-800/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-zinc-600 transition-shadow"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Category Filter Buttons */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-2 space-y-1">
        {CATEGORIES.map(({ id, label, subtitle, Icon }) => {
          const isActive = activeCategory === id;
          const count = getCount(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCategory(id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer min-h-[48px] ${
                isActive
                  ? 'bg-zinc-900 text-white border border-zinc-700/80'
                  : 'text-zinc-300 border border-transparent hover:bg-zinc-900/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-zinc-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight truncate">
                    {label}
                  </div>
                  <div
                    className={`text-[11px] leading-tight mt-0.5 truncate ${
                      isActive ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {subtitle}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-mono tabular-nums shrink-0 ${
                  isActive ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                {id !== 'salvos' && !searchQuery.trim() && count > 0 ? `${count}+` : count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Editorial & Doctrinal Curatorship Summary */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-2.5">
        <h2 className="text-sm font-display font-bold text-zinc-100">
          Critério de Curadoria
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Pregações e estudos de Bíblia e Evangelho são filtrados exclusivamente
          dentro da doutrina Adventista do Sétimo Dia.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Louvores e testemunhos abrangem expressões cristãs de todas as
          congregações e denominações.
        </p>
        <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-500">
          {sourceMode === 'youtube_api'
            ? 'Fonte ativa: YouTube Data API v3'
            : apiKeyConfigured
              ? 'Fonte ativa: Curadoria oficial YouTube'
              : 'Modo curadoria oficial · Adicione YOUTUBE_API_KEY no servidor para ampliar buscas'}
        </div>
      </div>
    </aside>
  );
};
