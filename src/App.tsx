import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Bookmark, RefreshCw, Search, X } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RightQueuePanel } from './components/RightQueuePanel';
import { ShareModal } from './components/ShareModal';
import { ShortsFeedStage } from './components/ShortsFeedStage';
import { ShortsSidebar } from './components/ShortsSidebar';
import { TopBar } from './components/TopBar';
import { loadYouTubeIframeApi } from './utils/youtubePlayerApi';
import {
  fetchShortsOnNativeDevice,
  isNativeCapacitorApp,
} from './utils/nativeShortsFallback';
import type { ChristianShort, ContentCategory, ShortCategory, ShortsApiResponse } from './types/shorts';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const SAVED_STORAGE_KEY = 'luz_shorts_saved_ids_v1';
const SEEN_STORAGE_KEY = 'luz_shorts_seen_ids_v1';
const MAX_SEEN_IDS = 5000;

const MOBILE_FILTERS: Array<{ id: ShortCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'pregacoes', label: 'Pregações' },
  { id: 'biblia', label: 'Bíblia' },
  { id: 'louvores', label: 'Louvores' },
  { id: 'testemunhos', label: 'Testemunhos' },
  { id: 'salvos', label: 'Salvos' },
];

function readStoredIdList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function shuffleArray<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function spreadChannelOrder(list: ChristianShort[]): ChristianShort[] {
  const remaining = [...list];
  const arranged: ChristianShort[] = [];
  let lastChannelId: string | null = null;

  while (remaining.length > 0) {
    let idx = remaining.findIndex((item) => item.channelId !== lastChannelId);
    if (idx === -1) idx = 0;
    const [picked] = remaining.splice(idx, 1);
    if (picked) {
      arranged.push(picked);
      lastChannelId = picked.channelId;
    }
  }
  return arranged;
}

export function App() {
  const [allShorts, setAllShorts] = useState<ChristianShort[]>([]);
  const [sourceMode, setSourceMode] = useState<'youtube_api' | 'curated_rss'>('curated_rss');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ShortCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readStoredIdList(SAVED_STORAGE_KEY)
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreByCategory, setHasMoreByCategory] = useState<Record<string, boolean>>({
    all: true,
    pregacoes: true,
    biblia: true,
    louvores: true,
    testemunhos: true,
  });
  const [paginationRetryTick, setPaginationRetryTick] = useState(0);
  const [remoteSearchShorts, setRemoteSearchShorts] = useState<ChristianShort[] | null>(null);
  const [searchCursor, setSearchCursor] = useState<string | null>(null);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ChristianShort | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const feedRef = useRef<HTMLDivElement | null>(null);
  const seenIdsRef = useRef<string[]>(readStoredIdList(SEEN_STORAGE_KEY));
  const prevActiveIdRef = useRef<string | undefined>(undefined);
  const categoryCursorsRef = useRef<Record<string, string | null>>({});
  const fetchedCategoryBatchRef = useRef<Set<string>>(new Set());
  const emptyRetryCountRef = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const activeSearchTermRef = useRef('');

  const markShortSeen = useCallback((shortId: string | undefined) => {
    if (!shortId) return;
    const next = [shortId, ...seenIdsRef.current.filter((id) => id !== shortId)].slice(
      0,
      MAX_SEEN_IDS
    );
    seenIdsRef.current = next;
    try {
      localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const loadShorts = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    fetchedCategoryBatchRef.current.clear();

    try {
      let data: ShortsApiResponse | null = null;
      const nativeApp = isNativeCapacitorApp();

      if (!nativeApp || API_BASE_URL.length > 0) {
        try {
          const params = new URLSearchParams();
          if (forceRefresh) params.set('refresh', '1');
          const recentSeen = seenIdsRef.current.slice(0, 400);
          if (recentSeen.length > 0) {
            params.set('exclude', recentSeen.join(','));
          }
          const res = await fetch(
            `${API_BASE_URL}/api/shorts${params.toString() ? `?${params.toString()}` : ''}`
          );
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            data = (await res.json()) as ShortsApiResponse;
          } else if (!nativeApp) {
            throw new Error(`Erro HTTP ${res.status} ao carregar vídeos`);
          }
        } catch (fetchErr) {
          if (!nativeApp) throw fetchErr;
        }
      }

      if (!data) {
        data = await fetchShortsOnNativeDevice(forceRefresh);
      }

      // Prioritize unseen videos in a fresh random spread on every entry
      const seenSet = new Set(seenIdsRef.current);
      const unseenItems = data.items.filter((item) => !seenSet.has(item.id));
      const seenItems = data.items.filter((item) => seenSet.has(item.id));

      let items: ChristianShort[];
      if (unseenItems.length === 0 && seenItems.length > 0) {
        // Keep the most recent 250 seen IDs protected so recently watched louvores never jump back to the front
        const recentOnly = seenIdsRef.current.slice(0, 250);
        seenIdsRef.current = recentOnly;
        try {
          localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(recentOnly));
        } catch {
          // Ignore storage quota errors
        }
        const recentSet = new Set(recentOnly);
        items = [
          ...spreadChannelOrder(
            shuffleArray(data.items.filter((item) => !recentSet.has(item.id)))
          ),
          ...spreadChannelOrder(
            shuffleArray(data.items.filter((item) => recentSet.has(item.id)))
          ),
        ];
      } else {
        items = [
          ...spreadChannelOrder(shuffleArray(unseenItems)),
          ...spreadChannelOrder(shuffleArray(seenItems)),
        ];
      }

      // Support direct shared video links (?v=VIDEO_ID) on initial load
      if (!forceRefresh) {
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
      }

      setAllShorts(items);
      setSourceMode(data.sourceMode);
      setApiKeyConfigured(data.apiKeyConfigured);
      categoryCursorsRef.current = {
        all: data.nextCursor ?? null,
      };
      emptyRetryCountRef.current = 0;
      const canPaginate = data.hasMore ?? true;
      setHasMoreByCategory({
        all: canPaginate,
        pregacoes: true,
        biblia: true,
        louvores: true,
        testemunhos: true,
      });
      setActiveIndex(0);
      if (feedRef.current) {
        feedRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
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

  // Debounced live YouTube search whenever user types a query (>= 2 chars)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      activeSearchTermRef.current = '';
      setRemoteSearchShorts(null);
      setSearchCursor(null);
      setSearchHasMore(false);
      return;
    }

    const nativeApp = isNativeCapacitorApp();
    if (nativeApp && API_BASE_URL.length === 0) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          category: activeCategory === 'salvos' ? 'all' : activeCategory,
        });
        const res = await fetch(`${API_BASE_URL}/api/shorts?${params.toString()}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as ShortsApiResponse;
        if (cancelled) return;

        const isNewTerm = activeSearchTermRef.current !== trimmed;
        activeSearchTermRef.current = trimmed;
        setRemoteSearchShorts(data.items);
        setSearchCursor(data.nextCursor ?? null);
        setSearchHasMore(Boolean(data.hasMore && data.nextCursor));
        if (isNewTerm) {
          setActiveIndex(0);
          if (feedRef.current) {
            feedRef.current.scrollTo({ top: 0, behavior: 'auto' });
          }
        }
      } catch {
        // Keep instant client-side filtered results on transient network failures
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, activeCategory]);

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
    const q = searchQuery
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (!q) return allShorts;
    if (remoteSearchShorts !== null) return remoteSearchShorts;
    const fold = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    return allShorts.filter((item) => {
      const haystack = fold(
        `${item.title} ${item.channelTitle} ${item.description} ${item.categoryLabel}`
      );
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [allShorts, searchQuery, remoteSearchShorts]);

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

  const loadMoreShorts = useCallback(async () => {
    if (isLoadingMoreRef.current || loading || isRefreshing || activeCategory === 'salvos') {
      return;
    }

    const trimmedQuery = searchQuery.trim();
    const isLiveSearch = trimmedQuery.length >= 2 && remoteSearchShorts !== null;
    const categoryHasMore = hasMoreByCategory[activeCategory] ?? true;
    if (isLiveSearch && (!searchHasMore || !searchCursor)) {
      return;
    }
    if (!isLiveSearch && !categoryHasMore) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      let data: ShortsApiResponse | null = null;
      const nativeApp = isNativeCapacitorApp();
      const categoryCursor = categoryCursorsRef.current[activeCategory] ?? null;

      if (!nativeApp || API_BASE_URL.length > 0) {
        const params = new URLSearchParams({
          category: activeCategory,
        });
        const cursorToUse = isLiveSearch ? searchCursor : categoryCursor;
        if (cursorToUse) params.set('cursor', cursorToUse);
        if (isLiveSearch) params.set('q', trimmedQuery);
        const activePool = isLiveSearch
          ? remoteSearchShorts ?? []
          : activeCategory === 'all'
          ? allShorts
          : allShorts.filter((i) => i.category === activeCategory);
        const combinedExclude = Array.from(
          new Set([
            ...(isLiveSearch ? [] : seenIdsRef.current.slice(0, 260)),
            ...activePool.slice(0, 120).map((i) => i.id),
            ...activePool.slice(-120).map((i) => i.id),
          ])
        ).slice(0, 450);
        if (combinedExclude.length > 0) params.set('exclude', combinedExclude.join(','));

        const res = await fetch(`${API_BASE_URL}/api/shorts/more?${params.toString()}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          data = (await res.json()) as ShortsApiResponse;
        }
      } else if (!isLiveSearch) {
        const pageNum = Number(categoryCursor || '1');
        if (Number.isFinite(pageNum) && pageNum > 0) {
          data = await fetchShortsOnNativeDevice(false, pageNum);
        }
      }

      if (!data) return;

      if (isLiveSearch) {
        const existing = new Set((remoteSearchShorts ?? []).map((i) => i.id));
        const freshCount = data.items.filter((i) => !existing.has(i.id)).length;
        setRemoteSearchShorts((prev) => {
          const base = prev ?? [];
          const baseIds = new Set(base.map((i) => i.id));
          const fresh = data!.items.filter((i) => !baseIds.has(i.id));
          return fresh.length > 0 ? [...base, ...fresh] : base;
        });
        setSearchCursor(data.nextCursor ?? null);
        const nextSearchHasMore = Boolean(data.hasMore && data.nextCursor);
        setSearchHasMore(nextSearchHasMore);
        if (freshCount === 0 && nextSearchHasMore && emptyRetryCountRef.current < 2) {
          emptyRetryCountRef.current += 1;
          setPaginationRetryTick((t) => t + 1);
        } else {
          emptyRetryCountRef.current = 0;
        }
      } else {
        const existingAll = new Set(allShorts.map((i) => i.id));
        const freshCount = data.items.filter((i) => !existingAll.has(i.id)).length;
        setAllShorts((prev) => {
          const existing = new Set(prev.map((i) => i.id));
          const seenSet = new Set(seenIdsRef.current);
          const fresh = data!.items.filter((i) => !existing.has(i.id));
          if (fresh.length === 0) return prev;
          const unseen = spreadChannelOrder(fresh.filter((i) => !seenSet.has(i.id)));
          const seen = spreadChannelOrder(fresh.filter((i) => seenSet.has(i.id)));
          return [...prev, ...unseen, ...seen];
        });
        categoryCursorsRef.current[activeCategory] = data.nextCursor ?? null;
        const nextHasMore = Boolean(data.hasMore);
        setHasMoreByCategory((prev) => ({
          ...prev,
          [activeCategory]: nextHasMore,
        }));
        if (freshCount === 0 && nextHasMore && emptyRetryCountRef.current < 3) {
          emptyRetryCountRef.current += 1;
          setPaginationRetryTick((t) => t + 1);
        } else {
          emptyRetryCountRef.current = 0;
        }
      }
    } catch {
      // Fail silently; user can keep watching current items or pull to refresh
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [
    loading,
    isRefreshing,
    activeCategory,
    searchQuery,
    remoteSearchShorts,
    searchHasMore,
    searchCursor,
    hasMoreByCategory,
    allShorts,
  ]);

  // Automatically load more videos from YouTube as unseen videos run low or the user approaches the end of any feed,
  // and fetch a fresh YouTube batch once whenever switching into a specific category.
  useEffect(() => {
    if (loading || isRefreshing || activeCategory === 'salvos') return;
    const trimmed = searchQuery.trim();
    const seenSet = new Set(seenIdsRef.current);
    const unseenCount = visibleShorts.filter((item) => !seenSet.has(item.id)).length;
    const needsCategoryWarmup =
      !trimmed &&
      activeCategory !== 'all' &&
      !fetchedCategoryBatchRef.current.has(activeCategory);
    const lowStockInCategory = !trimmed && unseenCount < 25;
    if (
      visibleShorts.length === 0 ||
      needsCategoryWarmup ||
      lowStockInCategory ||
      activeIndex >= visibleShorts.length - 6
    ) {
      if (needsCategoryWarmup) {
        fetchedCategoryBatchRef.current.add(activeCategory);
      }
      loadMoreShorts();
    }
  }, [
    activeIndex,
    visibleShorts,
    activeCategory,
    searchQuery,
    loading,
    isRefreshing,
    paginationRetryTick,
    loadMoreShorts,
  ]);

  const handleSelectCategory = useCallback(
    (cat: ShortCategory) => {
      const currentId = visibleShorts[activeIndex]?.id;
      if (currentId) {
        markShortSeen(currentId);
      }
      if (cat !== 'salvos') {
        const seenSet = new Set(seenIdsRef.current);
        setAllShorts((prev) => {
          const unseen = prev.filter((item) => !seenSet.has(item.id));
          const seen = prev.filter((item) => seenSet.has(item.id));
          return unseen.length > 0 ? [...unseen, ...seen] : prev;
        });
      }
      emptyRetryCountRef.current = 0;
      setActiveCategory(cat);
      setActiveIndex(0);
      if (feedRef.current) {
        feedRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
    },
    [activeIndex, visibleShorts, markShortSeen]
  );

  const scrollToIndex = useCallback(
    (targetIdx: number) => {
      const container = feedRef.current;
      if (!container || visibleShorts.length === 0) return;
      const clamped = Math.max(0, Math.min(visibleShorts.length - 1, targetIdx));
      const slideHeight = container.clientHeight;
      container.scrollTo({
        top: clamped * slideHeight,
        behavior: 'auto',
      });
      setActiveIndex(clamped);
    },
    [visibleShorts.length]
  );

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

  // Track watched Shorts immediately on swipe/navigation, after 150ms dwell, and when closing/backgrounding
  useEffect(() => {
    const activeId = visibleShorts[activeIndex]?.id;
    const previousId = prevActiveIdRef.current;
    if (previousId && previousId !== activeId) {
      markShortSeen(previousId);
    }
    prevActiveIdRef.current = activeId;
    if (!activeId) return;

    const timer = window.setTimeout(() => {
      markShortSeen(activeId);
    }, 150);
    const handleVisibilityOrHide = () => {
      if (document.visibilityState === 'hidden') {
        markShortSeen(activeId);
      }
    };
    const handleBeforeUnload = () => {
      markShortSeen(activeId);
    };
    window.addEventListener('pagehide', handleVisibilityOrHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityOrHide);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pagehide', handleVisibilityOrHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityOrHide);
    };
  }, [activeIndex, visibleShorts, markShortSeen]);

  const handleRefreshFeed = useCallback(() => {
    const currentId = visibleShorts[activeIndex]?.id;
    if (currentId) {
      markShortSeen(currentId);
    }
    loadShorts(true);
  }, [activeIndex, visibleShorts, markShortSeen, loadShorts]);

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
    const canLoadMore = hasMoreByCategory[activeCategory] ?? true;
    if (activeIndex < visibleShorts.length - 1) {
      scrollToIndex(activeIndex + 1);
    } else if (canLoadMore && activeCategory !== 'salvos') {
      loadMoreShorts();
    } else {
      scrollToIndex(0);
    }
  }, [
    activeIndex,
    visibleShorts.length,
    scrollToIndex,
    hasMoreByCategory,
    activeCategory,
    loadMoreShorts,
  ]);

  return (
    <div className="h-[100dvh] max-h-[100dvh] lg:h-auto lg:max-h-none lg:min-h-screen flex flex-col bg-black text-zinc-100 overflow-hidden lg:overflow-visible safe-pb lg:pb-0 w-full max-w-full">
      <TopBar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Mobile compact single-line category bar (stays well below 15% sticky height cap) */}
      <div className="lg:hidden shrink-0 z-20 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-3 h-11 flex items-center gap-2 safe-px">
        {mobileSearchOpen ? (
          <div className="flex items-center gap-2 w-full">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pregação, bíblia, louvor..."
              className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none text-zinc-100 placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMobileSearchOpen(false);
              }}
              aria-label="Fechar busca"
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-900 shrink-0"
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
                        ? 'bg-white text-black'
                        : 'bg-zinc-950 border border-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Main 3-Column Studio Workspace on Desktop / Exact Viewport Feed on Mobile */}
      <main className="flex-1 min-h-0 overflow-hidden lg:overflow-visible max-w-[1360px] w-full mx-auto lg:px-6 lg:py-6 flex items-stretch lg:items-start justify-center lg:gap-8">
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
          className="w-full h-full min-h-0 lg:h-auto lg:w-auto flex-1 flex items-center justify-center"
        >
          <div className="w-full h-full lg:w-auto lg:aspect-[9/16] lg:max-w-[438px] lg:h-[calc(100vh-7.5rem)] lg:max-h-[780px] bg-black lg:rounded-2xl overflow-hidden shadow-2xl border-0 lg:border lg:border-zinc-800/90 relative">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-300 px-6 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
                <p className="text-sm font-medium">
                  Carregando vídeos cristãos selecionados...
                </p>
              </div>
            ) : error && visibleShorts.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white px-8 text-center">
                <AlertCircle className="w-8 h-8 text-amber-400" aria-hidden="true" />
                <p className="text-sm text-zinc-300">{error}</p>
                <button
                  type="button"
                  onClick={() => loadShorts(true)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition-colors cursor-pointer"
                >
                  Tentar novamente
                </button>
              </div>
            ) : visibleShorts.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white px-8 text-center">
                <Bookmark className="w-8 h-8 text-zinc-500" aria-hidden="true" />
                <p className="text-sm font-medium text-zinc-300">
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
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition-colors cursor-pointer"
                >
                  Ver todos os vídeos
                </button>
              </div>
            ) : (
              <ShortsFeedStage
                items={visibleShorts}
                activeIndex={activeIndex}
                audioUnlocked={audioUnlocked}
                autoAdvance={autoAdvance}
                isRefreshing={isRefreshing}
                savedSet={savedSet}
                feedRef={feedRef}
                onActiveIndexChange={setActiveIndex}
                onAudioUnlocked={handleUnlockAudio}
                onToggleSave={handleToggleSave}
                onShare={setShareTarget}
                onRefresh={handleRefreshFeed}
                onEnded={handleVideoEnded}
              />
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
          onRefresh={handleRefreshFeed}
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
