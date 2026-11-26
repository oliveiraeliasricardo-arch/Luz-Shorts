import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  PictureInPicture2,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Share2,
} from 'lucide-react';
import type { ChristianShort } from '../types/shorts';
import { isNativeCapacitorApp } from '../utils/nativeShortsFallback';
import { loadYouTubeIframeApi, type YTPlayer } from '../utils/youtubePlayerApi';
import {
  type DocumentPictureInPictureWindow,
  isDocumentPipAvailable,
  syncNativePipPlaybackState,
} from '../utils/pictureInPicture';

interface ShortsFeedStageProps {
  items: ChristianShort[];
  activeIndex: number;
  audioUnlocked: boolean;
  autoAdvance: boolean;
  isRefreshing: boolean;
  isNativePipActive?: boolean;
  isHorizontalMode?: boolean;
  isCompactLandscape?: boolean;
  prevCategoryLabel?: string | null;
  nextCategoryLabel?: string | null;
  categorySwitchBanner?: { label: string; direction: -1 | 1; nonce: number } | null;
  savedSet: Set<string>;
  feedRef: React.RefObject<HTMLDivElement | null>;
  onActiveIndexChange: (index: number) => void;
  onAudioUnlocked: () => void;
  onToggleSave: (shortId: string) => void;
  onShare: (short: ChristianShort) => void;
  onRefresh: () => void;
  onEnded: () => void;
  onUnplayableVideo?: (videoId: string) => void;
  onStepCategory?: (direction: -1 | 1) => void;
}

function formatViews(views: number | null): string | null {
  if (views === null || !Number.isFinite(views)) return null;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace('.', ',')}M visualizações`;
  if (views >= 1_000) return `${Math.round(views / 1_000)} mil visualizações`;
  return `${views} visualizações`;
}

function formatPlaybackTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0:00';
  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const mins = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const PULL_REFRESH_THRESHOLD = 76;

export const ShortsFeedStage: React.FC<ShortsFeedStageProps> = React.memo(({
  items,
  activeIndex,
  audioUnlocked,
  autoAdvance,
  isRefreshing,
  isNativePipActive = false,
  isHorizontalMode = false,
  isCompactLandscape = false,
  prevCategoryLabel = null,
  nextCategoryLabel = null,
  categorySwitchBanner = null,
  savedSet,
  feedRef,
  onActiveIndexChange,
  onAudioUnlocked,
  onToggleSave,
  onShare,
  onRefresh,
  onEnded,
  onUnplayableVideo,
  onStepCategory,
}) => {
  const playerSlotRef = useRef<HTMLDivElement | null>(null);
  const playerHostElRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pipWindowRef = useRef<DocumentPictureInPictureWindow | null>(null);
  const pipTitleElRef = useRef<HTMLDivElement | null>(null);
  const pipPlayBtnRef = useRef<HTMLButtonElement | null>(null);
  const pipNoticeTimerRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const autoplayCheckTimerRef = useRef<number | null>(null);
  const premiereGuardTimerRef = useRef<number | null>(null);
  const errorSkipTimerRef = useRef<number | null>(null);
  const hasEnteredPlayableStateRef = useRef<boolean>(false);
  const wheelLockUntilRef = useRef<number>(0);
  const horizontalWheelLockUntilRef = useRef<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const lastTouchXRef = useRef<number>(0);
  const lastTouchYRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const gestureAxisRef = useRef<'pending' | 'vertical' | 'horizontal'>('pending');
  const velocityXRef = useRef<number>(0);
  const velocityYRef = useRef<number>(0);
  const dragOffsetPxRef = useRef<number>(0);
  const horizontalDragPxRef = useRef<number>(0);
  const rawHorizontalDeltaRef = useRef<number>(0);
  const touchDraggedRef = useRef<boolean>(false);
  const pullDistanceRef = useRef<number>(0);
  const peakPullDistanceRef = useRef<number>(0);
  const longPullRefreshArmedRef = useRef<boolean>(false);
  const lastWheelTimeRef = useRef<number>(0);
  const lastWheelAbsDeltaRef = useRef<number>(0);
  const mouseDragStartXRef = useRef<number | null>(null);
  const mouseDragStartYRef = useRef<number | null>(null);
  const mouseDragLastXRef = useRef<number>(0);
  const mouseDragLastTimeRef = useRef<number>(0);
  const mouseVelocityXRef = useRef<number>(0);
  const mouseDragAxisRef = useRef<'pending' | 'horizontal' | 'ignored'>('pending');
  const slideTimerRef = useRef<number | null>(null);
  const renderedIndexRef = useRef<number>(activeIndex);
  const prevFirstItemIdRef = useRef<string | null>(items[0]?.id ?? null);
  const isScrubbingRef = useRef<boolean>(false);
  const seekGraceRef = useRef<{ target: number; until: number } | null>(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isDocPipActive, setIsDocPipActive] = useState(false);
  const [pipNotice, setPipNotice] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubSeconds, setScrubSeconds] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [horizontalDragPx, setHorizontalDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'play' | 'pause' | null>(null);

  const activeShort = items[activeIndex] ?? items[0] ?? null;
  const activeVideoId = activeShort?.id ?? null;
  const fallbackDuration =
    activeShort?.durationSeconds && activeShort.durationSeconds > 0
      ? activeShort.durationSeconds
      : 0;
  const effectiveDuration = duration > 0 ? duration : fallbackDuration;

  const activeVideoIdRef = useRef<string | null>(activeVideoId);
  const activeIndexRef = useRef(activeIndex);
  const itemsLengthRef = useRef(items.length);
  const audioUnlockedRef = useRef(audioUnlocked);
  const autoAdvanceRef = useRef(autoAdvance);
  const isRefreshingRef = useRef(isRefreshing);
  const effectiveDurationRef = useRef(effectiveDuration);
  const currentTimeRef = useRef(currentTime);
  const hasErrorRef = useRef(hasError);
  const prevCategoryLabelRef = useRef<string | null>(prevCategoryLabel);
  const nextCategoryLabelRef = useRef<string | null>(nextCategoryLabel);
  const onEndedRef = useRef(onEnded);
  const onUnplayableVideoRef = useRef(onUnplayableVideo);
  const onRefreshRef = useRef(onRefresh);
  const onAudioUnlockedRef = useRef(onAudioUnlocked);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);
  const onStepCategoryRef = useRef(onStepCategory);

  activeVideoIdRef.current = activeVideoId;
  activeIndexRef.current = activeIndex;
  itemsLengthRef.current = items.length;
  audioUnlockedRef.current = audioUnlocked;
  autoAdvanceRef.current = autoAdvance;
  isRefreshingRef.current = isRefreshing;
  effectiveDurationRef.current = effectiveDuration;
  currentTimeRef.current = currentTime;
  hasErrorRef.current = hasError;
  prevCategoryLabelRef.current = prevCategoryLabel;
  nextCategoryLabelRef.current = nextCategoryLabel;
  onEndedRef.current = onEnded;
  onUnplayableVideoRef.current = onUnplayableVideo;
  onRefreshRef.current = onRefresh;
  onAudioUnlockedRef.current = onAudioUnlocked;
  onActiveIndexChangeRef.current = onActiveIndexChange;
  onStepCategoryRef.current = onStepCategory;

  const currentFirstItemId = items[0]?.id ?? null;
  const indexDeltaFromLastRender = activeIndex - renderedIndexRef.current;
  const isListReset =
    currentFirstItemId !== prevFirstItemIdRef.current &&
    indexDeltaFromLastRender !== 0;
  const isBigNonAdjacentJump =
    indexDeltaFromLastRender !== 0 &&
    (Math.abs(indexDeltaFromLastRender) > 1 || isListReset);

  const triggerSlideWindow = useCallback((durationMs = 360) => {
    if (slideTimerRef.current) {
      window.clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
    setIsSliding(true);
    slideTimerRef.current = window.setTimeout(() => {
      slideTimerRef.current = null;
      setIsSliding(false);
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (slideTimerRef.current) {
        window.clearTimeout(slideTimerRef.current);
        slideTimerRef.current = null;
      }
    };
  }, []);

  const resetPlaybackClock = useCallback((nextFallbackDuration = 0) => {
    isScrubbingRef.current = false;
    seekGraceRef.current = null;
    setScrubSeconds(null);
    setCurrentTime(0);
    setDuration(nextFallbackDuration > 0 ? nextFallbackDuration : 0);
  }, []);

  const silenceCurrentVideoImmediately = useCallback(() => {
    hasEnteredPlayableStateRef.current = false;
    setIsVideoVisible(false);
    setIsPlaying(false);
    resetPlaybackClock(0);
    if (autoplayCheckTimerRef.current) {
      window.clearTimeout(autoplayCheckTimerRef.current);
      autoplayCheckTimerRef.current = null;
    }
    if (premiereGuardTimerRef.current) {
      window.clearTimeout(premiereGuardTimerRef.current);
      premiereGuardTimerRef.current = null;
    }
    if (errorSkipTimerRef.current) {
      window.clearTimeout(errorSkipTimerRef.current);
      errorSkipTimerRef.current = null;
    }
    const player = playerRef.current;
    if (!player) return;
    try {
      player.mute();
      player.stopVideo();
    } catch {
      // Ignore if player is still initializing
    }
  }, [resetPlaybackClock]);

  const jumpToSlide = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, nextIndex));
      if (clamped === activeIndexRef.current) return;

      const isAdjacent = Math.abs(clamped - activeIndexRef.current) === 1;
      silenceCurrentVideoImmediately();
      onAudioUnlockedRef.current();

      if (isAdjacent) {
        triggerSlideWindow(360);
      }
      onActiveIndexChangeRef.current(clamped);
    },
    [items.length, silenceCurrentVideoImmediately, triggerSlideWindow]
  );

  // Sync rendered index ref & animate adjacent slide changes triggered externally (keyboard, queue, auto-advance)
  useEffect(() => {
    const prevIdx = renderedIndexRef.current;
    const prevFirst = prevFirstItemIdRef.current;
    const delta = activeIndex - prevIdx;
    const listChanged = currentFirstItemId !== prevFirst && delta !== 0;

    renderedIndexRef.current = activeIndex;
    prevFirstItemIdRef.current = currentFirstItemId;

    if (delta !== 0 && Math.abs(delta) === 1 && !listChanged) {
      triggerSlideWindow(360);
    }
  }, [activeIndex, currentFirstItemId, triggerSlideWindow]);

  const startPlaybackOnPlayer = useCallback(
    (
      player: YTPlayer,
      videoId: string,
      isFirstMount: boolean,
      YTStates?: { PLAYING: number; BUFFERING: number }
    ) => {
      currentVideoIdRef.current = videoId;
      hasEnteredPlayableStateRef.current = false;
      setHasError(false);
      setIsVideoVisible(false);
      resetPlaybackClock(effectiveDurationRef.current);

      if (autoplayCheckTimerRef.current) {
        window.clearTimeout(autoplayCheckTimerRef.current);
        autoplayCheckTimerRef.current = null;
      }
      if (premiereGuardTimerRef.current) {
        window.clearTimeout(premiereGuardTimerRef.current);
        premiereGuardTimerRef.current = null;
      }
      if (errorSkipTimerRef.current) {
        window.clearTimeout(errorSkipTimerRef.current);
        errorSkipTimerRef.current = null;
      }

      try {
        const shouldStartUnmuted = audioUnlockedRef.current || isNativeCapacitorApp();
        if (shouldStartUnmuted) {
          player.unMute();
          player.setVolume(100);
        } else {
          player.mute();
        }
        if (isFirstMount) {
          const initialState = player.getPlayerState();
          const alreadyStarted = YTStates
            ? initialState === YTStates.PLAYING || initialState === YTStates.BUFFERING
            : initialState === 1 || initialState === 3;
          // Let playerVars autoplay=1 proceed without restarting an active load; only kick CUED/PAUSED/UNSTARTED
          if (!alreadyStarted && initialState !== -1) {
            player.playVideo();
          }
        } else {
          player.loadVideoById({ videoId, startSeconds: 0 });
        }

        // Fallback if browser blocks unmuted autoplay before first user gesture
        autoplayCheckTimerRef.current = window.setTimeout(() => {
          if (activeVideoIdRef.current !== videoId) return;
          try {
            const state = player.getPlayerState();
            const isStarted = YTStates
              ? state === YTStates.PLAYING || state === YTStates.BUFFERING
              : state === 1 || state === 3;
            if (!isStarted && !audioUnlockedRef.current) {
              player.mute();
              player.playVideo();
            } else if (isStarted && shouldStartUnmuted) {
              onAudioUnlockedRef.current();
            }
          } catch {
            // Ignore transient state errors
          }
        }, 550);

        // Guard against upcoming Premieres/lives that render a countdown screen
        // (stays UNSTARTED=-1 or CUED=5 with duration 0 and never enters BUFFERING/PLAYING)
        premiereGuardTimerRef.current = window.setTimeout(() => {
          premiereGuardTimerRef.current = null;
          if (
            activeVideoIdRef.current !== videoId ||
            hasEnteredPlayableStateRef.current ||
            hasErrorRef.current
          ) {
            return;
          }
          try {
            const state = player.getPlayerState();
            const liveDur = player.getDuration();
            if (state === 1 || state === 3 || (Number.isFinite(liveDur) && liveDur > 0)) {
              hasEnteredPlayableStateRef.current = true;
              return;
            }
            if (state === -1 || state === 5) {
              player.mute();
              player.playVideo();
              premiereGuardTimerRef.current = window.setTimeout(() => {
                premiereGuardTimerRef.current = null;
                if (
                  activeVideoIdRef.current !== videoId ||
                  hasEnteredPlayableStateRef.current ||
                  hasErrorRef.current
                ) {
                  return;
                }
                try {
                  const finalState = player.getPlayerState();
                  const finalDur = player.getDuration();
                  const online =
                    typeof navigator === 'undefined' || navigator.onLine !== false;
                  if (
                    online &&
                    itemsLengthRef.current > 1 &&
                    (!Number.isFinite(finalDur) || finalDur <= 0) &&
                    (finalState === -1 || finalState === 5)
                  ) {
                    if (onUnplayableVideoRef.current) {
                      onUnplayableVideoRef.current(videoId);
                    } else {
                      onEndedRef.current();
                    }
                  }
                } catch {
                  // Ignore transient state reads
                }
              }, 1600);
            }
          } catch {
            // Ignore transient state errors
          }
        }, 3800);
      } catch {
        // Ignore transient play errors
      }
    },
    [resetPlaybackClock]
  );

  // Sync baseline duration whenever active slide changes
  useEffect(() => {
    setDuration(fallbackDuration);
    setCurrentTime(0);
    setScrubSeconds(null);
    isScrubbingRef.current = false;
    seekGraceRef.current = null;
  }, [activeVideoId, fallbackDuration]);

  // Boot ONE single persistent YouTube IFrame Player once inside an imperative host container
  // so it can move seamlessly into a Document Picture-in-Picture window without reloading.
  useEffect(() => {
    if (!playerSlotRef.current || !activeVideoId) return;

    let cancelled = false;
    const initialVideoId = activeVideoId;
    const hostEl = document.createElement('div');
    hostEl.className = 'w-full h-full';
    hostEl.style.width = '100%';
    hostEl.style.height = '100%';

    const mountNode = document.createElement('div');
    mountNode.className = 'w-full h-full';
    mountNode.style.width = '100%';
    mountNode.style.height = '100%';
    hostEl.appendChild(mountNode);

    playerSlotRef.current.innerHTML = '';
    playerSlotRef.current.appendChild(hostEl);
    playerHostElRef.current = hostEl;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !playerHostElRef.current) return;

        const player = new YT.Player(mountNode, {
          videoId: initialVideoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            mute: isNativeCapacitorApp() || audioUnlockedRef.current ? 0 : 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) {
                try {
                  event.target.destroy();
                } catch {
                  // Ignore
                }
                return;
              }
              playerRef.current = event.target;
              setPlayerReady(true);

              const targetId = activeVideoIdRef.current || initialVideoId;
              const isSameAsInitial = targetId === initialVideoId;
              startPlaybackOnPlayer(
                event.target,
                targetId,
                isSameAsInitial,
                YT.PlayerState
              );
            },
            onStateChange: (event) => {
              if (cancelled) return;
              try {
                const liveDuration = event.target.getDuration();
                if (Number.isFinite(liveDuration) && liveDuration > 0) {
                  hasEnteredPlayableStateRef.current = true;
                  setDuration(liveDuration);
                }
                const liveCurrent = event.target.getCurrentTime();
                if (
                  !isScrubbingRef.current &&
                  Number.isFinite(liveCurrent) &&
                  liveCurrent >= 0
                ) {
                  const grace = seekGraceRef.current;
                  if (
                    !grace ||
                    Date.now() > grace.until ||
                    Math.abs(liveCurrent - grace.target) <= 1.5
                  ) {
                    seekGraceRef.current = null;
                    setCurrentTime(liveCurrent);
                  }
                }
              } catch {
                // Ignore transient metadata reads
              }

              if (event.data === YT.PlayerState.BUFFERING) {
                hasEnteredPlayableStateRef.current = true;
                if (premiereGuardTimerRef.current) {
                  window.clearTimeout(premiereGuardTimerRef.current);
                  premiereGuardTimerRef.current = null;
                }
                setIsVideoVisible(true);
              } else if (event.data === YT.PlayerState.PLAYING) {
                hasEnteredPlayableStateRef.current = true;
                if (premiereGuardTimerRef.current) {
                  window.clearTimeout(premiereGuardTimerRef.current);
                  premiereGuardTimerRef.current = null;
                }
                setIsPlaying(true);
                setIsVideoVisible(true);
                if (audioUnlockedRef.current) {
                  try {
                    event.target.unMute();
                    event.target.setVolume(100);
                  } catch {
                    // Ignore
                  }
                }
              } else if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.CUED
              ) {
                setIsPlaying(false);
              } else if (event.data === YT.PlayerState.ENDED) {
                if (effectiveDurationRef.current > 0) {
                  setCurrentTime(effectiveDurationRef.current);
                }
                if (autoAdvanceRef.current) {
                  onEndedRef.current();
                } else {
                  seekGraceRef.current = { target: 0, until: Date.now() + 500 };
                  setCurrentTime(0);
                  event.target.seekTo(0, true);
                  event.target.playVideo();
                }
              }
            },
            onError: () => {
              if (!cancelled) {
                setIsVideoVisible(false);
                setHasError(true);
                if (premiereGuardTimerRef.current) {
                  window.clearTimeout(premiereGuardTimerRef.current);
                  premiereGuardTimerRef.current = null;
                }
                const erroredId = activeVideoIdRef.current;
                const online =
                  typeof navigator === 'undefined' || navigator.onLine !== false;
                if (erroredId && online && itemsLengthRef.current > 1) {
                  if (errorSkipTimerRef.current) {
                    window.clearTimeout(errorSkipTimerRef.current);
                  }
                  errorSkipTimerRef.current = window.setTimeout(() => {
                    errorSkipTimerRef.current = null;
                    if (cancelled || activeVideoIdRef.current !== erroredId) return;
                    if (onUnplayableVideoRef.current) {
                      onUnplayableVideoRef.current(erroredId);
                    } else {
                      onEndedRef.current();
                    }
                  }, 750);
                }
              }
            },
          },
        });

        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
      if (autoplayCheckTimerRef.current) {
        window.clearTimeout(autoplayCheckTimerRef.current);
        autoplayCheckTimerRef.current = null;
      }
      if (premiereGuardTimerRef.current) {
        window.clearTimeout(premiereGuardTimerRef.current);
        premiereGuardTimerRef.current = null;
      }
      if (errorSkipTimerRef.current) {
        window.clearTimeout(errorSkipTimerRef.current);
        errorSkipTimerRef.current = null;
      }
      if (pipWindowRef.current) {
        try {
          pipWindowRef.current.close();
        } catch {
          // Ignore
        }
        pipWindowRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.stopVideo();
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup
        }
        playerRef.current = null;
      }
      if (playerHostElRef.current) {
        playerHostElRef.current.remove();
        playerHostElRef.current = null;
      }
      if (playerSlotRef.current) {
        playerSlotRef.current.innerHTML = '';
      }
      currentVideoIdRef.current = null;
      setPlayerReady(false);
      setIsPlaying(false);
      setIsVideoVisible(false);
      setIsDocPipActive(false);
      resetPlaybackClock(0);
    };
    // Mount single persistent player once and reuse via loadVideoById
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(activeVideoId)]);

  // Switch videos instantaneously via loadVideoById whenever activeVideoId changes
  useEffect(() => {
    if (!playerReady || !playerRef.current || !activeVideoId) {
      return;
    }
    if (currentVideoIdRef.current !== activeVideoId) {
      startPlaybackOnPlayer(playerRef.current, activeVideoId, false);
    }
  }, [activeVideoId, playerReady, startPlaybackOnPlayer]);

  // Keep native container scrollTop at 0 since vertical slides are animated via CSS translate3d
  useEffect(() => {
    const container = feedRef.current;
    if (container && container.scrollTop !== 0) {
      container.scrollTop = 0;
    }
  }, [activeIndex, items.length, feedRef]);

  // Smooth TikTok-style wheel + real-time 1:1 finger drag swipe & horizontal category navigation
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const commitHorizontalStep = (direction: -1 | 1) => {
      if (!onStepCategoryRef.current) return false;
      const canStep =
        direction === -1
          ? Boolean(prevCategoryLabelRef.current)
          : Boolean(nextCategoryLabelRef.current);
      if (!canStep) return false;
      silenceCurrentVideoImmediately();
      onAudioUnlockedRef.current();
      onStepCategoryRef.current(direction);
      return true;
    };

    const computeHorizontalVisualOffset = (deltaX: number) => {
      // Swiping right (deltaX > 0) reveals previous category (-1); swiping left (deltaX < 0) reveals next (+1)
      const hasTarget =
        deltaX > 0
          ? Boolean(prevCategoryLabelRef.current)
          : Boolean(nextCategoryLabelRef.current);
      if (!hasTarget) {
        return Math.max(-44, Math.min(44, Math.round(deltaX * 0.22)));
      }
      return Math.max(-132, Math.min(132, Math.round(deltaX * 0.56)));
    };

    const handleWheel = (e: WheelEvent) => {
      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);

      // Two-finger horizontal trackpad swipe switches categories
      if (absX >= 18 && absX > absY * 1.35 && onStepCategoryRef.current) {
        e.preventDefault();
        const now = Date.now();
        if (now < horizontalWheelLockUntilRef.current) return;
        horizontalWheelLockUntilRef.current = now + 480;
        if (e.deltaX > 0) {
          commitHorizontalStep(1);
        } else {
          commitHorizontalStep(-1);
        }
        return;
      }

      if (absY < 8) return;
      e.preventDefault();

      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTimeRef.current;
      const isDeceleratingTail =
        timeSinceLastWheel < 85 && absY <= lastWheelAbsDeltaRef.current * 1.05;

      lastWheelTimeRef.current = now;
      lastWheelAbsDeltaRef.current = absY;

      if (now < wheelLockUntilRef.current || (isDeceleratingTail && now < wheelLockUntilRef.current + 180)) {
        return;
      }
      wheelLockUntilRef.current = now + 400;

      if (e.deltaY > 0) {
        jumpToSlide(activeIndexRef.current + 1);
      } else {
        jumpToSlide(activeIndexRef.current - 1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const targetEl = e.target as HTMLElement | null;
      if (
        targetEl?.closest(
          '[data-no-swipe="true"], [role="slider"], a, button:not([data-stage-surface="true"])'
        )
      ) {
        return;
      }
      const touch = e.touches[0];
      const now = performance.now();
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
      touchStartTimeRef.current = now;
      lastTouchXRef.current = touch.clientX;
      lastTouchYRef.current = touch.clientY;
      lastTouchTimeRef.current = now;
      gestureAxisRef.current = 'pending';
      velocityXRef.current = 0;
      velocityYRef.current = 0;
      dragOffsetPxRef.current = 0;
      horizontalDragPxRef.current = 0;
      rawHorizontalDeltaRef.current = 0;
      touchDraggedRef.current = false;
      pullDistanceRef.current = 0;
      peakPullDistanceRef.current = 0;
      longPullRefreshArmedRef.current = false;
      setPullDistance(0);
      setDragOffsetPx(0);
      setHorizontalDragPx(0);
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null || touchStartXRef.current === null || e.touches.length !== 1) {
        return;
      }
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - lastTouchTimeRef.current);
      const instantVelocityX = (currentX - lastTouchXRef.current) / dt;
      const instantVelocityY = (currentY - lastTouchYRef.current) / dt;
      velocityXRef.current = velocityXRef.current * 0.35 + instantVelocityX * 0.65;
      velocityYRef.current = velocityYRef.current * 0.35 + instantVelocityY * 0.65;
      lastTouchXRef.current = currentX;
      lastTouchYRef.current = currentY;
      lastTouchTimeRef.current = now;

      const deltaX = currentX - touchStartXRef.current;
      const deltaY = currentY - touchStartYRef.current; // negative = swiping up (next), positive = swiping down (prev/refresh)

      if (gestureAxisRef.current === 'pending') {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          gestureAxisRef.current =
            Math.abs(deltaX) > Math.abs(deltaY) * 1.2 ? 'horizontal' : 'vertical';
        }
      }

      if (gestureAxisRef.current === 'horizontal') {
        if (Math.abs(deltaX) > 7) {
          touchDraggedRef.current = true;
          e.preventDefault();
        }
        rawHorizontalDeltaRef.current = deltaX;
        const visualX = computeHorizontalVisualOffset(deltaX);
        horizontalDragPxRef.current = visualX;
        setHorizontalDragPx(visualX);
        return;
      }

      if (Math.abs(deltaY) > 7) {
        touchDraggedRef.current = true;
        e.preventDefault();
      }

      const idx = activeIndexRef.current;
      const total = itemsLengthRef.current;
      const containerHeight = container.clientHeight || 640;

      // Top of feed + dragging down: responsive pull-to-refresh + gentle rubber-band slide
      if (idx === 0 && deltaY > 0) {
        const dampedPull = Math.min(180, Math.round(deltaY * 0.86));
        const rubberOffset = Math.min(82, Math.round(deltaY * 0.28));
        pullDistanceRef.current = dampedPull;
        if (dampedPull > peakPullDistanceRef.current) {
          peakPullDistanceRef.current = dampedPull;
        }
        dragOffsetPxRef.current = rubberOffset;
        setPullDistance(dampedPull);
        setDragOffsetPx(rubberOffset);
        return;
      }

      // Mid-feed + deliberate longer downward drag: arm pull-to-refresh without breaking quick prev-video swipe
      if (idx > 0 && deltaY > 0) {
        const longPullActivatePx = Math.min(185, Math.max(112, Math.round(containerHeight * 0.23)));
        const elapsed = now - touchStartTimeRef.current;

        if (!longPullRefreshArmedRef.current) {
          if (deltaY >= longPullActivatePx && (elapsed >= 135 || deltaY >= longPullActivatePx + 55)) {
            longPullRefreshArmedRef.current = true;
          }
        } else if (deltaY < longPullActivatePx - 36) {
          longPullRefreshArmedRef.current = false;
        }

        if (longPullRefreshArmedRef.current) {
          const extraPull = Math.max(0, deltaY - longPullActivatePx);
          const dampedPull = Math.min(180, Math.round(38 + extraPull * 0.92));
          const cushionedOffset = Math.min(
            longPullActivatePx + 58,
            Math.round(longPullActivatePx + extraPull * 0.16)
          );
          pullDistanceRef.current = dampedPull;
          if (dampedPull > peakPullDistanceRef.current) {
            peakPullDistanceRef.current = dampedPull;
          }
          dragOffsetPxRef.current = cushionedOffset;
          setPullDistance(dampedPull);
          setDragOffsetPx(cushionedOffset);
          return;
        }
      }

      if (pullDistanceRef.current > 0 || longPullRefreshArmedRef.current) {
        pullDistanceRef.current = 0;
        peakPullDistanceRef.current = 0;
        longPullRefreshArmedRef.current = false;
        setPullDistance(0);
      }

      // Bottom of feed + dragging up: rubber-band resistance
      if (idx >= total - 1 && deltaY < 0) {
        const rubberBottom = Math.max(-72, Math.round(deltaY * 0.28));
        dragOffsetPxRef.current = rubberBottom;
        setDragOffsetPx(rubberBottom);
        return;
      }

      // 1:1 TikTok vertical finger tracking
      dragOffsetPxRef.current = Math.round(deltaY);
      setDragOffsetPx(Math.round(deltaY));
    };

    const handleTouchEnd = () => {
      if (touchStartYRef.current === null) return;

      const currentOffset = dragOffsetPxRef.current;
      const currentHorizontalOffset = horizontalDragPxRef.current;
      const rawDeltaX = rawHorizontalDeltaRef.current;
      const pulled = pullDistanceRef.current;
      const peakPulled = peakPullDistanceRef.current;
      const wasLongPullArmed = longPullRefreshArmedRef.current;
      const wasHorizontal = gestureAxisRef.current === 'horizontal';
      const velocityX = velocityXRef.current;
      const velocityY = velocityYRef.current;
      const idx = activeIndexRef.current;
      const total = itemsLengthRef.current;
      const containerWidth = container.clientWidth || 360;
      const containerHeight = container.clientHeight || 640;
      const distThresholdX = Math.max(52, Math.min(115, containerWidth * 0.16));
      const distThreshold = Math.max(56, containerHeight * 0.16);
      const hasLeftFlick = velocityX < -0.32 && rawDeltaX < -22;
      const hasRightFlick = velocityX > 0.32 && rawDeltaX > 22;
      const hasUpFlick = velocityY < -0.35 && currentOffset < -22;
      const hasDownFlick = velocityY > 0.35 && currentOffset > 22;
      const metRefreshPull =
        pulled >= PULL_REFRESH_THRESHOLD ||
        (peakPulled >= PULL_REFRESH_THRESHOLD + 8 && pulled >= PULL_REFRESH_THRESHOLD - 18);

      setIsDragging(false);
      dragOffsetPxRef.current = 0;
      horizontalDragPxRef.current = 0;
      rawHorizontalDeltaRef.current = 0;
      setDragOffsetPx(0);
      setHorizontalDragPx(0);

      if (wasHorizontal) {
        let switched = false;
        if (rawDeltaX <= -distThresholdX || hasLeftFlick) {
          switched = commitHorizontalStep(1);
        } else if (rawDeltaX >= distThresholdX || hasRightFlick) {
          switched = commitHorizontalStep(-1);
        }
        if (!switched && Math.abs(currentHorizontalOffset) > 2) {
          triggerSlideWindow(240);
        }
      } else if (idx === 0 && pulled > 0) {
        if (!isRefreshingRef.current && metRefreshPull) {
          onAudioUnlockedRef.current();
          onRefreshRef.current();
        }
        if (Math.abs(currentOffset) > 2) {
          triggerSlideWindow(280);
        }
      } else if (wasLongPullArmed && metRefreshPull) {
        if (!isRefreshingRef.current) {
          onAudioUnlockedRef.current();
          onRefreshRef.current();
        }
        if (Math.abs(currentOffset) > 2) {
          triggerSlideWindow(280);
        }
      } else if ((currentOffset <= -distThreshold || hasUpFlick) && idx < total - 1) {
        jumpToSlide(idx + 1);
      } else if ((currentOffset >= distThreshold || hasDownFlick) && idx > 0) {
        jumpToSlide(idx - 1);
      } else if (Math.abs(currentOffset) > 2) {
        // Cancelled drag: keep poster visible while springing back to 0px
        triggerSlideWindow(280);
      }

      pullDistanceRef.current = 0;
      peakPullDistanceRef.current = 0;
      longPullRefreshArmedRef.current = false;
      gestureAxisRef.current = 'pending';
      setPullDistance(0);
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      velocityXRef.current = 0;
      velocityYRef.current = 0;
      window.setTimeout(() => {
        touchDraggedRef.current = false;
      }, 60);
    };

    // Desktop mouse horizontal click-and-drag category switching
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !onStepCategoryRef.current) return;
      const targetEl = e.target as HTMLElement | null;
      if (
        targetEl?.closest(
          '[data-no-swipe="true"], [role="slider"], a, button:not([data-stage-surface="true"])'
        )
      ) {
        return;
      }
      mouseDragStartXRef.current = e.clientX;
      mouseDragStartYRef.current = e.clientY;
      mouseDragLastXRef.current = e.clientX;
      mouseDragLastTimeRef.current = performance.now();
      mouseVelocityXRef.current = 0;
      mouseDragAxisRef.current = 'pending';
      rawHorizontalDeltaRef.current = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (
        e.pointerType !== 'mouse' ||
        mouseDragStartXRef.current === null ||
        mouseDragStartYRef.current === null
      ) {
        return;
      }
      const deltaX = e.clientX - mouseDragStartXRef.current;
      const deltaY = e.clientY - mouseDragStartYRef.current;
      const now = performance.now();
      const dt = Math.max(1, now - mouseDragLastTimeRef.current);
      const instantVx = (e.clientX - mouseDragLastXRef.current) / dt;
      mouseVelocityXRef.current = mouseVelocityXRef.current * 0.35 + instantVx * 0.65;
      mouseDragLastXRef.current = e.clientX;
      mouseDragLastTimeRef.current = now;

      if (mouseDragAxisRef.current === 'pending') {
        if (Math.abs(deltaX) > 12 || Math.abs(deltaY) > 12) {
          if (Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
            mouseDragAxisRef.current = 'horizontal';
            touchDraggedRef.current = true;
            setIsDragging(true);
          } else {
            mouseDragAxisRef.current = 'ignored';
            return;
          }
        }
      }

      if (mouseDragAxisRef.current !== 'horizontal') return;

      rawHorizontalDeltaRef.current = deltaX;
      const visualX = computeHorizontalVisualOffset(deltaX);
      horizontalDragPxRef.current = visualX;
      setHorizontalDragPx(visualX);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || mouseDragStartXRef.current === null) return;
      const wasHorizontal = mouseDragAxisRef.current === 'horizontal';
      const rawDeltaX = rawHorizontalDeltaRef.current;
      const vx = mouseVelocityXRef.current;
      const visualOffset = horizontalDragPxRef.current;
      const containerWidth = container.clientWidth || 360;
      const distThresholdX = Math.max(54, Math.min(120, containerWidth * 0.16));

      mouseDragStartXRef.current = null;
      mouseDragStartYRef.current = null;
      mouseDragAxisRef.current = 'pending';
      mouseVelocityXRef.current = 0;

      if (!wasHorizontal) return;

      setIsDragging(false);
      horizontalDragPxRef.current = 0;
      rawHorizontalDeltaRef.current = 0;
      setHorizontalDragPx(0);

      let switched = false;
      if (rawDeltaX <= -distThresholdX || (vx < -0.35 && rawDeltaX < -24)) {
        switched = commitHorizontalStep(1);
      } else if (rawDeltaX >= distThresholdX || (vx > 0.35 && rawDeltaX > 24)) {
        switched = commitHorizontalStep(-1);
      }
      if (!switched && Math.abs(visualOffset) > 2) {
        triggerSlideWindow(220);
      }
      window.setTimeout(() => {
        touchDraggedRef.current = false;
      }, 60);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [feedRef, jumpToSlide, silenceCurrentVideoImmediately, triggerSlideWindow]);

  // Unmute automatically on first user gesture anywhere
  useEffect(() => {
    if (!audioUnlocked || !playerReady || !playerRef.current) return;
    try {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
    } catch {
      // Ignore
    }
  }, [audioUnlocked, playerReady]);

  // Fast 100ms progress & elapsed-time polling while playing
  useEffect(() => {
    if (!playerReady || !isPlaying) return;
    const interval = window.setInterval(() => {
      if (isScrubbingRef.current) return;
      const player = playerRef.current;
      if (!player) return;
      try {
        const liveDuration = player.getDuration();
        const liveCurrent = player.getCurrentTime();
        if (Number.isFinite(liveDuration) && liveDuration > 0) {
          setDuration(liveDuration);
        }
        if (Number.isFinite(liveCurrent) && liveCurrent >= 0) {
          const grace = seekGraceRef.current;
          if (grace) {
            if (
              Date.now() > grace.until ||
              Math.abs(liveCurrent - grace.target) <= 1.5
            ) {
              seekGraceRef.current = null;
              setCurrentTime(liveCurrent);
            }
          } else {
            setCurrentTime(liveCurrent);
          }
        }
      } catch {
        // Ignore
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, [playerReady, isPlaying]);

  const seekToSeconds = useCallback(
    (nextSeconds: number) => {
      const player = playerRef.current;
      const total = effectiveDurationRef.current;
      if (!player || !playerReady || total <= 0) return;

      const clamped = Math.max(0, Math.min(total, nextSeconds));
      onAudioUnlockedRef.current();
      seekGraceRef.current = { target: clamped, until: Date.now() + 900 };
      setCurrentTime(clamped);

      try {
        player.unMute();
        player.setVolume(100);
        player.seekTo(clamped, true);
      } catch {
        // Ignore transient seek errors
      }
    },
    [playerReady]
  );

  // Keyboard Left/Right (-10s / +10s) seeking when not typing inside inputs or modals
  useEffect(() => {
    const handleKeySeek = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'slider')
      ) {
        return;
      }
      if (hasErrorRef.current || effectiveDurationRef.current <= 0) return;
      if (document.querySelector('[role="dialog"]')) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekToSeconds(currentTimeRef.current - 10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekToSeconds(currentTimeRef.current + 10);
      }
    };

    window.addEventListener('keydown', handleKeySeek);
    return () => window.removeEventListener('keydown', handleKeySeek);
  }, [seekToSeconds]);

  const computeSecondsFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    const total = effectiveDurationRef.current;
    if (!track || total <= 0) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * total;
  }, []);

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (effectiveDuration <= 0 || hasError || !playerReady) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is unavailable
    }
    onAudioUnlocked();
    isScrubbingRef.current = true;
    setScrubSeconds(computeSecondsFromClientX(e.clientX));
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isScrubbingRef.current) return;
    setScrubSeconds(computeSecondsFromClientX(e.clientX));
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isScrubbingRef.current) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    const finalSeconds = computeSecondsFromClientX(e.clientX);
    isScrubbingRef.current = false;
    setScrubSeconds(null);
    seekToSeconds(finalSeconds);
  };

  const handleTrackPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isScrubbingRef.current = false;
    setScrubSeconds(null);
  };

  const handleTrackKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (effectiveDuration <= 0 || hasError) return;
    const current = scrubSeconds ?? currentTime;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      seekToSeconds(current - 5);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      seekToSeconds(current + 5);
    } else if (e.key === 'Home') {
      e.preventDefault();
      e.stopPropagation();
      seekToSeconds(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      e.stopPropagation();
      seekToSeconds(effectiveDuration);
    }
  };

  const handleTogglePlayPause = () => {
    const wasLocked = !audioUnlockedRef.current;
    onAudioUnlocked();
    const player = playerRef.current;
    if (!player || !playerReady) return;
    try {
      const wasMuted =
        typeof player.isMuted === 'function' ? player.isMuted() : wasLocked;
      player.unMute();
      player.setVolume(100);
      if (isPlaying && wasLocked && wasMuted) {
        setFeedbackState('play');
        window.setTimeout(() => setFeedbackState(null), 220);
        return;
      }
      if (isPlaying) {
        player.pauseVideo();
        setFeedbackState('pause');
      } else {
        player.playVideo();
        setFeedbackState('play');
      }
      window.setTimeout(() => setFeedbackState(null), 220);
    } catch {
      // Ignore
    }
  };

  const handleTapTogglePlayPause = () => {
    if (touchDraggedRef.current) return;
    handleTogglePlayPause();
  };

  // Sync Android native Picture-in-Picture eligibility & aspect ratio with live playback state
  useEffect(() => {
    syncNativePipPlaybackState(
      isPlaying && !hasError && !isDocPipActive,
      isHorizontalMode ? 16 : 9,
      isHorizontalMode ? 9 : 16
    );
  }, [isPlaying, hasError, isDocPipActive, activeVideoId, isHorizontalMode]);

  useEffect(() => {
    return () => {
      syncNativePipPlaybackState(false);
      if (pipNoticeTimerRef.current) {
        window.clearTimeout(pipNoticeTimerRef.current);
      }
    };
  }, []);

  const showPipInfoNotice = useCallback((msg: string) => {
    setPipNotice(msg);
    if (pipNoticeTimerRef.current) {
      window.clearTimeout(pipNoticeTimerRef.current);
    }
    pipNoticeTimerRef.current = window.setTimeout(() => {
      setPipNotice(null);
      pipNoticeTimerRef.current = null;
    }, 3400);
  }, []);

  const restoreHostFromDocPip = useCallback(() => {
    const hostEl = playerHostElRef.current;
    const slotEl = playerSlotRef.current;
    if (hostEl && slotEl && hostEl.parentElement !== slotEl) {
      slotEl.innerHTML = '';
      slotEl.appendChild(hostEl);
    }
    pipTitleElRef.current = null;
    pipPlayBtnRef.current = null;
    pipWindowRef.current = null;
    setIsDocPipActive(false);
  }, []);

  const closeDocumentPip = useCallback(() => {
    const win = pipWindowRef.current;
    restoreHostFromDocPip();
    if (win) {
      try {
        win.close();
      } catch {
        // Ignore
      }
    }
  }, [restoreHostFromDocPip]);

  const handleTogglePlayPauseRef = useRef(handleTogglePlayPause);
  const jumpToSlideRef = useRef(jumpToSlide);
  handleTogglePlayPauseRef.current = handleTogglePlayPause;
  jumpToSlideRef.current = jumpToSlide;

  const openDocumentPip = useCallback(async () => {
    if (pipWindowRef.current) {
      closeDocumentPip();
      return;
    }
    const hostEl = playerHostElRef.current;
    const pipApi = window.documentPictureInPicture;
    if (!hostEl || !pipApi?.requestWindow) return;

    try {
      const pipWin = await pipApi.requestWindow({
        width: isHorizontalMode ? 480 : 340,
        height: isHorizontalMode ? 300 : 560,
      });
      pipWindowRef.current = pipWin;

      const doc = pipWin.document;
      doc.title = activeShort ? `${activeShort.title} · GraçaPlay` : 'GraçaPlay';
      doc.documentElement.style.cssText = 'height:100%;margin:0;background:#000;';
      doc.body.style.cssText =
        'height:100%;margin:0;padding:0;background:#000;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;overflow:hidden;user-select:none;';

      const stage = doc.createElement('div');
      stage.style.cssText =
        'position:relative;flex:1;min-height:0;width:100%;background:#000;overflow:hidden;';
      stage.appendChild(hostEl);

      const footer = doc.createElement('div');
      footer.style.cssText =
        'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#09090b;border-top:1px solid rgba(255,255,255,0.1);';

      const titleEl = doc.createElement('div');
      titleEl.style.cssText =
        'flex:1;min-width:0;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f4f4f5;';
      titleEl.textContent = activeShort?.title || 'GraçaPlay';
      pipTitleElRef.current = titleEl;

      const controls = doc.createElement('div');
      controls.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0;';

      const makeBtn = (label: string, title: string, onClick: () => void) => {
        const btn = doc.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.title = title;
        btn.setAttribute('aria-label', title);
        btn.style.cssText =
          'width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.14);background:#18181b;color:#fff;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;';
        btn.addEventListener('click', onClick);
        return btn;
      };

      const prevBtn = makeBtn('‹', 'Vídeo anterior', () =>
        jumpToSlideRef.current(activeIndexRef.current - 1)
      );
      const playBtn = makeBtn(isPlaying ? '❚❚' : '▶', 'Reproduzir ou pausar', () =>
        handleTogglePlayPauseRef.current()
      );
      pipPlayBtnRef.current = playBtn;
      const nextBtn = makeBtn('›', 'Próximo vídeo', () =>
        jumpToSlideRef.current(activeIndexRef.current + 1)
      );
      const backBtn = makeBtn('⤢', 'Voltar ao aplicativo', () => closeDocumentPip());

      controls.append(prevBtn, playBtn, nextBtn, backBtn);
      footer.append(titleEl, controls);
      doc.body.append(stage, footer);

      pipWin.addEventListener('pagehide', () => {
        restoreHostFromDocPip();
      });

      setIsDocPipActive(true);
    } catch {
      restoreHostFromDocPip();
      showPipInfoNotice(
        'Não foi possível abrir a janela flutuante neste navegador.'
      );
    }
  }, [
    activeShort,
    closeDocumentPip,
    isHorizontalMode,
    isPlaying,
    restoreHostFromDocPip,
    showPipInfoNotice,
  ]);

  // Keep Document PiP title & play/pause label synced as videos change or pause
  useEffect(() => {
    if (!isDocPipActive) return;
    if (pipTitleElRef.current) {
      pipTitleElRef.current.textContent = activeShort?.title || 'GraçaPlay';
    }
    if (pipWindowRef.current && activeShort) {
      pipWindowRef.current.document.title = `${activeShort.title} · GraçaPlay`;
    }
    if (pipPlayBtnRef.current) {
      pipPlayBtnRef.current.textContent = isPlaying ? '❚❚' : '▶';
    }
  }, [isDocPipActive, activeShort, isPlaying]);

  // Sync Media Session metadata, playback controls & auto-PiP with the phone OS / browser
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession as MediaSession & {
      setActionHandler?: (action: string, handler: (() => void) | null) => void;
    };

    try {
      if (typeof MediaMetadata !== 'undefined' && activeShort) {
        mediaSession.metadata = new MediaMetadata({
          title: activeShort.title,
          artist: activeShort.channelTitle,
          album: 'GraçaPlay',
          artwork: [
            {
              src: activeShort.thumbnailUrl,
              sizes: '480x360',
              type: 'image/jpeg',
            },
          ],
        });
      }
      mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      // Ignore MediaMetadata errors on older browsers
    }

    const safeSetHandler = (action: string, handler: (() => void) | null) => {
      try {
        mediaSession.setActionHandler?.(action, handler);
      } catch {
        // Ignore unsupported mediaSession action
      }
    };

    safeSetHandler('play', () => {
      const player = playerRef.current;
      if (!player) return;
      try {
        player.unMute();
        player.playVideo();
      } catch {
        // Ignore
      }
    });
    safeSetHandler('pause', () => {
      try {
        playerRef.current?.pauseVideo();
      } catch {
        // Ignore
      }
    });
    safeSetHandler('previoustrack', () => {
      jumpToSlideRef.current(activeIndexRef.current - 1);
    });
    safeSetHandler('nexttrack', () => {
      jumpToSlideRef.current(activeIndexRef.current + 1);
    });
    if (isDocumentPipAvailable()) {
      safeSetHandler('enterpictureinpicture', () => {
        if (!pipWindowRef.current) {
          void openDocumentPip();
        }
      });
    }

    return () => {
      safeSetHandler('play', null);
      safeSetHandler('pause', null);
      safeSetHandler('previoustrack', null);
      safeSetHandler('nexttrack', null);
      safeSetHandler('enterpictureinpicture', null);
    };
  }, [activeShort, isPlaying, openDocumentPip]);

  // Follow native Android PiP transitions: keep video playing on PiP entry & pause cleanly if PiP is dismissed
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    const handlePipResume = () => {
      const player = playerRef.current;
      if (!player || hasErrorRef.current) return;
      try {
        const state = player.getPlayerState();
        if (state !== 1 && state !== 3) {
          player.unMute();
          player.setVolume(100);
          player.playVideo();
        }
      } catch {
        // Ignore
      }
    };

    const handleAppStopped = () => {
      const player = playerRef.current;
      if (!player) return;
      try {
        if (isPlayingRef.current) {
          player.pauseVideo();
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('gracaplay-pip-resume', handlePipResume);
    window.addEventListener('gracaplay-app-stopped', handleAppStopped);
    return () => {
      window.removeEventListener('gracaplay-pip-resume', handlePipResume);
      window.removeEventListener('gracaplay-app-stopped', handleAppStopped);
    };
  }, []);

  const isScrubbing = scrubSeconds !== null;
  const displayedTime =
    effectiveDuration > 0
      ? Math.max(0, Math.min(effectiveDuration, scrubSeconds ?? currentTime))
      : 0;
  const progressPercent =
    effectiveDuration > 0
      ? Math.min(100, Math.max(0, (displayedTime / effectiveDuration) * 100))
      : 0;

  const isCompactNativePip = Boolean(isNativePipActive);
  const pullThreshold = PULL_REFRESH_THRESHOLD;
  const showPullIndicator = !isCompactNativePip && (isRefreshing || pullDistance > 14);
  const readyToRefresh = pullDistance >= pullThreshold;
  const pullProgress = Math.min(1, pullDistance / pullThreshold);
  const pullTranslateY = isRefreshing ? 14 : Math.min(64, Math.round(pullDistance * 0.45)) - 6;

  // Hide the stationary YouTube iframe layer while finger-dragging or mid-slide so outgoing & incoming posters glide together like TikTok
  const isActivelyDisplaced =
    isDragging && (Math.abs(dragOffsetPx) > 2 || Math.abs(horizontalDragPx) > 2);
  const isScrollingMotion =
    isActivelyDisplaced || isSliding || indexDeltaFromLastRender !== 0;
  const shouldAnimateTrack = !isDragging && !isBigNonAdjacentJump;
  // Keep the persistent player container at opacity-100 while booting so browsers/WebViews never
  // throttle iframe decode; the opaque thumbnail poster above it hides the player until BUFFERING/PLAYING.
  const keepPlayerLayerPainted =
    Boolean(activeVideoId) && !hasError && !isScrollingMotion && !isDocPipActive;
  const horizontalPreviewDirection: -1 | 1 | null =
    horizontalDragPx > 14 && prevCategoryLabel
      ? -1
      : horizontalDragPx < -14 && nextCategoryLabel
      ? 1
      : null;
  const horizontalPreviewLabel =
    horizontalPreviewDirection === -1
      ? prevCategoryLabel
      : horizontalPreviewDirection === 1
      ? nextCategoryLabel
      : null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none overscroll-none">
      {/* Horizontal category swipe drag preview */}
      {!isCompactNativePip && horizontalPreviewDirection && horizontalPreviewLabel && (
        <div
          aria-live="polite"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl ${
            horizontalPreviewDirection === -1 ? 'left-3' : 'right-3'
          }`}
        >
          {horizontalPreviewDirection === -1 && (
            <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span className="whitespace-nowrap">{horizontalPreviewLabel}</span>
          {horizontalPreviewDirection === 1 && (
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
        </div>
      )}

      {/* Brief confirmation banner when switching category horizontally */}
      {!isCompactNativePip && !horizontalPreviewLabel && categorySwitchBanner && (
        <div
          key={categorySwitchBanner.nonce}
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-40"
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

      {/* Pull-to-refresh floating indicator */}
      {!isCompactNativePip && (
        <div
          aria-live="polite"
          className={`pointer-events-none absolute top-2 left-1/2 z-40 transition-opacity duration-150 ${
            showPullIndicator ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `translate3d(-50%, ${pullTranslateY}px, 0)`,
          }}
        >
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border text-xs font-semibold shadow-lg whitespace-nowrap ${
              readyToRefresh || isRefreshing
                ? 'bg-white border-white text-black'
                : 'bg-zinc-950/95 border-zinc-800 text-zinc-100'
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`}
              style={
                isRefreshing
                  ? undefined
                  : { transform: `rotate(${Math.round(pullProgress * 220)}deg)` }
              }
              aria-hidden="true"
            />
            <span>
              {isRefreshing
                ? 'Atualizando vídeos...'
                : readyToRefresh
                ? 'Solte para atualizar o feed'
                : 'Deslize mais para atualizar'}
            </span>
          </div>
        </div>
      )}

      {/* Subtle transient PiP notice on unsupported web browsers */}
      {pipNotice && !isCompactNativePip && (
        <div
          role="status"
          className="pointer-events-none absolute top-3 inset-x-4 z-50 flex justify-center"
        >
          <div className="px-3.5 py-2 rounded-xl bg-zinc-950/95 border border-zinc-700 text-xs font-medium text-zinc-100 text-center shadow-xl max-w-[300px]">
            {pipNotice}
          </div>
        </div>
      )}

      {/* Persistent Single YouTube Player Layer */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-150 ${
          keepPlayerLayerPainted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div ref={playerSlotRef} className="w-full h-full" />
      </div>

      {/* In-app placeholder while video is floating in Web Document PiP */}
      {isDocPipActive && !isCompactNativePip && (
        <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
            <PictureInPicture2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-[260px]">
            <p className="text-sm font-semibold text-white">
              Reproduzindo na janela flutuante
            </p>
            {activeShort && (
              <p className="text-xs text-zinc-400 line-clamp-2">{activeShort.title}</p>
            )}
          </div>
          <button
            type="button"
            onClick={closeDocumentPip}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition-colors cursor-pointer"
          >
            Trazer vídeo de volta
          </button>
        </div>
      )}

      {/* TikTok-style GPU-Accelerated Vertical Slide Viewport */}
      <div
        ref={feedRef}
        className="relative z-20 w-full h-full overflow-hidden touch-none overscroll-none"
      >
        <div
          className={`w-full h-full flex flex-col will-change-transform ${
            shouldAnimateTrack
              ? 'transition-transform duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
              : 'transition-none'
          }`}
          style={{
            transform: `translate3d(${horizontalDragPx}px, calc(${-activeIndex * 100}% + ${dragOffsetPx}px), 0)`,
          }}
        >
        {items.map((short, idx) => {
          const isCurrent = idx === activeIndex;
          const isNearActive = Math.abs(idx - activeIndex) <= 4;
          const isSaved = savedSet.has(short.id);
          const viewsLabel = formatViews(short.viewCount);
          const hidePosterForVideo =
            isCurrent && isVideoVisible && !hasError && !isScrollingMotion;

          if (!isNearActive) {
            return (
              <article
                key={short.id}
                data-short-id={short.id}
                aria-hidden="true"
                className="relative w-full h-full shrink-0 overflow-hidden"
              />
            );
          }

          return (
            <article
              key={short.id}
              data-short-id={short.id}
              className="relative w-full h-full shrink-0 flex items-center justify-center overflow-hidden"
            >
              {/* Full-Frame Thumbnail Poster */}
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-200 ${
                  hidePosterForVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <img
                  src={short.thumbnailUrl}
                  alt={short.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full ${
                    isHorizontalMode &&
                    (short.category === 'biblia' || short.category === 'testemunhos')
                      ? 'object-contain'
                      : 'object-cover'
                  }`}
                />
              </div>

              {/* Tap-to-play/pause interactive surface */}
              <button
                type="button"
                data-stage-surface="true"
                onClick={handleTapTogglePlayPause}
                aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                className="absolute inset-0 z-10 w-full h-full cursor-pointer focus:outline-none"
              />

              {/* Subtle buffering indicator while YouTube player connects */}
              {isCurrent && !isVideoVisible && !hasError && !isScrollingMotion && !isDocPipActive && !feedbackState && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                >
                  <div className="w-11 h-11 rounded-full bg-black/55 backdrop-blur-sm text-white/90 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}

              {/* Snappy transient Play/Pause feedback */}
              {isCurrent && feedbackState && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center">
                    {feedbackState === 'play' ? (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    ) : (
                      <Pause className="w-6 h-6 fill-current" />
                    )}
                  </div>
                </div>
              )}

              {/* Embed restriction fallback */}
              {isCurrent && hasError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center bg-black/90 text-white space-y-3">
                  <p className="text-sm font-medium text-zinc-200">
                    Este vídeo restringiu a reprodução incorporada neste navegador.
                  </p>
                  <a
                    href={
                      short.category === 'louvores' ||
                      short.category === 'pregacoes' ||
                      short.category === 'feliz7play'
                        ? short.youtubeUrl
                        : short.shortsUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span>Assistir no YouTube</span>
                  </a>
                </div>
              )}

              {/* Bottom measured contrast scrim + video details (hidden in compact Android PiP window) */}
              {!isCompactNativePip && (
                <>
                  <div
                    className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-20 ${
                      isCompactLandscape ? 'h-28' : 'h-56'
                    }`}
                  />

                  <div
                    className={`absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end pointer-events-none ${
                      isCompactLandscape
                        ? 'px-3.5 pt-2 pb-[56px] pr-[152px]'
                        : 'px-4 pt-4 pb-[84px] pr-16 sm:px-5 sm:pt-5 sm:pb-[90px] sm:pr-20'
                    }`}
                  >
                    <div className={isCompactLandscape ? 'space-y-0.5' : 'space-y-1.5'}>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-200 font-medium">
                        <span className="font-semibold text-white truncate max-w-[200px]">
                          {short.channelTitle}
                        </span>
                        {short.durationLabel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{short.durationLabel}</span>
                          </>
                        )}
                        {viewsLabel && !isCompactLandscape && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{viewsLabel}</span>
                          </>
                        )}
                      </div>

                      <h2
                        className={`font-display font-semibold text-white leading-snug ${
                          isCompactLandscape
                            ? 'text-sm line-clamp-1'
                            : 'text-base sm:text-[17px] line-clamp-2'
                        }`}
                      >
                        {short.title}
                      </h2>

                      {!isCompactLandscape && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                          <span>{short.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>{short.doctrineLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right-side thumb-zone actions */}
                  <div
                    data-no-swipe="true"
                    className={`absolute z-30 flex items-center ${
                      isCompactLandscape
                        ? 'right-2.5 bottom-[54px] flex-row gap-1'
                        : 'right-2.5 bottom-[86px] sm:bottom-[92px] flex-col gap-3'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAudioUnlocked();
                        onToggleSave(short.id);
                      }}
                      aria-label={isSaved ? 'Remover dos salvos' : 'Salvar vídeo'}
                      className={`${
                        isCompactLandscape ? 'w-10 h-10' : 'w-11 h-11'
                      } rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150 cursor-pointer`}
                    >
                      <Bookmark
                        className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAudioUnlocked();
                        onShare(short);
                      }}
                      aria-label="Compartilhar este vídeo"
                      className={`${
                        isCompactLandscape ? 'w-10 h-10' : 'w-11 h-11'
                      } rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150 cursor-pointer`}
                    >
                      <Share2 className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <a
                      href={
                        short.category === 'louvores' ||
                        short.category === 'pregacoes' ||
                        short.category === 'feliz7play'
                          ? short.youtubeUrl
                          : short.shortsUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Abrir vídeo no YouTube"
                      className={`${
                        isCompactLandscape ? 'w-10 h-10' : 'w-11 h-11'
                      } rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150`}
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </>
              )}
            </article>
          );
        })}
        </div>
      </div>

      {/* Interactive playback progress & seek bar (isolated from swipe gestures at z-40) */}
      {activeShort && !hasError && !isCompactNativePip && (
        <div
          data-no-swipe="true"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black via-black/85 to-transparent ${
            isCompactLandscape
              ? 'px-3.5 pt-1 pb-1.5'
              : 'px-4 pt-2 pb-2.5 sm:px-5 sm:pb-3'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-baseline gap-1 font-mono tabular-nums text-[11px] sm:text-xs leading-none">
              <span className="text-white font-semibold">
                {formatPlaybackTime(displayedTime)}
              </span>
              <span className="text-zinc-500">/</span>
              <span className="text-zinc-300">
                {formatPlaybackTime(effectiveDuration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!playerReady || effectiveDuration <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  seekToSeconds(displayedTime - 10);
                }}
                aria-label="Voltar 10 segundos"
                title="Voltar 10 segundos"
                className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums font-medium text-zinc-300 hover:text-white active:scale-95 py-1 px-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>10s</span>
              </button>

              <button
                type="button"
                disabled={!playerReady || effectiveDuration <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  seekToSeconds(displayedTime + 10);
                }}
                aria-label="Adiantar 10 segundos"
                title="Adiantar 10 segundos"
                className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums font-medium text-zinc-300 hover:text-white active:scale-95 py-1 px-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                <span>10s</span>
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Barra de reprodução do vídeo"
            aria-valuemin={0}
            aria-valuemax={Math.round(effectiveDuration)}
            aria-valuenow={Math.round(displayedTime)}
            aria-valuetext={`${formatPlaybackTime(displayedTime)} de ${formatPlaybackTime(
              effectiveDuration
            )}`}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerUp={handleTrackPointerUp}
            onPointerCancel={handleTrackPointerCancel}
            onKeyDown={handleTrackKeyDown}
            className={`relative w-full flex items-center cursor-pointer touch-none group focus:outline-none focus-visible:ring-1 focus-visible:ring-white/80 rounded ${
              isCompactLandscape ? 'h-7' : 'h-8'
            }`}
          >
            <div
              className={`relative w-full bg-white/25 rounded-full transition-[height] duration-100 ${
                isScrubbing ? 'h-2' : 'h-1 group-hover:h-1.5'
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                aria-hidden="true"
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none transition-transform duration-100 ${
                  isScrubbing ? 'scale-110' : 'scale-90 group-hover:scale-105'
                }`}
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

