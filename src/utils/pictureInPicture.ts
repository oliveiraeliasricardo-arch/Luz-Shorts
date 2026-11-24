export interface GracaPlayNativePipBridge {
  setPlaybackState?: (playing: boolean, width: number, height: number) => void;
  enterPip?: () => void;
  isSupported?: () => boolean;
}

export interface DocumentPictureInPictureWindow extends Window {
  document: Document;
  close: () => void;
}

export interface DocumentPictureInPictureApi {
  window: DocumentPictureInPictureWindow | null;
  requestWindow: (options?: {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
  }) => Promise<DocumentPictureInPictureWindow>;
}

declare global {
  interface Window {
    GracaPlayNativePip?: GracaPlayNativePipBridge;
    documentPictureInPicture?: DocumentPictureInPictureApi;
  }
}

export function isNativeAndroidPipAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const bridge = window.GracaPlayNativePip;
  if (!bridge) return false;
  try {
    return typeof bridge.isSupported === 'function' ? bridge.isSupported() : true;
  } catch {
    return true;
  }
}

export function isDocumentPipAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'documentPictureInPicture' in window &&
    typeof window.documentPictureInPicture?.requestWindow === 'function'
  );
}

export function syncNativePipPlaybackState(
  playing: boolean,
  aspectWidth = 9,
  aspectHeight = 16
): void {
  if (typeof window === 'undefined') return;
  try {
    window.GracaPlayNativePip?.setPlaybackState?.(playing, aspectWidth, aspectHeight);
  } catch {
    // Ignore bridge errors on web or unsupported devices
  }
}

export function requestNativeAndroidPip(): boolean {
  if (!isNativeAndroidPipAvailable()) return false;
  try {
    window.GracaPlayNativePip?.enterPip?.();
    return true;
  } catch {
    return false;
  }
}
