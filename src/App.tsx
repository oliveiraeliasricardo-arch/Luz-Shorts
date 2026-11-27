import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellRing,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SearchBoxWithSuggestions } from './components/SearchBoxWithSuggestions';
import { ShareModal } from './components/ShareModal';
import { ShortsFeedStage } from './components/ShortsFeedStage';
import { ShortsSidebar } from './components/ShortsSidebar';
import { TopBar } from './components/TopBar';
import { useVideoNotifications } from './hooks/useVideoNotifications';

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
  fetchFastNativeSeed,
  fetchShortsOnNativeDevice,
  isNativeCapacitorApp,
} from './utils/nativeShortsFallback';
import { getViewportOrientationState } from './utils/screenOrientation';
import {
  buildDiverseFeed,
  extractFuzzyContentKey,
  isUpcomingOrPremiereEntry,
  normalizeTitleKey,
} from './shared/curatorCore';
import type { ChristianShort, ContentCategory, ShortCategory, ShortsApiResponse } from './types/shorts';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const SAVED_STORAGE_KEY = 'gracaplay_saved_ids_v1';
const SAVED_SHORTS_STORAGE_KEY = 'gracaplay_saved_shorts_v1';
const SEEN_STORAGE_KEY = 'gracaplay_seen_ids_v1';
const SEEN_TITLES_STORAGE_KEY = 'gracaplay_seen_titles_v1';
const LAST_SESSION_TOP_KEY = 'gracaplay_last_top_v1';
const FEED_CACHE_STORAGE_KEY = 'gracaplay_feed_cache_v2';
const LEGACY_FEED_CACHE_STORAGE_KEY = 'gracaplay_feed_cache_v1';
const LEGACY_SAVED_STORAGE_KEY = 'luz_shorts_saved_ids_v1';
const LEGACY_SEEN_STORAGE_KEY = 'luz_shorts_seen_ids_v1';
const MAX_SEEN_IDS = 8000;
const MAX_SEEN_TITLES = 5000;
const MAX_SURFACED_TOP_IDS = 4000;
const MAX_CACHED_FEED_ITEMS = 220;

const MAIN_ALL_CATEGORIES: ContentCategory[] = [
  'pregacoes',
  'biblia',
  'louvores',
  'testemunhos',
];

function createFeedRequestSeed(): { seed: number; randomOffset: number } {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(2);
    crypto.getRandomValues(buf);
    return {
      seed: (buf[0] % 2_147_483_646) + 1,
      randomOffset: buf[1] % 10_000,
    };
  }
  return {
    seed: Math.floor(Math.random() * 2_147_483_646) + 1,
    randomOffset: Math.floor(Math.random() * 10_000),
  };
}

function getItemTitleKeys(title: string): string[] {
  const keys: string[] = [];
  const exactKey = normalizeTitleKey(title);
  if (exactKey.length >= 14) keys.push(exactKey);
  const fuzzyKey = extractFuzzyContentKey(title);
  if (fuzzyKey && fuzzyKey !== exactKey) keys.push(fuzzyKey);
  return keys;
}

function isItemRetired(
  item: ChristianShort,
  seenSet: Set<string>,
  priorSurfacedSet: Set<string>,
  seenTitleSet: Set<string>
): boolean {
  if (seenSet.has(item.id) || priorSurfacedSet.has(item.id)) {
    return true;
  }
  const titleKeys = getItemTitleKeys(item.title);
  return titleKeys.some((k) => seenTitleSet.has(k));
}

function filterFreshUnseenItems(
  source: ChristianShort[],
  seenIds: string[],
  priorSurfacedIds: string[],
  seenTitleKeys: string[]
): ChristianShort[] {
  const seenSet = new Set(seenIds);
  const priorSurfacedSet = new Set(priorSurfacedIds);
  const seenTitleSet = new Set(seenTitleKeys);
  const batchIds = new Set<string>();
  const batchTitles = new Set<string>();

  const fresh: ChristianShort[] = [];
  for (const item of source) {
    if (batchIds.has(item.id)) continue;
    if (isItemRetired(item, seenSet, priorSurfacedSet, seenTitleSet)) continue;
    const tKeys = getItemTitleKeys(item.title);
    if (tKeys.some((k) => batchTitles.has(k))) continue;

    batchIds.add(item.id);
    for (const k of tKeys) batchTitles.add(k);
    fresh.push(item);
  }
  return fresh;
}

function prioritizeAndShuffleFeed(
  source: ChristianShort[],
  seenIds: string[],
  priorSurfacedIds: string[],
  seenTitleKeys: string[]
): ChristianShort[] {
  const unseenFresh = filterFreshUnseenItems(
    source,
    seenIds,
    priorSurfacedIds,
    seenTitleKeys
  );
  return buildDiverseFeed(unseenFresh, true);
}

function extractSessionTopIds(items: ChristianShort[]): string[] {
  const picked = new Set<string>();
  for (const item of items.filter((i) => i.category !== 'feliz7play').slice(0, 12)) {
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

function getSharedVideoIdFromUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = new URLSearchParams(window.location.search).get('v')?.trim() || '';
    return /^[a-zA-Z0-9_-]{11}$/.test(raw) ? raw : '';
  } catch {
    return '';
  }
}

function readCachedFeedSnapshot(): ChristianShort[] {
  try {
    try {
      localStorage.removeItem(LEGACY_FEED_CACHE_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    const raw = localStorage.getItem(FEED_CACHE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ChristianShort =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.category === 'string' &&
        typeof item.embedUrl === 'string'
    );
  } catch {
    return [];
  }
}

function readSavedShortsSnapshot(): Record<string, ChristianShort> {
  try {
    const raw = localStorage.getItem(SAVED_SHORTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result: Record<string, ChristianShort> = {};
    for (const [id, item] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as ChristianShort).id === 'string' &&
        typeof (item as ChristianShort).title === 'string' &&
        typeof (item as ChristianShort).category === 'string'
      ) {
        result[id] = item as ChristianShort;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeSavedShortsSnapshot(
  map: Record<string, ChristianShort>,
  savedIds: string[]
): void {
  try {
    const next: Record<string, ChristianShort> = {};
    for (const id of savedIds) {
      const item = map[id];
      if (!item) continue;
      next[id] =
        item.description.length > 160
          ? { ...item, description: `${item.description.slice(0, 157)}...` }
          : item;
    }
    localStorage.setItem(SAVED_SHORTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
}

function writeCachedFeedSnapshot(
  items: ChristianShort[],
  seenSet: Set<string>,
  surfacedSet: Set<string>,
  seenTitleSet: Set<string>
): void {
  try {
    const unseenFresh = items.filter(
      (item) => !isItemRetired(item, seenSet, surfacedSet, seenTitleSet)
    );
    if (unseenFresh.length === 0) {
      localStorage.removeItem(FEED_CACHE_STORAGE_KEY);
      return;
    }
    const compact = unseenFresh.slice(0, MAX_CACHED_FEED_ITEMS).map((item) =>
      item.description.length > 160
        ? { ...item, description: `${item.description.slice(0, 157)}...` }
        : item
    );
    localStorage.setItem(FEED_CACHE_STORAGE_KEY, JSON.stringify(compact));
  } catch {
    // Ignore storage quota errors
  }
}

function foldSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function App() {
  const [allShorts, setAllShorts] = useState<ChristianShort[]>(() => {
    const cachedRaw = readCachedFeedSnapshot().filter(
      (item) => !isUpcomingOrPremiereEntry(item.title, item.description, item.publishedAt)
    );
    if (cachedRaw.length === 0) return [];
    const initialSeen = readStoredIdList(SEEN_STORAGE_KEY, LEGACY_SEEN_STORAGE_KEY);
    const initialTop = readStoredIdList(LAST_SESSION_TOP_KEY);
    const initialTitles = readStoredIdList(SEEN_TITLES_STORAGE_KEY);
    const prioritized = prioritizeAndShuffleFeed(
      cachedRaw,
      initialSeen,
      initialTop,
      initialTitles
    );
    const sharedVideoId = getSharedVideoIdFromUrl();
    if (sharedVideoId) {
      const sharedIdx = prioritized.findIndex((item) => item.id === sharedVideoId);
      if (sharedIdx >= 0) {
        const reordered = [...prioritized];
        const [picked] = reordered.splice(sharedIdx, 1);
        return [picked, ...reordered];
      }
      return [];
    }
    return prioritized;
  });
  const [sourceMode, setSourceMode] = useState<'youtube_api' | 'curated_rss'>('curated_rss');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ShortCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchViewMode, setSearchViewMode] = useState<'results' | 'player'>('player');
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readStoredIdList(SAVED_STORAGE_KEY, LEGACY_SAVED_STORAGE_KEY)
  );
  const [savedShortsById, setSavedShortsById] = useState<Record<string, ChristianShort>>(() =>
    readSavedShortsSnapshot()
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [loading, setLoading] = useState(() => allShorts.length === 0);
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
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const videoNotifications = useVideoNotifications(API_BASE_URL);
  const [categorySwitchBanner, setCategorySwitchBanner] = useState<{
    label: string;
    direction: -1 | 1;
    nonce: number;
  } | null>(null);
  const [emptyDragX, setEmptyDragX] = useState(0);
  const [isEmptyDragging, setIsEmptyDragging] = useState(false);
  const [viewportOrientation, setViewportOrientation] = useState(() =>
    getViewportOrientationState()
  );
  const [isNarrowScreen, setIsNarrowScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
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
  const emptyStageRef = useRef<HTMLDivElement | null>(null);
  const mobileFilterTabRefs = useRef<Partial<Record<ShortCategory, HTMLButtonElement | null>>>({});
  const categoryBannerTimerRef = useRef<number | null>(null);
  const seenIdsRef = useRef<string[]>(
    readStoredIdList(SEEN_STORAGE_KEY, LEGACY_SEEN_STORAGE_KEY)
  );
  const seenIdsSetRef = useRef<Set<string>>(new Set(seenIdsRef.current));
  const seenTitleKeysRef = useRef<string[]>(readStoredIdList(SEEN_TITLES_STORAGE_KEY));
  const seenTitleKeysSetRef = useRef<Set<string>>(new Set(seenTitleKeysRef.current));
  const lastSessionTopRef = useRef<string[]>(readStoredIdList(LAST_SESSION_TOP_KEY));
  const savedShortsByIdRef = useRef<Record<string, ChristianShort>>(savedShortsById);
  const allShortsRef = useRef<ChristianShort[]>(allShorts);
  const visibleShortsRef = useRef<ChristianShort[]>([]);
  const activeIndexRef = useRef<number>(activeIndex);
  const hasMoreByCategoryRef = useRef<Record<string, boolean>>(hasMoreByCategory);
  const prevActiveShortRef = useRef<ChristianShort | undefined>(undefined);
  const categoryCursorsRef = useRef<Record<string, string | null>>({});
  const fetchedCategoryBatchRef = useRef<Set<string>>(new Set());
  const emptyRetryCountRef = useRef(0);
  const allBalanceRetryCountRef = useRef(0);
  const consecutiveUnplayableRef = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const activeSearchTermRef = useRef('');
  const remoteSearchQueryRef = useRef('');
  const remoteSearchLoadedCatsRef = useRef<Set<string>>(new Set());
  const lastSearchSubmitTickRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);

  activeIndexRef.current = activeIndex;
  hasMoreByCategoryRef.current = hasMoreByCategory;
  savedShortsByIdRef.current = savedShortsById;

  useEffect(() => {
    allShortsRef.current = allShorts;
  }, [allShorts]);

  // Open specific video immediately when user taps a background push notification
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    const handleSwMessage = async (event: MessageEvent<{ type?: string; videoId?: string }>) => {
      if (event.data?.type !== 'GRACAPLAY_OPEN_VIDEO' || !event.data.videoId) return;
      const targetId = event.data.videoId;
      if (!/^[a-zA-Z0-9_-]{11}$/.test(targetId)) return;

      setSearchQuery('');
      setSubmittedSearchQuery('');
      setSearchViewMode('player');
      setMobileSearchOpen(false);
      setActiveCategory('all');

      const current = allShortsRef.current;
      const existingIdx = current.findIndex((i) => i.id === targetId);
      if (existingIdx >= 0) {
        const reordered = [...current];
        const [picked] = reordered.splice(existingIdx, 1);
        const nextAll = [picked, ...reordered];
        allShortsRef.current = nextAll;
        setAllShorts(nextAll);
        setActiveIndex(0);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/shorts/video/${targetId}`);
        if (!res.ok) return;
        const single = (await res.json()) as ChristianShort;
        const nextAll = [single, ...allShortsRef.current.filter((i) => i.id !== single.id)];
        allShortsRef.current = nextAll;
        setAllShorts(nextAll);
        setActiveIndex(0);
      } catch {
        // Ignore network errors when deep-linking from notification
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, []);

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

  useEffect(() => {
    const syncOrientation = () => {
      setViewportOrientation(getViewportOrientationState());
      setIsNarrowScreen(window.innerWidth < 1024);
    };

    window.addEventListener('resize', syncOrientation);
    window.addEventListener('orientationchange', syncOrientation);
    document.addEventListener('fullscreenchange', syncOrientation);

    return () => {
      window.removeEventListener('resize', syncOrientation);
      window.removeEventListener('orientationchange', syncOrientation);
      document.removeEventListener('fullscreenchange', syncOrientation);
    };
  }, []);

  const persistNextSessionTopIds = useCallback((ids: string[], updateInMemoryRef = false) => {
    const next = Array.from(new Set([...ids, ...lastSessionTopRef.current])).slice(
      0,
      MAX_SURFACED_TOP_IDS
    );
    if (updateInMemoryRef) {
      lastSessionTopRef.current = next;
    }
    try {
      localStorage.setItem(LAST_SESSION_TOP_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const markShortsSeenBatch = useCallback(
    (items: Array<{ id?: string; title?: string }>) => {
      if (items.length === 0) return;
      const incomingIds: string[] = [];
      const incomingTitleKeys: string[] = [];
      for (const entry of items) {
        if (entry.id) incomingIds.push(entry.id);
        if (entry.title) {
          incomingTitleKeys.push(...getItemTitleKeys(entry.title));
        }
      }
      if (incomingIds.length === 0) return;

      const incomingIdSet = new Set(incomingIds);
      const nextIds = [
        ...Array.from(incomingIdSet),
        ...seenIdsRef.current.filter((id) => !incomingIdSet.has(id)),
      ].slice(0, MAX_SEEN_IDS);
      seenIdsRef.current = nextIds;
      seenIdsSetRef.current = new Set(nextIds);
      try {
        localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(nextIds));
      } catch {
        // Ignore storage quota errors
      }

      if (incomingTitleKeys.length > 0) {
        const incomingTitleSet = new Set(incomingTitleKeys);
        const nextTitles = [
          ...Array.from(incomingTitleSet),
          ...seenTitleKeysRef.current.filter((k) => !incomingTitleSet.has(k)),
        ].slice(0, MAX_SEEN_TITLES);
        seenTitleKeysRef.current = nextTitles;
        seenTitleKeysSetRef.current = new Set(nextTitles);
        try {
          localStorage.setItem(SEEN_TITLES_STORAGE_KEY, JSON.stringify(nextTitles));
        } catch {
          // Ignore storage quota errors
        }
      }
    },
    []
  );

  const markShortSeen = useCallback(
    (shortId: string | undefined, shortTitle?: string) => {
      if (!shortId) return;
      markShortsSeenBatch([{ id: shortId, title: shortTitle }]);
    },
    [markShortsSeenBatch]
  );

  const reshuffleUnseenFeed = useCallback((targetCat: ShortCategory) => {
    const currentList = allShortsRef.current;
    if (currentList.length === 0 || targetCat === 'salvos') return;

    const nextItems = prioritizeAndShuffleFeed(
      currentList,
      seenIdsRef.current,
      lastSessionTopRef.current,
      seenTitleKeysRef.current
    );

    allShortsRef.current = nextItems;
    setAllShorts(nextItems);
    writeCachedFeedSnapshot(
      nextItems,
      seenIdsSetRef.current,
      new Set(lastSessionTopRef.current),
      seenTitleKeysSetRef.current
    );
  }, []);

  const orderResponseItems = useCallback((orderedSource: ChristianShort[]) => {
    const playableOnly = orderedSource.filter(
      (item) => !isUpcomingOrPremiereEntry(item.title, item.description, item.publishedAt)
    );
    const unseenFresh = filterFreshUnseenItems(
      playableOnly,
      seenIdsRef.current,
      lastSessionTopRef.current,
      seenTitleKeysRef.current
    );
    const items = buildDiverseFeed(unseenFresh, true);
    const nextSessionTop = extractSessionTopIds(items);
    return { items, nextSessionTop };
  }, []);

  const applyFeedPayload = useCallback(
    async (
      data: ShortsApiResponse,
      forceRefresh: boolean,
      preserveActivePlayback: boolean
    ) => {
      const { items: orderedItems, nextSessionTop } = orderResponseItems(data.items);
      persistNextSessionTopIds(nextSessionTop, false);

      let items = orderedItems;
      if (!forceRefresh) {
        const sharedVideoId = getSharedVideoIdFromUrl();
        if (sharedVideoId) {
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

      if (preserveActivePlayback && !forceRefresh && allShortsRef.current.length > 0) {
        const currentVisible = visibleShortsRef.current;
        const currentIdx = activeIndexRef.current;
        const activeShort =
          currentVisible[currentIdx] ?? allShortsRef.current[0];
        const anchorIdxInAll = activeShort
          ? allShortsRef.current.findIndex((item) => item.id === activeShort.id)
          : -1;
        const prefix =
          anchorIdxInAll >= 0
            ? allShortsRef.current.slice(0, anchorIdxInAll + 1)
            : allShortsRef.current.slice(0, 1);
        const prefixIds = new Set(prefix.map((item) => item.id));
        const seenTitleSet = seenTitleKeysSetRef.current;
        const prefixTitleSet = new Set(
          prefix.flatMap((item) => getItemTitleKeys(item.title))
        );
        const merged = [
          ...prefix,
          ...items.filter(
            (item) =>
              !prefixIds.has(item.id) &&
              !getItemTitleKeys(item.title).some(
                (k) => prefixTitleSet.has(k) || seenTitleSet.has(k)
              )
          ),
        ];

        writeCachedFeedSnapshot(
          merged,
          seenIdsSetRef.current,
          new Set(lastSessionTopRef.current),
          seenTitleKeysSetRef.current
        );
        allShortsRef.current = merged;
        setAllShorts(merged);
        setSourceMode(data.sourceMode);
        setApiKeyConfigured(data.apiKeyConfigured);
        categoryCursorsRef.current = {
          ...categoryCursorsRef.current,
          all: data.nextCursor ?? null,
        };
        const canPaginate = data.hasMore ?? true;
        setHasMoreByCategory((prev) => ({
          ...prev,
          all: canPaginate,
        }));
        return;
      }

      writeCachedFeedSnapshot(
        items,
        seenIdsSetRef.current,
        new Set(lastSessionTopRef.current),
        seenTitleKeysSetRef.current
      );
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
    },
    [orderResponseItems, persistNextSessionTopIds]
  );

  const loadShorts = useCallback(
    async (forceRefresh = false) => {
      const hasInitialCache = !forceRefresh && allShortsRef.current.length > 0;
      if (forceRefresh) {
        setIsRefreshing(true);
      } else if (!hasInitialCache) {
        setLoading(true);
      }
      setError(null);
      fetchedCategoryBatchRef.current.clear();
      allBalanceRetryCountRef.current = 0;
      consecutiveUnplayableRef.current = 0;

      try {
        let data: ShortsApiResponse | null = null;
        const nativeApp = isNativeCapacitorApp();
        const { seed, randomOffset } = createFeedRequestSeed();

        const excludeIds = Array.from(
          new Set([
            ...seenIdsRef.current.slice(0, 5000),
            ...lastSessionTopRef.current.slice(0, 2900),
            ...(forceRefresh ? allShortsRef.current.slice(0, 100).map((i) => i.id) : []),
          ])
        ).slice(0, 8000);

        if (!nativeApp || API_BASE_URL.length > 0) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/shorts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                category: 'all',
                refresh: forceRefresh,
                exclude: excludeIds,
                seed,
                random_offset: randomOffset,
              }),
              signal: AbortSignal.timeout(12000),
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
          // Two-stage fast native bootstrap when APK starts cold without cached feed
          if (!forceRefresh && !hasInitialCache) {
            const seedData = await fetchFastNativeSeed(excludeIds, seed);
            if (seedData.items.length > 0) {
              await applyFeedPayload(seedData, false, false);
              setLoading(false);
              const fullData = await fetchShortsOnNativeDevice(
                false,
                0,
                excludeIds,
                seed,
                randomOffset
              );
              if (fullData.items.length > 0) {
                await applyFeedPayload(fullData, false, true);
              }
              return;
            }
          }
          data = await fetchShortsOnNativeDevice(
            forceRefresh,
            0,
            excludeIds,
            seed,
            randomOffset
          );
        }

        await applyFeedPayload(data, forceRefresh, hasInitialCache);
      } catch (err) {
        if (forceRefresh || allShortsRef.current.length === 0) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os vídeos cristãos.'
          );
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [applyFeedPayload]
  );

  useEffect(() => {
    // Rotate out any cached opening videos immediately on mount so rapid reopen stays fresh
    if (allShortsRef.current.length > 0) {
      const opening = allShortsRef.current[0];
      if (opening) {
        markShortSeen(opening.id, opening.title);
      }
      const openingIds = allShortsRef.current.slice(0, 8).map((item) => item.id);
      persistNextSessionTopIds(openingIds, false);
    }
    // Pre-warm YouTube IFrame Player API immediately on mount for faster first playback
    loadYouTubeIframeApi().catch(() => {});
    loadShorts(false);
  }, [loadShorts, markShortSeen, persistNextSessionTopIds]);

  // Unlock Web autoplay audio seamlessly on the very first user gesture anywhere
  useEffect(() => {
    if (audioUnlocked) return;
    const unlock = () => {
      setAudioUnlocked(true);
    };
    window.addEventListener('click', unlock, { once: true, capture: true });
    window.addEventListener('touchend', unlock, {
      once: true,
      capture: true,
      passive: true,
    });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener('click', unlock, { capture: true });
      window.removeEventListener('touchend', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, [audioUnlocked]);

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
        const { seed, randomOffset } = createFeedRequestSeed();
        const params = new URLSearchParams({
          q: trimmed,
          category: targetCategory,
          seed: String(seed),
          random_offset: String(randomOffset),
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

  // Live YouTube search query handled above; audio unlock handled once at lines 621-638

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  // Keep saved video metadata available even after watched items are purged from feed
  useEffect(() => {
    if (savedIds.length === 0) return;
    const candidatesById = new Map<string, ChristianShort>();
    for (const item of allShorts) candidatesById.set(item.id, item);
    if (remoteSearchShorts) {
      for (const item of remoteSearchShorts) candidatesById.set(item.id, item);
    }
    const additions: Record<string, ChristianShort> = {};
    let changed = false;
    for (const id of savedIds) {
      if (!savedShortsByIdRef.current[id]) {
        const found = candidatesById.get(id);
        if (found) {
          additions[id] = found;
          changed = true;
        }
      }
    }
    if (changed) {
      setSavedShortsById((prev) => {
        const next = { ...prev, ...additions };
        writeSavedShortsSnapshot(next, savedIds);
        return next;
      });
    }
  }, [savedIds, allShorts, remoteSearchShorts]);

  useEffect(() => {
    const missingIds = savedIds.filter(
      (id) => !savedShortsByIdRef.current[id] && /^[a-zA-Z0-9_-]{11}$/.test(id)
    );
    if (missingIds.length === 0 || (isNativeCapacitorApp() && API_BASE_URL.length === 0)) {
      return;
    }
    let cancelled = false;
    (async () => {
      const resolved: Record<string, ChristianShort> = {};
      await Promise.allSettled(
        missingIds.slice(0, 12).map(async (id) => {
          const res = await fetch(`${API_BASE_URL}/api/shorts/video/${id}`);
          if (!res.ok) return;
          const item = (await res.json()) as ChristianShort;
          if (item?.id) resolved[item.id] = item;
        })
      );
      if (cancelled || Object.keys(resolved).length === 0) return;
      setSavedShortsById((prev) => {
        const next = { ...prev, ...resolved };
        writeSavedShortsSnapshot(next, savedIds);
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
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
    const lookupById = new Map<string, ChristianShort>();

    for (const item of queryFiltered) {
      lookupById.set(item.id, item);
      counts[item.category] += 1;
      byCategory[item.category].push(item);
      if (allowFelizInSearch || item.category !== 'feliz7play') {
        todosItems.push(item);
      }
    }

    const savedItems: ChristianShort[] = [];
    const savedSearchTokens = foldSearchText(trimmedSubmittedSearch)
      .split(/\s+/)
      .filter(Boolean);
    for (const id of savedIds) {
      const item = savedShortsById[id] ?? lookupById.get(id);
      if (!item) continue;
      if (savedSearchTokens.length > 0) {
        const haystack = foldSearchText(
          `${item.title} ${item.channelTitle} ${item.description} ${item.categoryLabel}`
        );
        if (!savedSearchTokens.every((tok) => haystack.includes(tok))) continue;
      }
      savedItems.push(item);
    }

    return {
      counts,
      byCategory,
      todosItems: allowFelizInSearch ? queryFiltered : todosItems,
      todosFeedCount: allowFelizInSearch ? queryFiltered.length : todosItems.length,
      savedItems,
    };
  }, [queryFiltered, allowFelizInSearch, savedIds, savedShortsById, trimmedSubmittedSearch]);

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
      const { seed, randomOffset } = createFeedRequestSeed();

      const includeSurfacedInExclude = !isLiveSearch && activeCategory === 'all';
      const combinedExclude = Array.from(
        new Set([
          ...(isLiveSearch ? [] : seenIdsRef.current.slice(0, 4800)),
          ...(includeSurfacedInExclude ? lastSessionTopRef.current.slice(0, 2200) : []),
          ...allShorts.slice(0, 500).map((i) => i.id),
          ...allShorts.slice(-500).map((i) => i.id),
        ])
      ).slice(0, 8000);

      if (!nativeApp || API_BASE_URL.length > 0) {
        const cursorToUse = isLiveSearch ? searchCursor : categoryCursor;

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
            seed,
            random_offset: randomOffset,
          }),
          signal: AbortSignal.timeout(12000),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          data = (await res.json()) as ShortsApiResponse;
        }

        if (
          !isLiveSearch &&
          activeCategory !== 'all' &&
          visibleShortsRef.current.length === 0 &&
          (!data || data.items.length === 0)
        ) {
          const fallbackRes = await fetch(`${API_BASE_URL}/api/shorts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category: activeCategory,
              refresh: true,
              exclude: seenIdsRef.current.slice(0, 5000),
              seed,
              random_offset: randomOffset,
            }),
            signal: AbortSignal.timeout(12000),
          });
          const fbType = fallbackRes.headers.get('content-type') || '';
          if (fallbackRes.ok && fbType.includes('application/json')) {
            const fbData = (await fallbackRes.json()) as ShortsApiResponse;
            if (fbData.items.length > 0) {
              data = fbData;
            }
          }
        }
      } else if (!isLiveSearch) {
        const pageNum = Number(categoryCursor || '1');
        if (Number.isFinite(pageNum) && pageNum > 0) {
          data = await fetchShortsOnNativeDevice(
            false,
            pageNum,
            combinedExclude,
            seed,
            randomOffset
          );
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
        const seenSet = seenIdsSetRef.current;
        const surfacedSet =
          activeCategory === 'all' ? new Set(lastSessionTopRef.current) : new Set<string>();
        const surfacedListForFilter =
          activeCategory === 'all' ? lastSessionTopRef.current : [];
        const seenTitleSet = seenTitleKeysSetRef.current;
        const existingAll = new Set(allShorts.map((i) => i.id));
        const freshCount = data.items.filter(
          (i) =>
            !existingAll.has(i.id) &&
            !isItemRetired(i, seenSet, surfacedSet, seenTitleSet)
        ).length;
        const currentVisible = visibleShortsRef.current;
        const currentIdx = activeIndexRef.current;
        const activeId = currentVisible[currentIdx]?.id;
        setAllShorts((prev) => {
          const existing = new Set(prev.map((i) => i.id));
          const anchorIdx = activeId ? prev.findIndex((i) => i.id === activeId) : -1;
          const head = anchorIdx >= 0 ? prev.slice(0, anchorIdx + 1) : [];
          const tail = anchorIdx >= 0 ? prev.slice(anchorIdx + 1) : prev;

          const headIds = new Set(head.map((i) => i.id));
          const headTitles = new Set(head.flatMap((i) => getItemTitleKeys(i.title)));

          const filteredIncoming = data!.items.filter(
            (i) =>
              !existing.has(i.id) &&
              !headIds.has(i.id) &&
              !isItemRetired(i, seenSet, surfacedSet, seenTitleSet) &&
              !getItemTitleKeys(i.title).some((k) => headTitles.has(k))
          );
          const filteredTail = tail.filter(
            (i) =>
              !headIds.has(i.id) &&
              !isItemRetired(i, seenSet, surfacedSet, seenTitleSet) &&
              !getItemTitleKeys(i.title).some((k) => headTitles.has(k))
          );

          const tailUnseenCombined = filterFreshUnseenItems(
            [...filteredIncoming, ...filteredTail],
            seenIdsRef.current,
            surfacedListForFilter,
            seenTitleKeysRef.current
          );
          const nextAll = [...head, ...buildDiverseFeed(tailUnseenCombined, true)];
          writeCachedFeedSnapshot(
            nextAll,
            seenIdsSetRef.current,
            new Set(lastSessionTopRef.current),
            seenTitleKeysSetRef.current
          );
          return nextAll;
        });
        categoryCursorsRef.current[activeCategory] = data.nextCursor ?? null;
        const nextHasMore = Boolean(data.hasMore);
        setHasMoreByCategory((prev) => ({
          ...prev,
          [activeCategory]: nextHasMore,
        }));
        if (freshCount === 0 && nextHasMore && emptyRetryCountRef.current < 4) {
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
      const currentIdx = activeIndexRef.current;
      const displayedSoFar = visibleShortsRef.current.slice(0, currentIdx + 1);
      if (displayedSoFar.length > 0 && activeCategory !== 'salvos') {
        markShortsSeenBatch(displayedSoFar);
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
    [activeCategory, trimmedSubmittedSearch, markShortsSeenBatch, reshuffleUnseenFeed]
  );

  const categoryNavigation = useMemo(() => {
    const sequence =
      trimmedSubmittedSearch.length >= 2 ? MOBILE_FILTERS.slice(0, 6) : MOBILE_FILTERS;
    const currentIdx = sequence.findIndex((item) => item.id === activeCategory);
    const resolvedIdx = currentIdx >= 0 ? currentIdx : 0;
    const prevItem = resolvedIdx > 0 ? sequence[resolvedIdx - 1] : null;
    const nextItem = resolvedIdx < sequence.length - 1 ? sequence[resolvedIdx + 1] : null;
    return {
      sequence,
      currentIdx: resolvedIdx,
      prevItem,
      nextItem,
    };
  }, [activeCategory, trimmedSubmittedSearch]);

  const handleStepCategory = useCallback(
    (direction: -1 | 1) => {
      const target =
        direction === -1 ? categoryNavigation.prevItem : categoryNavigation.nextItem;
      if (!target) return;
      handleSelectCategory(target.id);
      if (categoryBannerTimerRef.current) {
        window.clearTimeout(categoryBannerTimerRef.current);
      }
      setCategorySwitchBanner({
        label: target.label,
        direction,
        nonce: Date.now(),
      });
      categoryBannerTimerRef.current = window.setTimeout(() => {
        categoryBannerTimerRef.current = null;
        setCategorySwitchBanner(null);
      }, 950);
    },
    [categoryNavigation.prevItem, categoryNavigation.nextItem, handleSelectCategory]
  );

  useEffect(() => {
    return () => {
      if (categoryBannerTimerRef.current) {
        window.clearTimeout(categoryBannerTimerRef.current);
        categoryBannerTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const tabEl = mobileFilterTabRefs.current[activeCategory];
    if (tabEl) {
      tabEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategory]);

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
    setSavedIds((prev) => {
      const exists = prev.includes(shortId);
      const nextIds = exists ? prev.filter((id) => id !== shortId) : [shortId, ...prev];
      if (!exists) {
        const found =
          visibleShortsRef.current.find((i) => i.id === shortId) ??
          allShortsRef.current.find((i) => i.id === shortId);
        if (found) {
          setSavedShortsById((prevMap) => {
            const nextMap = { ...prevMap, [shortId]: found };
            writeSavedShortsSnapshot(nextMap, nextIds);
            return nextMap;
          });
        }
      } else {
        setSavedShortsById((prevMap) => {
          const nextMap = { ...prevMap };
          delete nextMap[shortId];
          writeSavedShortsSnapshot(nextMap, nextIds);
          return nextMap;
        });
      }
      return nextIds;
    });
  }, []);

  const handleUnlockAudio = useCallback(() => {
    setAudioUnlocked(true);
  }, []);

  // Track every displayed video IMMEDIATELY when activeIndex lands on it (never wait 150ms)
  // while leaving playback undisturbed until refresh, category switch, or reload.
  useEffect(() => {
    const activeShort = visibleShorts[activeIndex];
    const previousShort = prevActiveShortRef.current;
    if (previousShort && previousShort.id !== activeShort?.id) {
      markShortSeen(previousShort.id, previousShort.title);
    }
    prevActiveShortRef.current = activeShort;
    if (!activeShort) return;

    markShortSeen(activeShort.id, activeShort.title);

    const flushVisible = () => {
      const idx = activeIndexRef.current;
      const shown = visibleShortsRef.current.slice(0, idx + 1);
      if (shown.length > 0) {
        markShortsSeenBatch(shown);
      }
    };
    const handleVisibilityOrHide = () => {
      if (document.visibilityState === 'hidden') {
        flushVisible();
      }
    };
    const verifiedTimer = window.setTimeout(() => {
      consecutiveUnplayableRef.current = 0;
    }, 7000);

    window.addEventListener('pagehide', flushVisible);
    window.addEventListener('beforeunload', flushVisible);
    document.addEventListener('visibilitychange', handleVisibilityOrHide);
    return () => {
      window.clearTimeout(verifiedTimer);
      window.removeEventListener('pagehide', flushVisible);
      window.removeEventListener('beforeunload', flushVisible);
      document.removeEventListener('visibilitychange', handleVisibilityOrHide);
    };
  }, [activeIndex, visibleShorts, markShortSeen, markShortsSeenBatch]);

  const handleRefreshFeed = useCallback(() => {
    const currentIdx = activeIndexRef.current;
    const currentVisible = visibleShortsRef.current;
    const displayedSoFar = currentVisible.slice(0, currentIdx + 1);
    if (displayedSoFar.length > 0) {
      markShortsSeenBatch(displayedSoFar);
    }
    const surfacedInView = [
      ...currentVisible.slice(0, Math.max(currentIdx + 8, 24)).map((i) => i.id),
      ...allShortsRef.current.slice(0, 24).map((i) => i.id),
    ];
    if (surfacedInView.length > 0) {
      persistNextSessionTopIds(surfacedInView, true);
    }
    loadShorts(true);
  }, [markShortsSeenBatch, persistNextSessionTopIds, loadShorts]);

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

  const handleUnplayableVideo = useCallback(
    (videoId: string) => {
      if (!videoId) return;
      const targetItem =
        visibleShortsRef.current.find((i) => i.id === videoId) ??
        allShortsRef.current.find((i) => i.id === videoId);
      markShortSeen(videoId, targetItem?.title);
      persistNextSessionTopIds([videoId], true);

      if (consecutiveUnplayableRef.current >= 4) {
        return;
      }
      consecutiveUnplayableRef.current += 1;

      setRemoteSearchShorts((prev) =>
        prev ? prev.filter((item) => item.id !== videoId) : prev
      );

      const currentAll = allShortsRef.current;
      const nextAll = currentAll.filter((item) => item.id !== videoId);
      if (nextAll.length !== currentAll.length) {
        allShortsRef.current = nextAll;
        setAllShorts(nextAll);
        writeCachedFeedSnapshot(
          nextAll,
          seenIdsSetRef.current,
          new Set(lastSessionTopRef.current),
          seenTitleKeysSetRef.current
        );
      }

      const remainingTotal = Math.max(0, visibleShortsRef.current.length - 1);
      if (remainingTotal === 0) {
        if ((hasMoreByCategoryRef.current[activeCategory] ?? true) && activeCategory !== 'salvos') {
          loadMoreShorts();
        }
        return;
      }

      const currentIdx = activeIndexRef.current;
      const clampedNextIdx = Math.min(currentIdx, remainingTotal - 1);
      if (clampedNextIdx !== currentIdx) {
        setActiveIndex(clampedNextIdx);
      }

      if (
        remainingTotal - clampedNextIdx <= 3 &&
        (hasMoreByCategoryRef.current[activeCategory] ?? true) &&
        activeCategory !== 'salvos'
      ) {
        loadMoreShorts();
      }
    },
    [activeCategory, loadMoreShorts, markShortSeen, persistNextSessionTopIds]
  );

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

  const isCompactLandscape = viewportOrientation.isCompactLandscape;
  const isHorizontalMode =
    isCompactLandscape ||
    (viewportOrientation.isLandscapeViewport && viewportOrientation.isTouchDevice);

  const isSearchActive = trimmedSubmittedSearch.length >= 2;
  const showingSearchResults = isSearchActive && searchViewMode === 'results';
  const useCompactStageHud =
    isCompactLandscape || (isHorizontalMode && isNarrowScreen);
  const stageShowsEmptyContainer =
    loading ||
    (Boolean(error) && visibleShorts.length === 0) ||
    visibleShorts.length === 0;

  // Allow horizontal category swipe/wheel/mouse-drag even when the active category has 0 videos (e.g. empty "Salvos")
  useEffect(() => {
    const el = emptyStageRef.current;
    if (!el || !stageShowsEmptyContainer || showingSearchResults || isNativePipMode) {
      setEmptyDragX(0);
      setIsEmptyDragging(false);
      return;
    }

    let startX: number | null = null;
    let startY: number | null = null;
    let lastX = 0;
    let lastTime = 0;
    let vx = 0;
    let axis: 'pending' | 'horizontal' | 'ignored' = 'pending';
    let rawDeltaX = 0;
    let wheelLockUntil = 0;

    let mouseStartX: number | null = null;
    let mouseStartY: number | null = null;
    let mouseLastX = 0;
    let mouseLastTime = 0;
    let mouseVx = 0;
    let mouseAxis: 'pending' | 'horizontal' | 'ignored' = 'pending';

    const computeOffset = (dx: number) => {
      const hasTarget =
        dx > 0
          ? Boolean(categoryNavigation.prevItem)
          : Boolean(categoryNavigation.nextItem);
      if (!hasTarget) return Math.max(-44, Math.min(44, Math.round(dx * 0.22)));
      return Math.max(-132, Math.min(132, Math.round(dx * 0.56)));
    };

    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX >= 18 && absX > absY * 1.35) {
        e.preventDefault();
        const now = Date.now();
        if (now < wheelLockUntil) return;
        wheelLockUntil = now + 480;
        handleStepCategory(e.deltaX > 0 ? 1 : -1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('button, a')) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = touch.clientX;
      lastTime = performance.now();
      vx = 0;
      axis = 'pending';
      rawDeltaX = 0;
      setEmptyDragX(0);
      setIsEmptyDragging(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startX === null || startY === null || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const instVx = (touch.clientX - lastX) / dt;
      vx = vx * 0.35 + instVx * 0.65;
      lastX = touch.clientX;
      lastTime = now;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (axis === 'pending') {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'horizontal' : 'ignored';
        }
      }

      if (axis !== 'horizontal') return;
      if (Math.abs(dx) > 7) e.preventDefault();
      rawDeltaX = dx;
      setEmptyDragX(computeOffset(dx));
    };

    const onTouchEnd = () => {
      if (startX === null) return;
      const wasHorizontal = axis === 'horizontal';
      const containerWidth = el.clientWidth || 360;
      const threshold = Math.max(52, Math.min(115, containerWidth * 0.16));

      startX = null;
      startY = null;
      axis = 'pending';
      setIsEmptyDragging(false);
      setEmptyDragX(0);

      if (!wasHorizontal) return;
      if (rawDeltaX <= -threshold || (vx < -0.32 && rawDeltaX < -22)) {
        handleStepCategory(1);
      } else if (rawDeltaX >= threshold || (vx > 0.32 && rawDeltaX > 22)) {
        handleStepCategory(-1);
      }
      rawDeltaX = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('button, a')) return;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
      mouseLastX = e.clientX;
      mouseLastTime = performance.now();
      mouseVx = 0;
      mouseAxis = 'pending';
      rawDeltaX = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || mouseStartX === null || mouseStartY === null) return;
      const dx = e.clientX - mouseStartX;
      const dy = e.clientY - mouseStartY;
      const now = performance.now();
      const dt = Math.max(1, now - mouseLastTime);
      const instVx = (e.clientX - mouseLastX) / dt;
      mouseVx = mouseVx * 0.35 + instVx * 0.65;
      mouseLastX = e.clientX;
      mouseLastTime = now;

      if (mouseAxis === 'pending') {
        if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
          if (Math.abs(dx) > Math.abs(dy) * 1.35) {
            mouseAxis = 'horizontal';
            setIsEmptyDragging(true);
          } else {
            mouseAxis = 'ignored';
            return;
          }
        }
      }

      if (mouseAxis !== 'horizontal') return;
      rawDeltaX = dx;
      setEmptyDragX(computeOffset(dx));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || mouseStartX === null) return;
      const wasHorizontal = mouseAxis === 'horizontal';
      const containerWidth = el.clientWidth || 360;
      const threshold = Math.max(54, Math.min(120, containerWidth * 0.16));

      mouseStartX = null;
      mouseStartY = null;
      mouseAxis = 'pending';

      if (!wasHorizontal) return;
      setIsEmptyDragging(false);
      setEmptyDragX(0);

      if (rawDeltaX <= -threshold || (mouseVx < -0.35 && rawDeltaX < -24)) {
        handleStepCategory(1);
      } else if (rawDeltaX >= threshold || (mouseVx > 0.35 && rawDeltaX > 24)) {
        handleStepCategory(-1);
      }
      rawDeltaX = 0;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [
    stageShowsEmptyContainer,
    showingSearchResults,
    isNativePipMode,
    categoryNavigation.prevItem,
    categoryNavigation.nextItem,
    handleStepCategory,
  ]);

  return (
    <div
      className={
        isNativePipMode
          ? 'h-[100dvh] w-screen bg-black text-zinc-100 overflow-hidden'
          : isCompactLandscape
          ? 'h-[100dvh] max-h-[100dvh] flex flex-col bg-black text-zinc-100 overflow-hidden safe-pb w-full max-w-full'
          : 'h-[100dvh] max-h-[100dvh] lg:h-auto lg:max-h-none lg:min-h-screen flex flex-col bg-black text-zinc-100 overflow-hidden lg:overflow-visible safe-pb lg:pb-0 w-full max-w-full'
      }
    >
      {!isNativePipMode && !isCompactLandscape && (
        <TopBar
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          notificationsEnabled={videoNotifications.isSubscribed}
          onOpenNotifications={() => {
            videoNotifications.clearFeedback();
            setNotifModalOpen(true);
          }}
        />
      )}

      {/* Unified compact single-line bar for mobile portrait & compact landscape (stays <= 15% sticky height cap) */}
      {!isNativePipMode && (
        <div
          className={`${
            isCompactLandscape ? 'flex h-10' : 'lg:hidden flex h-11'
          } shrink-0 z-30 bg-black/65 backdrop-blur-md border-b border-white/[0.06] px-3 items-center gap-2 safe-px`}
        >
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
            {isCompactLandscape && (
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectCategory('all');
                }}
                className="flex items-center gap-1.5 text-sm font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0 pr-1"
              >
                <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-700/90 text-white flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" aria-hidden="true">
                    <path d="M8 5.5v13l10-6.5-10-6.5z" />
                  </svg>
                </span>
                <span className="gracaplay-wordmark">GraçaPlay</span>
              </a>
            )}
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
                      ref={(el) => {
                        mobileFilterTabRefs.current[cat.id] = el;
                      }}
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
            {isCompactLandscape && (
              <button
                type="button"
                onClick={() => {
                  videoNotifications.clearFeedback();
                  setNotifModalOpen(true);
                }}
                aria-label={
                  videoNotifications.isSubscribed
                    ? 'Notificações de novos vídeos ativadas'
                    : 'Ativar notificações de novos vídeos'
                }
                className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-colors cursor-pointer ${
                  videoNotifications.isSubscribed
                    ? 'border-white/25 bg-white/10 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white'
                }`}
              >
                {videoNotifications.isSubscribed ? (
                  <BellRing className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Bell className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}
          </>
        )}
        </div>
      )}

      {/* Main 3-Column Studio Workspace on Desktop / Exact Viewport Feed on Mobile & Landscape */}
      <main
        className={
          isNativePipMode
            ? 'fixed inset-0 z-50 bg-black flex items-stretch justify-center overflow-hidden'
            : isCompactLandscape
            ? 'flex-1 min-h-0 overflow-hidden w-full mx-auto px-2 py-1 flex items-center justify-center safe-px'
            : 'flex-1 min-h-0 overflow-hidden lg:overflow-visible max-w-[1360px] w-full mx-auto lg:px-6 lg:py-6 flex items-stretch lg:items-start justify-center lg:gap-8'
        }
      >
        {!isNativePipMode && !isCompactLandscape && (
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
            notificationsEnabled={videoNotifications.isSubscribed}
            onOpenNotifications={() => {
              videoNotifications.clearFeedback();
              setNotifModalOpen(true);
            }}
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
            {/* Center Shorts / Horizontal Cinema Stage */}
            <section
              aria-label={
                isHorizontalMode
                  ? 'Reprodutor horizontal de vídeos cristãos'
                  : 'Reprodutor vertical de vídeos cristãos'
              }
              className="w-full h-full min-h-0 lg:h-auto lg:w-auto flex-1 flex flex-col items-center justify-center gap-2.5"
            >
              {isSearchActive && !isNativePipMode && !isCompactLandscape && (
                <div
                  className={`hidden lg:flex w-full items-center justify-between gap-2 px-1 ${
                    isHorizontalMode ? 'max-w-[860px]' : 'max-w-[438px]'
                  }`}
                >
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
                    : isCompactLandscape
                    ? isHorizontalMode
                      ? 'w-full max-w-[min(100%,calc((100dvh-3.25rem)*16/9))] aspect-video max-h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] relative'
                      : 'h-full max-h-full w-auto aspect-[9/16] max-w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] relative'
                    : isHorizontalMode
                    ? 'w-full max-w-[min(860px,calc((100dvh-10rem)*16/9))] aspect-video max-h-full bg-black rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/90 relative'
                    : 'w-full h-full lg:w-auto lg:aspect-[9/16] lg:max-w-[438px] lg:h-[calc(100vh-8.75rem)] lg:max-h-[760px] bg-black lg:rounded-2xl overflow-hidden shadow-2xl border-0 lg:border lg:border-zinc-800/90 relative'
                }
              >
                {stageShowsEmptyContainer ? (
                  <div
                    ref={emptyStageRef}
                    className="relative w-full h-full overflow-hidden touch-none select-none"
                  >
                    {emptyDragX > 14 && categoryNavigation.prevItem && (
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl">
                        <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="whitespace-nowrap">{categoryNavigation.prevItem.label}</span>
                      </div>
                    )}
                    {emptyDragX < -14 && categoryNavigation.nextItem && (
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl">
                        <span className="whitespace-nowrap">{categoryNavigation.nextItem.label}</span>
                        <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </div>
                    )}
                    {Math.abs(emptyDragX) <= 14 && categorySwitchBanner && (
                      <div
                        key={categorySwitchBanner.nonce}
                        role="status"
                        aria-live="polite"
                        className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30"
                      >
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-xl whitespace-nowrap">
                          {categorySwitchBanner.direction === -1 && (
                            <ChevronLeft className="w-3.5 h-3.5 text-zinc-300 shrink-0" aria-hidden="true" />
                          )}
                          <span>{categorySwitchBanner.label}</span>
                          {categorySwitchBanner.direction === 1 && (
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    )}
                    <div
                      className={`w-full h-full ${
                        isEmptyDragging
                          ? 'transition-none'
                          : 'transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                      }`}
                      style={{ transform: `translate3d(${emptyDragX}px, 0, 0)` }}
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
                      ) : isSearching ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-300 px-6 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
                          <p className="text-sm font-medium">
                            Buscando vídeos no YouTube...
                          </p>
                        </div>
                      ) : (
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
                      )}
                    </div>
                  </div>
                ) : (
                  <ShortsFeedStage
                    items={visibleShorts}
                    activeIndex={activeIndex}
                    audioUnlocked={audioUnlocked}
                    autoAdvance={autoAdvance}
                    isRefreshing={isRefreshing}
                    isNativePipActive={isNativePipMode}
                    isHorizontalMode={isHorizontalMode}
                    isCompactLandscape={useCompactStageHud}
                    prevCategoryLabel={categoryNavigation.prevItem?.label ?? null}
                    nextCategoryLabel={categoryNavigation.nextItem?.label ?? null}
                    categorySwitchBanner={categorySwitchBanner}
                    savedSet={savedSet}
                    feedRef={feedRef}
                    onActiveIndexChange={setActiveIndex}
                    onAudioUnlocked={handleUnlockAudio}
                    onToggleSave={handleToggleSave}
                    onShare={handleOpenShareModal}
                    onRefresh={handleRefreshFeed}
                    onEnded={handleVideoEnded}
                    onUnplayableVideo={handleUnplayableVideo}
                    onStepCategory={handleStepCategory}
                  />
                )}
              </div>
            </section>

            {!isNativePipMode && !isCompactLandscape && !isHorizontalMode && (
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

          <NotificationSettingsModal
            isOpen={notifModalOpen}
            onClose={() => setNotifModalOpen(false)}
            isSupported={videoNotifications.isSupported}
            requiresIOSHomeScreen={videoNotifications.requiresIOSHomeScreen}
            permission={videoNotifications.permission}
            isSubscribed={videoNotifications.isSubscribed}
            isBusy={videoNotifications.isBusy}
            categories={videoNotifications.categories}
            statusMessage={videoNotifications.statusMessage}
            errorMessage={videoNotifications.errorMessage}
            onEnable={() => videoNotifications.enableNotifications()}
            onDisable={() => videoNotifications.disableNotifications()}
            onToggleCategory={(cat) => videoNotifications.toggleCategory(cat)}
            onSendTest={() => videoNotifications.sendTestNotification()}
          />

          <OfflineIndicator />
        </>
      )}
    </div>
  );
}

export default App;
