export interface YTPlayer {
  loadVideoById: (options: { videoId: string; startSeconds?: number } | string) => void;
  cueVideoById: (options: { videoId: string; startSeconds?: number } | string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API requires a browser environment'));
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    let settled = false;
    let pollTimer: number | null = null;
    let timeoutTimer: number | null = null;

    const cleanup = () => {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer);
        pollTimer = null;
      }
      if (timeoutTimer !== null) {
        window.clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
    };

    const tryResolve = () => {
      if (settled) return false;
      if (window.YT && window.YT.Player) {
        settled = true;
        cleanup();
        resolve(window.YT);
        return true;
      }
      return false;
    };

    if (tryResolve()) return;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      if (!tryResolve() && !settled) {
        settled = true;
        cleanup();
        apiPromise = null;
        reject(new Error('YouTube IFrame API failed to initialize'));
      }
    };

    pollTimer = window.setInterval(() => {
      tryResolve();
    }, 40);

    timeoutTimer = window.setTimeout(() => {
      if (!settled && !tryResolve()) {
        settled = true;
        cleanup();
        apiPromise = null;
        reject(new Error('YouTube IFrame API load timeout'));
      }
    }, 10000);

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        tryResolve();
      }, { once: true });
      existingScript.addEventListener('error', () => {
        if (!settled) {
          settled = true;
          cleanup();
          apiPromise = null;
          reject(new Error('Failed to load YouTube IFrame API script'));
        }
      }, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        if (!settled) {
          settled = true;
          cleanup();
          apiPromise = null;
          reject(new Error('Failed to load YouTube IFrame API script'));
        }
      };
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}
