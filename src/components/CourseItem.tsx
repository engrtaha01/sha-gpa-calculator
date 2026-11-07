import React, { useState } from 'react';
import { Course, GradeLetter, SHA_GRADE_SCALE, AppLanguage } from '../types/gpa';
import { GradeSelectorModal } from './GradeSelectorModal';
import { Trash2, RotateCcw } from 'lucide-react';

interface CourseItemProps {
  course: Course;
  onUpdate: (updated: Course) => void;
  onRemove: (id: string) => void;
  lang: AppLanguage;
}

export const CourseItem: React.FC<CourseItemProps> = ({
  course,
  onUpdate,
  onRemove,
  lang,
}) => {
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const gradeInfo = SHA_GRADE_SCALE[course.grade] || SHA_GRADE_SCALE['B'];

  const handleCreditsChange = (newCredits: number) => {
    if (newCredits >= 1 && newCredits <= 6) {
      onUpdate({ ...course, credits: newCredits });
    }
  };

  const handleGradeSelect = (grade: GradeLetter, percentage?: number) => {
    onUpdate({
      ...course,
      grade,
      percentage,
    });
  };

  const toggleRetake = () => {
    onUpdate({
      ...course,
      isRetake: !course.isRetake,
      previousGrade: !course.isRetake ? (course.previousGrade || 'D') : undefined,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 hover:border-slate-700 transition shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {/* Course Code & Name Input */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <input
              type="text"
              value={course.code}
              onChange={(e) => onUpdate({ ...course, code: e.target.value.toUpperCase() })}
              placeholder={lang === 'ar' ? 'كود المادة' : 'CODE'}
              className="w-20 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 uppercase"
            />
            {course.isRetake && (
              <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md flex items-center gap-1">
                <RotateCcw className="w-2.5 h-2.5" />
                {lang === 'ar' ? 'تحسين' : 'Retake'}
              </span>
            )}
          </div>
          <input
            type="text"
            value={course.name}
            onChange={(e) => onUpdate({ ...course, name: e.target.value })}
            placeholder={lang === 'ar' ? 'اسم المقرر الدراسي...' : 'Course Title...'}
            className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none truncate"
          />
        </div>

        {/* Grade Action Button (Tap to pick) */}
        <button
          onClick={() => setIsGradeModalOpen(true)}
          className={`min-h-[44px] min-w-[54px] px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center transition active:scale-95 ${gradeInfo.bgLightClass}`}
          title={lang === 'ar' ? 'اضغط لتغيير التقدير' : 'Tap to change grade'}
        >
          <span className="text-base font-black leading-none">{course.grade}</span>
          <span className="text-[10px] opacity-80 font-mono mt-0.5">
            {gradeInfo.points.toFixed(1)} pt
          </span>
        </button>
      </div>

      {/* Row Footer: Credit hours stepper, Retake toggle & Delete */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
        {/* Credits stepper */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">
            {lang === 'ar' ? 'الساعات:' : 'Credits:'}
          </span>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                onClick={() => handleCreditsChange(c)}
                className={`min-w-[28px] h-6 rounded text-xs font-mono font-semibold transition ${
                  course.credits === c
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions: Retake switch & Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRetake}
            className={`min-h-[32px] px-2 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
              course.isRetake
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
            }`}
            title={lang === 'ar' ? 'إعادة مادة لتحسين التقدير القديم' : 'Repeat course for grade improvement'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === 'ar' ? 'إعادة مادة' : 'Repeat'}</span>
          </button>

          {course.isRetake && (
            <select
              value={course.previousGrade || 'D'}
              onChange={(e) =>
                onUpdate({
                  ...course,
                  previousGrade: e.target.value as GradeLetter,
                })
              }
              className="bg-slate-950 text-amber-300 border border-amber-500/30 rounded-lg text-xs py-1 px-1.5 font-bold font-mono focus:outline-none"
              title={lang === 'ar' ? 'التقدير القديم السابق' : 'Old Grade'}
            >
              <option value="D">Old: D</option>
              <option value="D+">Old: D+</option>
              <option value="C-">Old: C-</option>
              <option value="C">Old: C</option>
              <option value="F">Old: F</option>
            </select>
          )}

          <button
            onClick={() => onRemove(course.id)}
            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition ml-1"
            title={lang === 'ar' ? 'حذف المقرر' : 'Remove Course'}
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <GradeSelectorModal
        isOpen={isGradeModalOpen}
        currentGrade={course.grade}
        currentPercentage={course.percentage}
        onSelect={handleGradeSelect}
        onClose={() => setIsGradeModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
