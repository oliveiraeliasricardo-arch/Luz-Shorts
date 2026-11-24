export interface GracaPlayOrientationBridge {
  requestOrientation?: (mode: 'landscape' | 'portrait' | 'auto') => void;
  isSupported?: () => boolean;
}

declare global {
  interface Window {
    GracaPlayOrientation?: GracaPlayOrientationBridge;
  }
}

export interface ViewportOrientationState {
  isLandscapeViewport: boolean;
  isCompactLandscape: boolean;
}

export function getViewportOrientationState(): ViewportOrientationState {
  if (typeof window === 'undefined') {
    return { isLandscapeViewport: false, isCompactLandscape: false };
  }
  const width = window.innerWidth || 0;
  const height = window.innerHeight || 0;
  const isLandscapeViewport = width > height;
  const isCompactLandscape = isLandscapeViewport && height > 0 && height <= 620;
  return { isLandscapeViewport, isCompactLandscape };
}

export function isNativeAndroidOrientationAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const bridge = window.GracaPlayOrientation;
  if (!bridge) return false;
  try {
    return typeof bridge.isSupported === 'function' ? bridge.isSupported() : true;
  } catch {
    return true;
  }
}

export async function requestLandscapeOrientation(): Promise<'native' | 'web' | 'layout_only'> {
  if (typeof window === 'undefined') return 'layout_only';

  if (isNativeAndroidOrientationAvailable()) {
    try {
      window.GracaPlayOrientation?.requestOrientation?.('landscape');
      return 'native';
    } catch {
      // Fall through to web orientation API
    }
  }

  const screenOrientation = window.screen?.orientation as
    | (ScreenOrientation & { lock?: (orientation: string) => Promise<void> })
    | undefined;

  if (screenOrientation && typeof screenOrientation.lock === 'function') {
    try {
      await screenOrientation.lock('landscape');
      return 'web';
    } catch {
      const isTouchDevice =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches;
      if (
        isTouchDevice &&
        typeof document !== 'undefined' &&
        !document.fullscreenElement &&
        typeof document.documentElement?.requestFullscreen === 'function'
      ) {
        try {
          await document.documentElement.requestFullscreen();
          await screenOrientation.lock('landscape');
          return 'web';
        } catch {
          // Browser denied fullscreen or orientation lock; fall back to proportional 16:9 layout
        }
      }
    }
  }

  return 'layout_only';
}

export async function releaseLandscapeOrientation(preferPortrait = false): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isNativeAndroidOrientationAvailable()) {
    try {
      window.GracaPlayOrientation?.requestOrientation?.(
        preferPortrait ? 'portrait' : 'auto'
      );
      return;
    } catch {
      // Ignore native bridge failure
    }
  }

  try {
    const screenOrientation = window.screen?.orientation;
    if (screenOrientation && typeof screenOrientation.unlock === 'function') {
      screenOrientation.unlock();
    }
  } catch {
    // Ignore orientation unlock errors
  }

  if (typeof document !== 'undefined' && document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {
      // Ignore fullscreen exit errors
    }
  }
}
