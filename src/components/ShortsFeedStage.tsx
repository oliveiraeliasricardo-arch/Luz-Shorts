import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Pause,
  Play,
  Share2,
} from 'lucide-react';
import type { ChristianShort } from '../types/shorts';
import { loadYouTubeIframeApi, type YTPlayer } from '../utils/youtubePlayerApi';

interface ShortsFeedStageProps {
  items: ChristianShort[];
  activeIndex: number;
  audioUnlocked: boolean;
  autoAdvance: boolean;
  savedSet: Set<string>;
  feedRef: React.RefObject<HTMLDivElement | null>;
  onActiveIndexChange: (index: number) => void;
  onAudioUnlocked: () => void;
  onToggleSave: (shortId: string) => void;
  onShare: (short: ChristianShort) => void;
  onEnded: () => void;
}

function formatViews(views: number | null): string | null {
  if (views === null || !Number.isFinite(views)) return null;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace('.', ',')}M visualizações`;
  if (views >= 1_000) return `${Math.round(views / 1_000)} mil visualizações`;
  return `${views} visualizações`;
}

export const ShortsFeedStage: React.FC<ShortsFeedStageProps> = ({
  items,
  activeIndex,
  audioUnlocked,
  autoAdvance,
  savedSet,
  feedRef,
  onActiveIndexChange,
  onAudioUnlocked,
  onToggleSave,
  onShare,
  onEnded,
}) => {
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const autoplayCheckTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'play' | 'pause' | null>(null);

  const activeShort = items[activeIndex] ?? items[0] ?? null;
  const activeVideoId = activeShort?.id ?? null;

  const activeVideoIdRef = useRef<string | null>(activeVideoId);
  const activeIndexRef = useRef(activeIndex);
  const audioUnlockedRef = useRef(audioUnlocked);
  const autoAdvanceRef = useRef(autoAdvance);
  const onEndedRef = useRef(onEnded);
  const onAudioUnlockedRef = useRef(onAudioUnlocked);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);

  activeVideoIdRef.current = activeVideoId;
  activeIndexRef.current = activeIndex;
  audioUnlockedRef.current = audioUnlocked;
  autoAdvanceRef.current = autoAdvance;
  onEndedRef.current = onEnded;
  onAudioUnlockedRef.current = onAudioUnlocked;
  onActiveIndexChangeRef.current = onActiveIndexChange;

  const silenceCurrentVideoImmediately = useCallback(() => {
    setIsVideoVisible(false);
    setIsPlaying(false);
    setProgress(0);
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
  }, []);

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
      setProgress(0);

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
    []
  );

  // Boot ONE single persistent YouTube IFrame Player once
  useEffect(() => {
    if (!playerHostRef.current || !activeVideoId) return;

    let cancelled = false;
    const initialVideoId = activeVideoId;
    const mountNode = document.createElement('div');
    mountNode.className = 'w-full h-full';
    playerHostRef.current.innerHTML = '';
    playerHostRef.current.appendChild(mountNode);

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !playerHostRef.current) return;

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
              // Reveal player immediately on BUFFERING as well as PLAYING so the video decoder
              // paints frames before audio begins (zero audio-before-video desync).
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
                setProgress(1);
                if (autoAdvanceRef.current) {
                  onEndedRef.current();
                } else {
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
      if (playerRef.current) {
        try {
          playerRef.current.stopVideo();
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup
        }
        playerRef.current = null;
      }
      if (playerHostRef.current) {
        playerHostRef.current.innerHTML = '';
      }
      currentVideoIdRef.current = null;
      setPlayerReady(false);
      setIsPlaying(false);
      setIsVideoVisible(false);
    };
    // Mount single persistent player once and reuse via loadVideoById
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(activeVideoId)]);

  // Switch videos instantaneously via loadVideoById whenever activeVideoId changes and scroll settles
  useEffect(() => {
    if (!playerReady || !playerRef.current || !activeVideoId || isScrolling) {
      return;
    }
    if (currentVideoIdRef.current !== activeVideoId) {
      startPlaybackOnPlayer(playerRef.current, activeVideoId, false);
    }
  }, [activeVideoId, playerReady, isScrolling, startPlaybackOnPlayer]);

  // Cut audio synchronously on scroll start and finalize immediately when aligned
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const finalizeScroll = () => {
      const h = container.clientHeight;
      if (h > 0) {
        const nextIdx = Math.max(
          0,
          Math.min(items.length - 1, Math.round(container.scrollTop / h))
        );
        if (nextIdx !== activeIndexRef.current) {
          onActiveIndexChangeRef.current(nextIdx);
        }
      }
      setIsScrolling(false);
    };

    const handleScroll = () => {
      const h = container.clientHeight;
      if (h <= 0) return;

      const nearestIdx = Math.max(
        0,
        Math.min(items.length - 1, Math.round(container.scrollTop / h))
      );
      const distanceFromNearest = Math.abs(container.scrollTop - nearestIdx * h);

      if (nearestIdx !== activeIndexRef.current) {
        silenceCurrentVideoImmediately();
        onActiveIndexChangeRef.current(nearestIdx);
      }

      // If already snapped to a slide (e.g. instant jump or scroll just landed), finalize immediately
      if (distanceFromNearest <= 2) {
        if (settleTimerRef.current) {
          window.clearTimeout(settleTimerRef.current);
          settleTimerRef.current = null;
        }
        setIsScrolling(false);
        return;
      }

      // Actively mid-swipe between two slides: cut audio and show thumbnail deck
      setIsScrolling(true);
      silenceCurrentVideoImmediately();

      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
      }
      settleTimerRef.current = window.setTimeout(finalizeScroll, 45);
    };

    const handleScrollEnd = () => {
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      finalizeScroll();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('scrollend', handleScrollEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scrollend', handleScrollEnd);
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, [feedRef, items.length, silenceCurrentVideoImmediately]);

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

  // Fast 100ms progress bar polling
  useEffect(() => {
    if (!playerReady || !isPlaying || isScrolling) return;
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const duration = player.getDuration();
        const current = player.getCurrentTime();
        if (duration > 0) {
          setProgress(Math.min(1, Math.max(0, current / duration)));
        }
      } catch {
        // Ignore
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, [playerReady, isPlaying, isScrolling]);

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

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Persistent Single YouTube Player Layer (zero transition delay so video frames paint in sync with audio) */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none ${
          isVideoVisible && !isScrolling && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div ref={playerHostRef} className="w-full h-full" />
      </div>

      {/* Scroll-Snap Thumbnail Slide Feed */}
      <div
        ref={feedRef}
        className="relative z-20 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {items.map((short, idx) => {
          const isCurrent = idx === activeIndex;
          const isSaved = savedSet.has(short.id);
          const viewsLabel = formatViews(short.viewCount);
          const hidePosterForVideo =
            isCurrent && isVideoVisible && !isScrolling && !hasError;

          return (
            <article
              key={short.id}
              data-short-id={short.id}
              className="relative w-full h-full snap-start snap-always flex items-center justify-center overflow-hidden"
            >
              {/* Thumbnail Poster (instant cut when video starts buffering/playing—no slow fade) */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 ${
                  hidePosterForVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <img
                  src={short.thumbnailUrl}
                  alt={short.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>

              {/* Tap-to-play/pause interactive surface */}
              <button
                type="button"
                onClick={handleTogglePlayPause}
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
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center bg-slate-950/80 text-white space-y-3">
                  <p className="text-sm font-medium text-slate-200">
                    Este vídeo restringiu a reprodução incorporada neste navegador.
                  </p>
                  <a
                    href={short.shortsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-xs font-semibold text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span>Assistir no YouTube</span>
                  </a>
                </div>
              )}

              {/* Bottom measured contrast scrim + video details */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-20" />

              <div className="absolute inset-x-0 bottom-0 z-30 p-4 pr-16 sm:p-5 sm:pr-20 flex flex-col justify-end pointer-events-none">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-200 font-medium">
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

                  <div className="flex items-center gap-1.5 text-xs text-sky-200/95 font-medium">
                    <span>{short.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{short.doctrineLabel}</span>
                  </div>
                </div>
              </div>

              {/* Right-side thumb-zone actions */}
              <div className="absolute right-2.5 bottom-5 z-30 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePlayPause();
                  }}
                  aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                  className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 active:scale-95 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-all duration-150 cursor-pointer"
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAudioUnlocked();
                    onToggleSave(short.id);
                  }}
                  aria-label={isSaved ? 'Remover dos salvos' : 'Salvar vídeo'}
                  className={`w-11 h-11 rounded-full active:scale-95 backdrop-blur-md flex items-center justify-center border transition-all duration-150 cursor-pointer ${
                    isSaved
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-black/50 hover:bg-black/70 text-white border-white/15'
                  }`}
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
                  className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 active:scale-95 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-all duration-150 cursor-pointer"
                >
                  <Share2 className="w-5 h-5" aria-hidden="true" />
                </button>

                <a
                  href={short.shortsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Abrir vídeo no YouTube"
                  className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 active:scale-95 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-all duration-150"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              {/* Bottom hairline progress bar */}
              {isCurrent && (
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden"
                >
                  <div
                    className="h-full w-full bg-sky-400 origin-left transition-transform duration-100 ease-linear"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
