import React from 'react';
import { AppLanguage } from '../types/gpa';
import { Calculator, History, Target, BookOpen } from 'lucide-react';

export type TabType = 'calculator' | 'history' | 'target' | 'rules';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  lang: AppLanguage;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  lang,
}) => {
  const tabs: { id: TabType; labelEn: string; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'calculator',
      labelEn: 'Calculator',
      labelAr: 'الحاسبة',
      icon: Calculator,
    },
    {
      id: 'history',
      labelEn: 'Semesters',
      labelAr: 'السجلات',
      icon: History,
    },
    {
      id: 'target',
      labelEn: 'Planner',
      labelAr: 'المستهدف',
      icon: Target,
    },
    {
      id: 'rules',
      labelEn: 'Bylaws & Retake',
      labelAr: 'اللوائح والتحسين',
      icon: BookOpen,
    },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 shrink-0">
      <div className="grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
                {lang === 'ar' ? tab.labelAr : tab.labelEn}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
