import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Bookmark, RefreshCw, Search, X } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SearchBoxWithSuggestions } from './components/SearchBoxWithSuggestions';
import { ShareModal } from './components/ShareModal';
import { ShortsFeedStage } from './components/ShortsFeedStage';
import { ShortsSidebar } from './components/ShortsSidebar';
import { TopBar } from './components/TopBar';

const RightQueuePanel = lazy(() =>
  import('./components/RightQueuePanel').then((mod) => ({
    default: mod.RightQueuePanel,
  }))
);

const SearchResultsView = lazy(() =>
  import('./components/SearchResultsView').then((mod) => ({
    default: mod.SearchResultsView,
  }))
);
import { loadYouTubeIframeApi } from './utils/youtubePlayerApi';
import {
  fetchShortsOnNativeDevice,
  isNativeCapacitorApp,
} from './utils/nativeShortsFallback';
import { buildDiverseFeed, buildTieredDiverseFeed } from './shared/curatorCore';
import type { ChristianShort, ContentCategory, ShortCategory, ShortsApiResponse } from './types/shorts';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const SAVED_STORAGE_KEY = 'gracaplay_saved_ids_v1';
const SEEN_STORAGE_KEY = 'gracaplay_seen_ids_v1';
const LAST_SESSION_TOP_KEY = 'gracaplay_last_top_v1';
const LEGACY_SAVED_STORAGE_KEY = 'luz_shorts_saved_ids_v1';
const LEGACY_SEEN_STORAGE_KEY = 'luz_shorts_seen_ids_v1';
const MAX_SEEN_IDS = 5000;
const MAX_SURFACED_TOP_IDS = 120;

const MAIN_ALL_CATEGORIES: ContentCategory[] = [
  'pregacoes',
  'biblia',
  'louvores',
  'testemunhos',
];

function prioritizeAndShuffleFeed(
  source: ChristianShort[],
  seenIds: string[],
  surfacedTopIds: string[],
  targetCategory?: ShortCategory
): { items: ChristianShort[]; resetSurfacedIds: string[] } {
  const seenSet = new Set(seenIds);
  const surfacedSet = new Set(surfacedTopIds);

  const unseenFresh = source.filter(
    (item) => !seenSet.has(item.id) && !surfacedSet.has(item.id)
  );
  const unseenSurfaced = source.filter(
    (item) => !seenSet.has(item.id) && surfacedSet.has(item.id)
  );
  const seenItems = source.filter((item) => seenSet.has(item.id));

  const targetHasFresh =
    targetCategory && targetCategory !== 'all' && targetCategory !== 'salvos'
      ? unseenFresh.some((item) => item.category === targetCategory)
      : targetCategory === 'all'
        ? unseenFresh.some((item) => item.category !== 'feliz7play')
        : unseenFresh.length > 0;

  if (!targetHasFresh && unseenSurfaced.length > 0) {
    const resetIds =
      targetCategory && targetCategory !== 'all' && targetCategory !== 'salvos'
        ? unseenSurfaced
            .filter((item) => item.category === targetCategory)
            .map((item) => item.id)
        : unseenSurfaced
            .filter((item) => targetCategory !== 'all' || item.category !== 'feliz7play')
            .map((item) => item.id);
    const allUnseen = source.filter((item) => !seenSet.has(item.id));
    return {
      items: [...buildDiverseFeed(allUnseen, true), ...buildDiverseFeed(seenItems, true)],
      resetSurfacedIds: resetIds,
    };
  }

  return {
    items: [
      ...buildTieredDiverseFeed([unseenFresh, unseenSurfaced], true),
      ...buildDiverseFeed(seenItems, true),
    ],
    resetSurfacedIds: [],
  };
}

function extractSessionTopIds(items: ChristianShort[]): string[] {
  const picked = new Set<string>();
  for (const item of items.filter((i) => i.category !== 'feliz7play').slice(0, 10)) {
    picked.add(item.id);
  }
  const categories: ContentCategory[] = [
    'pregacoes',
    'biblia',
    'louvores',
    'testemunhos',
    'feliz7play',
  ];
  for (const cat of categories) {
    const topForCat = items.filter((item) => item.category === cat).slice(0, 6);
    for (const item of topForCat) {
      picked.add(item.id);
    }
  }
  return Array.from(picked).slice(0, 45);
}

const MOBILE_FILTERS: Array<{ id: ShortCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'pregacoes', label: 'Pregações' },
  { id: 'biblia', label: 'Bíblia' },
  { id: 'louvores', label: 'Louvores' },
  { id: 'testemunhos', label: 'Testemunhos' },
  { id: 'feliz7play', label: 'Feliz7Play' },
  { id: 'salvos', label: 'Salvos' },
];

function readStoredIdList(key: string, legacyKey?: string): string[] {
  try {
    const raw = localStorage.getItem(key) ?? (legacyKey ? localStorage.getItem(legacyKey) : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function foldSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function App() {
  const [allShorts, setAllShorts] = useState<ChristianShort[]>([]);
  const [sourceMode, setSourceMode] = useState<'youtube_api' | 'curated_rss'>('curated_rss');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ShortCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchViewMode, setSearchViewMode] = useState<'results' | 'player'>('player');
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readStoredIdList(SAVED_STORAGE_KEY, LEGACY_SAVED_STORAGE_KEY)
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
    feliz7play: true,
  });
  const [paginationRetryTick, setPaginationRetryTick] = useState(0);
  const [remoteSearchShorts, setRemoteSearchShorts] = useState<ChristianShort[] | null>(null);
  const [searchCursor, setSearchCursor] = useState<string | null>(null);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSubmitTick, setSearchSubmitTick] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ChristianShort | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isNativePipMode, setIsNativePipMode] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.dataset.pipMode === 'true') {
      return true;
    }
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(display-mode: picture-in-picture)').matches;
    }
    return false;
  });

  const feedRef = useRef<HTMLDivElement | null>(null);
  const seenIdsRef = useRef<string[]>(
    readStoredIdList(SEEN_STORAGE_KEY, LEGACY_SEEN_STORAGE_KEY)
  );
  const seenIdsSetRef = useRef<Set<string>>(new Set(seenIdsRef.current));
  const lastSessionTopRef = useRef<string[]>(readStoredIdList(LAST_SESSION_TOP_KEY));
  const allShortsRef = useRef<ChristianShort[]>([]);
  const visibleShortsRef = useRef<ChristianShort[]>([]);
  const activeIndexRef = useRef<number>(activeIndex);
  const hasMoreByCategoryRef = useRef<Record<string, boolean>>(hasMoreByCategory);
  const prevActiveIdRef = useRef<string | undefined>(undefined);
  const categoryCursorsRef = useRef<Record<string, string | null>>({});
  const fetchedCategoryBatchRef = useRef<Set<string>>(new Set());
  const emptyRetryCountRef = useRef(0);
  const allBalanceRetryCountRef = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const activeSearchTermRef = useRef('');
  const remoteSearchQueryRef = useRef('');
  const remoteSearchLoadedCatsRef = useRef<Set<string>>(new Set());
  const lastSearchSubmitTickRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);

  activeIndexRef.current = activeIndex;
  hasMoreByCategoryRef.current = hasMoreByCategory;

  useEffect(() => {
    allShortsRef.current = allShorts;
  }, [allShorts]);

  useEffect(() => {
    const handleNativePipChange = (e: Event) => {
      const detail = (e as CustomEvent<{ active?: boolean }>).detail;
      if (typeof detail?.active === 'boolean') {
        setIsNativePipMode(detail.active);
      }
    };
    window.addEventListener('gracaplay-pip-change', handleNativePipChange);

    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: picture-in-picture)')
        : null;
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsNativePipMode(e.matches);
    };
    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('gracaplay-pip-change', handleNativePipChange);
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  const recordSurfacedTopIds = useCallback((ids: string[], removeIds: string[] = []) => {
    const removeSet = new Set(removeIds);
    const cleanedPrev = lastSessionTopRef.current.filter((id) => !removeSet.has(id));
    const next = Array.from(new Set([...ids, ...cleanedPrev])).slice(0, MAX_SURFACED_TOP_IDS);
    lastSessionTopRef.current = next;
    try {
      localStorage.setItem(LAST_SESSION_TOP_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const markShortSeen = useCallback((shortId: string | undefined) => {
    if (!shortId) return;
    const next = [shortId, ...seenIdsRef.current.filter((id) => id !== shortId)].slice(
      0,
      MAX_SEEN_IDS
    );
    seenIdsRef.current = next;
    seenIdsSetRef.current = new Set(next);
    try {
      localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const reshuffleUnseenFeed = useCallback(
    (targetCat: ShortCategory) => {
      const currentList = allShortsRef.current;
      if (currentList.length === 0 || targetCat === 'salvos') return;

      const { items: nextItems, resetSurfacedIds } = prioritizeAndShuffleFeed(
        currentList,
        seenIdsRef.current,
        lastSessionTopRef.current,
        targetCat
      );

      const seenSet = new Set(seenIdsRef.current);
      const upcomingForTarget = (
        targetCat === 'all'
          ? nextItems.filter((item) => item.category !== 'feliz7play')
          : nextItems.filter((item) => item.category === targetCat)
      )
        .filter((item) => !seenSet.has(item.id))
        .slice(0, 3)
        .map((item) => item.id);

      recordSurfacedTopIds(upcomingForTarget, resetSurfacedIds);
      allShortsRef.current = nextItems;
      setAllShorts(nextItems);
    },
    [recordSurfacedTopIds]
  );

  const loadShorts = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    fetchedCategoryBatchRef.current.clear();
    allBalanceRetryCountRef.current = 0;

    try {
      let data: ShortsApiResponse | null = null;
      const nativeApp = isNativeCapacitorApp();

      if (!nativeApp || API_BASE_URL.length > 0) {
        try {
          const excludeIds = Array.from(
            new Set([
              ...lastSessionTopRef.current.slice(0, 45),
              ...seenIdsRef.current.slice(0, 600),
            ])
          ).slice(0, 645);
          const res = await fetch(`${API_BASE_URL}/api/shorts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category: 'all',
              refresh: forceRefresh,
              exclude: excludeIds,
            }),
          });
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

      // Preserve balanced bucket ordering (Hinário, CD Jovem, Adoradores, Gospel Geral
      // and per-category balance), while demoting previously shown top items and watched items.
      const orderedSource = data.items;

      const seenSet = new Set(seenIdsRef.current);
      const lastTopSet = new Set(lastSessionTopRef.current);
      const unseenFresh = orderedSource.filter(
        (item) => !seenSet.has(item.id) && !lastTopSet.has(item.id)
      );
      const unseenPrevTop = orderedSource.filter(
        (item) => !seenSet.has(item.id) && lastTopSet.has(item.id)
      );
      const seenItems = orderedSource.filter((item) => seenSet.has(item.id));

      let items: ChristianShort[];
      if (unseenFresh.length === 0 && unseenPrevTop.length === 0 && seenItems.length > 0) {
        // Keep the most recent 250 seen IDs protected so recently watched videos stay at the end
        const recentOnly = seenIdsRef.current.slice(0, 250);
        seenIdsRef.current = recentOnly;
        seenIdsSetRef.current = new Set(recentOnly);
        try {
          localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(recentOnly));
        } catch {
          // Ignore storage quota errors
        }
        const recentSet = seenIdsSetRef.current;
        items = [
          ...buildDiverseFeed(orderedSource.filter((item) => !recentSet.has(item.id)), true),
          ...buildDiverseFeed(orderedSource.filter((item) => recentSet.has(item.id)), true),
        ];
      } else {
        items = [
          ...buildTieredDiverseFeed([unseenFresh, unseenPrevTop], true),
          ...buildDiverseFeed(seenItems, true),
        ];
      }

      // Record top items from this session so reopening or switching categories immediately rotates them out
      const nextSessionTop = extractSessionTopIds(items);
      recordSurfacedTopIds(nextSessionTop);

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

      allShortsRef.current = items;
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
        feliz7play: true,
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
  }, [recordSurfacedTopIds]);

  useEffect(() => {
    // Pre-warm YouTube IFrame Player API immediately on mount for faster first playback
    loadYouTubeIframeApi().catch(() => {});
    loadShorts(false);
  }, [loadShorts]);

  // Live YouTube search whenever user submits a query (>= 2 chars) or changes filter while searching
  useEffect(() => {
    const trimmed = submittedSearchQuery.trim();
    if (trimmed.length < 2) {
      activeSearchTermRef.current = '';
      remoteSearchQueryRef.current = '';
      remoteSearchLoadedCatsRef.current.clear();
      setRemoteSearchShorts(null);
      setSearchCursor(null);
      setSearchHasMore(false);
      setIsSearching(false);
      return;
    }

    const nativeApp = isNativeCapacitorApp();
    if (nativeApp && API_BASE_URL.length === 0) {
      setIsSearching(false);
      return;
    }

    const targetCategory = activeCategory === 'salvos' ? 'all' : activeCategory;
    const isManualSubmit = searchSubmitTick !== lastSearchSubmitTickRef.current;
    lastSearchSubmitTickRef.current = searchSubmitTick;

    if (
      !isManualSubmit &&
      remoteSearchQueryRef.current === trimmed &&
      remoteSearchLoadedCatsRef.current.has(targetCategory)
    ) {
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    (async () => {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          category: targetCategory,
        });
        const res = await fetch(`${API_BASE_URL}/api/shorts?${params.toString()}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as ShortsApiResponse;
        if (cancelled) return;

        const isNewTerm = remoteSearchQueryRef.current !== trimmed;
        activeSearchTermRef.current = trimmed;
        remoteSearchQueryRef.current = trimmed;
        if (isNewTerm) {
          remoteSearchLoadedCatsRef.current = new Set([targetCategory]);
          setRemoteSearchShorts(data.items);
        } else {
          remoteSearchLoadedCatsRef.current.add(targetCategory);
          setRemoteSearchShorts((prev) => {
            const incomingIds = new Set(data.items.map((item) => item.id));
            const kept = (prev ?? []).filter((item) => !incomingIds.has(item.id));
            return [...data.items, ...kept];
          });
        }
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
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [submittedSearchQuery, activeCategory, searchSubmitTick]);

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

  const trimmedSubmittedSearch = useMemo(
    () => submittedSearchQuery.trim(),
    [submittedSearchQuery]
  );

  const allowFelizInSearch = useMemo(
    () =>
      trimmedSubmittedSearch.length >= 2 &&
      /\b(feliz7|defensores|camelo|nt kids)\b/i.test(trimmedSubmittedSearch),
    [trimmedSubmittedSearch]
  );

  const queryFiltered = useMemo(() => {
    const q = foldSearchText(trimmedSubmittedSearch);
    if (!q) return allShorts;
    if (
      remoteSearchShorts !== null &&
      remoteSearchQueryRef.current === trimmedSubmittedSearch
    ) {
      return remoteSearchShorts;
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    const seenPoolIds = new Set<string>();
    const combinedPool: ChristianShort[] = [];
    for (const item of allShorts) {
      if (!seenPoolIds.has(item.id)) {
        seenPoolIds.add(item.id);
        combinedPool.push(item);
      }
    }
    if (remoteSearchShorts) {
      for (const item of remoteSearchShorts) {
        if (!seenPoolIds.has(item.id)) {
          seenPoolIds.add(item.id);
          combinedPool.push(item);
        }
      }
    }
    return combinedPool.filter((item) => {
      const haystack = foldSearchText(
        `${item.title} ${item.channelTitle} ${item.description} ${item.categoryLabel}`
      );
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [allShorts, trimmedSubmittedSearch, remoteSearchShorts]);

  // Single-pass memoized partitioning for category counts, Todos feed, saved list, and per-category lists
  const filteredCatalog = useMemo(() => {
    const counts: Record<ContentCategory, number> = {
      pregacoes: 0,
      biblia: 0,
      louvores: 0,
      testemunhos: 0,
      feliz7play: 0,
    };
    const byCategory: Record<ContentCategory, ChristianShort[]> = {
      pregacoes: [],
      biblia: [],
      louvores: [],
      testemunhos: [],
      feliz7play: [],
    };
    const todosItems: ChristianShort[] = [];
    const savedItems: ChristianShort[] = [];

    for (const item of queryFiltered) {
      counts[item.category] += 1;
      byCategory[item.category].push(item);
      if (allowFelizInSearch || item.category !== 'feliz7play') {
        todosItems.push(item);
      }
      if (savedSet.has(item.id)) {
        savedItems.push(item);
      }
    }

    return {
      counts,
      byCategory,
      todosItems: allowFelizInSearch ? queryFiltered : todosItems,
      todosFeedCount: allowFelizInSearch ? queryFiltered.length : todosItems.length,
      savedItems,
    };
  }, [queryFiltered, allowFelizInSearch, savedSet]);

  const categoryCounts = filteredCatalog.counts;
  const todosFeedCount = filteredCatalog.todosFeedCount;

  const visibleShorts = useMemo(() => {
    if (activeCategory === 'all') {
      return filteredCatalog.todosItems;
    }
    if (activeCategory === 'salvos') {
      return filteredCatalog.savedItems;
    }
    return filteredCatalog.byCategory[activeCategory];
  }, [activeCategory, filteredCatalog]);

  visibleShortsRef.current = visibleShorts;

  const loadMoreShorts = useCallback(async () => {
    if (isLoadingMoreRef.current || loading || isRefreshing || activeCategory === 'salvos') {
      return;
    }

    const trimmedQuery = submittedSearchQuery.trim();
    const isLiveSearch =
      trimmedQuery.length >= 2 &&
      remoteSearchShorts !== null &&
      remoteSearchQueryRef.current === trimmedQuery;
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
        const cursorToUse = isLiveSearch ? searchCursor : categoryCursor;
        const activePool = isLiveSearch
          ? remoteSearchShorts ?? []
          : activeCategory === 'all'
          ? allShorts.filter((i) => i.category !== 'feliz7play')
          : allShorts.filter((i) => i.category === activeCategory);
        const combinedExclude = Array.from(
          new Set([
            ...(isLiveSearch ? [] : seenIdsRef.current.slice(0, 400)),
            ...activePool.slice(0, 150).map((i) => i.id),
            ...activePool.slice(-150).map((i) => i.id),
          ])
        ).slice(0, 700);

        const res = await fetch(`${API_BASE_URL}/api/shorts/more`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: activeCategory,
            cursor: cursorToUse || undefined,
            q: isLiveSearch ? trimmedQuery : undefined,
            exclude: combinedExclude,
          }),
        });
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
        const currentVisible = visibleShortsRef.current;
        const currentIdx = activeIndexRef.current;
        const anchorId =
          currentVisible[
            Math.min(currentIdx + 1, Math.max(0, currentVisible.length - 1))
          ]?.id;
        setAllShorts((prev) => {
          const existing = new Set(prev.map((i) => i.id));
          const seenSet = seenIdsSetRef.current;
          const fresh = data!.items.filter((i) => !existing.has(i.id));
          if (fresh.length === 0) return prev;

          const anchorIdx = anchorId ? prev.findIndex((i) => i.id === anchorId) : -1;
          const head = anchorIdx >= 0 ? prev.slice(0, anchorIdx + 1) : [];
          const tail = anchorIdx >= 0 ? prev.slice(anchorIdx + 1) : prev;

          const unseen = fresh.filter((i) => !seenSet.has(i.id));
          const seen = fresh.filter((i) => seenSet.has(i.id));
          const tailUnseen = tail.filter((i) => !seenSet.has(i.id));
          const tailSeen = tail.filter((i) => seenSet.has(i.id));

          return [
            ...head,
            ...buildDiverseFeed([...tailUnseen, ...unseen], true),
            ...buildDiverseFeed([...tailSeen, ...seen], true),
          ];
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
    trimmedSubmittedSearch,
    remoteSearchShorts,
    searchHasMore,
    searchCursor,
    hasMoreByCategory,
    allShorts,
  ]);

  const unseenStockSummary = useMemo(() => {
    const seenSet = seenIdsSetRef.current;
    let unseenCount = 0;
    const perMainCat: Record<ContentCategory, number> = {
      pregacoes: 0,
      biblia: 0,
      louvores: 0,
      testemunhos: 0,
      feliz7play: 0,
    };

    for (const item of visibleShorts) {
      if (!seenSet.has(item.id)) {
        unseenCount += 1;
        perMainCat[item.category] += 1;
      }
    }

    let minMainUnseen = Infinity;
    if (activeCategory === 'all') {
      for (const cat of MAIN_ALL_CATEGORIES) {
        if (perMainCat[cat] < minMainUnseen) {
          minMainUnseen = perMainCat[cat];
        }
      }
    }

    return { unseenCount, minMainUnseen };
  }, [visibleShorts, activeCategory]);

  // Automatically load more videos from YouTube as unseen videos run low or the user approaches the end of any feed,
  // and fetch a fresh YouTube batch once whenever switching into a specific category.
  useEffect(() => {
    if (loading || isRefreshing || activeCategory === 'salvos') return;
    if (trimmedSubmittedSearch.length >= 2) return;
    const needsCategoryWarmup =
      !trimmedSubmittedSearch &&
      activeCategory !== 'all' &&
      !fetchedCategoryBatchRef.current.has(activeCategory);
    const needsAllDiversification =
      !trimmedSubmittedSearch &&
      activeCategory === 'all' &&
      unseenStockSummary.minMainUnseen < 8 &&
      allBalanceRetryCountRef.current < 3;
    const lowStockInCategory =
      !trimmedSubmittedSearch &&
      (unseenStockSummary.unseenCount < 25 || needsAllDiversification);
    if (
      visibleShorts.length === 0 ||
      needsCategoryWarmup ||
      lowStockInCategory ||
      activeIndex >= visibleShorts.length - 6
    ) {
      if (needsCategoryWarmup) {
        fetchedCategoryBatchRef.current.add(activeCategory);
      }
      if (needsAllDiversification) {
        allBalanceRetryCountRef.current += 1;
      }
      loadMoreShorts();
    }
  }, [
    activeIndex,
    visibleShorts.length,
    unseenStockSummary,
    activeCategory,
    trimmedSubmittedSearch,
    loading,
    isRefreshing,
    paginationRetryTick,
    loadMoreShorts,
  ]);

  const handleSelectCategory = useCallback(
    (cat: ShortCategory) => {
      const currentId = visibleShortsRef.current[activeIndexRef.current]?.id;
      if (currentId) {
        markShortSeen(currentId);
      }
      if (!trimmedSubmittedSearch && cat !== 'salvos') {
        reshuffleUnseenFeed(cat);
      }
      emptyRetryCountRef.current = 0;
      allBalanceRetryCountRef.current = 0;
      setActiveCategory(cat);
      setActiveIndex(0);
      if (feedRef.current) {
        feedRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
    },
    [trimmedSubmittedSearch, markShortSeen, reshuffleUnseenFeed]
  );

  // Automatically re-prioritize and shuffle unseen videos when returning via browser history (pageshow)
  // or resuming the app/tab at the start of the feed after being away
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !submittedSearchQuery.trim() && activeCategory !== 'salvos') {
        reshuffleUnseenFeed(activeCategory);
        setActiveIndex(0);
        if (feedRef.current) {
          feedRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
      }
    };
    const handleVisibilityResume = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
        return;
      }
      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (
        hiddenAt !== null &&
        Date.now() - hiddenAt > 90_000 &&
        !submittedSearchQuery.trim() &&
        activeCategory !== 'salvos' &&
        activeIndex === 0
      ) {
        reshuffleUnseenFeed(activeCategory);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityResume);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityResume);
    };
  }, [activeCategory, activeIndex, submittedSearchQuery, reshuffleUnseenFeed]);

  const scrollToIndex = useCallback((targetIdx: number) => {
    const total = visibleShortsRef.current.length;
    if (total === 0) return;
    const clamped = Math.max(0, Math.min(total - 1, targetIdx));
    if (feedRef.current && feedRef.current.scrollTop !== 0) {
      feedRef.current.scrollTop = 0;
    }
    setActiveIndex(clamped);
  }, []);

  const handlePrevShort = useCallback(() => {
    scrollToIndex(activeIndexRef.current - 1);
  }, [scrollToIndex]);

  const handleNextShort = useCallback(() => {
    scrollToIndex(activeIndexRef.current + 1);
  }, [scrollToIndex]);

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
        scrollToIndex(activeIndexRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setAudioUnlocked(true);
        scrollToIndex(activeIndexRef.current - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToIndex, shareTarget]);

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
    const currentId = visibleShortsRef.current[activeIndexRef.current]?.id;
    if (currentId) {
      markShortSeen(currentId);
    }
    loadShorts(true);
  }, [markShortSeen, loadShorts]);

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
    const canLoadMore = hasMoreByCategoryRef.current[activeCategory] ?? true;
    const currentIdx = activeIndexRef.current;
    const total = visibleShortsRef.current.length;
    if (currentIdx < total - 1) {
      scrollToIndex(currentIdx + 1);
    } else if (canLoadMore && activeCategory !== 'salvos') {
      loadMoreShorts();
    } else {
      scrollToIndex(0);
    }
  }, [scrollToIndex, activeCategory, loadMoreShorts]);

  const handleSubmitSearch = useCallback((rawTerm: string) => {
    const clean = rawTerm.trim();
    if (clean.length < 2) return;
    setSearchQuery(clean);
    setSubmittedSearchQuery(clean);
    setSearchViewMode('results');
    setSearchSubmitTick((t) => t + 1);
  }, []);

  const handleClearSearch = useCallback(() => {
    const hadSubmitted = trimmedSubmittedSearch.length > 0;
    setSearchQuery('');
    setSubmittedSearchQuery('');
    setSearchViewMode('player');
    setMobileSearchOpen(false);
    if (hadSubmitted && activeCategory !== 'salvos') {
      reshuffleUnseenFeed(activeCategory);
    }
    setActiveIndex(0);
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [trimmedSubmittedSearch, activeCategory, reshuffleUnseenFeed]);

  const handleSelectSearchVideo = useCallback((index: number) => {
    setAudioUnlocked(true);
    setSearchViewMode('player');
    setMobileSearchOpen(false);
    if (feedRef.current && feedRef.current.scrollTop !== 0) {
      feedRef.current.scrollTop = 0;
    }
    setActiveIndex(index);
  }, []);

  const handleToggleAutoAdvance = useCallback(() => {
    setAutoAdvance((prev) => !prev);
  }, []);

  const handleOpenShareModal = useCallback((short: ChristianShort) => {
    setShareTarget(short);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShareTarget(null);
  }, []);

  const handleOpenMobileSearch = useCallback(() => {
    setMobileSearchOpen(true);
  }, []);

  const handleCloseMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
  }, []);

  const handleShowSearchResultsView = useCallback(() => {
    setSearchViewMode('results');
  }, []);

  const handleResetToAllVideos = useCallback(() => {
    handleClearSearch();
    handleSelectCategory('all');
  }, [handleClearSearch, handleSelectCategory]);

  const isSearchActive = trimmedSubmittedSearch.length >= 2;
  const showingSearchResults = isSearchActive && searchViewMode === 'results';

  return (
    <div
      className={
        isNativePipMode
          ? 'h-[100dvh] w-screen bg-black text-zinc-100 overflow-hidden'
          : 'h-[100dvh] max-h-[100dvh] lg:h-auto lg:max-h-none lg:min-h-screen flex flex-col bg-black text-zinc-100 overflow-hidden lg:overflow-visible safe-pb lg:pb-0 w-full max-w-full'
      }
    >
      {!isNativePipMode && (
        <TopBar
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Mobile compact single-line category / search bar (stays well below 15% sticky height cap) */}
      {!isNativePipMode && (
        <div className="lg:hidden shrink-0 z-30 bg-black/65 backdrop-blur-md border-b border-white/[0.06] px-3 h-11 flex items-center gap-2 safe-px">
        {mobileSearchOpen ? (
          <div className="flex items-center gap-1.5 w-full">
            <button
              type="button"
              onClick={handleCloseMobileSearch}
              aria-label="Voltar às categorias"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white shrink-0"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="flex-1 min-w-0">
              <SearchBoxWithSuggestions
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSubmitSearch}
                onClear={handleClearSearch}
                catalogShorts={allShorts}
                apiBaseUrl={API_BASE_URL}
                isSearching={isSearching}
                autoFocus
                compact
                placeholder="Pesquisar no YouTube..."
              />
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleOpenMobileSearch}
              aria-label="Pesquisar vídeos"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/[0.06] shrink-0 transition-colors"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            {isSearchActive && searchViewMode === 'player' ? (
              <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={handleShowSearchResultsView}
                  className="flex items-center gap-1.5 min-w-0 text-xs font-semibold text-white bg-white/[0.06] border border-white/[0.08] px-2.5 py-1.5 rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">Resultados: “{submittedSearchQuery}”</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Fechar pesquisa"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white shrink-0"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0 h-full">
                {MOBILE_FILTERS.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`relative h-full px-2.5 flex items-center text-xs bg-transparent whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-zinc-400 font-medium hover:text-zinc-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-2 right-2 bottom-0 h-0.5 bg-white rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
        </div>
      )}

      {/* Main 3-Column Studio Workspace on Desktop / Exact Viewport Feed on Mobile */}
      <main
        className={
          isNativePipMode
            ? 'fixed inset-0 z-50 bg-black flex items-stretch justify-center overflow-hidden'
            : 'flex-1 min-h-0 overflow-hidden lg:overflow-visible max-w-[1360px] w-full mx-auto lg:px-6 lg:py-6 flex items-stretch lg:items-start justify-center lg:gap-8'
        }
      >
        {!isNativePipMode && (
          <ShortsSidebar
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSubmitSearch}
            onClearSearch={handleClearSearch}
            catalogShorts={allShorts}
            apiBaseUrl={API_BASE_URL}
            isSearching={isSearching}
            onSelectCategory={handleSelectCategory}
            categoryCounts={categoryCounts}
            totalCount={todosFeedCount}
            savedCount={savedIds.length}
            sourceMode={sourceMode}
            apiKeyConfigured={apiKeyConfigured}
          />
        )}

        {showingSearchResults && !isNativePipMode ? (
          <Suspense
            fallback={
              <div className="flex-1 w-full min-h-[260px] flex flex-col items-center justify-center gap-3 text-zinc-300 px-6 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
                <p className="text-sm font-medium">Carregando resultados...</p>
              </div>
            }
          >
            <SearchResultsView
              query={submittedSearchQuery}
              items={visibleShorts}
              activeCategory={activeCategory}
              categoryCounts={categoryCounts}
              todosCount={todosFeedCount}
              isSearching={isSearching}
              isLoadingMore={isLoadingMore}
              hasMore={searchHasMore}
              onSelectCategory={handleSelectCategory}
              onSelectVideo={handleSelectSearchVideo}
              onLoadMore={loadMoreShorts}
              onExitSearch={handleClearSearch}
            />
          </Suspense>
        ) : (
          <>
            {/* Center Vertical Shorts Stage */}
            <section
              aria-label="Reprodutor vertical de vídeos cristãos"
              className="w-full h-full min-h-0 lg:h-auto lg:w-auto flex-1 flex flex-col items-center justify-center gap-2.5"
            >
              {isSearchActive && !isNativePipMode && (
                <div className="hidden lg:flex w-full max-w-[438px] items-center justify-between gap-2 px-1">
                  <button
                    type="button"
                    onClick={handleShowSearchResultsView}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate max-w-[260px]">
                      Resultados para “{submittedSearchQuery}”
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Limpar busca</span>
                  </button>
                </div>
              )}

              <div
                className={
                  isNativePipMode
                    ? 'w-full h-full bg-black overflow-hidden relative'
                    : 'w-full h-full lg:w-auto lg:aspect-[9/16] lg:max-w-[438px] lg:h-[calc(100vh-8.75rem)] lg:max-h-[760px] bg-black lg:rounded-2xl overflow-hidden shadow-2xl border-0 lg:border lg:border-zinc-800/90 relative'
                }
              >
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
                      onClick={handleRefreshFeed}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition-colors cursor-pointer"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : visibleShorts.length === 0 && isSearching ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-300 px-6 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
                    <p className="text-sm font-medium">
                      Buscando vídeos no YouTube...
                    </p>
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
                      onClick={handleResetToAllVideos}
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
                    isNativePipActive={isNativePipMode}
                    savedSet={savedSet}
                    feedRef={feedRef}
                    onActiveIndexChange={setActiveIndex}
                    onAudioUnlocked={handleUnlockAudio}
                    onToggleSave={handleToggleSave}
                    onShare={handleOpenShareModal}
                    onRefresh={handleRefreshFeed}
                    onEnded={handleVideoEnded}
                  />
                )}
              </div>
            </section>

            {!isNativePipMode && (
              <Suspense
                fallback={
                  <aside
                    aria-hidden="true"
                    className="hidden xl:block w-72 shrink-0 h-[calc(100vh-8.75rem)] max-h-[760px]"
                  />
                }
              >
                <RightQueuePanel
                  items={visibleShorts}
                  activeIndex={activeIndex}
                  autoAdvance={autoAdvance}
                  isRefreshing={isRefreshing}
                  onToggleAutoAdvance={handleToggleAutoAdvance}
                  onPrev={handlePrevShort}
                  onNext={handleNextShort}
                  onSelectIndex={scrollToIndex}
                  onShare={handleOpenShareModal}
                  onRefresh={handleRefreshFeed}
                />
              </Suspense>
            )}
          </>
        )}
      </main>

      {!isNativePipMode && (
        <>
          <ShareModal
            short={shareTarget}
            isOpen={Boolean(shareTarget)}
            onClose={handleCloseShareModal}
          />

          <OfflineIndicator />
        </>
      )}
    </div>
  );
}

export default App;
