import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppLanguage } from '../types/gpa';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-900 p-0.5 flex items-center justify-center shadow-lg border border-blue-400/30">
            <img src="/icon.svg" alt="SHA GPA" className="w-full h-full rounded-[14px]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {lang === 'ar' ? 'تثبيت تطبيق معدل الشروق' : 'Install SHA GPA App'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'أكاديمية الشروق - يعمل بدون إنترنت' : 'El Shorouk Academy - 100% Offline'}
            </p>
          </div>
        </div>

        {/* Already Installed state */}
        {isInstalled ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'التطبيق مثبت بالفعل على جهازك وتعمل في وضع التطبيق المستقل.'
                : 'Application is already installed on your device in standalone mode.'}
            </span>
          </div>
        ) : isIOS ? (
          /* iOS Safari Specific Guide */
          <div className="space-y-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'على هواتف iPhone و iPad، يمكنك تثبيت التطبيق مباشرة من متصفح Safari باتباع الخطوات التالية:'
                : 'On iPhone and iPad, install the application directly from Safari by following these quick steps:'}
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-semibold text-white">
                    {lang === 'ar' ? 'اضغط على زر المشاركة (Share)' : 'Tap the Share Button'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{lang === 'ar' ? 'في شريط Safari السفلي' : 'In the bottom Safari bar'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="font-semibold text-white">
                    {lang === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                    <PlusSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>{lang === 'ar' ? 'Add to Home Screen' : 'Add to Home Screen option'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-semibold text-white">
                    {lang === 'ar' ? 'اضغط "إضافة" (Add) في أعلى اليمين' : 'Tap "Add" in top right'}
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {lang === 'ar' ? 'ستجد أيقونة التطبيق على شاشة هاتفك الرئيسية كأي تطبيق عادي.' : 'The SHA GPA app icon will appear instantly on your home screen.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Chromium Flow */
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'ثبت التطبيق الآن للوصول السريع بدون متصفح وتوفير استهلاك باقة الإنترنت مع حفظ بيانات مقرراتك تلقائياً.'
                : 'Install the app now for one-tap home screen launch, offline access in campus lecture halls, and zero data consumption.'}
            </p>

            <button
              onClick={handleInstallClick}
              disabled={!isInstallable}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                isInstallable
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {isInstallable
                  ? (lang === 'ar' ? 'تثبيت الآن على الهاتف (1-Click)' : 'Install App Now (1-Tap)')
                  : (lang === 'ar' ? 'استخدم خيارات المتصفح (⋮) -> إضافة للشاشة' : 'Open Chrome menu (⋮) -> Install App')}
              </span>
            </button>
          </div>
        )}

        {/* Benefits list */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{lang === 'ar' ? 'يعمل بدون نت' : '100% Offline Ready'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{lang === 'ar' ? 'حفظ تلقائي للمواد' : 'Auto-saves data'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
