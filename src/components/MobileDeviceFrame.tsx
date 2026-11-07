import React from 'react';
import { DeviceMode, AppLanguage } from '../types/gpa';
import { Smartphone, Monitor, Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileDeviceFrameProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  lang: AppLanguage;
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  deviceMode,
  onDeviceModeChange,
  lang,
  children,
}) => {
  const isRtl = lang === 'ar';
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isRtl ? 'font-[\'Cairo\',sans-serif]' : 'font-[\'Plus_Jakarta_Sans\',sans-serif]'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Desktop Device Switcher Bar (Hidden on narrow mobile screens) */}
      <aside aria-label="Device simulation selector" className="hidden md:flex items-center justify-between px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-blue-400" />
            {lang === 'ar' ? 'عرض تجربة الهاتف الذكي' : 'Mobile Experience Preview'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            {lang === 'ar'
              ? 'تطبيق متكامل لنظامي iOS و Android مع دعم PWA وتثبيت الشاشة الرئيسية'
              : 'iOS & Android Hybrid PWA with Native Touch & Offline Support'}
          </span>
        </div>

        {/* Device Switcher Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onDeviceModeChange('iphone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              deviceMode === 'iphone'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>iPhone 16 Pro</span>
          </button>
          <button
            onClick={() => onDeviceModeChange('pixel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              deviceMode === 'pixel'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Pixel 9 (Android)</span>
          </button>
          <button
            onClick={() => onDeviceModeChange('responsive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              deviceMode === 'responsive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'شاشة كاملة' : 'Full Screen'}</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex items-center justify-center ${deviceMode !== 'responsive' ? 'md:py-6 md:px-4 bg-slate-950/70' : ''}`}>
        {deviceMode === 'responsive' ? (
          // Full responsive container that works on iPad, desktop, and mobile
          <main className="w-full max-w-4xl min-h-screen md:min-h-[90vh] bg-slate-900 md:rounded-2xl md:border md:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
            {children}
          </main>
        ) : (
          // Mobile Phone Shell (iPhone or Pixel)
          <div className="relative">
            {/* Phone Outer Frame */}
            <div
              className={`w-full max-w-[430px] min-w-[360px] h-screen md:h-[860px] bg-slate-900 md:rounded-[48px] md:border-[10px] ${
                deviceMode === 'iphone'
                  ? 'md:border-slate-800 shadow-[0_0_50px_rgba(30,58,138,0.25)]'
                  : 'md:border-slate-800 shadow-[0_0_50px_rgba(15,23,42,0.6)]'
              } flex flex-col overflow-hidden relative`}
            >
              {/* Dynamic Island / Notch for iPhone */}
              {deviceMode === 'iphone' && (
                <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 z-50 w-28 h-6 bg-black rounded-full items-center justify-between px-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] text-slate-400 font-mono">SHA</span>
                  </div>
                </div>
              )}

              {/* Punch-hole Camera for Pixel */}
              {deviceMode === 'pixel' && (
                <div className="hidden md:block absolute top-3.5 left-1/2 -translate-x-1/2 z-50 w-3.5 h-3.5 rounded-full bg-black border border-slate-800" />
              )}

              {/* Mobile System Status Bar */}
              <div className="h-10 px-6 pt-2 shrink-0 flex items-center justify-between text-xs text-slate-400 font-medium select-none z-40 bg-slate-900/90 backdrop-blur-md">
                <span className="font-mono text-slate-300 font-semibold">{currentTime}</span>
                <div className="flex items-center gap-2">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <BatteryMedium className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Phone Content Canvas with native scroll & safe area */}
              <main className="flex-1 overflow-y-auto flex flex-col relative bg-slate-950">
                {children}
              </main>

              {/* iOS Home Indicator Bar or Android Gesture Pill */}
              <div className="h-5 shrink-0 bg-slate-900 flex items-center justify-center select-none pb-1">
                {deviceMode === 'iphone' ? (
                  <div className="w-32 h-1 bg-slate-600 rounded-full opacity-60" />
                ) : (
                  <div className="w-20 h-1 bg-slate-600 rounded-full opacity-60" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
