import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'sidebar' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'sidebar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={handleTrigger}
          aria-label="Instalar aplicativo"
          className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-xs font-semibold text-zinc-100 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
        >
          <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleTrigger}
          className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-100 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Smartphone className="w-4 h-4 shrink-0 text-zinc-300" aria-hidden="true" />
          <span>{isInstallable ? 'Instalar como App' : 'Instalar no celular'}</span>
        </button>
      )}

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-guide-title"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-zinc-950 rounded-t-3xl sm:rounded-2xl border border-zinc-800 shadow-2xl p-5 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-10 h-1.5 bg-zinc-700 rounded-full mx-auto -mt-1 mb-1" />

            <div className="flex items-start justify-between gap-3">
              <h3
                id="pwa-install-guide-title"
                className="text-base font-display font-bold text-white"
              >
                Instalar GraçaPlay como App
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Fechar instruções de instalação"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2.5 text-sm text-zinc-400 leading-relaxed">
                <li>
                  1. Toque no ícone <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline" aria-hidden="true" /> Compartilhar</strong> na barra do Safari.
                </li>
                <li>
                  2. Role as opções e selecione <strong className="text-white">Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  3. Confirme em <strong className="text-white">Adicionar</strong> para abrir em tela cheia.
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-sm text-zinc-400 leading-relaxed">
                <li>
                  1. Abra o menu do navegador (<strong className="text-white">⋮</strong> no Android/Chrome ou ícone de instalação na barra de endereços no computador).
                </li>
                <li>
                  2. Selecione <strong className="text-white">Instalar aplicativo</strong> ou <strong className="text-white">Adicionar à tela inicial</strong>.
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
