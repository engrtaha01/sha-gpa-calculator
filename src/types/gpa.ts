export type GradeLetter =
  | 'A+'
  | 'A'
  | 'A-'
  | 'B+'
  | 'B'
  | 'B-'
  | 'C+'
  | 'C'
  | 'C-'
  | 'D+'
  | 'D'
  | 'F';

export interface GradeScaleItem {
  letter: GradeLetter;
  points: number;
  minPercentage: number;
  maxPercentage: number;
  arabicLabel: string;
  englishLabel: string;
  colorClass: string;
  bgLightClass: string;
}

export const SHA_GRADE_SCALE: Record<GradeLetter, GradeScaleItem> = {
  'A+': {
    letter: 'A+',
    points: 4.0,
    minPercentage: 97,
    maxPercentage: 100,
    englishLabel: 'Excellent',
    arabicLabel: 'امتياز مرتفع',
    colorClass: 'text-emerald-500',
    bgLightClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  'A': {
    letter: 'A',
    points: 4.0,
    minPercentage: 93,
    maxPercentage: 96,
    englishLabel: 'Excellent',
    arabicLabel: 'امتياز',
    colorClass: 'text-emerald-400',
    bgLightClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  'A-': {
    letter: 'A-',
    points: 3.7,
    minPercentage: 89,
    maxPercentage: 92,
    englishLabel: 'Excellent',
    arabicLabel: 'امتياز منخفض',
    colorClass: 'text-teal-400',
    bgLightClass: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  },
  'B+': {
    letter: 'B+',
    points: 3.3,
    minPercentage: 84,
    maxPercentage: 88,
    englishLabel: 'Very Good',
    arabicLabel: 'جيد جداً مرتفع',
    colorClass: 'text-blue-400',
    bgLightClass: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  'B': {
    letter: 'B',
    points: 3.0,
    minPercentage: 80,
    maxPercentage: 83,
    englishLabel: 'Very Good',
    arabicLabel: 'جيد جداً',
    colorClass: 'text-blue-400',
    bgLightClass: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  'B-': {
    letter: 'B-',
    points: 2.7,
    minPercentage: 76,
    maxPercentage: 79,
    englishLabel: 'Good',
    arabicLabel: 'جيد مرتفع',
    colorClass: 'text-cyan-400',
    bgLightClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  },
  'C+': {
    letter: 'C+',
    points: 2.3,
    minPercentage: 71,
    maxPercentage: 75,
    englishLabel: 'Good',
    arabicLabel: 'جيد',
    colorClass: 'text-amber-400',
    bgLightClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  'C': {
    letter: 'C',
    points: 2.0,
    minPercentage: 67,
    maxPercentage: 70,
    englishLabel: 'Satisfactory',
    arabicLabel: 'مقبول مرتفع',
    colorClass: 'text-amber-500',
    bgLightClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  'C-': {
    letter: 'C-',
    points: 1.7,
    minPercentage: 63,
    maxPercentage: 66,
    englishLabel: 'Satisfactory',
    arabicLabel: 'مقبول',
    colorClass: 'text-orange-400',
    bgLightClass: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  },
  'D+': {
    letter: 'D+',
    points: 1.3,
    minPercentage: 59,
    maxPercentage: 62,
    englishLabel: 'Weak Pass',
    arabicLabel: 'ضعيف مرتفع',
    colorClass: 'text-rose-400',
    bgLightClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
  'D': {
    letter: 'D',
    points: 1.0,
    minPercentage: 50,
    maxPercentage: 58,
    englishLabel: 'Weak Pass',
    arabicLabel: 'ضعيف (ناجح)',
    colorClass: 'text-rose-400',
    bgLightClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
  'F': {
    letter: 'F',
    points: 0.0,
    minPercentage: 0,
    maxPercentage: 49,
    englishLabel: 'Fail',
    arabicLabel: 'راسب',
    colorClass: 'text-red-500',
    bgLightClass: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: GradeLetter;
  percentage?: number;
  isRetake?: boolean;
  previousGrade?: GradeLetter;
}

export interface Semester {
  id: string;
  name: string;
  academicYear?: string;
  term: 'Fall' | 'Spring' | 'Summer';
  courses: Course[];
  isCompleted?: boolean;
  notes?: string;
}

export interface StudentProfile {
  name: string;
  studentId: string;
  instituteId: 'engineering' | 'cs_it' | 'media' | 'management';
  major: string;
  prevCgpa: number;
  prevCredits: number;
}

export interface AcademicStanding {
  code: 'honors' | 'excellent' | 'very_good' | 'good' | 'pass' | 'probation';
  titleEn: string;
  titleAr: string;
  badgeColor: string;
  textColor: string;
  maxRegistrationCredits: number;
  descriptionEn: string;
  descriptionAr: string;
}

export type DeviceMode = 'auto' | 'iphone' | 'pixel' | 'responsive';
export type AppLanguage = 'ar' | 'en';
