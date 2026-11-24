import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
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
import { loadYouTubeIframeApi, type YTPlayer } from '../utils/youtubePlayerApi';
import {
  type DocumentPictureInPictureWindow,
  isDocumentPipAvailable,
  isNativeAndroidPipAvailable,
  requestNativeAndroidPip,
  syncNativePipPlaybackState,
} from '../utils/pictureInPicture';

interface ShortsFeedStageProps {
  items: ChristianShort[];
  activeIndex: number;
  audioUnlocked: boolean;
  autoAdvance: boolean;
  isRefreshing: boolean;
  isNativePipActive?: boolean;
  savedSet: Set<string>;
  feedRef: React.RefObject<HTMLDivElement | null>;
  onActiveIndexChange: (index: number) => void;
  onAudioUnlocked: () => void;
  onToggleSave: (shortId: string) => void;
  onShare: (short: ChristianShort) => void;
  onRefresh: () => void;
  onEnded: () => void;
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

export const ShortsFeedStage: React.FC<ShortsFeedStageProps> = React.memo(({
  items,
  activeIndex,
  audioUnlocked,
  autoAdvance,
  isRefreshing,
  isNativePipActive = false,
  savedSet,
  feedRef,
  onActiveIndexChange,
  onAudioUnlocked,
  onToggleSave,
  onShare,
  onRefresh,
  onEnded,
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
  const wheelLockUntilRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);
  const lastTouchYRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const velocityYRef = useRef<number>(0);
  const dragOffsetPxRef = useRef<number>(0);
  const touchDraggedRef = useRef<boolean>(false);
  const pullDistanceRef = useRef<number>(0);
  const lastWheelTimeRef = useRef<number>(0);
  const lastWheelAbsDeltaRef = useRef<number>(0);
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
  const onEndedRef = useRef(onEnded);
  const onRefreshRef = useRef(onRefresh);
  const onAudioUnlockedRef = useRef(onAudioUnlocked);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);

  activeVideoIdRef.current = activeVideoId;
  activeIndexRef.current = activeIndex;
  itemsLengthRef.current = items.length;
  audioUnlockedRef.current = audioUnlocked;
  autoAdvanceRef.current = autoAdvance;
  isRefreshingRef.current = isRefreshing;
  effectiveDurationRef.current = effectiveDuration;
  currentTimeRef.current = currentTime;
  hasErrorRef.current = hasError;
  onEndedRef.current = onEnded;
  onRefreshRef.current = onRefresh;
  onAudioUnlockedRef.current = onAudioUnlocked;
  onActiveIndexChangeRef.current = onActiveIndexChange;

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
    setIsVideoVisible(false);
    setIsPlaying(false);
    resetPlaybackClock(0);
    if (autoplayCheckTimerRef.current) {
      window.clearTimeout(autoplayCheckTimerRef.current);
      autoplayCheckTimerRef.current = null;
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
      setHasError(false);
      setIsVideoVisible(false);
      resetPlaybackClock(effectiveDurationRef.current);

      if (autoplayCheckTimerRef.current) {
        window.clearTimeout(autoplayCheckTimerRef.current);
        autoplayCheckTimerRef.current = null;
      }

      try {
        player.unMute();
        player.setVolume(100);
        if (isFirstMount) {
          player.playVideo();
        } else {
          player.stopVideo();
          player.loadVideoById({ videoId, startSeconds: 0 });
        }

        // Fallback only if browser blocks unmuted autoplay before first user gesture
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
            } else if (isStarted) {
              onAudioUnlockedRef.current();
            }
          } catch {
            // Ignore transient state errors
          }
        }, 200);
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
            mute: 0,
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
                setIsVideoVisible(true);
              } else if (event.data === YT.PlayerState.PLAYING) {
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

  // Smooth TikTok-style wheel + real-time 1:1 finger drag swipe & velocity flick navigation
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const absDelta = Math.abs(e.deltaY);
      if (absDelta < 8) return;
      e.preventDefault();

      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTimeRef.current;
      const isDeceleratingTail =
        timeSinceLastWheel < 85 && absDelta <= lastWheelAbsDeltaRef.current * 1.05;

      lastWheelTimeRef.current = now;
      lastWheelAbsDeltaRef.current = absDelta;

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
      const y = e.touches[0].clientY;
      touchStartYRef.current = y;
      lastTouchYRef.current = y;
      lastTouchTimeRef.current = performance.now();
      velocityYRef.current = 0;
      dragOffsetPxRef.current = 0;
      touchDraggedRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
      setDragOffsetPx(0);
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const now = performance.now();
      const dt = Math.max(1, now - lastTouchTimeRef.current);
      const instantVelocity = (currentY - lastTouchYRef.current) / dt;
      velocityYRef.current = velocityYRef.current * 0.35 + instantVelocity * 0.65;
      lastTouchYRef.current = currentY;
      lastTouchTimeRef.current = now;

      const deltaY = currentY - touchStartYRef.current; // negative = swiping up (next), positive = swiping down (prev/refresh)
      if (Math.abs(deltaY) > 7) {
        touchDraggedRef.current = true;
        e.preventDefault();
      }

      const idx = activeIndexRef.current;
      const total = itemsLengthRef.current;

      // Top of feed + dragging down: pull-to-refresh + gentle rubber-band slide
      if (idx === 0 && deltaY > 0) {
        const dampedPull = Math.min(180, Math.round(deltaY * 0.78));
        const rubberOffset = Math.min(76, Math.round(deltaY * 0.26));
        pullDistanceRef.current = dampedPull;
        dragOffsetPxRef.current = rubberOffset;
        setPullDistance(dampedPull);
        setDragOffsetPx(rubberOffset);
        return;
      }

      if (pullDistanceRef.current > 0) {
        pullDistanceRef.current = 0;
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
      const pulled = pullDistanceRef.current;
      const velocityY = velocityYRef.current;
      const idx = activeIndexRef.current;
      const total = itemsLengthRef.current;
      const containerHeight = container.clientHeight || 640;
      const distThreshold = Math.max(56, containerHeight * 0.16);
      const hasUpFlick = velocityY < -0.35 && currentOffset < -22;
      const hasDownFlick = velocityY > 0.35 && currentOffset > 22;

      setIsDragging(false);
      dragOffsetPxRef.current = 0;
      setDragOffsetPx(0);

      if (idx === 0 && pulled > 0) {
        if (!isRefreshingRef.current && pulled >= 92) {
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
      setPullDistance(0);
      touchStartYRef.current = null;
      velocityYRef.current = 0;
      window.setTimeout(() => {
        touchDraggedRef.current = false;
      }, 60);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [feedRef, jumpToSlide, triggerSlideWindow]);

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
    onAudioUnlocked();
    const player = playerRef.current;
    if (!player || !playerReady) return;
    try {
      player.unMute();
      player.setVolume(100);
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

  // Sync Android native Picture-in-Picture eligibility with live playback state
  useEffect(() => {
    syncNativePipPlaybackState(isPlaying && !hasError && !isDocPipActive, 9, 16);
  }, [isPlaying, hasError, isDocPipActive, activeVideoId]);

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
        width: 340,
        height: 560,
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
    isPlaying,
    restoreHostFromDocPip,
    showPipInfoNotice,
  ]);

  const handleTogglePictureInPicture = useCallback(() => {
    onAudioUnlocked();
    if (isNativeAndroidPipAvailable()) {
      requestNativeAndroidPip();
      return;
    }
    if (isDocumentPipAvailable()) {
      void openDocumentPip();
      return;
    }
    showPipInfoNotice(
      'No app Android (APK) a janela flutuante abre ao minimizar. No navegador, use Chrome ou Edge no computador.'
    );
  }, [onAudioUnlocked, openDocumentPip, showPipInfoNotice]);

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

  // Register Media Session handler for browsers that support auto-PiP on tab switch
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!isDocumentPipAvailable()) return;

    try {
      (
        navigator.mediaSession as MediaSession & {
          setActionHandler: (action: string, handler: (() => void) | null) => void;
        }
      ).setActionHandler('enterpictureinpicture', () => {
        if (!pipWindowRef.current) {
          void openDocumentPip();
        }
      });
      return () => {
        try {
          (
            navigator.mediaSession as MediaSession & {
              setActionHandler: (action: string, handler: (() => void) | null) => void;
            }
          ).setActionHandler('enterpictureinpicture', null);
        } catch {
          // Ignore
        }
      };
    } catch {
      return undefined;
    }
  }, [openDocumentPip]);

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
  const pullThreshold = 92;
  const showPullIndicator = !isCompactNativePip && (isRefreshing || pullDistance > 16);
  const readyToRefresh = pullDistance >= pullThreshold;
  const pullProgress = Math.min(1, pullDistance / pullThreshold);
  const pullTranslateY = isRefreshing ? 14 : Math.min(64, Math.round(pullDistance * 0.45)) - 6;

  // Hide the stationary YouTube iframe layer while finger-dragging or mid-slide so outgoing & incoming posters glide together like TikTok
  const isActivelyDisplaced = isDragging && Math.abs(dragOffsetPx) > 2;
  const isScrollingMotion =
    isActivelyDisplaced || isSliding || indexDeltaFromLastRender !== 0;
  const shouldAnimateTrack = !isDragging && !isBigNonAdjacentJump;
  const showLivePlayer =
    isVideoVisible && !hasError && !isScrollingMotion && !isDocPipActive;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none overscroll-none">
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
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-200 ${
          showLivePlayer ? 'opacity-100' : 'opacity-0'
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
            transform: `translate3d(0, calc(${-activeIndex * 100}% + ${dragOffsetPx}px), 0)`,
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
                className={`absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-zinc-900 transition-opacity duration-200 ${
                  hidePosterForVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <img
                  src={short.thumbnailUrl}
                  alt={short.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tap-to-play/pause interactive surface */}
              <button
                type="button"
                onClick={handleTapTogglePlayPause}
                aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                className="absolute inset-0 z-10 w-full h-full cursor-pointer focus:outline-none"
              />

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
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-20" />

                  <div className="absolute inset-x-0 bottom-0 z-30 px-4 pt-4 pb-[84px] pr-16 sm:px-5 sm:pt-5 sm:pb-[90px] sm:pr-20 flex flex-col justify-end pointer-events-none">
                    <div className="space-y-1.5">
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
                        {viewsLabel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{viewsLabel}</span>
                          </>
                        )}
                      </div>

                      <h2 className="text-base sm:text-[17px] font-display font-semibold text-white leading-snug line-clamp-2">
                        {short.title}
                      </h2>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                        <span>{short.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{short.doctrineLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right-side thumb-zone actions */}
                  <div className="absolute right-2.5 bottom-[86px] sm:bottom-[92px] z-30 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePictureInPicture();
                      }}
                      aria-label={
                        isDocPipActive
                          ? 'Fechar janela flutuante'
                          : 'Abrir em janela flutuante (PiP)'
                      }
                      title="Janela flutuante (PiP)"
                      className="w-11 h-11 rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150 cursor-pointer"
                    >
                      <PictureInPicture2 className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAudioUnlocked();
                        onToggleSave(short.id);
                      }}
                      aria-label={isSaved ? 'Remover dos salvos' : 'Salvar vídeo'}
                      className="w-11 h-11 rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150 cursor-pointer"
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
                      className="w-11 h-11 rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150 cursor-pointer"
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
                      className="w-11 h-11 rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150"
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
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 z-40 px-4 pt-2 pb-2.5 sm:px-5 sm:pb-3 bg-gradient-to-t from-black via-black/85 to-transparent"
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
            className="relative w-full h-8 flex items-center cursor-pointer touch-none group focus:outline-none focus-visible:ring-1 focus-visible:ring-white/80 rounded"
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

