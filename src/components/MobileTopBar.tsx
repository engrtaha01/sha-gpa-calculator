import React from 'react';
import { AppLanguage } from '../types/gpa';
import { Download, Globe, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { RealtimeStatusBadge } from './RealtimeStatusBadge';

interface MobileTopBarProps {
  lang: AppLanguage;
  onToggleLang: () => void;
  onOpenInstallModal: () => void;
  isConnected?: boolean;
  clientCount?: number;
  isSyncing?: boolean;
  lastSyncTime?: number | null;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  lang,
  onToggleLang,
  onOpenInstallModal,
  isConnected,
  clientCount,
  isSyncing,
  lastSyncTime,
}) => {
  const { isInstalled } = usePWAInstall();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between shrink-0">
      {/* Brand Zone: 1 clean line lockup */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-900 p-0.5 flex items-center justify-center shadow-md">
          <img src="/icon.svg" alt="SHA" className="w-full h-full rounded-[10px]" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
            <span>SHA GPA</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded-md font-mono">
              4.0
            </span>
          </h1>
          <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
            {lang === 'ar' ? 'أكاديمية الشروق' : 'El Shorouk Academy'}
          </span>
        </div>
      </div>

      {/* Action Zone: Real-Time Sync Badge + Install PWA + Language Switcher */}
      <div className="flex items-center gap-1.5">
        {isConnected !== undefined && (
          <RealtimeStatusBadge
            isConnected={isConnected}
            clientCount={clientCount ?? 1}
            isSyncing={!!isSyncing}
            lastSyncTime={lastSyncTime ?? null}
            lang={lang}
          />
        )}
        {/* PWA Install Button */}
        {!isInstalled && (
          <button
            onClick={onOpenInstallModal}
            className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            title={lang === 'ar' ? 'تثبيت على الهاتف' : 'Install on Mobile'}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">
              {lang === 'ar' ? 'تثبيت' : 'Install'}
            </span>
          </button>
        )}

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          title="Switch language (English / العربية)"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] uppercase font-mono font-bold">
            {lang === 'ar' ? 'EN' : 'عربي'}
          </span>
        </button>
      </div>
    </header>
  );
};
