import React, { useState } from 'react';
import { GradeLetter, SHA_GRADE_SCALE, AppLanguage } from '../types/gpa';
import { getGradeFromScore } from '../utils/gpaCalculations';
import { X, Check } from 'lucide-react';

interface GradeSelectorModalProps {
  isOpen: boolean;
  currentGrade: GradeLetter;
  currentPercentage?: number;
  onSelect: (grade: GradeLetter, percentage?: number) => void;
  onClose: () => void;
  lang: AppLanguage;
}

export const GradeSelectorModal: React.FC<GradeSelectorModalProps> = ({
  isOpen,
  currentGrade,
  currentPercentage,
  onSelect,
  onClose,
  lang,
}) => {
  const [activeMode, setActiveMode] = useState<'letter' | 'score'>('letter');
  const [scoreInput, setScoreInput] = useState<string>(
    currentPercentage ? currentPercentage.toString() : ''
  );

  if (!isOpen) return null;

  const handleScoreChange = (val: string) => {
    setScoreInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      const derivedGrade = getGradeFromScore(num);
      onSelect(derivedGrade, num);
    }
  };

  const gradeList = Object.values(SHA_GRADE_SCALE);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Grab handle for mobile bottom sheet */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">
            {lang === 'ar' ? 'اختر التقدير أو الدرجة' : 'Select Grade or Score'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector (Letter vs Score) */}
        <div className="flex p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800">
          <button
            onClick={() => setActiveMode('letter')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeMode === 'letter'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'ar' ? 'التقدير الحرفي (A+, B...)' : 'Letter Grade (A, B...)'}
          </button>
          <button
            onClick={() => setActiveMode('score')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeMode === 'score'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'ar' ? 'النسبة المئوية (0-100%)' : 'Percentage (0-100%)'}
          </button>
        </div>

        {activeMode === 'score' ? (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === 'ar' ? 'أدخل درجة المادة من 100' : 'Enter Course Mark out of 100'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreInput}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  placeholder="e.g. 85"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">%</span>
              </div>
            </div>

            {scoreInput && !isNaN(parseFloat(scoreInput)) && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    {lang === 'ar' ? 'التقدير المحسوب وفق لائحة الشروق:' : 'Calculated SHA Grade:'}
                  </span>
                  <span className="text-xl font-bold text-blue-400">
                    {getGradeFromScore(parseFloat(scoreInput))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">
                    {lang === 'ar' ? 'النقاط:' : 'Points:'}
                  </span>
                  <span className="font-mono text-base font-bold text-white">
                    {SHA_GRADE_SCALE[getGradeFromScore(parseFloat(scoreInput))].points.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              {lang === 'ar' ? 'تأكيد وحفظ الدرجة' : 'Confirm & Save Score'}
            </button>
          </div>
        ) : (
          /* Letter Grade Grid (Touch Friendly) */
          <div className="overflow-y-auto flex-1 pr-1 space-y-1.5">
            {gradeList.map((item) => {
              const isSelected = currentGrade === item.letter;
              return (
                <button
                  key={item.letter}
                  onClick={() => {
                    onSelect(item.letter, undefined);
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition min-h-[44px] ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-base text-white">
                      {item.letter}
                    </span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {lang === 'ar' ? item.arabicLabel : item.englishLabel}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.minPercentage}%-{item.maxPercentage}%
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.points.toFixed(2)} {lang === 'ar' ? 'نقطة' : 'pts'}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
