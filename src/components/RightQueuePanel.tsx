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

export const RightQueuePanel: React.FC<RightQueuePanelProps> = ({
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono tabular-nums text-slate-500">
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
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={activeIndex >= items.length - 1}
              aria-label="Próximo vídeo"
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Atualizar lista de vídeos"
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 cursor-pointer">
          <span className="text-xs font-medium text-slate-700">
            Avanço automático ao terminar
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoAdvance}
            onClick={onToggleAutoAdvance}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
              autoAdvance ? 'bg-sky-700' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                autoAdvance ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Active Short Editorial Context */}
      {activeShort && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-sky-800 font-medium">
            <span>{activeShort.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{activeShort.doctrineLabel}</span>
          </div>

          <h3 className="text-base font-display font-bold text-slate-900 leading-snug">
            {activeShort.title}
          </h3>

          <p className="text-xs font-medium text-slate-600">
            Canal: {activeShort.channelTitle}
          </p>

          {activeShort.description && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {activeShort.description}
            </p>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onShare(activeShort)}
              className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Compartilhar</span>
            </button>
            <a
              href={
                activeShort.category === 'louvores' || activeShort.category === 'pregacoes'
                  ? activeShort.youtubeUrl
                  : activeShort.shortsUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Assistir no YouTube"
              className="h-10 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>YouTube</span>
            </a>
          </div>
        </div>
      )}

      {/* Up Next Queue */}
      {upcoming.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-display font-bold text-slate-900">
            A seguir na fila
          </h3>
          <div className="divide-y divide-slate-100">
            {upcoming.map(({ item, idx }) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className="w-full py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-11 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-sky-800 line-clamp-2 leading-snug transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
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
};
