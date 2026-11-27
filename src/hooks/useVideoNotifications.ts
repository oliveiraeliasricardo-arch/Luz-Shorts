import { useCallback, useEffect, useRef, useState } from 'react';
import type { ContentCategory } from '../types/shorts';

const STORAGE_KEY = 'gracaplay_notif_prefs_v1';

const ALL_CATEGORIES: ContentCategory[] = [
  'pregacoes',
  'biblia',
  'louvores',
  'testemunhos',
  'feliz7play',
];

interface StoredNotificationPrefs {
  enabled: boolean;
  categories: ContentCategory[];
}

function readStoredPrefs(): StoredNotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { enabled: false, categories: [...ALL_CATEGORIES] };
    }
    const parsed = JSON.parse(raw) as Partial<StoredNotificationPrefs>;
    const validCats = Array.isArray(parsed.categories)
      ? parsed.categories.filter((c): c is ContentCategory =>
          ALL_CATEGORIES.includes(c as ContentCategory)
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

export type NotificationPermissionState =
  | 'default'
  | 'granted'
  | 'denied'
  | 'unsupported';

export function useVideoNotifications(apiBaseUrl = '') {
  const initialPrefs = readStoredPrefs();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [categories, setCategories] = useState<ContentCategory[]>(
    initialPrefs.categories
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  });

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);
  const requiresIOSHomeScreen = isIOS && !isStandalone;
  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const categoriesRef = useRef<ContentCategory[]>(categories);
  categoriesRef.current = categories;
  const apiBase = apiBaseUrl.replace(/\/+$/, '');

  // Check existing subscription and silently re-sync with server on mount
  useEffect(() => {
    if (!isSupported) return;
    let active = true;

    const syncExisting = async () => {
      setPermission(Notification.permission);
      if (Notification.permission !== 'granted') {
        if (active) setIsSubscribed(false);
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
          if (active) setIsSubscribed(false);
        }
      } catch {
        if (active) setIsSubscribed(false);
      }
    };

    void syncExisting();
    return () => {
      active = false;
    };
  }, [apiBase, isSupported]);

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
          'Este navegador não oferece suporte a notificações em segundo plano (Web Push).'
        );
        return false;
      }

      setIsBusy(true);
      try {
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
        if (!reg) {
          setErrorMessage(
            'O serviço em segundo plano ainda está iniciando. Recarregue a página e tente novamente.'
          );
          return false;
        }

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

        const targetCats =
          customCategories && customCategories.length > 0
            ? customCategories
            : categoriesRef.current;

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
    [apiBase, isSupported, requiresIOSHomeScreen]
  );

  const disableNotifications = useCallback(async (): Promise<void> => {
    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const reg = await waitForServiceWorkerReady(4000);
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe().catch(() => {});
        await fetch(`${apiBase}/api/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        }).catch(() => {});
      }
      writeStoredPrefs({ enabled: false, categories: categoriesRef.current });
      setIsSubscribed(false);
      setStatusMessage('Notificações em segundo plano desativadas neste dispositivo.');
    } finally {
      setIsBusy(false);
    }
  }, [apiBase]);

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
        const reg = await waitForServiceWorkerReady(3000);
        await syncPrefsToServiceWorker(reg, next);
        const sub = await reg?.pushManager.getSubscription();
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
    [apiBase, isSubscribed]
  );

  const sendTestNotification = useCallback(async (): Promise<void> => {
    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const reg = await waitForServiceWorkerReady(4000);
      const sub = await reg?.pushManager.getSubscription();
      if (!sub) {
        setErrorMessage('Ative as notificações primeiro para testar.');
        return;
      }
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
        videoTitle?: string;
      };
      if (!res.ok || !data.ok) {
        setErrorMessage(
          data.error || 'Não foi possível enviar a notificação de teste.'
        );
        return;
      }
      setStatusMessage(
        'Notificação enviada! Verifique a barra de notificações do seu dispositivo.'
      );
    } catch {
      setErrorMessage('Erro de conexão ao enviar notificação de teste.');
    } finally {
      setIsBusy(false);
    }
  }, [apiBase]);

  return {
    isSupported,
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
