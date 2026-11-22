import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-50 flex items-center gap-2.5 rounded-xl bg-zinc-950 text-zinc-100 px-4 py-2.5 text-xs font-medium shadow-lg border border-zinc-700"
    >
      <WifiOff className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
      <span>Sem conexão — exibindo interface em cache.</span>
    </div>
  );
};
