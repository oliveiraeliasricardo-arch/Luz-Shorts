import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import type { ShortCategory } from '../types/shorts';

interface TopBarProps {
  activeCategory: ShortCategory;
  onSelectCategory: (category: ShortCategory) => void;
  notificationsEnabled?: boolean;
  onOpenNotifications?: () => void;
}

const NAV_ITEMS: Array<{ id: ShortCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'pregacoes', label: 'Pregações' },
  { id: 'biblia', label: 'Bíblia' },
  { id: 'louvores', label: 'Louvores' },
  { id: 'testemunhos', label: 'Testemunhos' },
  { id: 'feliz7play', label: 'Feliz7Play' },
];

export const TopBar: React.FC<TopBarProps> = React.memo(({
  activeCategory,
  onSelectCategory,
  notificationsEnabled = false,
  onOpenNotifications,
}) => {
  const [tapPopKey, setTapPopKey] = React.useState(0);

  return (
    <header className="shrink-0 sticky top-0 z-30 bg-black/70 backdrop-blur-md border-b border-white/[0.06] safe-pt safe-px">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 flex flex-col items-center">
        {/* Centered Animated Brand Wordmark at the top + right notification/install controls */}
        <div className="relative w-full h-12 lg:h-[52px] flex items-center justify-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setTapPopKey((k) => k + 1);
              onSelectCategory('all');
            }}
            className="gracaplay-brand-entrance group flex items-center gap-2.5 text-lg font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-md px-2 py-1 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <span
              key={tapPopKey}
              className={`relative w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/90 text-white flex items-center justify-center shrink-0 gracaplay-play-badge ${
                tapPopKey > 0 ? 'gracaplay-tap-pop' : ''
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-lg border border-white/40 pointer-events-none gracaplay-play-ring"
              />
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current relative z-10 translate-x-[0.5px] transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M8 5.5v13l10-6.5-10-6.5z" />
              </svg>
            </span>
            <span className="gracaplay-wordmark">GraçaPlay</span>
          </a>

          <div className="absolute right-0 flex items-center gap-1.5">
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                aria-label={
                  notificationsEnabled
                    ? 'Notificações de novos vídeos ativadas'
                    : 'Ativar notificações de novos vídeos'
                }
                title={
                  notificationsEnabled
                    ? 'Notificações ativadas'
                    : 'Notificações de novos vídeos'
                }
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                  notificationsEnabled
                    ? 'border-white/25 bg-white/10 text-white hover:bg-white/15'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {notificationsEnabled ? (
                  <BellRing className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Bell className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Single-Line Centered Category Navigation */}
        <nav
          aria-label="Categorias principais"
          className="hidden lg:flex items-center justify-center gap-6 h-10 w-full border-t border-white/[0.05]"
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
      </div>
    </header>
  );
});

