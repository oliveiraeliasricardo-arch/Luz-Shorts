import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Bookmark, RefreshCw, Search, X } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { RightQueuePanel } from './components/RightQueuePanel';
import { ShareModal } from './components/ShareModal';
import { ShortsSidebar } from './components/ShortsSidebar';
import { TopBar } from './components/TopBar';
import { YouTubeShortPlayer } from './components/YouTubeShortPlayer';
import { loadYouTubeIframeApi } from './utils/youtubePlayerApi';
import type { ChristianShort, ContentCategory, ShortCategory, ShortsApiResponse } from './types/shorts';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const SAVED_STORAGE_KEY = 'luz_shorts_saved_ids_v1';

const MOBILE_FILTERS: Array<{ id: ShortCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'pregacoes', label: 'Pregações' },
  { id: 'biblia', label: 'Bíblia' },
  { id: 'louvores', label: 'Louvores' },
  { id: 'testemunhos', label: 'Testemunhos' },
  { id: 'salvos', label: 'Salvos' },
];

function readSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function App() {
  const [allShorts, setAllShorts] = useState<ChristianShort[]>([]);
  const [sourceMode, setSourceMode] = useState<'youtube_api' | 'curated_rss'>('curated_rss');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ShortCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(() => readSavedIds());
  const [activeIndex, setActiveIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ChristianShort | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const feedRef = useRef<HTMLDivElement | null>(null);

  const loadShorts = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (forceRefresh) params.set('refresh', '1');
      const res = await fetch(
        `${API_BASE_URL}/api/shorts${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!res.ok) {
        throw new Error(`Erro HTTP ${res.status} ao carregar vídeos`);
      }
      const data = (await res.json()) as ShortsApiResponse;

      let items = data.items;

      // Support direct shared video links (?v=VIDEO_ID)
      const urlParams = new URLSearchParams(window.location.search);
      const sharedVideoId = urlParams.get('v')?.trim() || '';
      if (/^[a-zA-Z0-9_-]{11}$/.test(sharedVideoId)) {
        const existingIdx = items.findIndex((item) => item.id === sharedVideoId);
        if (existingIdx > 0) {
          const [picked] = items.splice(existingIdx, 1);
          items = [picked, ...items];
        } else if (existingIdx === -1) {
          try {
            const singleRes = await fetch(
              `${API_BASE_URL}/api/shorts/video/${sharedVideoId}`
            );
            if (singleRes.ok) {
              const singleItem = (await singleRes.json()) as ChristianShort;
              items = [singleItem, ...items];
            }
          } catch {
            // Keep regular feed if shared lookup fails
          }
        }
      }

      setAllShorts(items);
      setSourceMode(data.sourceMode);
      setApiKeyConfigured(data.apiKeyConfigured);
      setActiveIndex(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os vídeos cristãos.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Pre-warm YouTube IFrame Player API immediately on mount for faster first playback
    loadYouTubeIframeApi().catch(() => {});
    loadShorts(false);
  }, [loadShorts]);

  useEffect(() => {
    if (audioUnlocked) return;
    const unlock = () => setAudioUnlocked(true);
    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { passive: true, once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [audioUnlocked]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const queryFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allShorts;
    return allShorts.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.channelTitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
    );
  }, [allShorts, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      biblia: 0,
      louvores: 0,
      testemunhos: 0,
    };
    for (const item of queryFiltered) {
      counts[item.category] += 1;
    }
    return counts;
  }, [queryFiltered]);

  const visibleShorts = useMemo(() => {
    if (activeCategory === 'all') return queryFiltered;
    if (activeCategory === 'salvos') {
      return queryFiltered.filter((item) => savedSet.has(item.id));
    }
    return queryFiltered.filter((item) => item.category === activeCategory);
  }, [queryFiltered, activeCategory, savedSet]);

  const handleSelectCategory = useCallback((cat: ShortCategory) => {
    setActiveCategory(cat);
    setActiveIndex(0);
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const scrollToIndex = useCallback(
    (targetIdx: number) => {
      const container = feedRef.current;
      if (!container || visibleShorts.length === 0) return;
      const clamped = Math.max(0, Math.min(visibleShorts.length - 1, targetIdx));
      const slideHeight = container.clientHeight;
      container.scrollTo({
        top: clamped * slideHeight,
        behavior: 'smooth',
      });
      setActiveIndex(clamped);
    },
    [visibleShorts.length]
  );

  // Sync activeIndex accurately on vertical scroll-snap
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const h = container.clientHeight;
        if (h <= 0) return;
        const idx = Math.round(container.scrollTop / h);
        const clamped = Math.max(0, Math.min(visibleShorts.length - 1, idx));
        setActiveIndex((prev) => (prev !== clamped ? clamped : prev));
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [visibleShorts.length]);

  // Keyboard navigation (ArrowDown / ArrowUp / J / K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (shareTarget) return;

      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setAudioUnlocked(true);
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setAudioUnlocked(true);
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, scrollToIndex, shareTarget]);

  const handleToggleSave = useCallback((shortId: string) => {
    setSavedIds((prev) =>
      prev.includes(shortId) ? prev.filter((id) => id !== shortId) : [shortId, ...prev]
    );
  }, []);

  const handleUnlockAudio = useCallback(() => {
    setAudioUnlocked(true);
  }, []);

  // Prefetch next 2 thumbnails so swiping feels instantaneous without keeping extra video iframes open
  useEffect(() => {
    const upcoming = visibleShorts.slice(activeIndex + 1, activeIndex + 3);
    for (const item of upcoming) {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.src = item.thumbnailUrl;
    }
  }, [activeIndex, visibleShorts]);

  const handleVideoEnded = useCallback(() => {
    if (activeIndex < visibleShorts.length - 1) {
      scrollToIndex(activeIndex + 1);
    } else {
      scrollToIndex(0);
    }
  }, [activeIndex, visibleShorts.length, scrollToIndex]);

  const activeShort = visibleShorts[activeIndex] ?? visibleShorts[0] ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onShareActive={() => {
          if (activeShort) setShareTarget(activeShort);
        }}
      />

      {/* Mobile compact single-line category bar (stays well below 15% sticky height cap) */}
      <div className="lg:hidden sticky top-[52px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 h-11 flex items-center gap-2">
        {mobileSearchOpen ? (
          <div className="flex items-center gap-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pregação, bíblia, louvor..."
              className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none text-slate-900"
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMobileSearchOpen(false);
              }}
              aria-label="Fechar busca"
              className="w-8 h-8 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Buscar vídeos"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 shrink-0"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
              {MOBILE_FILTERS.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <PWAInstallButton variant="compact" />
          </>
        )}
      </div>

      {/* Main 3-Column Studio Workspace on Desktop / Full-Height Feed on Mobile */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto lg:px-6 lg:py-6 flex items-start justify-center lg:gap-8">
        <ShortsSidebar
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectCategory={handleSelectCategory}
          categoryCounts={categoryCounts}
          totalCount={queryFiltered.length}
          savedCount={savedIds.length}
          sourceMode={sourceMode}
          apiKeyConfigured={apiKeyConfigured}
        />

        {/* Center Vertical Shorts Stage */}
        <section
          aria-label="Reprodutor vertical de vídeos cristãos"
          className="w-full lg:w-auto flex-1 flex items-center justify-center"
        >
          <div className="w-full lg:max-w-[420px] h-[calc(100dvh-96px)] lg:h-[calc(100vh-7.5rem)] lg:max-h-[780px] bg-slate-950 lg:rounded-2xl overflow-hidden shadow-lg border-0 lg:border lg:border-slate-200 relative">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300 px-6 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-400" aria-hidden="true" />
                <p className="text-sm font-medium">
                  Carregando vídeos cristãos selecionados...
                </p>
              </div>
            ) : error && visibleShorts.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white px-8 text-center">
                <AlertCircle className="w-8 h-8 text-amber-400" aria-hidden="true" />
                <p className="text-sm text-slate-200">{error}</p>
                <button
                  type="button"
                  onClick={() => loadShorts(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Tentar novamente
                </button>
              </div>
            ) : visibleShorts.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white px-8 text-center">
                <Bookmark className="w-8 h-8 text-slate-400" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-200">
                  {activeCategory === 'salvos'
                    ? 'Você ainda não salvou nenhum vídeo.'
                    : 'Nenhum vídeo encontrado para este filtro.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    handleSelectCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Ver todos os vídeos
                </button>
              </div>
            ) : (
              <div
                ref={feedRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
              >
                {visibleShorts.map((short, idx) => (
                  <div key={short.id} className="w-full h-full snap-start snap-always">
                    <YouTubeShortPlayer
                      short={short}
                      isActive={idx === activeIndex}
                      audioUnlocked={audioUnlocked}
                      autoAdvance={autoAdvance}
                      isSaved={savedSet.has(short.id)}
                      onAudioUnlocked={handleUnlockAudio}
                      onToggleSave={handleToggleSave}
                      onShare={setShareTarget}
                      onEnded={handleVideoEnded}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <RightQueuePanel
          items={visibleShorts}
          activeIndex={activeIndex}
          autoAdvance={autoAdvance}
          isRefreshing={isRefreshing}
          onToggleAutoAdvance={() => setAutoAdvance((prev) => !prev)}
          onPrev={() => scrollToIndex(activeIndex - 1)}
          onNext={() => scrollToIndex(activeIndex + 1)}
          onSelectIndex={scrollToIndex}
          onShare={setShareTarget}
          onRefresh={() => loadShorts(true)}
        />
      </main>

      <ShareModal
        short={shareTarget}
        isOpen={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
      />

      <OfflineIndicator />
    </div>
  );
}

export default App;
