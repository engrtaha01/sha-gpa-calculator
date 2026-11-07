import React, { useState } from 'react';
import { AppLanguage } from '../types/gpa';
import { calculateTargetPlan } from '../utils/gpaCalculations';
import { Target, CheckCircle2, AlertCircle, Compass, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TargetPlannerViewProps {
  currentCgpa: number;
  completedCredits: number;
  lang: AppLanguage;
}

export const TargetPlannerView: React.FC<TargetPlannerViewProps> = ({
  currentCgpa,
  completedCredits,
  lang,
}) => {
  const [curGpa, setCurGpa] = useState<number>(currentCgpa || 2.75);
  const [curCredits, setCurCredits] = useState<number>(completedCredits || 60);
  const [targetGpa, setTargetGpa] = useState<number>(3.2);
  const [plannedCredits, setPlannedCredits] = useState<number>(18);

  const planResult = calculateTargetPlan(curGpa, curCredits, targetGpa, plannedCredits);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-2xl mx-auto w-full">
      {/* Title banner */}
      <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/40 border border-slate-800 rounded-3xl p-4 shadow-lg">
        <div className="flex items-center gap-2.5 mb-1">
          <Target className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">
            {lang === 'ar' ? 'مخطط المعدل التراكمي المستهدف' : 'Target CGPA Goal Planner'}
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          {lang === 'ar'
            ? 'احسب بالضبط ما تحتاجه من تقديرات ومعدل فصلي في الساعات القادمة للوصول لتقديرك المنشود.'
            : 'Find out the exact semester GPA and grades needed in upcoming credits to reach your dream CGPA.'}
        </p>
      </div>

      {/* Target & Current Settings Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'ar' ? 'معدلك الحالي (CGPA)' : 'Current CGPA'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={curGpa}
              onChange={(e) => setCurGpa(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'ar' ? 'الساعات المجتازة' : 'Passed Credits'}
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="200"
              value={curCredits}
              onChange={(e) => setCurCredits(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Target CGPA Slider */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ar' ? 'المعدل التراكمي المستهدف (Target)' : 'Desired Target CGPA'}
            </label>
            <span className="text-base font-black font-mono text-blue-400 tabular-nums">
              {targetGpa.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="2.0"
            max="4.0"
            step="0.05"
            value={targetGpa}
            onChange={(e) => setTargetGpa(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>2.00 (Pass)</span>
            <span>2.40 (Good)</span>
            <span>3.00 (Very Good)</span>
            <span>3.50 (Honors)</span>
          </div>
        </div>

        {/* Planned Upcoming Credits */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ar' ? 'الساعات المخططة القادمة' : 'Planned Credits in Period'}
            </label>
            <span className="text-base font-black font-mono text-white tabular-nums">
              {plannedCredits} {lang === 'ar' ? 'ساعة' : 'Credits'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[12, 15, 18, 30].map((cr) => (
              <button
                key={cr}
                onClick={() => setPlannedCredits(cr)}
                className={`py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  plannedCredits === cr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cr} {lang === 'ar' ? 'س' : 'cr'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div
        className={`border rounded-3xl p-5 shadow-xl relative overflow-hidden transition-all ${
          planResult.feasibility === 'impossible'
            ? 'bg-rose-950/20 border-rose-500/30'
            : planResult.feasibility === 'challenging'
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-emerald-950/20 border-emerald-500/30'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {lang === 'ar' ? 'المعدل الفصلي المطلوب تحقيقه' : 'Required Semester GPA'}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono tabular-nums ${
                  planResult.feasibility === 'impossible'
                    ? 'text-rose-400'
                    : planResult.feasibility === 'challenging'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {planResult.requiredTermGpa > 4.0 ? '> 4.00' : Math.max(0, planResult.requiredTermGpa).toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-slate-500 font-mono">/ 4.00</span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              planResult.feasibility === 'impossible'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : planResult.feasibility === 'challenging'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {planResult.feasibility === 'impossible'
              ? (lang === 'ar' ? 'مستحيل في هذا الترم' : 'Mathematically Impossible')
              : planResult.feasibility === 'challenging'
              ? (lang === 'ar' ? 'يتطلب درجات مرتفعة (A)' : 'High Distinction (A)')
              : (lang === 'ar' ? 'ممكن ومتاح' : 'Realistic Goal')}
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-300 leading-relaxed">
          {lang === 'ar' ? planResult.messageAr : planResult.messageEn}
        </p>

        {planResult.feasibility !== 'impossible' && (
          <button
            onClick={triggerConfetti}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-blue-400 hover:text-white transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'التحفيز الأكاديمي' : 'Celebrate Goal Plan'}</span>
          </button>
        )}
      </div>

      {/* Recommended Strategy */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
        <h4 className="font-bold text-white flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>{lang === 'ar' ? 'نصائح أكاديمية الشروق لتحقيق الهدف:' : 'Academic Strategy for SHA Students:'}</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
          <li>
            {lang === 'ar'
              ? 'إعادة المقررات ذات تقدير D أو F هي أسرع وسيلة لرفع المعدل التراكمي دون زيادة عدد الساعات الكلية.'
              : 'Retaking courses with grade D or F directly replaces the grade without increasing denominator hours.'}
          </li>
          <li>
            {lang === 'ar'
              ? 'توزيع الساعات على فصول الصيف (Summer Course) يساعد في تحسين المقررات الصعبة بتركيز أعلى.'
              : 'Taking a 6-credit summer session can boost your cumulative GPA significantly.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
