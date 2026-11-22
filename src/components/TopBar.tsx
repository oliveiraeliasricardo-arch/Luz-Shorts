import React from 'react';
import { Bookmark } from 'lucide-react';
import type { ShortCategory } from '../types/shorts';

interface TopBarProps {
  activeCategory: ShortCategory;
  savedCount: number;
  onSelectCategory: (category: ShortCategory) => void;
}

const NAV_ITEMS: Array<{ id: ShortCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'pregacoes', label: 'Pregações' },
  { id: 'biblia', label: 'Bíblia' },
  { id: 'louvores', label: 'Louvores' },
  { id: 'testemunhos', label: 'Testemunhos' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeCategory,
  savedCount,
  onSelectCategory,
}) => {
  const isSavedActive = activeCategory === 'salvos';

  return (
    <header className="shrink-0 sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-zinc-900 safe-pt safe-px">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 h-[52px] lg:h-16 flex items-center justify-between gap-3 lg:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('all');
          }}
          className="flex items-center gap-2.5 text-lg font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-md"
        >
          <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5-10-6.5z" />
            </svg>
          </span>
          <span>Luz Shorts</span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Categorias principais"
          className="hidden md:flex items-center gap-6"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCategory(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action (Salvos) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onSelectCategory(isSavedActive ? 'all' : 'salvos')}
            className={`inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
              isSavedActive
                ? 'bg-white text-black border-white'
                : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-100 border-zinc-800'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 shrink-0 ${isSavedActive ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
            <span>Salvos{savedCount > 0 ? ` (${savedCount})` : ''}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
