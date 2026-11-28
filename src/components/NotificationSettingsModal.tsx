import React from 'react';
import { Bell, BellOff, BellRing, Check, Send, Smartphone, X } from 'lucide-react';
import type { ContentCategory } from '../types/shorts';
import type {
  NotificationPermissionState,
  NotificationSupportMode,
} from '../hooks/useVideoNotifications';

const CATEGORY_OPTIONS: Array<{ id: ContentCategory; label: string }> = [
  { id: 'pregacoes', label: 'Pregações e Bíblia' },
  { id: 'escola_sabatina', label: 'Escola Sabatina (Adultos e Jovens)' },
  { id: 'louvores', label: 'Louvores' },
  { id: 'testemunhos', label: 'Testemunhos' },
  { id: 'feliz7play', label: 'Feliz7Play' },
];

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupported: boolean;
  supportMode: NotificationSupportMode;
  isStandalone: boolean;
  isNativeApp: boolean;
  requiresIOSHomeScreen: boolean;
  permission: NotificationPermissionState;
  isSubscribed: boolean;
  isBusy: boolean;
  categories: ContentCategory[];
  statusMessage: string | null;
  errorMessage: string | null;
  onEnable: () => Promise<boolean>;
  onDisable: () => Promise<void>;
  onToggleCategory: (category: ContentCategory) => Promise<void>;
  onSendTest: () => Promise<void>;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
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
  onEnable,
  onDisable,
  onToggleCategory,
  onSendTest,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-zinc-950 rounded-t-3xl sm:rounded-2xl border border-zinc-800 shadow-2xl p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1.5 bg-zinc-700 rounded-full mx-auto -mt-1 mb-1" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shrink-0">
              {isSubscribed ? (
                <BellRing className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Bell className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2
                id="notif-modal-title"
                className="text-base font-display font-bold text-white leading-tight"
              >
                Alertas de novos vídeos
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Receba avisos mesmo com o app fechado
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações de notificações"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {requiresIOSHomeScreen ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-white shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              No iPhone/iPad, toque em <strong className="text-white">Compartilhar</strong> e depois em{' '}
              <strong className="text-white">Adicionar à Tela de Início</strong> para liberar notificações em segundo plano.
            </span>
          </div>
        ) : !isSupported ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 text-xs text-zinc-300 leading-relaxed">
            {isNativeApp
              ? 'Esta instalação do aplicativo Android precisa ser atualizada para a versão mais recente para ativar as notificações nativas em segundo plano.'
              : isStandalone
                ? 'O navegador usado na instalação deste aplicativo bloqueia notificações neste dispositivo. Para receber alertas fora do app, habilite as notificações nas configurações do navegador ou instale pelo Chrome, Edge ou Firefox.'
                : 'Este navegador não suporta notificações em segundo plano. Para receber alertas fora do app, abra o GraçaPlay no Chrome, Edge ou Firefox.'}
          </div>
        ) : permission === 'denied' ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 leading-relaxed">
            {supportMode === 'native_android'
              ? 'As notificações estão desativadas para o GraçaPlay no Android. Abra Configurações > Aplicativos > GraçaPlay > Notificações e ative a permissão.'
              : 'As notificações estão bloqueadas nas permissões do navegador para este site. Toque no ícone de cadeado na barra de endereços e altere Notificações para Permitir.'}
          </div>
        ) : supportMode === 'local_only' && !isSubscribed ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 text-xs text-zinc-300 leading-relaxed">
            Este navegador não mantém Web Push remoto com o aplicativo totalmente fechado, mas você pode ativar os alertas para verificações periódicas e ao abrir o app.
          </div>
        ) : null}

        {/* Category choices */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-zinc-300">
            Categorias que deseja acompanhar
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORY_OPTIONS.map((opt) => {
              const selected = categories.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => void onToggleCategory(opt.id)}
                  className={`h-9 px-3 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    selected
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        {statusMessage && (
          <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-2.5 leading-relaxed">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3.5 py-2.5 leading-relaxed">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          {!isSubscribed ? (
            <button
              type="button"
              disabled={isBusy || requiresIOSHomeScreen || !isSupported}
              onClick={() => void onEnable()}
              className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-45 disabled:pointer-events-none text-black text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <BellRing className="w-4 h-4" aria-hidden="true" />
              <span>{isBusy ? 'Ativando...' : 'Ativar notificações em segundo plano'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void onSendTest()}
                className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{isBusy ? 'Enviando...' : 'Enviar notificação de teste'}</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void onDisable()}
                className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900 disabled:opacity-50 text-zinc-300 text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <BellOff className="w-4 h-4" aria-hidden="true" />
                <span>Desativar neste dispositivo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
