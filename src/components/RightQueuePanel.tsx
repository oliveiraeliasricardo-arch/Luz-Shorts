import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  RefreshCw,
  Share2,
} from 'lucide-react';
import type { ChristianShort } from '../types/shorts';

interface RightQueuePanelProps {
  items: ChristianShort[];
  activeIndex: number;
  autoAdvance: boolean;
  isRefreshing: boolean;
  onToggleAutoAdvance: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  onShare: (short: ChristianShort) => void;
  onRefresh: () => void;
}

export const RightQueuePanel: React.FC<RightQueuePanelProps> = React.memo(({
  items,
  activeIndex,
  autoAdvance,
  isRefreshing,
  onToggleAutoAdvance,
  onPrev,
  onNext,
  onSelectIndex,
  onShare,
  onRefresh,
}) => {
  const activeShort = items[activeIndex] ?? null;
  const upcoming = items
    .map((item, idx) => ({ item, idx }))
    .slice(activeIndex + 1, activeIndex + 6);

  return (
    <aside className="hidden lg:flex flex-col gap-5 w-[320px] shrink-0">
      {/* Player Playback & Navigation Controls */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono tabular-nums text-zinc-400">
            {items.length > 0
              ? `${String(activeIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`
              : '00 / 00'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={activeIndex <= 0}
              aria-label="Vídeo anterior"
              className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={activeIndex >= items.length - 1}
              aria-label="Próximo vídeo"
              className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Atualizar lista de vídeos"
              className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-900 cursor-pointer">
          <span className="text-xs font-medium text-zinc-300">
            Avanço automático ao terminar
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoAdvance}
            onClick={onToggleAutoAdvance}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
              autoAdvance ? 'bg-white' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full shadow-xs transition-transform duration-150 ${
                autoAdvance ? 'translate-x-5 bg-black' : 'translate-x-1 bg-zinc-300'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Active Short Editorial Context */}
      {activeShort && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <span>{activeShort.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{activeShort.doctrineLabel}</span>
          </div>

          <h3 className="text-base font-display font-bold text-white leading-snug">
            {activeShort.title}
          </h3>

          <p className="text-xs font-medium text-zinc-400">
            Canal: {activeShort.channelTitle}
          </p>

          {activeShort.description && (
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
              {activeShort.description}
            </p>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onShare(activeShort)}
              className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Compartilhar</span>
            </button>
            <a
              href={
                activeShort.category === 'louvores' ||
                activeShort.category === 'pregacoes' ||
                activeShort.category === 'escola_sabatina' ||
                activeShort.category === 'feliz7play'
                  ? activeShort.youtubeUrl
                  : activeShort.shortsUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Assistir no YouTube"
              className="h-10 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-black border border-zinc-800 hover:bg-zinc-900 text-zinc-200 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>YouTube</span>
            </a>
          </div>
        </div>
      )}

      {/* Up Next Queue */}
      {upcoming.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-display font-bold text-zinc-100">
            A seguir na fila
          </h3>
          <div className="divide-y divide-zinc-900">
            {upcoming.map(({ item, idx }) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className="w-full py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-11 h-14 rounded-lg overflow-hidden bg-black border border-zinc-800/80 shrink-0">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {item.channelTitle} · {item.categoryLabel}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
});
