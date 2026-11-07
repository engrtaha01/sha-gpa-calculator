import React, { useState } from 'react';
import { Semester, AppLanguage } from '../types/gpa';
import { calculateSemesterGPA } from '../utils/gpaCalculations';
import { History, Plus, Trash2, Download, Upload, CheckCircle2, ChevronRight, FileDown, TrendingUp, FileText, Scale } from 'lucide-react';
import { generateTranscriptHistoryPDF } from '../utils/pdfGenerator';
import { SemesterComparisonView } from './SemesterComparisonView';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface TooltipPayloadItem {
  value: number;
  name: string;
  dataKey: string;
  payload: {
    idx: number;
    shortName: string;
    fullName: string;
    termGpa: number;
    cumulativeGpa: number;
    termCredits: number;
    totalCredits: number;
  };
}

interface CustomTranscriptTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  lang: AppLanguage;
}

const CustomTranscriptTooltip: React.FC<CustomTranscriptTooltipProps> = ({ active, payload, lang }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 border border-slate-700 rounded-2xl p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
        <span className="font-bold text-white block pb-1 border-b border-slate-800 text-[11px] truncate max-w-[200px]">
          {data.fullName}
        </span>
        <div className="flex items-center justify-between gap-4 text-amber-400 font-mono">
          <span className="text-[10px] text-slate-300">{lang === 'ar' ? 'المعدل التراكمي (CGPA):' : 'Cumulative CGPA:'}</span>
          <span className="font-bold">{data.cumulativeGpa.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-blue-400 font-mono">
          <span className="text-[10px] text-slate-300">{lang === 'ar' ? 'معدل الفصل (SGPA):' : 'Semester SGPA:'}</span>
          <span className="font-bold">{data.termGpa.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-400 text-[10px] font-mono pt-1 border-t border-slate-800/80">
          <span>{lang === 'ar' ? 'إجمالي الساعات:' : 'Total Credits:'}</span>
          <span className="text-white font-semibold">{data.totalCredits} cr</span>
        </div>
      </div>
    );
  }
  return null;
};

interface TranscriptsViewProps {
  semesters: Semester[];
  onSemestersChange: (semesters: Semester[]) => void;
  onSelectSemesterToEdit?: (semester: Semester) => void;
  lang: AppLanguage;
}

export const TranscriptsView: React.FC<TranscriptsViewProps> = ({
  semesters,
  onSemestersChange,
  onSelectSemesterToEdit,
  lang,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'compare'>('timeline');
  const [compareSemAId, setCompareSemAId] = useState<string | undefined>(undefined);
  const [compareSemBId, setCompareSemBId] = useState<string | undefined>(undefined);
  const [newSemName, setNewSemName] = useState('');
  const [newSemNotes, setNewSemNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [studentName, setStudentName] = useState('Ahmed Mohamed');
  const [studentId, setStudentId] = useState('SHA-2024-8192');
  const [major, setMajor] = useState('Computer Science & Information Technology');

  // Compute total credits and cumulative GPA across all saved semesters
  let grandTotalCredits = 0;
  let grandQualityPoints = 0;

  semesters.forEach((sem) => {
    const res = calculateSemesterGPA(sem.courses);
    grandTotalCredits += res.totalCredits;
    grandQualityPoints += res.qualityPoints;
  });

  const cumulativeAll = grandTotalCredits > 0 ? grandQualityPoints / grandTotalCredits : 0;

  let runningCredits = 0;
  let runningQualityPoints = 0;
  const chartData = semesters.map((sem, idx) => {
    const res = calculateSemesterGPA(sem.courses);
    runningCredits += res.totalCredits;
    runningQualityPoints += res.qualityPoints;
    const cgpaSoFar = runningCredits > 0 ? runningQualityPoints / runningCredits : res.gpa;
    return {
      idx: idx + 1,
      shortName: `T${idx + 1}`,
      fullName: sem.name,
      termGpa: Number(res.gpa.toFixed(2)),
      cumulativeGpa: Number(cgpaSoFar.toFixed(2)),
      termCredits: res.totalCredits,
      totalCredits: runningCredits,
    };
  });

  const handleAddSemester = () => {
    if (!newSemName.trim()) return;
    const newSem: Semester = {
      id: 'sem_' + Date.now(),
      name: newSemName.trim(),
      term: 'Fall',
      courses: [],
      notes: newSemNotes.trim() ? newSemNotes.trim() : undefined,
    };
    onSemestersChange([...semesters, newSem]);
    setNewSemName('');
    setNewSemNotes('');
    setShowAddModal(false);
  };

  const handleRemoveSemester = (id: string) => {
    if (confirm(lang === 'ar' ? 'هل تريد حذف هذا الفصل الدراسي من سجلك؟' : 'Remove this semester from history?')) {
      onSemestersChange(semesters.filter((s) => s.id !== id));
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(semesters, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'SHA_GPA_Transcript_Backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onSemestersChange(parsed);
            alert(lang === 'ar' ? 'تم استيراد سجل الفصول بنجاح!' : 'Transcript imported successfully!');
          }
        } catch {
          alert(lang === 'ar' ? 'خطأ في قراءة ملف النسخة الاحتياطية' : 'Error parsing backup file');
        }
      };
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-2xl mx-auto w-full">
      {/* Sub-view Segmented Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
            activeSubTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'سجل الفصول والمنحنى' : 'Transcripts & Timeline'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('compare')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
            activeSubTab === 'compare'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <div className="flex items-center gap-1.5">
            <span>{lang === 'ar' ? 'مقارنة فصلين' : 'Compare Terms'}</span>
            {semesters.length >= 2 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                {semesters.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {activeSubTab === 'compare' ? (
        <SemesterComparisonView
          semesters={semesters}
          lang={lang}
          initialSemesterAId={compareSemAId}
          initialSemesterBId={compareSemBId}
          onBackToHistory={() => setActiveSubTab('timeline')}
          onAddNewSemester={() => setShowAddModal(true)}
        />
      ) : (
        <>
          {/* Transcript Overview Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950/70 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
              {lang === 'ar' ? 'المعدل التراكمي لجميع الفصول المسجلة' : 'Cumulative Multi-Term CGPA'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tabular-nums">
                {cumulativeAll.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-slate-400 font-mono">/ 4.00</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block mb-1">
              {lang === 'ar' ? 'الفصول المسجلة' : 'Terms Count'}
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {semesters.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 block">
              {lang === 'ar' ? 'إجمالي الساعات المعتمدة' : 'Total Earned Hours'}
            </span>
            <span className="text-base font-bold font-mono text-white">
              {grandTotalCredits} {lang === 'ar' ? 'ساعة' : 'Hrs'}
            </span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 block">
              {lang === 'ar' ? 'إجمالي النقاط' : 'Total Quality Points'}
            </span>
            <span className="text-base font-bold font-mono text-white">
              {grandQualityPoints.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* GPA Progression Line Chart Card */}
      {semesters.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 shadow-lg space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'ar' ? 'منحنى تطور المعدل التراكمي والفصلي' : 'Cumulative CGPA Progression'}
              </h3>
            </div>
            {/* Legend / Metrics */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs" />
                <span>{lang === 'ar' ? 'التراكمي (CGPA)' : 'Cumulative'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-xs" />
                <span>{lang === 'ar' ? 'الفصلي (SGPA)' : 'Term GPA'}</span>
              </span>
            </div>
          </div>

          {/* Recharts responsive container with explicit height */}
          <div className="w-full h-56 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 12, left: -22, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                <XAxis
                  dataKey="shortName"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  domain={[1.0, 4.0]}
                  ticks={[1.0, 2.0, 3.0, 4.0]}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTranscriptTooltip lang={lang} />} />
                {/* 2.00 Warning Threshold Reference Line */}
                <ReferenceLine
                  y={2.0}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                {/* 3.50 Honors Reference Line */}
                <ReferenceLine
                  y={3.5}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                {/* Cumulative CGPA line */}
                <Line
                  type="monotone"
                  dataKey="cumulativeGpa"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4.5, fill: '#f59e0b', strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 6.5, fill: '#fbbf24' }}
                />
                {/* Semester GPA line */}
                <Line
                  type="monotone"
                  dataKey="termGpa"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 1.5, stroke: '#0f172a' }}
                  activeDot={{ r: 5, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Reference indicators note */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>3.50: {lang === 'ar' ? 'مرتبة الشرف' : 'Honors Line'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>2.00: {lang === 'ar' ? 'حد الإنذار الأكاديمي' : 'Warning Threshold'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-blue-400" />
          <span>{lang === 'ar' ? 'سجل الفصول الدراسية' : 'Semester Transcripts'}</span>
        </h3>

        <div className="flex items-center gap-1.5">
          {semesters.length > 0 && (
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-700/20 hover:from-amber-600/40 hover:to-amber-700/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title={lang === 'ar' ? 'تصدير السجل الأكاديمي الشامل (PDF)' : 'Export Full Transcript (PDF)'}
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'تقرير PDF' : 'Export PDF'}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إضافة فصل' : 'Add Term'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
            title={lang === 'ar' ? 'تصدير نسخة احتياطية' : 'Export Backup JSON'}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
            title={lang === 'ar' ? 'استيراد نسخة احتياطية' : 'Import Backup JSON'}
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Semester Cards List */}
      <div className="space-y-3">
        {semesters.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
            <History className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-3">
              {lang === 'ar'
                ? 'لا توجد فصول دراسية محفوظة في السجل. بعد حساب أي فصل في الصفحة الأولى، يمكنك الضغط على "حفظ بالسجل" لتتبع مسيرتك الأكاديمية.'
                : 'No semesters recorded yet. Calculate any term on the calculator tab and tap "Save to History" to track your progression.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              {lang === 'ar' ? '+ إضافة فصل جديد' : '+ Add New Semester'}
            </button>
          </div>
        ) : (
          semesters.map((sem, index) => {
            const semRes = calculateSemesterGPA(sem.courses);
            return (
              <div
                key={sem.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-mono font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{sem.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {sem.courses.length} {lang === 'ar' ? 'مقررات مسجلة' : 'courses'} · {semRes.totalCredits} {lang === 'ar' ? 'ساعات' : 'credits'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-blue-400 tabular-nums">
                        {semRes.gpa.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono">GPA</span>
                    </div>

                    <button
                      onClick={() => {
                        setCompareSemAId(sem.id);
                        const other = semesters.find((s) => s.id !== sem.id);
                        if (other) setCompareSemBId(other.id);
                        setActiveSubTab('compare');
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-amber-500/10 transition"
                      title={lang === 'ar' ? 'مقارنة هذا الفصل' : 'Compare this semester'}
                      aria-label="Compare semester"
                    >
                      <Scale className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRemoveSemester(sem.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      aria-label="Remove semester"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Course pills preview */}
                {sem.courses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                    {sem.courses.map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 font-mono border border-slate-800 flex items-center gap-1"
                      >
                        <span>{c.code || c.name}</span>
                        <span className="font-bold text-blue-400">({c.grade})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Private Semester Notes */}
                {sem.notes && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="flex items-start gap-2 bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80">
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                          {lang === 'ar' ? 'ملاحظات الفصل الخاصة:' : 'Private Notes:'}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed italic">
                          "{sem.notes}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* Add Semester Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                {lang === 'ar' ? 'إضافة فصل دراسي جديد' : 'Add New Semester'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'أدخل اسم الفصل والملاحظات الدراسية الخاصة:' : 'Enter term label and private semester notes:'}
              </p>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {lang === 'ar' ? 'اسم الفصل الدراسي:' : 'Semester Name:'}
              </label>
              <input
                type="text"
                value={newSemName}
                onChange={(e) => setNewSemName(e.target.value)}
                placeholder="e.g. Fall 2024"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {lang === 'ar' ? 'ملاحظات خاصة بالفصل (اختياري):' : 'Private Notes (Optional):'}
              </label>
              <textarea
                rows={2}
                value={newSemNotes}
                onChange={(e) => setNewSemNotes(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: التركيز على التفاضل، تحسين الحضور، هدف 3.4+...' : 'e.g., Focus on Calculus, Need to improve attendance...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddSemester}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
              >
                {lang === 'ar' ? 'إضافة الفصل' : 'Add Semester'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Transcript PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'تصدير السجل الأكاديمي الشامل (PDF)' : 'Export Full Transcript (PDF)'}
                </h3>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? `سيتم استخراج وثيقة رسمية بصيغة PDF تشمل جميع الفصول الدراسية المسجلة (${semesters.length} فصول، إجمالي ${grandTotalCredits} ساعة معتمدة) بمعدل تراكمي ${cumulativeAll.toFixed(2)}.`
                : `Exports an official academic transcript PDF including all ${semesters.length} recorded semesters (${grandTotalCredits} total credit hours) with CGPA of ${cumulativeAll.toFixed(2)}.`}
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  {lang === 'ar' ? 'اسم الطالب:' : 'Student Name:'}
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {lang === 'ar' ? 'رقم القيد الجامعي (Student ID):' : 'Student ID:'}
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {lang === 'ar' ? 'التخصص أو الشعبة الأكاديمية:' : 'Academic Major / Institute:'}
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  generateTranscriptHistoryPDF({
                    studentName,
                    studentId,
                    major,
                    semesters,
                    lang,
                  });
                  setShowPdfModal(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
              >
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>{lang === 'ar' ? 'تحميل وثيقة السجل (PDF)' : 'Download Transcript (PDF)'}</span>
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
