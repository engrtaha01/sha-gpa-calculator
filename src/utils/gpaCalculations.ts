import {
  AcademicStanding,
  Course,
  GradeLetter,
  SHA_GRADE_SCALE,
  StudentProfile,
} from '../types/gpa';

export interface SemesterCalculationResult {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  qualityPoints: number;
  passedCredits: number;
}

export interface CumulativeCalculationResult {
  newCgpa: number;
  totalCumulativeCredits: number;
  totalCumulativePoints: number;
  gpaDelta: number; // positive or negative change
  standing: AcademicStanding;
}

export function getGradePoints(grade: GradeLetter): number {
  return SHA_GRADE_SCALE[grade]?.points ?? 0.0;
}

export function getGradeFromScore(percentage: number): GradeLetter {
  const score = Math.max(0, Math.min(100, Math.round(percentage)));
  const entries = Object.values(SHA_GRADE_SCALE);
  for (const item of entries) {
    if (score >= item.minPercentage && score <= item.maxPercentage) {
      return item.letter;
    }
  }
  return score >= 50 ? 'D' : 'F';
}

export function calculateSemesterGPA(courses: Course[]): SemesterCalculationResult {
  let totalCredits = 0;
  let qualityPoints = 0;
  let passedCredits = 0;

  for (const course of courses) {
    const credits = Number(course.credits) || 0;
    const points = getGradePoints(course.grade);
    totalCredits += credits;
    qualityPoints += credits * points;
    if (course.grade !== 'F') {
      passedCredits += credits;
    }
  }

  const gpa = totalCredits > 0 ? qualityPoints / totalCredits : 0.0;

  return {
    gpa: Math.round(gpa * 1000) / 1000,
    totalCredits,
    totalPoints: qualityPoints,
    qualityPoints: Math.round(qualityPoints * 100) / 100,
    passedCredits,
  };
}

export function calculateCumulativeGPA(
  prevCgpa: number,
  prevCredits: number,
  currentCourses: Course[]
): CumulativeCalculationResult {
  const safePrevCgpa = Math.max(0, Number(prevCgpa) || 0);
  const safePrevCredits = Math.max(0, Number(prevCredits) || 0);
  let cumulativePoints = safePrevCgpa * safePrevCredits;
  let cumulativeCredits = safePrevCredits;

  for (const course of currentCourses) {
    const credits = Number(course.credits) || 0;
    const newGradePoints = getGradePoints(course.grade);

    if (course.isRetake && course.previousGrade) {
      // In El Shorouk Academy bylaws:
      // Grade Replacement: Previous points for these credits are deducted, new points are added.
      // Total cumulative credits do NOT increase for repeated course.
      const oldGradePoints = getGradePoints(course.previousGrade);
      const pointsDiff = (newGradePoints - oldGradePoints) * credits;
      cumulativePoints += pointsDiff;
    } else {
      // Standard new course
      cumulativeCredits += credits;
      cumulativePoints += newGradePoints * credits;
    }
  }

  const newCgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : safePrevCgpa;
  const roundedCgpa = Math.round(newCgpa * 1000) / 1000;
  const gpaDelta = Math.round((roundedCgpa - safePrevCgpa) * 1000) / 1000;

  return {
    newCgpa: roundedCgpa,
    totalCumulativeCredits: cumulativeCredits,
    totalCumulativePoints: Math.round(cumulativePoints * 100) / 100,
    gpaDelta,
    standing: getAcademicStanding(roundedCgpa),
  };
}

export function getAcademicStanding(cgpa: number): AcademicStanding {
  const gpa = Number(cgpa) || 0;

  if (gpa >= 3.5) {
    return {
      code: 'honors',
      titleEn: 'Excellent with Honors',
      titleAr: 'امتياز مع مرتبة الشرف',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textColor: 'text-emerald-400',
      maxRegistrationCredits: 21,
      descriptionEn: 'Highest academic distinction. Eligible for 21 credit hours registration.',
      descriptionAr: 'تقدير امتياز عالي. يحق لك تسجيل حتى 21 ساعة معتمدة في الفصل القادم.',
    };
  }

  if (gpa >= 3.0) {
    return {
      code: 'very_good',
      titleEn: 'Very Good',
      titleAr: 'جيد جداً',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      textColor: 'text-blue-400',
      maxRegistrationCredits: 18,
      descriptionEn: 'High academic standing. Eligible for 18 to 20 credit hours.',
      descriptionAr: 'مستوى أكاديمي متميز. الحد الأقصى للتسجيل 18-20 ساعة معتمدة.',
    };
  }

  if (gpa >= 2.4) {
    return {
      code: 'good',
      titleEn: 'Good',
      titleAr: 'جيد',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      textColor: 'text-cyan-400',
      maxRegistrationCredits: 18,
      descriptionEn: 'Solid academic standing. Standard registration of 18 credit hours.',
      descriptionAr: 'مستوى أكاديمي جيد ومنتظم. يحق لك تسجيل 18 ساعة معتمدة.',
    };
  }

  if (gpa >= 2.0) {
    return {
      code: 'pass',
      titleEn: 'Satisfactory / Pass',
      titleAr: 'مقبول (حالة آمنة)',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textColor: 'text-amber-400',
      maxRegistrationCredits: 15,
      descriptionEn: 'Above minimum threshold. Focus on retaking D/D+ courses to lift CGPA.',
      descriptionAr: 'فوق حد الإنذار مباشرة. يُنصح بتحسين مقررات D لرفع المعدل وتجنب الإنذار.',
    };
  }

  return {
    code: 'probation',
    titleEn: 'Academic Probation / Warning',
    titleAr: 'إنذار أكاديمي (تحت الملاحظة)',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    textColor: 'text-red-400',
    maxRegistrationCredits: 12,
    descriptionEn: 'Under probation. Registration is restricted to a maximum of 12 credit hours.',
    descriptionAr: 'إنذار أكاديمي رسمي. مقيد بالتسجيل في 12 ساعة معتمدة فقط لمقررات التحسين.',
  };
}

export function calculateTargetPlan(
  currentCgpa: number,
  completedCredits: number,
  targetCgpa: number,
  upcomingCredits: number
) {
  const curGpa = Math.max(0, Number(currentCgpa) || 0);
  const curCredits = Math.max(0, Number(completedCredits) || 0);
  const tgtGpa = Math.max(0, Math.min(4.0, Number(targetCgpa) || 0));
  const planCredits = Math.max(1, Number(upcomingCredits) || 15);

  const totalFutureCredits = curCredits + planCredits;
  const currentTotalPoints = curGpa * curCredits;
  const targetTotalPoints = tgtGpa * totalFutureCredits;

  const requiredPoints = targetTotalPoints - currentTotalPoints;
  const requiredTermGpa = requiredPoints / planCredits;

  let feasibility: 'easily_achievable' | 'challenging' | 'impossible';
  let messageEn = '';
  let messageAr = '';

  if (requiredTermGpa <= 0) {
    feasibility = 'easily_achievable';
    messageEn = 'You already meet or exceed this target!';
    messageAr = 'معدلك الحالي يحقق هذا الهدف بالفعل!';
  } else if (requiredTermGpa <= 3.3) {
    feasibility = 'easily_achievable';
    messageEn = `Achievable with an average grade of B/B+ (${requiredTermGpa.toFixed(2)})`;
    messageAr = `يمكن تحقيقه بسهولة بمتوسط درجات B أو B+ (معدل ترم ${requiredTermGpa.toFixed(2)})`;
  } else if (requiredTermGpa <= 4.0) {
    feasibility = 'challenging';
    messageEn = `Challenging! Requires an average of A/A+ (${requiredTermGpa.toFixed(2)})`;
    messageAr = `يحتاج مجهود عالي! يتطلب درجات A أو A+ (معدل ترم ${requiredTermGpa.toFixed(2)})`;
  } else {
    feasibility = 'impossible';
    messageEn = `Mathematically impossible in ${planCredits} credits (Needs > 4.00). You need more credit hours or course retakes.`;
    messageAr = `مستحيل حسابياً خلال ${planCredits} ساعة (يتطلب أكثر من 4.00). يلزم زيادة عدد الساعات أو إعادة مقررات للتحسين.`;
  }

  return {
    requiredTermGpa: Math.round(requiredTermGpa * 100) / 100,
    feasibility,
    messageEn,
    messageAr,
  };
}
