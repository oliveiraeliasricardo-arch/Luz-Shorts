import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Pause,
  Play,
  Share2,
} from 'lucide-react';
import type { ChristianShort } from '../types/shorts';
import { loadYouTubeIframeApi, type YTPlayer } from '../utils/youtubePlayerApi';

interface YouTubeShortPlayerProps {
  short: ChristianShort;
  isActive: boolean;
  audioUnlocked: boolean;
  autoAdvance: boolean;
  isSaved: boolean;
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

export const YouTubeShortPlayer: React.FC<YouTubeShortPlayerProps> = ({
  short,
  isActive,
  audioUnlocked,
  autoAdvance,
  isSaved,
  onAudioUnlocked,
  onToggleSave,
  onShare,
  onEnded,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const autoplayCheckTimerRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'play' | 'pause' | null>(null);

  const isActiveRef = useRef(isActive);
  const audioUnlockedRef = useRef(audioUnlocked);
  const autoAdvanceRef = useRef(autoAdvance);
  const onEndedRef = useRef(onEnded);
  const onAudioUnlockedRef = useRef(onAudioUnlocked);

  isActiveRef.current = isActive;
  audioUnlockedRef.current = audioUnlocked;
  autoAdvanceRef.current = autoAdvance;
  onEndedRef.current = onEnded;
  onAudioUnlockedRef.current = onAudioUnlocked;

  useEffect(() => {
    if (!isActive || !hostRef.current) {
      if (autoplayCheckTimerRef.current) {
        window.clearTimeout(autoplayCheckTimerRef.current);
        autoplayCheckTimerRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.stopVideo();
          playerRef.current.destroy();
        } catch {
          // Ignore destroy cleanup error
        }
        playerRef.current = null;
      }
      if (hostRef.current) {
        hostRef.current.innerHTML = '';
      }
      setIsReady(false);
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    let cancelled = false;
    setHasError(false);

    const mountNode = document.createElement('div');
    mountNode.className = 'w-full h-full';
    hostRef.current.innerHTML = '';
    hostRef.current.appendChild(mountNode);

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current || !isActiveRef.current) return;

        const player = new YT.Player(mountNode, {
          videoId: short.id,
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
              if (cancelled || !isActiveRef.current) {
                try {
                  event.target.stopVideo();
                  event.target.destroy();
                } catch {
                  // Ignore
                }
                return;
              }
              playerRef.current = event.target;
              setIsReady(true);

              try {
                event.target.unMute();
                event.target.setVolume(100);
                event.target.playVideo();

                autoplayCheckTimerRef.current = window.setTimeout(() => {
                  if (cancelled || !isActiveRef.current) return;
                  try {
                    const state = event.target.getPlayerState();
                    const isStarted =
                      state === YT.PlayerState.PLAYING ||
                      state === YT.PlayerState.BUFFERING;
                    if (!isStarted && !audioUnlockedRef.current) {
                      event.target.mute();
                      event.target.playVideo();
                    } else if (isStarted) {
                      onAudioUnlockedRef.current();
                    }
                  } catch {
                    // Ignore transient state errors
                  }
                }, 260);
              } catch {
                // Ignore transient play errors
              }
            },
            onStateChange: (event) => {
              if (cancelled || !isActiveRef.current) return;
              if (event.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true);
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
              if (!cancelled) setHasError(true);
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
      if (hostRef.current) {
        hostRef.current.innerHTML = '';
      }
      setIsReady(false);
      setIsPlaying(false);
      setProgress(0);
    };
  }, [short.id, isActive]);

  // Unmute automatically as soon as user interacts anywhere with the page
  useEffect(() => {
    if (!audioUnlocked || !isActive || !isReady || !playerRef.current) return;
    try {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
    } catch {
      // Ignore
    }
  }, [audioUnlocked, isActive, isReady]);

  // Snappy 100ms progress polling while playing
  useEffect(() => {
    if (!isActive || !isReady || !isPlaying) return;
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
  }, [isActive, isReady, isPlaying]);

  const handleTogglePlayPause = () => {
    onAudioUnlocked();
    const player = playerRef.current;
    if (!player || !isReady) return;
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
      window.setTimeout(() => setFeedbackState(null), 240);
    } catch {
      // Ignore
    }
  };

  const viewsLabel = formatViews(short.viewCount);

  return (
    <article
      data-short-id={short.id}
      className="relative w-full h-full snap-start snap-always flex items-center justify-center bg-slate-950 overflow-hidden select-none"
    >
      {/* Thumbnail poster + resilient CSS fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950">
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90"
        />
      </div>

      {/* Single Active YouTube IFrame Player */}
      <div
        ref={hostRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-150 ${
          isActive && isReady && !hasError ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Tap-to-play/pause interactive surface */}
      <button
        type="button"
        onClick={handleTogglePlayPause}
        aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        className="absolute inset-0 z-10 w-full h-full cursor-pointer focus:outline-none"
      />

      {/* Snappy transient Play/Pause tap feedback */}
      {feedbackState && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center transition-transform duration-150 scale-100">
            {feedbackState === 'play' ? (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            ) : (
              <Pause className="w-6 h-6 fill-current" />
            )}
          </div>
        </div>
      )}

      {/* Fallback message if embed fails */}
      {hasError && isActive && (
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

      {/* Right-side streamlined thumb-zone controls (>=44x44px hitboxes) */}
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
          {isPlaying ? (
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
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden"
      >
        <div
          className="h-full w-full bg-sky-400 origin-left transition-transform duration-100 ease-linear"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </article>
  );
};
