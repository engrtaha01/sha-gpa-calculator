import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Course, Semester, AppLanguage } from '../types/gpa';
import {
  calculateSemesterGPA,
  calculateCumulativeGPA,
  getGradePoints,
} from './gpaCalculations';

interface GenerateGradeCardPDFOptions {
  studentName: string;
  studentId?: string;
  major?: string;
  termName?: string;
  courses: Course[];
  prevCgpa: number;
  prevCredits: number;
  lang: AppLanguage;
}

interface GenerateTranscriptPDFOptions {
  studentName: string;
  studentId?: string;
  major?: string;
  semesters: Semester[];
  lang: AppLanguage;
}

export function generateSemesterGradeCardPDF({
  studentName,
  studentId = 'SHA-' + Math.floor(100000 + Math.random() * 900000),
  major = 'Computer Science & Engineering',
  termName = 'Current Semester (Spring 2025)',
  courses,
  prevCgpa,
  prevCredits,
  lang,
}: GenerateGradeCardPDFOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const semRes = calculateSemesterGPA(courses);
  const cumRes = calculateCumulativeGPA(prevCgpa, prevCredits, courses);
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Top Navy Header Bar
  doc.setFillColor(15, 39, 68); // #0f2744 Navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold Accent Stripe
  doc.setFillColor(212, 175, 55); // #d4af37 Gold
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Academy Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EL SHOROUK ACADEMY', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 245);
  doc.text('HIGHER INSTITUTES OF ENGINEERING, COMPUTER & IT, MEDIA, MANAGEMENT', 14, 18);
  doc.text('CREDIT HOUR SYSTEM - OFFICIAL ACADEMIC GRADE CARD', 14, 23);

  // Right Header Info
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 245);
  doc.text(`Document: OFFICIAL RECORD`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Issue Date: ${currentDate}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`System: Credit Hours (4.00 Scale)`, pageWidth - 14, 23, { align: 'right' });

  // Student Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT NAME:', 18, 41);
  doc.text('STUDENT ID:', 18, 49);

  doc.text('TERM / SESSION:', 115, 41);
  doc.text('ACADEMIC PROGRAM:', 115, 49);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(studentName.toUpperCase() || 'EL SHOROUK STUDENT', 50, 41);
  doc.text(studentId || 'SHA-2025', 50, 49);
  doc.text(termName, 155, 41);
  doc.text(major, 155, 49);

  // Summary KPI Cards (Semester GPA + Cumulative CGPA)
  const cardY = 58;
  const cardWidth = (pageWidth - 28 - 6) / 3;

  // Card 1: Semester GPA
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, cardY, cardWidth, 24, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SEMESTER GPA', 14 + cardWidth / 2, cardY + 6, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(15, 39, 68);
  doc.text(semRes.gpa.toFixed(2), 14 + cardWidth / 2, cardY + 14, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${semRes.totalCredits} Credit Hours (${semRes.qualityPoints.toFixed(1)} Pts)`, 14 + cardWidth / 2, cardY + 20, { align: 'center' });

  // Card 2: Cumulative CGPA
  doc.setFillColor(254, 252, 232); // light amber
  doc.setDrawColor(253, 224, 71);
  doc.roundedRect(14 + cardWidth + 3, cardY, cardWidth, 24, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text('CUMULATIVE GPA (CGPA)', 14 + cardWidth + 3 + cardWidth / 2, cardY + 6, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(180, 83, 9);
  doc.text(cumRes.newCgpa.toFixed(2), 14 + cardWidth + 3 + cardWidth / 2, cardY + 14, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(161, 98, 7);
  doc.text(`${cumRes.totalCumulativeCredits} Total Hours (${cumRes.totalCumulativePoints.toFixed(1)} Pts)`, 14 + cardWidth + 3 + cardWidth / 2, cardY + 20, { align: 'center' });

  // Card 3: Academic Standing
  const isProbation = cumRes.standing.code === 'probation';
  const isHonors = cumRes.standing.code === 'honors';
  doc.setFillColor(isProbation ? 254 : isHonors ? 240 : 241, isProbation ? 242 : isHonors ? 253 : 245, isProbation ? 242 : isHonors ? 244 : 249);
  doc.setDrawColor(isProbation ? 252 : isHonors ? 134 : 203, isProbation ? 165 : isHonors ? 239 : 213, isProbation ? 165 : isHonors ? 172 : 225);
  doc.roundedRect(14 + (cardWidth + 3) * 2, cardY, cardWidth, 24, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isProbation ? 185 : isHonors ? 21 : 71, isProbation ? 28 : isHonors ? 128 : 85, isProbation ? 28 : isHonors ? 61 : 105);
  doc.text('ACADEMIC STANDING', 14 + (cardWidth + 3) * 2 + cardWidth / 2, cardY + 6, { align: 'center' });
  doc.setFontSize(10);
  doc.text(cumRes.standing.titleEn.toUpperCase(), 14 + (cardWidth + 3) * 2 + cardWidth / 2, cardY + 13, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Max Registration: ${cumRes.standing.maxRegistrationCredits} Cr`, 14 + (cardWidth + 3) * 2 + cardWidth / 2, cardY + 20, { align: 'center' });

  // Course Details Table using autoTable
  const tableData = courses.map((course, idx) => {
    const pts = getGradePoints(course.grade);
    const qPts = (pts * course.credits).toFixed(1);
    const status = course.isRetake ? `Retake (Replaces ${course.previousGrade || 'D'})` : 'Regular';
    return [
      (idx + 1).toString(),
      course.code || `CRS-${idx + 1}`,
      course.name,
      course.credits.toString(),
      course.grade,
      pts.toFixed(2),
      qPts,
      status,
    ];
  });

  autoTable(doc, {
    startY: cardY + 29,
    margin: { left: 14, right: 14 },
    head: [['#', 'Course Code', 'Course Title', 'Credits', 'Grade', 'Points', 'Quality Pts', 'Type']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 39, 68],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 26 },
      2: { halign: 'left', cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 22 },
      7: { halign: 'center', cellWidth: 28 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Reference Grading Scale at the bottom
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 175;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 39, 68);
  doc.text('EL SHOROUK ACADEMY OFFICIAL GRADING SCALE & REGULATIONS:', 18, finalY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('A+ (4.00, 97-100%)  |  A (4.00, 93-96%)  |  A- (3.70, 89-92%)  |  B+ (3.30, 84-88%)  |  B (3.00, 80-83%)  |  B- (2.70, 76-79%)', 18, finalY + 12);
  doc.text('C+ (2.30, 71-75%)   |  C (2.00, 67-70%)  |  C- (1.70, 63-66%)  |  D+ (1.30, 59-62%)  |  D (1.00, 50-58%)  |  F (0.00, <50%)', 18, finalY + 17);
  doc.text('* Course retake (تحسين) replaces original grade points in CGPA calculation without increasing total graduation credit hours.', 18, finalY + 22);

  // Signatures / Stamps Section
  const sigY = finalY + 36;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);

  // 3 signature lines
  const sigColWidth = (pageWidth - 28) / 3;

  doc.line(18, sigY + 12, 18 + sigColWidth - 10, sigY + 12);
  doc.text('Academic Advisor', 18, sigY + 17);

  doc.line(18 + sigColWidth, sigY + 12, 18 + sigColWidth * 2 - 10, sigY + 12);
  doc.text('Department Head', 18 + sigColWidth, sigY + 17);

  doc.line(18 + sigColWidth * 2, sigY + 12, pageWidth - 18, sigY + 12);
  doc.text('Registrar & Student Affairs', 18 + sigColWidth * 2, sigY + 17);

  // Watermark Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This document is computer-generated by the El Shorouk Academy (SHA) Mobile GPA Portal. For official verification, consult the Student Affairs Bureau.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Download PDF file
  const fileName = `SHA_Grade_Card_${studentName.replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(fileName);
}

export function generateTranscriptHistoryPDF({
  studentName,
  studentId = 'SHA-' + Math.floor(100000 + Math.random() * 900000),
  major = 'Computer Science & Engineering',
  semesters,
  lang,
}: GenerateTranscriptPDFOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Calculate Cumulative Total
  let totalCredits = 0;
  let totalQualityPoints = 0;

  semesters.forEach((sem) => {
    const sRes = calculateSemesterGPA(sem.courses);
    totalCredits += sRes.totalCredits;
    totalQualityPoints += sRes.qualityPoints;
  });

  const grandCgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  // Header Banner
  doc.setFillColor(15, 39, 68);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EL SHOROUK ACADEMY', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 245);
  doc.text('OFFICIAL MULTI-SEMESTER ACADEMIC TRANSCRIPT', 14, 18);
  doc.text('CREDIT HOURS SYSTEM - COMPLETE STUDENT RECORD', 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(220, 230, 245);
  doc.text(`Official Academic Record`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Date: ${currentDate}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Recorded Terms: ${semesters.length}`, pageWidth - 14, 23, { align: 'right' });

  // Student Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT NAME:', 18, 41);
  doc.text('STUDENT ID:', 18, 49);
  doc.text('PROGRAM:', 115, 41);
  doc.text('OVERALL CGPA:', 115, 49);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(studentName.toUpperCase() || 'EL SHOROUK STUDENT', 50, 41);
  doc.text(studentId, 50, 49);
  doc.text(major, 145, 41);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 39, 68);
  doc.text(`${grandCgpa.toFixed(2)} / 4.00 (${totalCredits} Total Credits)`, 145, 49);

  let currentY = 58;

  // Render each semester section
  semesters.forEach((sem, sIdx) => {
    const sRes = calculateSemesterGPA(sem.courses);

    // Check page overflow
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, pageWidth - 28, 8, 1, 1, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 39, 68);
    doc.text(`${sIdx + 1}. ${sem.name.toUpperCase()}`, 18, currentY + 5.5);

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Term GPA: ${sRes.gpa.toFixed(2)}  |  Credits: ${sRes.totalCredits}  |  Quality Pts: ${sRes.qualityPoints.toFixed(1)}`,
      pageWidth - 18,
      currentY + 5.5,
      { align: 'right' }
    );

    const semTableData = sem.courses.map((c, cIdx) => [
      (cIdx + 1).toString(),
      c.code || `CRS-${cIdx + 1}`,
      c.name,
      c.credits.toString(),
      c.grade,
      getGradePoints(c.grade).toFixed(2),
      (getGradePoints(c.grade) * c.credits).toFixed(1),
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      margin: { left: 14, right: 14 },
      head: [['#', 'Course Code', 'Course Title', 'Credits', 'Grade', 'Points', 'Quality Pts']],
      body: semTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [226, 232, 240],
        textColor: [30, 41, 59],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'center', fontStyle: 'bold', cellWidth: 28 },
        2: { halign: 'left', cellWidth: 'auto' },
        3: { halign: 'center', cellWidth: 16 },
        4: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 20 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 3;

    if (sem.notes) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text(`* Notes: "${sem.notes}"`, 16, currentY + 3);
      currentY += 5;
    }

    currentY += 5;
  });

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'End of Official Academic Transcript - El Shorouk Academy (SHA). All Rights Reserved.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  const fileName = `SHA_Transcript_${studentName.replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(fileName);
}
