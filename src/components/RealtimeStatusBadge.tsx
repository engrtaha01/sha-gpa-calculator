import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Users, ShieldCheck, Zap } from 'lucide-react';
import { AppLanguage } from '../types/gpa';

interface RealtimeStatusBadgeProps {
  isConnected: boolean;
  clientCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  lang: AppLanguage;
}

export const RealtimeStatusBadge: React.FC<RealtimeStatusBadgeProps> = ({
  isConnected,
  clientCount,
  isSyncing,
  lastSyncTime,
  lang,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowInfo(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-semibold transition border ${
          isConnected
            ? isSyncing
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
        }`}
        title={
          lang === 'ar'
            ? 'المزامنة الحية اللحظية (اضغط للتفاصيل)'
            : 'Real-Time Sync Status (Tap for details)'
        }
      >
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSyncing ? 'bg-blue-400' : 'bg-emerald-400'
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected
                ? isSyncing
                  ? 'bg-blue-400'
                  : 'bg-emerald-400'
                : 'bg-rose-400'
            }`}
          />
        </span>

        <span className="truncate max-w-[90px] sm:max-w-none">
          {isConnected
            ? isSyncing
              ? lang === 'ar' ? 'جارِ المزامنة...' : 'Syncing...'
              : clientCount > 1
              ? `${lang === 'ar' ? 'متصل' : 'Live'} (${clientCount})`
              : lang === 'ar' ? 'مزامنة لحظية' : 'Live Sync'
            : lang === 'ar' ? 'غير متصل' : 'Offline'}
        </span>
      </button>

      {/* Info Dialog */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {lang === 'ar' ? 'محرك المزامنة اللحظية (SHA)' : 'SHA Real-Time Engine'}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isConnected
                      ? lang === 'ar' ? 'متصل عبر WebSockets' : 'Connected via WebSockets'
                      : lang === 'ar' ? 'في انتظار إعادة الاتصال...' : 'Reconnecting...'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'ar' ? 'الأجهزة المتصلة:' : 'Connected Devices:'}</span>
                </span>
                <span className="font-bold font-mono text-white text-[11px]">
                  {clientCount} {lang === 'ar' ? 'جهاز' : 'device(s)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ar' ? 'حساب المعدل والتنبيهات:' : 'Calculation & Alerts:'}</span>
                </span>
                <span className="font-bold text-emerald-400 text-[11px]">
                  {lang === 'ar' ? 'فوري وتلقائي' : 'Instant & Real-Time'}
                </span>
              </div>

              {lastSyncTime && (
                <div className="text-[10px] text-slate-500 font-mono text-center pt-1">
                  {lang === 'ar' ? 'آخر مزامنة:' : 'Last sync:'}{' '}
                  {new Date(lastSyncTime).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
              {lang === 'ar'
                ? 'أي تعديل في المقررات، التقديرات، أو الفصول الدراسية ينعكس فورياً في كل التبويبات والأجهزة المتزامنة دون الحاجة لتحديث الصفحة.'
                : 'Any edit to courses, grades, or semesters updates instantly across all views and open devices without page reloads.'}
            </p>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
            >
              {lang === 'ar' ? 'حسناً' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
