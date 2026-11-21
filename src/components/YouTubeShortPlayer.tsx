import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Pause,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { ChristianShort } from '../types/shorts';
import { loadYouTubeIframeApi, type YTPlayer } from '../utils/youtubePlayerApi';

interface YouTubeShortPlayerProps {
  short: ChristianShort;
  isActive: boolean;
  shouldMountPlayer: boolean;
  isMuted: boolean;
  autoAdvance: boolean;
  isSaved: boolean;
  onToggleMute: () => void;
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
  shouldMountPlayer,
  isMuted,
  autoAdvance,
  isSaved,
  onToggleMute,
  onToggleSave,
  onShare,
  onEnded,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'play' | 'pause' | null>(null);

  const isActiveRef = useRef(isActive);
  const isMutedRef = useRef(isMuted);
  const autoAdvanceRef = useRef(autoAdvance);
  const onEndedRef = useRef(onEnded);

  isActiveRef.current = isActive;
  isMutedRef.current = isMuted;
  autoAdvanceRef.current = autoAdvance;
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!shouldMountPlayer || !hostRef.current) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore destroy cleanup error
        }
        playerRef.current = null;
        setIsReady(false);
        setIsPlaying(false);
        setProgress(0);
      }
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
        if (cancelled || !hostRef.current) return;

        const player = new YT.Player(mountNode, {
          videoId: short.id,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: isActiveRef.current ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            mute: isMutedRef.current ? 1 : 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              playerRef.current = event.target;
              setIsReady(true);

              if (isMutedRef.current) {
                event.target.mute();
              } else {
                event.target.unMute();
              }

              if (isActiveRef.current) {
                event.target.playVideo();
              } else {
                event.target.pauseVideo();
              }
            },
            onStateChange: (event) => {
              if (cancelled) return;
              if (event.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true);
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
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup
        }
        playerRef.current = null;
      }
      setIsReady(false);
      setIsPlaying(false);
    };
  }, [short.id, shouldMountPlayer]);

  // Sync active playback
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    try {
      if (isActive) {
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    } catch {
      // Player might still be transitioning
    }
  }, [isActive, isReady, isMuted]);

  // Sync mute changes immediately
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    try {
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
      }
    } catch {
      // Ignore
    }
  }, [isMuted, isReady]);

  // Poll video playback progress while active & playing
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
    }, 250);
    return () => window.clearInterval(interval);
  }, [isActive, isReady, isPlaying]);

  const handleTogglePlayPause = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    try {
      if (isPlaying) {
        player.pauseVideo();
        setFeedbackState('pause');
      } else {
        if (!isMuted) player.unMute();
        player.playVideo();
        setFeedbackState('play');
      }
      window.setTimeout(() => setFeedbackState(null), 450);
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

      {/* Embedded YouTube IFrame Player */}
      <div
        ref={hostRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${
          isReady && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Tap-to-play/pause interactive surface */}
      <button
        type="button"
        onClick={handleTogglePlayPause}
        aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        className="absolute inset-0 z-10 w-full h-full cursor-pointer focus:outline-none"
      />

      {/* Subtle transient Play/Pause tap feedback */}
      {feedbackState && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center">
            {feedbackState === 'play' ? (
              <Play className="w-7 h-7 fill-current ml-0.5" />
            ) : (
              <Pause className="w-7 h-7 fill-current" />
            )}
          </div>
        </div>
      )}

      {/* Fallback message if embed fails */}
      {hasError && (
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

      {/* Top subtle scrim & sound unlock cue */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/55 to-transparent z-20" />
      {isActive && isMuted && (
        <div className="absolute top-3.5 left-3.5 z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="inline-flex items-center gap-2 px-3.5 min-h-[40px] rounded-xl bg-black/60 hover:bg-black/75 backdrop-blur-md text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
          >
            <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Ativar som</span>
          </button>
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

      {/* Right-side thumb-zone vertical controls (>=44x44px hitboxes) */}
      <div className="absolute right-2.5 bottom-5 z-30 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTogglePlayPause();
          }}
          aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
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
            onToggleMute();
          }}
          aria-label={isMuted ? 'Ativar som' : 'Silenciar vídeo'}
          className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(short.id);
          }}
          aria-label={isSaved ? 'Remover dos salvos' : 'Salvar vídeo'}
          className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors cursor-pointer ${
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
            onShare(short);
          }}
          aria-label="Compartilhar este vídeo"
          className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5" aria-hidden="true" />
        </button>

        <a
          href={short.shortsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="Abrir vídeo no YouTube"
          className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-colors"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>

      {/* Bottom hairline progress bar (compositor-only transform) */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden"
      >
        <div
          className="h-full w-full bg-sky-400 origin-left transition-transform duration-200 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </article>
  );
};
