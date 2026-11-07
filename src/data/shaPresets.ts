import { Course } from '../types/gpa';

export interface InstituteInfo {
  id: 'engineering' | 'cs_it' | 'media' | 'management';
  nameEn: string;
  nameAr: string;
  totalGraduationCredits: number;
  departments: {
    id: string;
    nameEn: string;
    nameAr: string;
    semesters: {
      nameEn: string;
      nameAr: string;
      courses: Omit<Course, 'id' | 'grade'>[];
    }[];
  }[];
}

export const SHA_INSTITUTES: InstituteInfo[] = [
  {
    id: 'engineering',
    nameEn: 'Higher Institute of Engineering',
    nameAr: 'المعهد العالي للهندسة بالشروق',
    totalGraduationCredits: 165,
    departments: [
      {
        id: 'prep',
        nameEn: 'Preparatory Year (إعدادي هندسة)',
        nameAr: 'السنة الإعدادية (عام)',
        semesters: [
          {
            nameEn: 'Prep - Fall Term (ترم أول)',
            nameAr: 'إعدادي - الفصل الدراسي الأول',
            courses: [
              { code: 'MATH001', name: 'Mathematics 1 (رياضيات 1)', credits: 3 },
              { code: 'PHYS001', name: 'Physics 1 (فيزياء 1)', credits: 3 },
              { code: 'CHEM001', name: 'General Chemistry (كيمياء عامة)', credits: 3 },
              { code: 'ENGD001', name: 'Engineering Drawing 1 (رسم هندسي)', credits: 2 },
              { code: 'MECH001', name: 'Engineering Mechanics (ميكانيكا 1)', credits: 3 },
              { code: 'ENG001', name: 'Technical English 1 (لغة إنجليزية)', credits: 2 },
            ],
          },
          {
            nameEn: 'Prep - Spring Term (ترم ثاني)',
            nameAr: 'إعدادي - الفصل الدراسي الثاني',
            courses: [
              { code: 'MATH002', name: 'Mathematics 2 (رياضيات 2)', credits: 3 },
              { code: 'PHYS002', name: 'Physics 2 (فيزياء 2)', credits: 3 },
              { code: 'ENGD002', name: 'Engineering Drawing 2 (رسم هندسي 2)', credits: 2 },
              { code: 'MECH002', name: 'Engineering Mechanics 2 (ميكانيكا 2)', credits: 3 },
              { code: 'PROD001', name: 'Production Technology (تكنولوجيا الإنتاج)', credits: 2 },
              { code: 'COMP001', name: 'Computer Applications (تطبيقات الحاسب)', credits: 2 },
            ],
          },
        ],
      },
      {
        id: 'comm',
        nameEn: 'Electronics & Communications Engineering',
        nameAr: 'هندسة الإلكترونيات والاتصالات',
        semesters: [
          {
            nameEn: 'Year 2 - Electronics Core',
            nameAr: 'الفرقة الأولى اتصالات - ترم أول',
            courses: [
              { code: 'ECE101', name: 'Electric Circuits (دوائر كهربائية 1)', credits: 3 },
              { code: 'ECE102', name: 'Electronic Devices (أجهزة إلكترونية)', credits: 3 },
              { code: 'MATH201', name: 'Advanced Engineering Math', credits: 3 },
              { code: 'ECE103', name: 'Signals & Systems (إشارات ونظم)', credits: 3 },
              { code: 'ECE104', name: 'Electromagnetics (كهرومغناطيسية)', credits: 3 },
            ],
          },
        ],
      },
      {
        id: 'civil',
        nameEn: 'Civil Engineering (هندسة مدنية)',
        nameAr: 'هندسة الإنشاءات والمدنية',
        semesters: [
          {
            nameEn: 'Year 2 - Civil Basics',
            nameAr: 'الفرقة الأولى مدني - ترم أول',
            courses: [
              { code: 'CIV101', name: 'Structural Analysis 1 (تحليل إنشاءات)', credits: 3 },
              { code: 'CIV102', name: 'Surveying 1 (مساحة مستوية)', credits: 3 },
              { code: 'CIV103', name: 'Building Materials (خواص المواد)', credits: 3 },
              { code: 'MATH201', name: 'Differential Equations (معادلات تفاضلية)', credits: 3 },
              { code: 'CIV104', name: 'Civil Engineering Drawing (رسم مدني)', credits: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cs_it',
    nameEn: 'Higher Institute of Computer & IT',
    nameAr: 'المعهد العالي للحاسبات وتكنولوجيا المعلومات بالشروق',
    totalGraduationCredits: 134,
    departments: [
      {
        id: 'cs',
        nameEn: 'Computer Science (علوم الحاسب)',
        nameAr: 'شعبة علوم الحاسب',
        semesters: [
          {
            nameEn: 'Level 1 - Fall (المستوى الأول - ترم أول)',
            nameAr: 'المستوى الأول - خريف',
            courses: [
              { code: 'CS101', name: 'Structured Programming (برمجة هيكلية C++)', credits: 3 },
              { code: 'CS102', name: 'Discrete Mathematics (رياضيات متقطعة)', credits: 3 },
              { code: 'CS103', name: 'Introduction to CS (مقدمة علوم الحاسب)', credits: 3 },
              { code: 'MATH101', name: 'Calculus 1 (تفاضل وتكامل 1)', credits: 3 },
              { code: 'ENG101', name: 'Technical English 1 (لغة إنجليزية فنية)', credits: 2 },
              { code: 'HUM101', name: 'Human Rights & Ethics (حقوق الإنسان)', credits: 2 },
            ],
          },
          {
            nameEn: 'Level 1 - Spring (المستوى الأول - ترم ثاني)',
            nameAr: 'المستوى الأول - ربيع',
            courses: [
              { code: 'CS104', name: 'Object-Oriented Programming (OOP Java)', credits: 3 },
              { code: 'CS105', name: 'Digital Logic Design (تصميم منطقي)', credits: 3 },
              { code: 'MATH102', name: 'Linear Algebra (جبر خطي)', credits: 3 },
              { code: 'STAT101', name: 'Probability & Statistics (إحصاء واحتمالات)', credits: 3 },
              { code: 'CS106', name: 'Web Programming 1 (تطوير الويب 1)', credits: 3 },
            ],
          },
          {
            nameEn: 'Level 2 - Core CS (المستوى الثاني)',
            nameAr: 'المستوى الثاني - خريف',
            courses: [
              { code: 'CS201', name: 'Data Structures (تراكيب البيانات)', credits: 3 },
              { code: 'CS202', name: 'Database Systems (نظم قواعد البيانات)', credits: 3 },
              { code: 'CS203', name: 'Computer Architecture (معمارية الحاسب)', credits: 3 },
              { code: 'CS204', name: 'Software Engineering (هندسة البرمجيات)', credits: 3 },
              { code: 'CS205', name: 'Operating Systems (نظم التشغيل)', credits: 3 },
            ],
          },
        ],
      },
      {
        id: 'is',
        nameEn: 'Information Systems (نظم المعلومات)',
        nameAr: 'شعبة نظم المعلومات الإدارية',
        semesters: [
          {
            nameEn: 'Level 1 - IS Core',
            nameAr: 'المستوى الأول - نظم معلومات',
            courses: [
              { code: 'IS101', name: 'Management Information Systems (نظم معلومات إدارية)', credits: 3 },
              { code: 'CS101', name: 'Introduction to Programming (مقدمة برمجة)', credits: 3 },
              { code: 'BUS101', name: 'Principles of Management (مبادئ إدارة)', credits: 3 },
              { code: 'ACC101', name: 'Principles of Accounting 1 (مبادئ محاسبة 1)', credits: 3 },
              { code: 'ECON101', name: 'Microeconomics (اقتصاد جزئي)', credits: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'media',
    nameEn: 'Higher Institute of Media & Mass Comm',
    nameAr: 'المعهد العالي للإعلام بالشروق',
    totalGraduationCredits: 132,
    departments: [
      {
        id: 'journalism',
        nameEn: 'Journalism & Digital Media (صحافة وإعلام رقمي)',
        nameAr: 'قسم الصحافة والنشر الرقمي',
        semesters: [
          {
            nameEn: 'Semester 1 - Media Foundation',
            nameAr: 'الفصل الأول - أساسيات الإعلام',
            courses: [
              { code: 'MED101', name: 'Intro to Mass Comm (مدخل لوسائل الإعلام)', credits: 3 },
              { code: 'MED102', name: 'Journalistic Writing (التحرير الصحفي)', credits: 3 },
              { code: 'MED103', name: 'Media Ethics & Law (تشريعات وأخلاقيات الإعلام)', credits: 3 },
              { code: 'ENG101', name: 'Media English (لغة إنجليزية إعلامية)', credits: 3 },
              { code: 'SOC101', name: 'Egyptian Society & Politics (المجتمع المصري)', credits: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'management',
    nameEn: 'Higher Institute of Business Administration',
    nameAr: 'المعهد العالي للإدارة والمحاسبة بالشروق',
    totalGraduationCredits: 132,
    departments: [
      {
        id: 'business',
        nameEn: 'Business Administration (إدارة أعمال)',
        nameAr: 'قسم إدارة الأعمال',
        semesters: [
          {
            nameEn: 'Semester 1 - Business Core',
            nameAr: 'الفصل الأول - أساسيات الأعمال',
            courses: [
              { code: 'MGT101', name: 'Principles of Management (مبادئ إدارة)', credits: 3 },
              { code: 'ACC101', name: 'Financial Accounting 1 (محاسبة مالية 1)', credits: 3 },
              { code: 'ECO101', name: 'Economics 1 (مبادئ الاقتصاد)', credits: 3 },
              { code: 'MTH101', name: 'Business Math & Stats (رياضيات وإحصاء تجاري)', credits: 3 },
              { code: 'ENG101', name: 'Business English (لغة إنجليزية للأعمال)', credits: 2 },
            ],
          },
        ],
      },
    ],
  },
];
