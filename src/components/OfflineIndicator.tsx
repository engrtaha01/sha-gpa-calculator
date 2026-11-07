import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { AppLanguage } from '../types/gpa';

interface OfflineIndicatorProps {
  lang: AppLanguage;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-12 left-4 right-4 z-50 flex items-center justify-between gap-2 rounded-xl bg-amber-500/90 text-slate-950 px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-md animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>
          {lang === 'ar'
            ? 'وضع عدم الاتصال: التطبيق يعمل بكامل طاقته ومحفوظ محلياً'
            : 'Offline Mode: All calculators work 100% offline with local cache'}
        </span>
      </div>
      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
    </div>
  );
};
