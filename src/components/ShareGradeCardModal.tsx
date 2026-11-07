import React, { useState } from 'react';
import { Course, AppLanguage } from '../types/gpa';
import { calculateSemesterGPA, calculateCumulativeGPA } from '../utils/gpaCalculations';
import { generateSemesterGradeCardPDF } from '../utils/pdfGenerator';
import { X, Printer, Share2, Award, Check, FileDown, User, Hash, GraduationCap } from 'lucide-react';

interface ShareGradeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  prevCgpa: number;
  prevCredits: number;
  lang: AppLanguage;
}

export const ShareGradeCardModal: React.FC<ShareGradeCardModalProps> = ({
  isOpen,
  onClose,
  courses,
  prevCgpa,
  prevCredits,
  lang,
}) => {
  const [studentName, setStudentName] = useState('Ahmed Mohamed');
  const [studentId, setStudentId] = useState('SHA-2024-8192');
  const [major, setMajor] = useState('Computer Science & IT');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const semRes = calculateSemesterGPA(courses);
  const cumRes = calculateCumulativeGPA(prevCgpa, prevCredits, courses);
  const currentDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      generateSemesterGradeCardPDF({
        studentName,
        studentId,
        major,
        termName: lang === 'ar' ? 'الفصل الدراسي الحالي - 2025' : 'Current Academic Term - 2025',
        courses,
        prevCgpa,
        prevCredits,
        lang,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert(lang === 'ar' ? 'حدث خطأ أثناء تصدير ملف PDF' : 'Error generating PDF document');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `🎓 *El Shorouk Academy - Official Grade Report*
👤 Student: ${studentName} (${studentId})
🏛️ Program: ${major}
📅 Date: ${currentDate}
━━━━━━━━━━━━━━━━━━
📊 Semester GPA: ${semRes.gpa.toFixed(2)} / 4.00 (${semRes.totalCredits} Credit Hours)
🏆 Cumulative CGPA: ${cumRes.newCgpa.toFixed(2)} / 4.00 (${cumRes.totalCumulativeCredits} Total Hours)
🎖️ Standing: ${lang === 'ar' ? cumRes.standing.titleAr : cumRes.standing.titleEn}
━━━━━━━━━━━━━━━━━━
Generated with SHA GPA Mobile App 📱`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === 'ar' ? 'تصدير بطاقة الدرجات الرسمية (PDF)' : 'Export Official Grade Card (PDF)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable / Screenshot Card */}
        <div
          id="printable-grade-card"
          className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden"
        >
          {/* SHA Brand Banner */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-900 p-0.5 flex items-center justify-center">
                <img src="/icon.svg" alt="SHA" className="w-full h-full rounded-[10px]" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider text-white uppercase">
                  EL SHOROUK ACADEMY
                </h4>
                <span className="text-[10px] text-amber-400 font-medium">
                  {lang === 'ar' ? 'أكاديمية الشروق - بطاقة المعدل' : 'Official Academic Record'}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{currentDate}</span>
          </div>

          {/* Student Editable Meta for PDF */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                <User className="w-3 h-3 text-blue-400" />
                {lang === 'ar' ? 'اسم الطالب:' : 'Student Name:'}
              </span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                placeholder="Ahmed Mohamed"
              />
            </div>

            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Hash className="w-3 h-3 text-blue-400" />
                {lang === 'ar' ? 'رقم القيد:' : 'Student ID:'}
              </span>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                placeholder="SHA-2024-8192"
              />
            </div>
          </div>

          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
              <GraduationCap className="w-3 h-3 text-blue-400" />
              {lang === 'ar' ? 'المعهد / الشعبة:' : 'Academic Department / Major:'}
            </span>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-200 focus:outline-none"
              placeholder="Computer Science & Engineering"
            />
          </div>

          {/* Double Metrics Strip */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-2.5">
              <span className="text-[10px] text-blue-300 font-semibold uppercase block">
                {lang === 'ar' ? 'معدل الفصل (GPA)' : 'Semester GPA'}
              </span>
              <span className="text-2xl font-black font-mono text-white tracking-tight tabular-nums">
                {semRes.gpa.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {semRes.totalCredits} {lang === 'ar' ? 'ساعات' : 'Credits'}
              </span>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5">
              <span className="text-[10px] text-amber-300 font-semibold uppercase block">
                {lang === 'ar' ? 'المعدل التراكمي (CGPA)' : 'Cumulative CGPA'}
              </span>
              <span className="text-2xl font-black font-mono text-amber-400 tracking-tight tabular-nums">
                {cumRes.newCgpa.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {cumRes.totalCumulativeCredits} {lang === 'ar' ? 'إجمالي الساعات' : 'Total Credits'}
              </span>
            </div>
          </div>

          {/* Standing Banner */}
          <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {lang === 'ar' ? 'التقدير العام:' : 'Academic Standing:'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cumRes.standing.badgeColor} flex items-center gap-1`}>
              <Award className="w-3 h-3 text-amber-400" />
              <span>{lang === 'ar' ? cumRes.standing.titleAr : cumRes.standing.titleEn}</span>
            </span>
          </div>

          {/* Course Mini Breakdown */}
          {courses.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 px-1 pb-1 border-b border-slate-800">
                <span className="col-span-7">{lang === 'ar' ? 'المقرر' : 'Course'}</span>
                <span className="col-span-2 text-center">{lang === 'ar' ? 'س' : 'Cr'}</span>
                <span className="col-span-3 text-right">{lang === 'ar' ? 'التقدير' : 'Grade'}</span>
              </div>
              {courses.map((c) => (
                <div key={c.id} className="grid grid-cols-12 text-[11px] text-slate-300 px-1 py-0.5">
                  <span className="col-span-7 truncate font-medium">{c.code} {c.name}</span>
                  <span className="col-span-2 text-center font-mono text-slate-400">{c.credits}</span>
                  <span className="col-span-3 text-right font-bold font-mono text-blue-400">{c.grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Primary Action: Download PDF Document */}
        <div className="mt-3.5 space-y-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4 text-amber-300" />
            <span>
              {isGeneratingPdf
                ? (lang === 'ar' ? 'جاري تجهيز ملف PDF...' : 'Generating Document...')
                : (lang === 'ar' ? 'تحميل وثيقة الدرجات الرسمية (PDF)' : 'Download Official Grade Card (PDF)')}
            </span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopySummary}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ للواتساب' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'ar' ? 'طباعة مباشرة' : 'Direct Print'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
