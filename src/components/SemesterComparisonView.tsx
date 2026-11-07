import React, { useState, useMemo } from 'react';
import { Semester, AppLanguage, SHA_GRADE_SCALE, GradeLetter } from '../types/gpa';
import { calculateSemesterGPA, getAcademicStanding } from '../utils/gpaCalculations';
import {
  ArrowRightLeft,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface SemesterComparisonViewProps {
  semesters: Semester[];
  lang: AppLanguage;
  initialSemesterAId?: string;
  initialSemesterBId?: string;
  onBackToHistory?: () => void;
  onAddNewSemester?: () => void;
}

export const SemesterComparisonView: React.FC<SemesterComparisonViewProps> = ({
  semesters,
  lang,
  initialSemesterAId,
  initialSemesterBId,
  onBackToHistory,
  onAddNewSemester,
}) => {
  // Safe initial semester selection
  const defaultA = useMemo(() => {
    if (initialSemesterAId && semesters.some((s) => s.id === initialSemesterAId)) {
      return initialSemesterAId;
    }
    return semesters[0]?.id || '';
  }, [semesters, initialSemesterAId]);

  const defaultB = useMemo(() => {
    if (initialSemesterBId && semesters.some((s) => s.id === initialSemesterBId)) {
      return initialSemesterBId;
    }
    if (semesters.length > 1) {
      return semesters[1].id;
    }
    return semesters[0]?.id || '';
  }, [semesters, initialSemesterBId]);

  const [selectedAId, setSelectedAId] = useState<string>(defaultA);
  const [selectedBId, setSelectedBId] = useState<string>(defaultB);

  // Sync if semesters list changes
  React.useEffect(() => {
    if (semesters.length >= 2) {
      if (!semesters.some((s) => s.id === selectedAId)) {
        setSelectedAId(semesters[0].id);
      }
      if (!semesters.some((s) => s.id === selectedBId)) {
        setSelectedBId(semesters[1].id);
      }
    }
  }, [semesters, selectedAId, selectedBId]);

  // If fewer than 2 semesters
  if (semesters.length < 2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {lang === 'ar' ? 'يلزم توفر فصلين دراسيين للمقارنة' : 'At Least 2 Semesters Required'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {lang === 'ar'
              ? `لديك حالياً (${semesters.length}) فصل مسجل في سجلك الأكاديمي. أضف فصلاً دراسياً إضافياً لتفعيل المقارنة الأفقية المباشرة للأداء والساعات والمقررات.`
              : `You currently have ${semesters.length} semester recorded. Add at least one more term to compare GPA, credit load, and course performance side-by-side.`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          {onAddNewSemester && (
            <button
              onClick={onAddNewSemester}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              {lang === 'ar' ? '+ إضافة فصل جديد' : '+ Add Another Semester'}
            </button>
          )}
          {onBackToHistory && (
            <button
              onClick={onBackToHistory}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              {lang === 'ar' ? 'العودة للسجل الأكاديمي' : 'Back to Transcript List'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const semA = semesters.find((s) => s.id === selectedAId) || semesters[0];
  const semB = semesters.find((s) => s.id === selectedBId) || (semesters[1] || semesters[0]);

  const metricsA = calculateSemesterGPA(semA.courses);
  const metricsB = calculateSemesterGPA(semB.courses);

  const standingA = getAcademicStanding(metricsA.gpa);
  const standingB = getAcademicStanding(metricsB.gpa);

  // Delta calculations (B relative to A)
  const gpaDiff = metricsB.gpa - metricsA.gpa;
  const creditsDiff = metricsB.totalCredits - metricsA.totalCredits;
  const coursesDiff = semB.courses.length - semA.courses.length;
  const qualityPointsDiff = metricsB.qualityPoints - metricsA.qualityPoints;

  // Grade categorization counts
  const getGradeCategoryCounts = (courses: typeof semA.courses) => {
    let honors = 0; // A+, A, A-
    let veryGood = 0; // B+, B
    let good = 0; // B-, C+
    let pass = 0; // C, C-, D+, D
    let fail = 0; // F

    courses.forEach((c) => {
      const g = c.grade;
      if (g === 'A+' || g === 'A' || g === 'A-') honors++;
      else if (g === 'B+' || g === 'B') veryGood++;
      else if (g === 'B-' || g === 'C+') good++;
      else if (g === 'F') fail++;
      else pass++;
    });

    return { honors, veryGood, good, pass, fail };
  };

  const gradesA = getGradeCategoryCounts(semA.courses);
  const gradesB = getGradeCategoryCounts(semB.courses);

  const handleSwap = () => {
    const temp = selectedAId;
    setSelectedAId(selectedBId);
    setSelectedBId(temp);
  };

  return (
    <div className="space-y-4">
      {/* Selector & Swap Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'ar' ? 'أداة مقارنة فصلين دراسيين' : 'Side-by-Side Term Comparison'}
            </h3>
          </div>
          <button
            onClick={handleSwap}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            title={lang === 'ar' ? 'تبديل الفصلين' : 'Swap terms'}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'ar' ? 'تبديل' : 'Swap'}</span>
          </button>
        </div>

        {/* Dropdown Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Semester A Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>{lang === 'ar' ? 'الفصل الدراسي الأول (أ):' : 'First Term (A):'}</span>
            </label>
            <select
              value={selectedAId}
              onChange={(e) => setSelectedAId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition focus:outline-none"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === selectedBId}>
                  {s.name} ({calculateSemesterGPA(s.courses).gpa.toFixed(2)} GPA · {calculateSemesterGPA(s.courses).totalCredits} cr)
                  {s.id === selectedBId ? (lang === 'ar' ? ' (محدد كفصل ب)' : ' (Selected as B)') : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Semester B Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{lang === 'ar' ? 'الفصل الدراسي الثاني (ب):' : 'Second Term (B):'}</span>
            </label>
            <select
              value={selectedBId}
              onChange={(e) => setSelectedBId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition focus:outline-none"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === selectedAId}>
                  {s.name} ({calculateSemesterGPA(s.courses).gpa.toFixed(2)} GPA · {calculateSemesterGPA(s.courses).totalCredits} cr)
                  {s.id === selectedAId ? (lang === 'ar' ? ' (محدد كفصل أ)' : ' (Selected as A)') : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Delta Performance Highlight Banner */}
      <div
        className={`border rounded-3xl p-4 shadow-lg transition-all ${
          gpaDiff > 0.05
            ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/30'
            : gpaDiff < -0.05
            ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/30'
            : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                gpaDiff > 0.05
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : gpaDiff < -0.05
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {gpaDiff > 0.05 ? (
                <TrendingUp className="w-6 h-6" />
              ) : gpaDiff < -0.05 ? (
                <TrendingDown className="w-6 h-6" />
              ) : (
                <Minus className="w-6 h-6" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                {lang === 'ar' ? 'محصلة الفارق بين الفصلين (ب مقارنة مع أ)' : 'Performance Variance (B vs A)'}
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${
                    gpaDiff > 0.05
                      ? 'text-emerald-400'
                      : gpaDiff < -0.05
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {gpaDiff > 0 ? `+${gpaDiff.toFixed(2)}` : gpaDiff.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-slate-300 font-mono">
                  {gpaDiff > 0.05
                    ? lang === 'ar' ? 'تحسن في المعدل' : 'GPA Surge'
                    : gpaDiff < -0.05
                    ? lang === 'ar' ? 'تراجع في المعدل' : 'GPA Decline'
                    : lang === 'ar' ? 'أداء متطابق' : 'Identical GPA'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Delta Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[9px] text-slate-400 block font-medium">
                {lang === 'ar' ? 'فارق الساعات' : 'Credit Delta'}
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  creditsDiff > 0 ? 'text-cyan-400' : creditsDiff < 0 ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {creditsDiff > 0 ? `+${creditsDiff}` : creditsDiff} {lang === 'ar' ? 'ساعة' : 'cr'}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[9px] text-slate-400 block font-medium">
                {lang === 'ar' ? 'فارق المقررات' : 'Courses Delta'}
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  coursesDiff > 0 ? 'text-cyan-400' : coursesDiff < 0 ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {coursesDiff > 0 ? `+${coursesDiff}` : coursesDiff} {lang === 'ar' ? 'مقرر' : 'crs'}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[9px] text-slate-400 block font-medium">
                {lang === 'ar' ? 'فارق النقاط' : 'Quality Points'}
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  qualityPointsDiff > 0 ? 'text-emerald-400' : qualityPointsDiff < 0 ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {qualityPointsDiff > 0 ? `+${qualityPointsDiff.toFixed(1)}` : qualityPointsDiff.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Insight Note */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            {gpaDiff > 0.05
              ? lang === 'ar'
                ? `حقق الفصل (ب) ارتفاعاً بمقدار ${gpaDiff.toFixed(2)} في المعدل الفصلي مع تسجيل ${metricsB.totalCredits} ساعة، مما يعكس تحسناً كبيراً في استيعاب المواد ومستوى التحصيل الأكاديمي.`
                : `Term B outperformed Term A with a +${gpaDiff.toFixed(2)} GPA gain across ${metricsB.totalCredits} credit hours, indicating improved study mastery and exam performance.`
              : gpaDiff < -0.05
              ? lang === 'ar'
                ? `شهد الفصل (ب) انخفاضاً بمقدار ${Math.abs(gpaDiff).toFixed(2)} في المعدل الفصلي. قد يكون ذلك بسبب زيادة العبء الدراسي (${metricsB.totalCredits} ساعة) أو صعوبة المقررات المتقدمة.`
                : `Term B saw a drop of ${Math.abs(gpaDiff).toFixed(2)} GPA. This can correlate with a heavier academic workload (${metricsB.totalCredits} cr) or demanding technical prerequisites.`
              : lang === 'ar'
              ? `حافظت على نفس المعدل الفصلي المستقر (${metricsA.gpa.toFixed(2)}) عبر كلا الفصلين الدراسيين مع ثبات في الأداء العام.`
              : `Consistent academic standing (${metricsA.gpa.toFixed(2)} GPA) sustained evenly across both compared semesters.`}
          </p>
        </div>
      </div>

      {/* Side-by-Side Performance Metric Columns */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Semester A Column */}
        <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-3.5 sm:p-4.5 space-y-3 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 truncate">
                {lang === 'ar' ? 'الفصل (أ)' : 'Term (A)'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 font-mono border border-indigo-800/60 shrink-0">
                A
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1" title={semA.name}>
              {semA.name}
            </h4>

            {/* GPA Display */}
            <div className="bg-slate-950/80 rounded-2xl p-3 text-center border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">
                {lang === 'ar' ? 'معدل الفصل (SGPA)' : 'Semester GPA'}
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-indigo-400 tabular-nums">
                {metricsA.gpa.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono truncate">
                {lang === 'ar' ? standingA.titleAr : standingA.titleEn}
              </span>

              {metricsA.gpa < 2.0 && (
                <div className="mt-2 text-[10px] text-rose-400 bg-rose-950/50 border border-rose-800/50 rounded-lg py-0.5 px-1.5 flex items-center justify-center gap-1 font-mono">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{lang === 'ar' ? 'إنذار أكاديمي' : 'Warning'}</span>
                </div>
              )}
            </div>

            {/* Core Metrics List */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-indigo-400" />
                  <span>{lang === 'ar' ? 'الساعات المعتمدة' : 'Credits'}</span>
                </span>
                <span className="font-bold font-mono text-white tabular-nums">
                  {metricsA.totalCredits} {lang === 'ar' ? 'ساعة' : 'cr'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  <span>{lang === 'ar' ? 'عدد المقررات' : 'Courses'}</span>
                </span>
                <span className="font-bold font-mono text-white tabular-nums">
                  {semA.courses.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-indigo-400" />
                  <span>{lang === 'ar' ? 'إجمالي النقاط' : 'Quality Pts'}</span>
                </span>
                <span className="font-bold font-mono text-white tabular-nums">
                  {metricsA.qualityPoints.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'ar' ? 'ساعات النجاح' : 'Passed'}</span>
                </span>
                <span className="font-bold font-mono text-emerald-400 tabular-nums">
                  {metricsA.passedCredits} {lang === 'ar' ? 'ساعة' : 'cr'}
                </span>
              </div>
            </div>
          </div>

          {/* Grade Breakdown for Term A */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-1.5 font-bold uppercase">
              {lang === 'ar' ? 'توزيع التقديرات:' : 'Grade Breakdown:'}
            </span>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-1">
                <span className="text-emerald-400 font-bold block">{gradesA.honors}</span>
                <span className="text-slate-400 text-[8px]">A's</span>
              </div>
              <div className="bg-blue-950/40 border border-blue-800/40 rounded-lg p-1">
                <span className="text-blue-400 font-bold block">{gradesA.veryGood}</span>
                <span className="text-slate-400 text-[8px]">B's</span>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-1">
                <span className="text-amber-400 font-bold block">{gradesA.good + gradesA.pass}</span>
                <span className="text-slate-400 text-[8px]">C/D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Semester B Column */}
        <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-3.5 sm:p-4.5 space-y-3 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate">
                {lang === 'ar' ? 'الفصل (ب)' : 'Term (B)'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/60 shrink-0">
                B
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1" title={semB.name}>
              {semB.name}
            </h4>

            {/* GPA Display */}
            <div className="bg-slate-950/80 rounded-2xl p-3 text-center border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">
                {lang === 'ar' ? 'معدل الفصل (SGPA)' : 'Semester GPA'}
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tabular-nums">
                {metricsB.gpa.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono truncate">
                {lang === 'ar' ? standingB.titleAr : standingB.titleEn}
              </span>

              {metricsB.gpa < 2.0 && (
                <div className="mt-2 text-[10px] text-rose-400 bg-rose-950/50 border border-rose-800/50 rounded-lg py-0.5 px-1.5 flex items-center justify-center gap-1 font-mono">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{lang === 'ar' ? 'إنذار أكاديمي' : 'Warning'}</span>
                </div>
              )}
            </div>

            {/* Core Metrics List */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  <span>{lang === 'ar' ? 'الساعات المعتمدة' : 'Credits'}</span>
                </span>
                <span className="font-bold font-mono text-white tabular-nums">
                  {metricsB.totalCredits} {lang === 'ar' ? 'ساعة' : 'cr'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>{lang === 'ar' ? 'عدد المقررات' : 'Courses'}</span>
                </span>
                <span className="font-bold font-mono text-white tabular-nums">
                  {semB.courses.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-cyan-400" />
                  <span>{lang === 'ar' ? 'إجمالي النقاط' : 'Quality Pts'}</span>
                </span>
                <span className="font-bold font-mono text-white tabular-nums">
                  {metricsB.qualityPoints.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'ar' ? 'ساعات النجاح' : 'Passed'}</span>
                </span>
                <span className="font-bold font-mono text-emerald-400 tabular-nums">
                  {metricsB.passedCredits} {lang === 'ar' ? 'ساعة' : 'cr'}
                </span>
              </div>
            </div>
          </div>

          {/* Grade Breakdown for Term B */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-1.5 font-bold uppercase">
              {lang === 'ar' ? 'توزيع التقديرات:' : 'Grade Breakdown:'}
            </span>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-1">
                <span className="text-emerald-400 font-bold block">{gradesB.honors}</span>
                <span className="text-slate-400 text-[8px]">A's</span>
              </div>
              <div className="bg-blue-950/40 border border-blue-800/40 rounded-lg p-1">
                <span className="text-blue-400 font-bold block">{gradesB.veryGood}</span>
                <span className="text-slate-400 text-[8px]">B's</span>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-1">
                <span className="text-amber-400 font-bold block">{gradesB.good + gradesB.pass}</span>
                <span className="text-slate-400 text-[8px]">C/D</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Registered Courses Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'ar' ? 'مقارنة المقررات والتقديرات المسجلة' : 'Course-by-Course Grade Comparison'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Term A Course List */}
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] font-bold text-indigo-400">
              <span className="truncate">{semA.name}</span>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                {semA.courses.length} {lang === 'ar' ? 'مقررات' : 'courses'}
              </span>
            </div>

            {semA.courses.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-2 text-center">
                {lang === 'ar' ? 'لا توجد مقررات مسجلة' : 'No courses recorded'}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {semA.courses.map((course) => {
                  const scale = SHA_GRADE_SCALE[course.grade];
                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/60 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white text-[11px] block truncate">
                          {course.code || course.name}
                        </span>
                        <span className="text-[9px] text-slate-400 block truncate">
                          {course.name} · {course.credits} {lang === 'ar' ? 'ساعة' : 'cr'}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg shrink-0 ${
                          scale ? scale.bgLightClass : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {course.grade}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Term B Course List */}
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] font-bold text-cyan-400">
              <span className="truncate">{semB.name}</span>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                {semB.courses.length} {lang === 'ar' ? 'مقررات' : 'courses'}
              </span>
            </div>

            {semB.courses.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-2 text-center">
                {lang === 'ar' ? 'لا توجد مقررات مسجلة' : 'No courses recorded'}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {semB.courses.map((course) => {
                  const scale = SHA_GRADE_SCALE[course.grade];
                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/60 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white text-[11px] block truncate">
                          {course.code || course.name}
                        </span>
                        <span className="text-[9px] text-slate-400 block truncate">
                          {course.name} · {course.credits} {lang === 'ar' ? 'ساعة' : 'cr'}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg shrink-0 ${
                          scale ? scale.bgLightClass : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {course.grade}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Private Semester Notes Comparison */}
      {(semA.notes || semB.notes) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'ar' ? 'مقارنة الملاحظات والأهداف الدراسية' : 'Semester Notes & Goals Comparison'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase block truncate">
                {lang === 'ar' ? 'ملاحظات' : 'Notes:'} {semA.name}
              </span>
              {semA.notes ? (
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{semA.notes}"
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {lang === 'ar' ? 'لا توجد ملاحظات مدونة لهذا الفصل.' : 'No notes entered for this semester.'}
                </p>
              )}
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase block truncate">
                {lang === 'ar' ? 'ملاحظات' : 'Notes:'} {semB.name}
              </span>
              {semB.notes ? (
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{semB.notes}"
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {lang === 'ar' ? 'لا توجد ملاحظات مدونة لهذا الفصل.' : 'No notes entered for this semester.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
