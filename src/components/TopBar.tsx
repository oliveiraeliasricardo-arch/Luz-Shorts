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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-[52px] lg:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('all');
          }}
          className="flex items-center gap-2.5 text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 rounded-md"
        >
          <span className="w-7 h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0">
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
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 rounded-sm ${
                  isActive
                    ? 'text-sky-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-sky-700 rounded-full"
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
            className={`inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 ${
              isSavedActive
                ? 'bg-sky-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
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
