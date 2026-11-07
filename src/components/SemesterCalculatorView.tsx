import React, { useState } from 'react';
import { Course, AppLanguage } from '../types/gpa';
import { CourseItem } from './CourseItem';
import {
  calculateSemesterGPA,
  calculateCumulativeGPA,
} from '../utils/gpaCalculations';
import { SHA_INSTITUTES } from '../data/shaPresets';
import {
  Plus,
  BookMarked,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Share2,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Award,
  FileDown,
  FileText,
} from 'lucide-react';

interface SemesterCalculatorViewProps {
  courses: Course[];
  onCoursesChange: (courses: Course[]) => void;
  prevCgpa: number;
  onPrevCgpaChange: (val: number) => void;
  prevCredits: number;
  onPrevCreditsChange: (val: number) => void;
  notes?: string;
  onNotesChange?: (val: string) => void;
  onOpenShareCard: () => void;
  onSaveToHistory: () => void;
  onNavigateToTab?: (tab: 'calculator' | 'history' | 'target' | 'rules') => void;
  lang: AppLanguage;
}

export const SemesterCalculatorView: React.FC<SemesterCalculatorViewProps> = ({
  courses,
  onCoursesChange,
  prevCgpa,
  onPrevCgpaChange,
  prevCredits,
  onPrevCreditsChange,
  notes = '',
  onNotesChange,
  onOpenShareCard,
  onSaveToHistory,
  onNavigateToTab,
  lang,
}) => {
  const [includeCumulative, setIncludeCumulative] = useState(prevCredits > 0 || prevCgpa > 0);
  const [showPresetModal, setShowPresetModal] = useState(false);

  const semesterResult = calculateSemesterGPA(courses);
  const cumulativeResult = calculateCumulativeGPA(
    includeCumulative ? prevCgpa : 0,
    includeCumulative ? prevCredits : 0,
    courses
  );

  const displayGpa = includeCumulative ? cumulativeResult.newCgpa : semesterResult.gpa;
  const standing = cumulativeResult.standing;

  const handleAddCourse = () => {
    const newCourse: Course = {
      id: 'course_' + Date.now() + Math.random().toString(36).substring(2, 6),
      code: `CRS${courses.length + 1}`,
      name: lang === 'ar' ? `مقرر دراسي ${courses.length + 1}` : `Course ${courses.length + 1}`,
      credits: 3,
      grade: 'B+',
    };
    onCoursesChange([...courses, newCourse]);
  };

  const handleUpdateCourse = (updated: Course) => {
    onCoursesChange(courses.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleRemoveCourse = (id: string) => {
    onCoursesChange(courses.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع المقررات؟' : 'Are you sure you want to clear all courses?')) {
      onCoursesChange([]);
    }
  };

  const handleLoadPreset = (presetCourses: { code: string; name: string; credits: number }[]) => {
    const loaded: Course[] = presetCourses.map((item, idx) => ({
      id: 'course_preset_' + Date.now() + '_' + idx,
      code: item.code,
      name: item.name,
      credits: item.credits,
      grade: 'A',
    }));
    onCoursesChange(loaded);
    setShowPresetModal(false);
  };

  const isSemesterWarning = courses.length > 0 && semesterResult.gpa < 2.0;
  const isCgpaWarning = includeCumulative && (prevCredits > 0 || courses.length > 0) && cumulativeResult.newCgpa < 2.0;
  const isAnyWarning = isSemesterWarning || isCgpaWarning;

  const warningThreshold = 2.0;
  const currentPercentage = Math.min(100, Math.max(0, (displayGpa / 4.0) * 100));
  const diffFromThreshold = displayGpa - warningThreshold;

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-2xl mx-auto w-full">
      {/* Top Hero GPA Indicator Card */}
      <div
        className={`rounded-3xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 border ${
          isAnyWarning
            ? 'bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 border-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.18)]'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/70 border-slate-800'
        }`}
      >
        {/* Subtle background glow */}
        <div
          className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isAnyWarning ? 'bg-rose-600/15' : 'bg-blue-600/10'
          }`}
        />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isAnyWarning ? 'text-rose-400' : 'text-blue-400'}`}>
                {includeCumulative
                  ? (lang === 'ar' ? 'المعدل التراكمي الإجمالي المتوقع' : 'Projected Cumulative GPA')
                  : (lang === 'ar' ? 'معدل الفصل الدراسي الحالي' : 'Current Semester GPA')}
              </span>
              {isAnyWarning && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <AlertOctagon className="w-3 h-3 text-rose-400" />
                  {lang === 'ar' ? 'تحت حد الإنذار' : '< 2.00 Warning'}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums ${
                  isAnyWarning ? 'text-rose-400' : 'text-white'
                }`}
              >
                {displayGpa.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-slate-400 font-mono">/ 4.00</span>
            </div>

            {includeCumulative && prevCredits > 0 && (
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="text-slate-400">
                  {lang === 'ar' ? 'تغير المعدل:' : 'Change:'}
                </span>
                <span
                  className={`font-mono font-bold flex items-center gap-0.5 ${
                    cumulativeResult.gpaDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <TrendingUp className={`w-3.5 h-3.5 ${cumulativeResult.gpaDelta < 0 ? 'rotate-180' : ''}`} />
                  {cumulativeResult.gpaDelta >= 0 ? `+${cumulativeResult.gpaDelta.toFixed(3)}` : cumulativeResult.gpaDelta.toFixed(3)}
                </span>
              </div>
            )}
          </div>

          {/* Academic Standing Emblem */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block mb-1">
              {lang === 'ar' ? 'التقدير العام' : 'Standing'}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                isAnyWarning ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : standing.badgeColor
              }`}
            >
              {isAnyWarning ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              ) : standing.code === 'honors' ? (
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              ) : null}
              <span>{lang === 'ar' ? standing.titleAr : standing.titleEn}</span>
            </span>
          </div>
        </div>

        {/* Visual Academic Safety Gauge (0.00 to 4.00 with 2.00 Warning Pin) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              {lang === 'ar' ? 'مؤشر حد الأمان الأكاديمي للشروق:' : 'SHA Academic Safety Gauge:'}
            </span>
            <span className={`font-bold flex items-center gap-1 ${displayGpa < 2.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {displayGpa < 2.0
                ? `${diffFromThreshold.toFixed(2)} ${lang === 'ar' ? 'تحت حد الإنذار' : 'below 2.00 threshold'}`
                : `+${diffFromThreshold.toFixed(2)} ${lang === 'ar' ? 'فوق حد الأمان' : 'safe margin above 2.00'}`}
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            {/* Danger Zone (0.00 to 2.00) */}
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-rose-950/40" />
            {/* Safe Zone (2.00 to 4.00) */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-950/20" />
            {/* Filled Progress Bar */}
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                displayGpa < 2.0
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                  : 'bg-gradient-to-r from-blue-600 to-emerald-500'
              }`}
              style={{ width: `${currentPercentage}%` }}
            />
            {/* 2.00 Pin line at exactly 50% */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-amber-400/90 z-10 shadow-xs" />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0.00</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              ▲ 2.00 {lang === 'ar' ? 'حد الإنذار' : 'Warning Line'}
            </span>
            <span>4.00</span>
          </div>
        </div>

        {/* 3 Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">
              {lang === 'ar' ? 'ساعات الترم' : 'Term Credits'}
            </span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {semesterResult.totalCredits}
            </span>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">
              {lang === 'ar' ? 'إجمالي الساعات' : 'Total Credits'}
            </span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {includeCumulative ? cumulativeResult.totalCumulativeCredits : semesterResult.totalCredits}
            </span>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">
              {lang === 'ar' ? 'النقاط' : 'Points'}
            </span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {semesterResult.qualityPoints.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Academic Warning Alert Banner (< 2.00) */}
      {isAnyWarning && (
        <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-rose-950/30 border-2 border-rose-500/40 rounded-3xl p-4.5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>
                    {lang === 'ar'
                      ? 'تنبيه أكاديمي: المعدل تحت حد الإنذار (2.00)'
                      : 'Official SHA Academic Warning Active'}
                  </span>
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                  {lang === 'ar' ? 'إنذار أكاديمي' : 'Probation'}
                </span>
              </div>

              <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                {isSemesterWarning && isCgpaWarning
                  ? (lang === 'ar'
                      ? `كلا المعدلين: الفصلي (${semesterResult.gpa.toFixed(2)}) والتراكمي (${cumulativeResult.newCgpa.toFixed(2)}) تحت حد الـ 2.00، مما يضعك تحت الملاحظة الأكاديمية الرسمية.`
                      : `Both Semester GPA (${semesterResult.gpa.toFixed(2)}) and Cumulative CGPA (${cumulativeResult.newCgpa.toFixed(2)}) are below 2.00, triggering official academic probation.`)
                  : isCgpaWarning
                  ? (lang === 'ar'
                      ? `المعدل التراكمي الإجمالي (${cumulativeResult.newCgpa.toFixed(2)}) أقل من 2.00، مما يعرضك للإنذار الأكاديمي وتقييد تسجيل الساعات.`
                      : `Cumulative CGPA (${cumulativeResult.newCgpa.toFixed(2)}) is below 2.00, placing you on Academic Probation with restricted registration.`)
                  : (lang === 'ar'
                      ? `معدل الفصل الحالي (${semesterResult.gpa.toFixed(2)}) أقل من 2.00. يجب الانتباه لتفادي هبوط المعدل التراكمي تحت حد الإنذار.`
                      : `Current Semester GPA (${semesterResult.gpa.toFixed(2)}) is below 2.00, putting your cumulative academic standing at risk.`)}
              </p>

              {/* SHA Regulations Impact Grid */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {lang === 'ar' ? 'الحد الأقصى للتسجيل:' : 'Registration Limit:'}
                    </span>
                    <span className="font-bold text-white">
                      12 {lang === 'ar' ? 'ساعة معتمدة فقط' : 'Credit Hours Max'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {lang === 'ar' ? 'الإجراء الإلزامي:' : 'Mandatory Action:'}
                    </span>
                    <span className="font-bold text-white">
                      {lang === 'ar' ? 'تحسين مقررات D و F' : 'Repeat D/F Courses'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to Escape Probation */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('rules')}
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/25 active:scale-[0.98]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'محاكاة تحسين المواد لرفع المعدل' : 'Simulate Retakes to Clear Warning'}</span>
                  </button>
                )}

                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('target')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    <span>{lang === 'ar' ? 'خطة الوصول لـ 2.00+' : 'Target 2.00+ Goal'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cumulative GPA Merge Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIncludeCumulative(!includeCumulative)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                includeCumulative ? 'bg-blue-600' : 'bg-slate-700'
              }`}
              aria-label="Toggle cumulative"
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-0.5 ${
                  includeCumulative ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
            <span className="text-xs font-semibold text-slate-200">
              {lang === 'ar' ? 'حساب المعدل التراكمي الإجمالي (CGPA)' : 'Calculate Cumulative GPA (CGPA)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {includeCumulative ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'ترم فقط' : 'Term Only')}
          </span>
        </div>

        {includeCumulative && (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {lang === 'ar' ? 'المعدل التراكمي السابق' : 'Previous CGPA'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={prevCgpa || ''}
                onChange={(e) => onPrevCgpaChange(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 2.85"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {lang === 'ar' ? 'الساعات السابقة المجتازة' : 'Previous Completed Credits'}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="200"
                value={prevCredits || ''}
                onChange={(e) => onPrevCreditsChange(parseInt(e.target.value, 10) || 0)}
                placeholder="e.g. 64"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Course List Header & Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">
            {lang === 'ar' ? 'المقررات المسجلة' : 'Semester Courses'}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold">
            {courses.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPresetModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-medium transition flex items-center gap-1"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مقررات الشروق' : 'SHA Presets'}</span>
          </button>

          {courses.length > 0 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
              title={lang === 'ar' ? 'مسح المقررات' : 'Reset courses'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-2.5">
        {courses.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
            <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-200 mb-1">
              {lang === 'ar' ? 'لا توجد مقررات بعد' : 'No courses added yet'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
              {lang === 'ar'
                ? 'أضف مقرراتك الدراسية يدوياً أو قم بتحميل خطة مقررات تخصصك من معاهد أكاديمية الشروق.'
                : 'Add your courses manually or load pre-built semester schedules for El Shorouk Academy.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleAddCourse}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
              >
                {lang === 'ar' ? '+ إضافة أول مقرر' : '+ Add First Course'}
              </button>
              <button
                onClick={() => setShowPresetModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                {lang === 'ar' ? 'تحميل جدول الشروق' : 'Load SHA Schedule'}
              </button>
            </div>
          </div>
        ) : (
          courses.map((course) => (
            <CourseItem
              key={course.id}
              course={course}
              onUpdate={handleUpdateCourse}
              onRemove={handleRemoveCourse}
              lang={lang}
            />
          ))
        )}
      </div>

      {/* Private Semester Notes Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'ar' ? 'ملاحظات خاصة بالفصل الدراسي (سرية)' : 'Private Semester Notes'}</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            {lang === 'ar' ? 'تُحفظ في سجلك فقط' : 'Saved in transcript'}
          </span>
        </div>

        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          placeholder={
            lang === 'ar'
              ? 'أضف ملاحظاتك الشخصية لهذا الفصل (مثال: التركيز على مادة الرياضيات، تحسين نسبة الحضور، الاستعداد لمشروع التخرج)...'
              : 'Add private study notes for this semester (e.g., Focus on Calculus, Need to improve attendance, Target honors >= 3.5)...'
          }
          className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/80 resize-none transition"
        />

        {/* Quick Suggestion Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-500 font-medium">
            {lang === 'ar' ? 'اقتراحات سريعة:' : 'Quick tags:'}
          </span>
          {[
            lang === 'ar' ? 'التركيز على مادة الرياضيات' : 'Focus on Calculus',
            lang === 'ar' ? 'تحسين نسبة الحضور' : 'Need to improve attendance',
            lang === 'ar' ? 'هدف مرتبة الشرف (3.5+)' : 'Target Honors (3.5+)',
            lang === 'ar' ? 'الاستعداد لمشروع التخرج' : 'Graduation Project Prep',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const updated = notes ? `${notes} · ${tag}` : tag;
                onNotesChange?.(updated);
              }}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
            >
              +{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={handleAddCourse}
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة مقرر دراسي' : 'Add Course'}</span>
        </button>

        {courses.length > 0 && (
          <>
            <button
              onClick={onSaveToHistory}
              className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition active:scale-[0.98]"
              title={lang === 'ar' ? 'حفظ هذا الفصل في السجل' : 'Save to Transcript History'}
            >
              {lang === 'ar' ? 'حفظ بالسجل' : 'Save'}
            </button>
            <button
              onClick={onOpenShareCard}
              className="py-3 px-3.5 bg-gradient-to-r from-amber-600/30 to-amber-700/20 hover:from-amber-600/40 hover:to-amber-700/30 text-amber-300 border border-amber-500/30 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 active:scale-[0.98]"
              title={lang === 'ar' ? 'تصدير وثيقة الدرجات الرسمية (PDF)' : 'Export Official Grade Card (PDF)'}
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'تقرير PDF' : 'PDF Card'}</span>
            </button>
          </>
        )}
      </div>

      {/* Preset Modal for El Shorouk Academy */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              {lang === 'ar' ? 'مقررات معاهد أكاديمية الشروق' : 'SHA Institute Course Presets'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ar'
                ? 'اختر المعهد والفرقة لإدراج المقررات بالساعات المعتمدة الرسمية فوراً:'
                : 'Select your institute and semester to populate official SHA courses and credit hours:'}
            </p>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {SHA_INSTITUTES.map((inst) => (
                <div key={inst.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
                  <h4 className="text-xs font-bold text-blue-400 mb-2">
                    {lang === 'ar' ? inst.nameAr : inst.nameEn}
                  </h4>
                  <div className="space-y-1.5">
                    {inst.departments.map((dept) =>
                      dept.semesters.map((sem, sIdx) => (
                        <button
                          key={dept.id + sIdx}
                          onClick={() => handleLoadPreset(sem.courses)}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500 hover:bg-blue-600/10 transition flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {lang === 'ar' ? sem.nameAr : sem.nameEn}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {dept.nameEn} · {sem.courses.length} {lang === 'ar' ? 'مقررات' : 'courses'}
                            </span>
                          </div>
                          <span className="text-xs text-blue-400 font-semibold">
                            {lang === 'ar' ? 'تحميل' : 'Load'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPresetModal(false)}
              className="mt-4 w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
