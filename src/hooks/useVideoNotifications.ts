import { useCallback, useEffect, useRef, useState } from 'react';
import type { ContentCategory } from '../types/shorts';

const STORAGE_KEY = 'gracaplay_notif_prefs_v1';
const LAST_LOCAL_NOTIFIED_KEY = 'gracaplay_local_notified_ids_v1';

const ALL_CATEGORIES: ContentCategory[] = [
  'pregacoes',
  'escola_sabatina',
  'louvores',
  'testemunhos',
  'feliz7play',
];

interface StoredNotificationPrefs {
  enabled: boolean;
  categories: ContentCategory[];
}

interface NativeNotificationBridge {
  isSupported?: () => boolean;
  getPermissionState?: () => string;
  isEnabled?: () => boolean;
  requestPermission?: () => void;
  enable?: (categoriesCsv: string, apiBaseUrl: string) => void;
  updateCategories?: (categoriesCsv: string, apiBaseUrl: string) => void;
  disable?: () => void;
  sendTestNotification?: (categoriesCsv: string, apiBaseUrl: string) => void;
  consumePendingVideoId?: () => string;
}

function getNativeNotificationBridge(): NativeNotificationBridge | null {
  if (typeof window === 'undefined') return null;
  const bridge = (
    window as unknown as { GracaPlayNotifications?: NativeNotificationBridge }
  ).GracaPlayNotifications;
  if (bridge && typeof bridge.isSupported === 'function' && bridge.isSupported()) {
    return bridge;
  }
  return null;
}

function detectNativeCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor;
    return Boolean(cap?.isNativePlatform?.());
  } catch {
    return false;
  }
}

function readStoredPrefs(): StoredNotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { enabled: false, categories: [...ALL_CATEGORIES] };
    }
    const parsed = JSON.parse(raw) as Partial<StoredNotificationPrefs>;
    const validCats = Array.isArray(parsed.categories)
      ? Array.from(
          new Set(
            parsed.categories
              .map((c) => ((c as string) === 'biblia' ? 'pregacoes' : c))
              .filter((c): c is ContentCategory =>
                ALL_CATEGORIES.includes(c as ContentCategory)
              )
          )
        )
      : [...ALL_CATEGORIES];
    return {
      enabled: Boolean(parsed.enabled),
      categories: validCats.length > 0 ? validCats : [...ALL_CATEGORIES],
    };
  } catch {
    return { enabled: false, categories: [...ALL_CATEGORIES] };
  }
}

function writeStoredPrefs(prefs: StoredNotificationPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

function readLocalNotifiedIds(): string[] {
  try {
    const raw = localStorage.getItem(LAST_LOCAL_NOTIFIED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeLocalNotifiedIds(ids: string[]): void {
  try {
    localStorage.setItem(LAST_LOCAL_NOTIFIED_KEY, JSON.stringify(ids.slice(0, 200)));
  } catch {
    // Ignore storage quota errors
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function waitForServiceWorkerReady(
  timeoutMs = 6000
): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
    return reg;
  } catch {
    return null;
  }
}

async function syncPrefsToServiceWorker(
  reg: ServiceWorkerRegistration | null,
  categories: ContentCategory[]
): Promise<void> {
  try {
    const controller = reg?.active || navigator.serviceWorker?.controller;
    controller?.postMessage({
      type: 'GRACAPLAY_SYNC_NOTIF_PREFS',
      categories,
    });
    const regWithSync = reg as
      | (ServiceWorkerRegistration & {
          periodicSync?: {
            register: (tag: string, options?: { minInterval?: number }) => Promise<void>;
          };
        })
      | null;
    if (regWithSync?.periodicSync?.register) {
      await regWithSync.periodicSync.register('gracaplay-new-videos', {
        minInterval: 60 * 60 * 1000,
      });
    }
  } catch {
    // Periodic sync requires installed PWA & permission; safe to ignore when unavailable
  }
}

function resolveRemoteApiBase(rawBase: string): string {
  const trimmed = rawBase.trim().replace(/\/+$/, '');
  if (
    trimmed.startsWith('http') &&
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(trimmed)
  ) {
    return trimmed;
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (
      origin.startsWith('https://') &&
      !/^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(origin)
    ) {
      return origin;
    }
  }
  return '';
}

async function displayLocalOrSwNotification(
  title: string,
  body: string,
  options?: { videoId?: string; image?: string }
): Promise<boolean> {
  try {
    const reg = await waitForServiceWorkerReady(2000);
    const notifOptions: NotificationOptions & { image?: string } = {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      image: options?.image,
      tag: options?.videoId ? `gracaplay-new-${options.videoId}` : 'gracaplay-test',
      data: options?.videoId
        ? {
            videoId: options.videoId,
            url: `/?v=${encodeURIComponent(options.videoId)}`,
          }
        : undefined,
    };
    if (reg && typeof reg.showNotification === 'function') {
      await reg.showNotification(title, notifOptions);
      return true;
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(title, notifOptions);
      return true;
    }
  } catch {
    // Ignore display failure
  }
  return false;
}

export type NotificationPermissionState =
  | 'default'
  | 'granted'
  | 'denied'
  | 'unsupported';

export type NotificationSupportMode =
  | 'native_android'
  | 'web_push'
  | 'local_only'
  | 'unsupported';

export function useVideoNotifications(apiBaseUrl = '') {
  const initialPrefs = readStoredPrefs();
  const nativeBridge = getNativeNotificationBridge();
  const isNativeApp = detectNativeCapacitorApp();

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);
  const requiresIOSHomeScreen = !nativeBridge && isIOS && !isStandalone;

  const hasWebPush =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;
  const hasBasicNotification =
    typeof window !== 'undefined' && 'Notification' in window;

  const supportMode: NotificationSupportMode = nativeBridge
    ? 'native_android'
    : hasWebPush
      ? 'web_push'
      : hasBasicNotification
        ? 'local_only'
        : 'unsupported';
  const isSupported = supportMode !== 'unsupported';

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (nativeBridge) {
      return Boolean(nativeBridge.isEnabled?.());
    }
    return false;
  });
  const [isBusy, setIsBusy] = useState(false);
  const [categories, setCategories] = useState<ContentCategory[]>(
    initialPrefs.categories
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (nativeBridge) {
      const state = nativeBridge.getPermissionState?.();
      if (state === 'granted' || state === 'denied' || state === 'default') {
        return state;
      }
      return 'default';
    }
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  });

  const categoriesRef = useRef<ContentCategory[]>(categories);
  categoriesRef.current = categories;
  const apiBase = apiBaseUrl.replace(/\/+$/, '');
  const remoteApiBase = resolveRemoteApiBase(apiBase);

  const checkLocalUpdates = useCallback(
    async (cats: ContentCategory[], notifyLatest = false) => {
      try {
        const res = await fetch(
          `${apiBase}/api/push/latest?categories=${encodeURIComponent(cats.join(','))}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return null;
        const json = (await res.json()) as {
          items?: Array<{
            id: string;
            title: string;
            channelTitle?: string;
            thumbnailUrl?: string;
          }>;
        };
        const items = json.items ?? [];
        if (items.length === 0) return null;

        if (notifyLatest) {
          const latest = items[0];
          const known = readLocalNotifiedIds();
          writeLocalNotifiedIds([
            latest.id,
            ...known.filter((id) => id !== latest.id),
          ]);
          await displayLocalOrSwNotification(
            'GraçaPlay · Teste de notificação',
            latest.channelTitle
              ? `${latest.title} — ${latest.channelTitle}`
              : latest.title,
            { videoId: latest.id, image: latest.thumbnailUrl }
          );
          return latest;
        }

        const known = readLocalNotifiedIds();
        if (known.length === 0) {
          writeLocalNotifiedIds(items.map((i) => i.id));
          return null;
        }
        const knownSet = new Set(known);
        const fresh = items.find((i) => !knownSet.has(i.id));
        if (!fresh) return null;

        writeLocalNotifiedIds([fresh.id, ...known]);
        await displayLocalOrSwNotification(
          'Novo vídeo no GraçaPlay',
          fresh.channelTitle
            ? `${fresh.title} — ${fresh.channelTitle}`
            : fresh.title,
          { videoId: fresh.id, image: fresh.thumbnailUrl }
        );
        return fresh;
      } catch {
        return null;
      }
    },
    [apiBase]
  );

  // Sync existing subscription & native permission on mount
  useEffect(() => {
    if (nativeBridge) {
      const syncNative = () => {
        const state = nativeBridge.getPermissionState?.();
        const perm: NotificationPermissionState =
          state === 'granted' || state === 'denied' ? state : 'default';
        setPermission(perm);
        const enabled = Boolean(nativeBridge.isEnabled?.()) && perm === 'granted';
        setIsSubscribed(enabled);
        if (enabled) {
          nativeBridge.updateCategories?.(
            categoriesRef.current.join(','),
            remoteApiBase
          );
        }
      };
      syncNative();

      const handlePermEvent = (ev: Event) => {
        const perm = (ev as CustomEvent<{ permission?: string }>).detail?.permission;
        if (perm === 'granted' || perm === 'denied' || perm === 'default') {
          setPermission(perm);
          if (perm !== 'granted') {
            setIsSubscribed(false);
          }
        }
      };
      window.addEventListener('gracaplay-native-notif-permission', handlePermEvent);
      return () => {
        window.removeEventListener('gracaplay-native-notif-permission', handlePermEvent);
      };
    }

    if (!isSupported) return;
    let active = true;

    const syncExisting = async () => {
      setPermission(Notification.permission);
      if (Notification.permission !== 'granted') {
        if (active) setIsSubscribed(false);
        return;
      }

      if (supportMode === 'local_only') {
        const stored = readStoredPrefs();
        if (active) setIsSubscribed(stored.enabled);
        const reg = await waitForServiceWorkerReady(3000);
        if (reg && stored.enabled) {
          await syncPrefsToServiceWorker(reg, categoriesRef.current);
          void checkLocalUpdates(categoriesRef.current, false);
        }
        return;
      }

      const reg = await waitForServiceWorkerReady(5000);
      if (!reg || !active) return;

      try {
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          if (active) setIsSubscribed(true);
          writeStoredPrefs({
            enabled: true,
            categories: categoriesRef.current,
          });
          await syncPrefsToServiceWorker(reg, categoriesRef.current);
          await fetch(`${apiBase}/api/push/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: existingSub.toJSON(),
              categories: categoriesRef.current,
            }),
          }).catch(() => {});
        } else {
          const stored = readStoredPrefs();
          if (active) setIsSubscribed(stored.enabled && supportMode === 'web_push');
        }
      } catch {
        if (active) setIsSubscribed(false);
      }
    };

    void syncExisting();
    return () => {
      active = false;
    };
  }, [apiBase, checkLocalUpdates, isSupported, nativeBridge, remoteApiBase, supportMode]);

  const requestNativePermissionAsync = useCallback(
    (bridge: NativeNotificationBridge): Promise<'granted' | 'denied'> => {
      const current = bridge.getPermissionState?.();
      if (current === 'granted') return Promise.resolve('granted');

      return new Promise((resolve) => {
        let settled = false;
        const finish = (perm: 'granted' | 'denied') => {
          if (settled) return;
          settled = true;
          window.removeEventListener('gracaplay-native-notif-permission', onEvent);
          window.clearTimeout(timer);
          resolve(perm);
        };
        const onEvent = (ev: Event) => {
          const p = (ev as CustomEvent<{ permission?: string }>).detail?.permission;
          finish(p === 'granted' ? 'granted' : 'denied');
        };
        const timer = window.setTimeout(() => {
          const check = bridge.getPermissionState?.();
          finish(check === 'granted' ? 'granted' : 'denied');
        }, 15_000);

        window.addEventListener('gracaplay-native-notif-permission', onEvent);
        bridge.requestPermission?.();
      });
    },
    []
  );

  const enableNotifications = useCallback(
    async (customCategories?: ContentCategory[]): Promise<boolean> => {
      setErrorMessage(null);
      setStatusMessage(null);

      if (requiresIOSHomeScreen) {
        setErrorMessage(
          'No iPhone/iPad, adicione o GraçaPlay à Tela de Início primeiro para receber notificações com o app fechado.'
        );
        return false;
      }

      if (!isSupported) {
        setErrorMessage(
          isNativeApp
            ? 'Esta versão do app Android ainda não inclui o serviço de notificações nativas.'
            : 'Este navegador não oferece suporte a notificações.'
        );
        return false;
      }

      const targetCats =
        customCategories && customCategories.length > 0
          ? customCategories
          : categoriesRef.current;

      setIsBusy(true);
      try {
        if (nativeBridge) {
          const permResult = await requestNativePermissionAsync(nativeBridge);
          setPermission(permResult);
          if (permResult !== 'granted') {
            setErrorMessage(
              'Permissão de notificações negada. Ative as notificações do GraçaPlay nas configurações do Android.'
            );
            return false;
          }
          nativeBridge.enable?.(targetCats.join(','), remoteApiBase);
          writeStoredPrefs({ enabled: true, categories: targetCats });
          setCategories(targetCats);
          setIsSubscribed(true);
          setStatusMessage(
            'Notificações ativadas! Você receberá alertas no celular sempre que novos vídeos entrarem, mesmo com o app fechado.'
          );
          return true;
        }

        const permResult =
          Notification.permission === 'granted'
            ? 'granted'
            : await Notification.requestPermission();
        setPermission(permResult);

        if (permResult !== 'granted') {
          setErrorMessage(
            permResult === 'denied'
              ? 'Permissão bloqueada no navegador. Libere as notificações nas configurações do site.'
              : 'Permissão não concedida para enviar avisos.'
          );
          return false;
        }

        const reg = await waitForServiceWorkerReady(6000);

        if (hasWebPush && reg) {
          try {
            const keyRes = await fetch(`${apiBase}/api/push/public-key`, {
              cache: 'no-store',
            });
            if (!keyRes.ok) {
              throw new Error('Falha ao obter chave de notificação do servidor.');
            }
            const keyData = (await keyRes.json()) as {
              enabled?: boolean;
              publicKey?: string;
            };
            if (!keyData.publicKey) {
              throw new Error('Chave Push indisponível no servidor.');
            }

            let sub = await reg.pushManager.getSubscription();
            const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
            if (!sub) {
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
              });
            }

            const saveRes = await fetch(`${apiBase}/api/push/subscribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscription: sub.toJSON(),
                categories: targetCats,
              }),
            });
            if (!saveRes.ok) {
              throw new Error('Não foi possível registrar seu dispositivo no servidor.');
            }

            await syncPrefsToServiceWorker(reg, targetCats);
            writeStoredPrefs({ enabled: true, categories: targetCats });
            setCategories(targetCats);
            setIsSubscribed(true);
            setStatusMessage(
              'Notificações ativadas! Você será avisado sempre que novos vídeos entrarem, mesmo fora do app.'
            );
            return true;
          } catch {
            // Fall through to local/PeriodicSync notification mode if browser Push service fails (e.g. Brave)
          }
        }

        if (reg) {
          await syncPrefsToServiceWorker(reg, targetCats);
        }
        await checkLocalUpdates(targetCats, false);
        writeStoredPrefs({ enabled: true, categories: targetCats });
        setCategories(targetCats);
        setIsSubscribed(true);
        setStatusMessage(
          'Notificações ativadas neste dispositivo! Novos vídeos serão avisados pelas verificações periódicas e ao abrir o app.'
        );
        return true;
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Não foi possível ativar as notificações agora.'
        );
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [
      apiBase,
      checkLocalUpdates,
      hasWebPush,
      isNativeApp,
      isSupported,
      nativeBridge,
      remoteApiBase,
      requestNativePermissionAsync,
      requiresIOSHomeScreen,
    ]
  );

  const disableNotifications = useCallback(async (): Promise<void> => {
    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      if (nativeBridge) {
        nativeBridge.disable?.();
      } else {
        const reg = await waitForServiceWorkerReady(4000);
        const sub = await reg?.pushManager?.getSubscription();
        if (sub) {
          const endpoint = sub.endpoint;
          await sub.unsubscribe().catch(() => {});
          await fetch(`${apiBase}/api/push/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint }),
          }).catch(() => {});
        }
      }
      writeStoredPrefs({ enabled: false, categories: categoriesRef.current });
      setIsSubscribed(false);
      setStatusMessage('Notificações desativadas neste dispositivo.');
    } finally {
      setIsBusy(false);
    }
  }, [apiBase, nativeBridge]);

  const toggleCategory = useCallback(
    async (cat: ContentCategory): Promise<void> => {
      const current = categoriesRef.current;
      const exists = current.includes(cat);
      if (exists && current.length <= 1) {
        setErrorMessage('Mantenha pelo menos uma categoria selecionada.');
        return;
      }
      setErrorMessage(null);
      const next = exists
        ? current.filter((c) => c !== cat)
        : [...current, cat];
      setCategories(next);
      writeStoredPrefs({ enabled: isSubscribed, categories: next });

      if (isSubscribed) {
        if (nativeBridge) {
          nativeBridge.updateCategories?.(next.join(','), remoteApiBase);
          return;
        }
        const reg = await waitForServiceWorkerReady(3000);
        await syncPrefsToServiceWorker(reg, next);
        const sub = await reg?.pushManager?.getSubscription();
        if (sub) {
          await fetch(`${apiBase}/api/push/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              categories: next,
            }),
          }).catch(() => {});
        }
      }
    },
    [apiBase, isSubscribed, nativeBridge, remoteApiBase]
  );

  const sendTestNotification = useCallback(async (): Promise<void> => {
    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      if (nativeBridge) {
        nativeBridge.sendTestNotification?.(
          categoriesRef.current.join(','),
          remoteApiBase
        );
        setStatusMessage(
          'Notificação de teste enviada! Verifique a barra de notificações do Android.'
        );
        return;
      }

      const reg = await waitForServiceWorkerReady(4000);
      const sub = await reg?.pushManager?.getSubscription();
      if (sub) {
        const res = await fetch(`${apiBase}/api/push/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            subscription: sub.toJSON(),
            categories: categoriesRef.current,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (res.ok && data.ok) {
          setStatusMessage(
            'Notificação enviada! Verifique a barra de notificações do seu dispositivo.'
          );
          return;
        }
      }

      const latest = await checkLocalUpdates(categoriesRef.current, true);
      if (latest) {
        setStatusMessage(
          'Notificação enviada! Verifique a barra de notificações do seu dispositivo.'
        );
        return;
      }

      const shown = await displayLocalOrSwNotification(
        'GraçaPlay · Notificações ativas',
        'Seus alertas de novos vídeos estão funcionando neste dispositivo.'
      );
      if (shown) {
        setStatusMessage(
          'Notificação enviada! Verifique a barra de notificações do seu dispositivo.'
        );
      } else {
        setErrorMessage('Não foi possível exibir a notificação de teste agora.');
      }
    } catch {
      setErrorMessage('Erro de conexão ao enviar notificação de teste.');
    } finally {
      setIsBusy(false);
    }
  }, [apiBase, checkLocalUpdates, nativeBridge, remoteApiBase]);

  return {
    isSupported,
    supportMode,
    isStandalone,
    isNativeApp,
    requiresIOSHomeScreen,
    permission,
    isSubscribed,
    isBusy,
    categories,
    statusMessage,
    errorMessage,
    enableNotifications,
    disableNotifications,
    toggleCategory,
    sendTestNotification,
    clearFeedback: useCallback(() => {
      setStatusMessage(null);
      setErrorMessage(null);
    }, []),
  };
}
