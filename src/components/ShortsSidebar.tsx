import React from 'react';
import { BookOpen, Bookmark, HeartHandshake, Mic, Music, Search, Sparkles, X } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
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
    subtitle: 'Todas as denominações',
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
          className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar tema, bíblia ou canal"
          aria-label="Buscar vídeos cristãos"
          className="w-full h-11 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition-shadow"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Category Filter Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 space-y-1">
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
                  ? 'bg-sky-700 text-white'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-sky-100' : 'text-slate-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight truncate">
                    {label}
                  </div>
                  <div
                    className={`text-[11px] leading-tight mt-0.5 truncate ${
                      isActive ? 'text-sky-100' : 'text-slate-500'
                    }`}
                  >
                    {subtitle}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-mono tabular-nums shrink-0 ${
                  isActive ? 'text-sky-100' : 'text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Editorial & Doctrinal Curatorship Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
        <h2 className="text-sm font-display font-bold text-slate-900">
          Critério de Curadoria
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Pregações e estudos de Bíblia e Evangelho são filtrados exclusivamente
          dentro da doutrina Adventista do Sétimo Dia.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          Louvores e testemunhos abrangem expressões cristãs de diversas
          denominações.
        </p>
        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          {sourceMode === 'youtube_api'
            ? 'Fonte ativa: YouTube Data API v3'
            : apiKeyConfigured
              ? 'Fonte ativa: Curadoria oficial YouTube'
              : 'Modo curadoria oficial · Adicione YOUTUBE_API_KEY no servidor para ampliar buscas'}
        </div>
        <div className="pt-1">
          <PWAInstallButton variant="sidebar" />
        </div>
      </div>
    </aside>
  );
};
