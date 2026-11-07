import React, { useState, useEffect, useCallback } from 'react';
import { Course, Semester, DeviceMode, AppLanguage } from './types/gpa';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { MobileTopBar } from './components/MobileTopBar';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { SemesterCalculatorView } from './components/SemesterCalculatorView';
import { TargetPlannerView } from './components/TargetPlannerView';
import { RetakeSimulatorView } from './components/RetakeSimulatorView';
import { TranscriptsView } from './components/TranscriptsView';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ShareGradeCardModal } from './components/ShareGradeCardModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { calculateSemesterGPA } from './utils/gpaCalculations';
import { useRealtimeSync, RealtimeAppState } from './hooks/useRealtimeSync';

const INITIAL_COURSES: Course[] = [
  { id: 'c1', code: 'CS101', name: 'Programming Fundamentals (C++)', credits: 3, grade: 'A' },
  { id: 'c2', code: 'MATH101', name: 'Mathematics 1 (Calculus)', credits: 3, grade: 'B+' },
  { id: 'c3', code: 'PHYS101', name: 'Physics 1 (Mechanics)', credits: 3, grade: 'A-' },
  { id: 'c4', code: 'ENG101', name: 'Technical English', credits: 2, grade: 'A' },
  { id: 'c5', code: 'HUM101', name: 'Ethics & Human Rights', credits: 2, grade: 'B+' },
];

export default function App() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('iphone');
  const [lang, setLang] = useState<AppLanguage>('ar');
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Persistence in localStorage
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('sha_current_courses');
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [prevCgpa, setPrevCgpa] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sha_prev_cgpa');
      return saved ? parseFloat(saved) : 3.15;
    } catch {
      return 3.15;
    }
  });

  const [prevCredits, setPrevCredits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sha_prev_credits');
      return saved ? parseInt(saved, 10) : 32;
    } catch {
      return 32;
    }
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const saved = localStorage.getItem('sha_semesters');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'sem_initial_1',
          name: 'Year 1 - Fall (الفرقة الأولى - خريف)',
          term: 'Fall',
          courses: [
            { id: 's1_1', code: 'MATH101', name: 'Calculus 1', credits: 3, grade: 'B+' },
            { id: 's1_2', code: 'PHYS101', name: 'Physics 1', credits: 3, grade: 'A-' },
            { id: 's1_3', code: 'CS101', name: 'Programming', credits: 3, grade: 'A' },
            { id: 's1_4', code: 'ENG101', name: 'English 1', credits: 2, grade: 'A' },
          ],
          notes: 'Focus on Calculus and programming foundations. Complete all lab sheets early.',
        },
        {
          id: 'sem_initial_2',
          name: 'Year 1 - Spring (الفرقة الأولى - ربيع)',
          term: 'Spring',
          courses: [
            { id: 's2_1', code: 'CS104', name: 'OOP Java', credits: 3, grade: 'A' },
            { id: 's2_2', code: 'CS105', name: 'Digital Logic', credits: 3, grade: 'B+' },
            { id: 's2_3', code: 'MATH102', name: 'Linear Algebra', credits: 3, grade: 'A' },
            { id: 's2_4', code: 'STAT101', name: 'Statistics', credits: 3, grade: 'A-' },
          ],
          notes: 'Need to improve attendance in digital logic lab and prepare early for midterms.',
        },
      ];
    } catch {
      return [];
    }
  });

  const [currentNotes, setCurrentNotes] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('sha_current_notes');
      return saved || '';
    } catch {
      return '';
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sha_current_courses', JSON.stringify(courses));
    } catch {
      // ignore
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem('sha_prev_cgpa', prevCgpa.toString());
      localStorage.setItem('sha_prev_credits', prevCredits.toString());
    } catch {
      // ignore
    }
  }, [prevCgpa, prevCredits]);

  useEffect(() => {
    try {
      localStorage.setItem('sha_semesters', JSON.stringify(semesters));
    } catch {
      // ignore
    }
  }, [semesters]);

  useEffect(() => {
    try {
      localStorage.setItem('sha_current_notes', currentNotes);
    } catch {
      // ignore
    }
  }, [currentNotes]);

  // Real-time synchronization callback for remote changes
  const handleRemoteState = useCallback((patch: Partial<RealtimeAppState>) => {
    if (patch.courses !== undefined) setCourses(patch.courses);
    if (patch.prevCgpa !== undefined) setPrevCgpa(patch.prevCgpa);
    if (patch.prevCredits !== undefined) setPrevCredits(patch.prevCredits);
    if (patch.semesters !== undefined) setSemesters(patch.semesters);
    if (patch.currentNotes !== undefined) setCurrentNotes(patch.currentNotes);
  }, []);

  const { isConnected, clientCount, isSyncing, lastSyncTime, broadcastPatch } = useRealtimeSync(
    { courses, prevCgpa, prevCredits, semesters, currentNotes },
    handleRemoteState
  );

  const handleCoursesChange = useCallback((newCourses: Course[]) => {
    setCourses(newCourses);
    broadcastPatch({ courses: newCourses });
  }, [broadcastPatch]);

  const handlePrevCgpaChange = useCallback((val: number) => {
    setPrevCgpa(val);
    broadcastPatch({ prevCgpa: val });
  }, [broadcastPatch]);

  const handlePrevCreditsChange = useCallback((val: number) => {
    setPrevCredits(val);
    broadcastPatch({ prevCredits: val });
  }, [broadcastPatch]);

  const handleSemestersChange = useCallback((newSemesters: Semester[]) => {
    setSemesters(newSemesters);
    broadcastPatch({ semesters: newSemesters });
  }, [broadcastPatch]);

  const handleNotesChange = useCallback((val: string) => {
    setCurrentNotes(val);
    broadcastPatch({ currentNotes: val });
  }, [broadcastPatch]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleSaveCurrentSemesterToHistory = () => {
    if (courses.length === 0) {
      alert(lang === 'ar' ? 'أضف مقررات أولاً لحفظ الفصل الدراسي' : 'Add courses first before saving term');
      return;
    }

    const termNum = semesters.length + 1;
    const termLabel =
      lang === 'ar'
        ? `الفصل الدراسي ${termNum} (${new Date().toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })})`
        : `Semester ${termNum} (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`;

    const newSem: Semester = {
      id: 'sem_' + Date.now(),
      name: termLabel,
      term: 'Fall',
      courses: [...courses],
      notes: currentNotes.trim() ? currentNotes.trim() : undefined,
    };

    const updated = [...semesters, newSem];
    setSemesters(updated);

    // Also update previous cumulative data automatically!
    const semRes = calculateSemesterGPA(courses);
    const newTotalCredits = prevCredits + semRes.totalCredits;
    const newTotalPoints = prevCgpa * prevCredits + semRes.qualityPoints;
    const newCumulativeGpa = newTotalCredits > 0 ? newTotalPoints / newTotalCredits : prevCgpa;
    const roundedCgpa = Math.round(newCumulativeGpa * 1000) / 1000;

    setPrevCredits(newTotalCredits);
    setPrevCgpa(roundedCgpa);

    broadcastPatch({
      semesters: updated,
      prevCredits: newTotalCredits,
      prevCgpa: roundedCgpa,
    });

    alert(
      lang === 'ar'
        ? `تم حفظ الفصل الدراسي في السجل وتحديث المعدل التراكمي إلى (${newCumulativeGpa.toFixed(2)})!`
        : `Semester saved to history and Cumulative GPA updated to (${newCumulativeGpa.toFixed(2)})!`
    );
  };

  return (
    <MobileDeviceFrame
      deviceMode={deviceMode}
      onDeviceModeChange={setDeviceMode}
      lang={lang}
    >
      <OfflineIndicator lang={lang} />

      <MobileTopBar
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isConnected={isConnected}
        clientCount={clientCount}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'calculator' && (
          <SemesterCalculatorView
            courses={courses}
            onCoursesChange={handleCoursesChange}
            prevCgpa={prevCgpa}
            onPrevCgpaChange={handlePrevCgpaChange}
            prevCredits={prevCredits}
            onPrevCreditsChange={handlePrevCreditsChange}
            notes={currentNotes}
            onNotesChange={handleNotesChange}
            onOpenShareCard={() => setIsShareModalOpen(true)}
            onSaveToHistory={handleSaveCurrentSemesterToHistory}
            onNavigateToTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'history' && (
          <TranscriptsView
            semesters={semesters}
            onSemestersChange={handleSemestersChange}
            lang={lang}
          />
        )}

        {activeTab === 'target' && (
          <TargetPlannerView
            currentCgpa={prevCgpa}
            completedCredits={prevCredits}
            lang={lang}
          />
        )}

        {activeTab === 'rules' && (
          <RetakeSimulatorView
            currentCgpa={prevCgpa}
            totalCredits={prevCredits}
            lang={lang}
          />
        )}
      </div>

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={lang}
      />

      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        lang={lang}
      />

      <ShareGradeCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        courses={courses}
        prevCgpa={prevCgpa}
        prevCredits={prevCredits}
        lang={lang}
      />
    </MobileDeviceFrame>
  );
}
