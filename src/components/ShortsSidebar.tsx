import React from 'react';
import { Bell, BellRing, BookOpen, Bookmark, Clapperboard, HeartHandshake, Mic, Music, Sparkles } from 'lucide-react';
import { SearchBoxWithSuggestions } from './SearchBoxWithSuggestions';
import type { ChristianShort, ContentCategory, ShortCategory } from '../types/shorts';

interface ShortsSidebarProps {
  activeCategory: ShortCategory;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onClearSearch?: () => void;
  catalogShorts?: ChristianShort[];
  apiBaseUrl?: string;
  isSearching?: boolean;
  onSelectCategory: (category: ShortCategory) => void;
  categoryCounts: Record<ContentCategory, number>;
  totalCount: number;
  savedCount: number;
  sourceMode: 'youtube_api' | 'curated_rss';
  apiKeyConfigured: boolean;
  notificationsEnabled?: boolean;
  onOpenNotifications?: () => void;
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
    label: 'Pregações e Bíblia',
    subtitle: 'Sermões e estudos · Adventista',
    Icon: Mic,
  },
  {
    id: 'escola_sabatina',
    label: 'Escola Sabatina',
    subtitle: 'Adultos e Jovens · Adventista',
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
    id: 'feliz7play',
    label: 'Feliz7Play',
    subtitle: 'Séries e animações bíblicas',
    Icon: Clapperboard,
  },
  {
    id: 'salvos',
    label: 'Salvos',
    subtitle: 'Seus vídeos favoritos',
    Icon: Bookmark,
  },
];

export const ShortsSidebar: React.FC<ShortsSidebarProps> = React.memo(({
  activeCategory,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  catalogShorts = [],
  apiBaseUrl = '',
  isSearching = false,
  onSelectCategory,
  categoryCounts,
  totalCount,
  savedCount,
  sourceMode,
  apiKeyConfigured,
  notificationsEnabled = false,
  onOpenNotifications,
}) => {
  const getCount = (id: ShortCategory): number => {
    if (id === 'all') return totalCount;
    if (id === 'salvos') return savedCount;
    return categoryCounts[id] ?? 0;
  };

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-[280px] shrink-0">
      {/* Search input with live YouTube-style suggestions */}
      <SearchBoxWithSuggestions
        value={searchQuery}
        onChange={onSearchChange}
        onSubmit={(q) => onSearchSubmit?.(q)}
        onClear={onClearSearch}
        catalogShorts={catalogShorts}
        apiBaseUrl={apiBaseUrl}
        isSearching={isSearching}
      />

      {/* Category Filter Buttons */}
      <nav aria-label="Categorias do feed" className="bg-transparent space-y-0.5">
        {CATEGORIES.map(({ id, label, subtitle, Icon }) => {
          const isActive = activeCategory === id;
          const count = getCount(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCategory(id)}
              className={`relative w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer min-h-[46px] ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'bg-transparent text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2.5 bottom-2.5 w-0.5 bg-white rounded-full"
                />
              )}
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className={`text-sm leading-tight truncate ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>
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
                  isActive ? 'text-zinc-200' : 'text-zinc-600'
                }`}
              >
                {id !== 'salvos' && !searchQuery.trim() && count > 0 ? `${count}+` : count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Editorial & Doctrinal Curatorship Summary */}
      <div className="bg-transparent border border-white/[0.07] rounded-2xl p-4 space-y-2.5">
        <h2 className="text-sm font-display font-bold text-zinc-100">
          Critério de Curadoria
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Pregações e Bíblia, Escola Sabatina (Adultos e Jovens), Feliz7Play e
          animações bíblicas seguem exclusivamente a doutrina Adventista do Sétimo Dia.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Louvores e testemunhos abrangem expressões cristãs de todas as
          congregações e denominações.
        </p>
        <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-500">
          {sourceMode === 'youtube_api'
            ? 'Fonte ativa: YouTube Data API v3'
            : apiKeyConfigured
              ? 'Fonte ativa: Curadoria oficial YouTube'
              : 'Modo curadoria oficial · Adicione YOUTUBE_API_KEY no servidor para ampliar buscas'}
        </div>
      </div>

      {onOpenNotifications && (
        <button
          type="button"
          onClick={onOpenNotifications}
          className={`w-full h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
            notificationsEnabled
              ? 'border-white/25 bg-white/10 hover:bg-white/15 text-white'
              : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-100'
          }`}
        >
          {notificationsEnabled ? (
            <BellRing className="w-4 h-4 shrink-0 text-white" aria-hidden="true" />
          ) : (
            <Bell className="w-4 h-4 shrink-0 text-zinc-300" aria-hidden="true" />
          )}
          <span>
            {notificationsEnabled ? 'Notificações ativadas' : 'Avisar novos vídeos'}
          </span>
        </button>
      )}
    </aside>
  );
});
