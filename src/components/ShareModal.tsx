import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, Send, Share2, X } from 'lucide-react';
import type { ChristianShort } from '../types/shorts';

interface ShareModalProps {
  short: ChristianShort | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ short, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [short?.id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !short) return null;

  const shareUrl = `${window.location.origin}/?v=${encodeURIComponent(short.id)}`;
  const shareText = `${short.title} — ${short.channelTitle} (Luz Shorts)`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy via temporary input
      const el = document.createElement('textarea');
      el.value = shareUrl;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: short.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User canceled or native share unsupported in frame; keep sheet open
      }
    }
    await handleCopy();
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-zinc-950 rounded-t-3xl sm:rounded-2xl border border-zinc-800 shadow-2xl p-5 sm:p-6 safe-pb space-y-5 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1.5 bg-zinc-700 rounded-full mx-auto -mt-1 mb-2" />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="share-modal-title"
              className="text-lg font-display font-bold text-white"
            >
              Compartilhar vídeo
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Envie este conteúdo edificante com link direto
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de compartilhamento"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Preview item */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-black border border-zinc-800/90">
          <div className="w-14 h-20 rounded-lg overflow-hidden bg-zinc-900 shrink-0 relative">
            <img
              src={short.thumbnailUrl}
              alt={short.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug">
              {short.title}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
              <span className="truncate max-w-[140px]">{short.channelTitle}</span>
              <span aria-hidden="true">·</span>
              <span>{short.categoryLabel}</span>
            </div>
          </div>
        </div>

        {/* Share URL box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            aria-label="Link direto para o vídeo"
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 h-11 px-3 text-xs font-mono text-zinc-200 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 h-11 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Direct share channels */}
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-black border border-zinc-800 hover:bg-zinc-900 text-zinc-200 hover:text-white transition-colors text-xs font-medium min-h-[64px]"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-black border border-zinc-800 hover:bg-zinc-900 text-zinc-200 hover:text-white transition-colors text-xs font-medium min-h-[64px]"
          >
            <Send className="w-5 h-5 text-zinc-200" aria-hidden="true" />
            <span>Telegram</span>
          </a>
          <a
            href={short.category === 'louvores' || short.category === 'pregacoes' ? short.youtubeUrl : short.shortsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-black border border-zinc-800 hover:bg-zinc-900 text-zinc-200 hover:text-white transition-colors text-xs font-medium min-h-[64px]"
          >
            <ExternalLink className="w-5 h-5 text-zinc-200" aria-hidden="true" />
            <span>YouTube</span>
          </a>
        </div>

        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
          <span>Compartilhar via dispositivo</span>
        </button>
      </div>
    </div>
  );
};
