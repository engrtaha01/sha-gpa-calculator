import React, { useState } from 'react';
import { GradeLetter, SHA_GRADE_SCALE, AppLanguage } from '../types/gpa';
import { getGradePoints } from '../utils/gpaCalculations';
import { RotateCcw, BookOpen, AlertOctagon, CheckCircle2, Award, Info } from 'lucide-react';

interface RetakeSimulatorViewProps {
  currentCgpa: number;
  totalCredits: number;
  lang: AppLanguage;
}

export const RetakeSimulatorView: React.FC<RetakeSimulatorViewProps> = ({
  currentCgpa,
  totalCredits,
  lang,
}) => {
  const [cgpa, setCgpa] = useState<number>(currentCgpa || 2.65);
  const [credits, setCredits] = useState<number>(totalCredits || 72);
  const [courseCredits, setCourseCredits] = useState<number>(3);
  const [oldGrade, setOldGrade] = useState<GradeLetter>('D');
  const [newGrade, setNewGrade] = useState<GradeLetter>('A');

  // Retake Calculation:
  // Current Total Points = cgpa * credits
  // Old Grade Points = getGradePoints(oldGrade) * courseCredits
  // New Grade Points = getGradePoints(newGrade) * courseCredits
  // New Total Points = Current Total Points - Old Grade Points + New Grade Points
  // New CGPA = New Total Points / credits (credits remain the same because it's a replacement!)
  const curPoints = cgpa * credits;
  const oldPts = getGradePoints(oldGrade) * courseCredits;
  const newPts = getGradePoints(newGrade) * courseCredits;
  const newPoints = curPoints - oldPts + newPts;
  const simulatedCgpa = credits > 0 ? newPoints / credits : cgpa;
  const gpaBoost = simulatedCgpa - cgpa;

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-2xl mx-auto w-full">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            {lang === 'ar' ? 'حاسبة تحسين المواد واللوائح (SHA)' : 'Retake Simulator & SHA Academic Bylaws'}
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          {lang === 'ar'
            ? 'شاهد كيف يؤثر تحسين مادة واحدة بتقدير ضعيف (D أو F) على قفزة معدلك التراكمي دون زيادة الساعات.'
            : 'Simulate how retaking a single low-grade course (D/F) will instantly raise your CGPA without extra hours.'}
        </p>
      </div>

      {/* Simulator Inputs Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          {lang === 'ar' ? 'بيانات المادة المراد تحسينها' : 'Course Retake Parameters'}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {lang === 'ar' ? 'المعدل التراكمي الحالي' : 'Current CGPA'}
            </label>
            <input
              type="number"
              step="0.01"
              value={cgpa}
              onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {lang === 'ar' ? 'إجمالي الساعات الحالية' : 'Total Earned Credits'}
            </label>
            <input
              type="number"
              step="1"
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Course Credits Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            {lang === 'ar' ? 'ساعات المادة المراد إعادتها' : 'Credits of Retaken Course'}
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map((cr) => (
              <button
                key={cr}
                onClick={() => setCourseCredits(cr)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  courseCredits === cr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cr} {lang === 'ar' ? 'ساعات' : 'Credits'}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Transition: Old -> New */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-rose-400 mb-1">
              {lang === 'ar' ? 'التقدير القديم الأصلي' : 'Original Old Grade'}
            </label>
            <select
              value={oldGrade}
              onChange={(e) => setOldGrade(e.target.value as GradeLetter)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-rose-500"
            >
              <option value="F">F (0.0 pt - رسوب)</option>
              <option value="D">D (1.0 pt - ضعيف)</option>
              <option value="D+">D+ (1.3 pt)</option>
              <option value="C-">C- (1.7 pt)</option>
              <option value="C">C (2.0 pt)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">
              {lang === 'ar' ? 'التقدير المتوقع بعد الإعادة' : 'Projected New Grade'}
            </label>
            <select
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value as GradeLetter)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="A+">A+ (4.0 pt - امتياز)</option>
              <option value="A">A (4.0 pt - ممتاز)</option>
              <option value="A-">A- (3.7 pt)</option>
              <option value="B+">B+ (3.3 pt - جيد جداً)</option>
              <option value="B">B (3.0 pt)</option>
              <option value="C+">C+ (2.3 pt)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Retake Outcome Card */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {lang === 'ar' ? 'المعدل التراكمي الجديد بعد التحسين' : 'New CGPA after Replacement'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tabular-nums">
                {simulatedCgpa.toFixed(3)}
              </span>
              <span className="text-sm font-semibold text-slate-500 font-mono">/ 4.00</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block mb-1">
              {lang === 'ar' ? 'الزيادة الصافية' : 'Net Boost'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +{gpaBoost.toFixed(3)}
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-300">
          {lang === 'ar'
            ? `استبدال تقدير (${oldGrade}) بتقدير (${newGrade}) يضيف لك ${(newPts - oldPts).toFixed(1)} نقطة صافية لمجموعك التراكمي دون زيادة ساعات التخرج.`
            : `Replacing (${oldGrade}) with (${newGrade}) adds ${(newPts - oldPts).toFixed(1)} net quality points to your cumulative standing without increasing your total graduation credits.`}
        </p>
      </div>

      {/* El Shorouk Academy Academic Bylaws Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>{lang === 'ar' ? 'لوائح وقواعد الساعات المعتمدة بأكاديمية الشروق' : 'Official SHA Credit Hour Bylaws'}</span>
        </h3>

        {/* Academic Standing Thresholds */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">
                {lang === 'ar' ? 'مرتبة الشرف (امتياز >= 3.50)' : 'Honors Standing (CGPA >= 3.50)'}
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {lang === 'ar'
                  ? 'يمنح الطالب مرتبة الشرف إذا حافظ على معدل 3.50 فما فوق طوال سنوات دراسته ولم يرسب في أي مقرر دراسي.'
                  : 'Granted if student maintains CGPA >= 3.50 across all academic levels with zero fail records.'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">
                {lang === 'ar' ? 'الحد الأقصى للتسجيل الفصلي' : 'Semester Credit Hour Registration Limits'}
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {lang === 'ar'
                  ? 'المعدل >= 3.00: تسجيل حتى 21 ساعة. المعدل 2.00-2.99: تسجيل حتى 18 ساعة. المعدل < 2.00: مقيد بـ 12 ساعة فقط.'
                  : 'CGPA >= 3.00: Up to 21 credits. CGPA 2.00-2.99: Up to 18 credits. CGPA < 2.00: Restricted to 12 credits.'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">
                {lang === 'ar' ? 'الإنذار الأكاديمي والملاحظة (CGPA < 2.00)' : 'Academic Probation & Warning'}
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {lang === 'ar'
                  ? 'يوجه للطالب إنذار أكاديمي إذا انخفض معدله التراكمي عن 2.00. استمرار الإنذار لفصول متتالية يعرض الطالب لمجلس التأديب الأكاديمي أو الفصل.'
                  : 'Triggered if CGPA falls below 2.00. Consecutive warnings limit course registration and may lead to academic committee review.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
