export interface Student {
  id: string;
  matricNumber: string;
  password: string;
  fullName: string;
  faculty: string;
  department: string;
  level: number;
  email: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  faculty: string;
  department: string;
  level: number;
  semester: 1 | 2;
  session: string;
  type: "compulsory" | "elective";
}

export interface Result {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  grade: string;
  score: number;
  semester: 1 | 2;
  session: string;
  level: number;
}

export interface Registration {
  studentId: string;
  courseId: string;
  semester: 1 | 2;
  session: string;
}

export const FACULTIES = [
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Arts",
  "Faculty of Social Sciences",
];

export const DEPARTMENTS: Record<string, string[]> = {
  "Faculty of Engineering": ["Computer Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
  "Faculty of Science": ["Computer Science", "Mathematics", "Physics", "Chemistry"],
  "Faculty of Arts": ["English", "History", "Philosophy", "Linguistics"],
  "Faculty of Social Sciences": ["Economics", "Political Science", "Sociology", "Psychology"],
};

export const LEVELS = [100, 200, 300, 400, 500];
export const SESSIONS = ["2023/2024", "2024/2025", "2025/2026"];
export const SEMESTERS: (1 | 2)[] = [1, 2];

export const MOCK_STUDENTS: Student[] = [
  {
    id: "1",
    matricNumber: "CSC/2021/001",
    password: "student123",
    fullName: "Adebayo Johnson",
    faculty: "Faculty of Science",
    department: "Computer Science",
    level: 300,
    email: "adebayo.johnson@student.edu.ng",
  },
  {
    id: "2",
    matricNumber: "ENG/2021/015",
    password: "student123",
    fullName: "Chioma Okafor",
    faculty: "Faculty of Engineering",
    department: "Computer Engineering",
    level: 300,
    email: "chioma.okafor@student.edu.ng",
  },
];

export const MOCK_COURSES: Course[] = [
  // Computer Science - Level 300 - Semester 1
  { id: "c1", code: "CSC 301", title: "Data Structures and Algorithms", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
  { id: "c2", code: "CSC 303", title: "Operating Systems", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
  { id: "c3", code: "CSC 305", title: "Database Management Systems", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
  { id: "c4", code: "CSC 307", title: "Computer Networks", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
  { id: "c5", code: "CSC 309", title: "Artificial Intelligence", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 1, session: "2024/2025", type: "elective" },
  { id: "c6", code: "GST 301", title: "Entrepreneurship Studies", units: 2, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
  // Computer Science - Level 300 - Semester 2
  { id: "c7", code: "CSC 302", title: "Software Engineering", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 2, session: "2024/2025", type: "compulsory" },
  { id: "c8", code: "CSC 304", title: "Compiler Design", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 2, session: "2024/2025", type: "compulsory" },
  { id: "c9", code: "CSC 306", title: "Web Technology", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 2, session: "2024/2025", type: "elective" },
  { id: "c10", code: "CSC 308", title: "Numerical Computing", units: 3, faculty: "Faculty of Science", department: "Computer Science", level: 300, semester: 2, session: "2024/2025", type: "compulsory" },
  // Computer Engineering - Level 300 - Semester 1
  { id: "c11", code: "CPE 301", title: "Digital Systems Design", units: 3, faculty: "Faculty of Engineering", department: "Computer Engineering", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
  { id: "c12", code: "CPE 303", title: "Microprocessor Systems", units: 3, faculty: "Faculty of Engineering", department: "Computer Engineering", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
  { id: "c13", code: "CPE 305", title: "Signals and Systems", units: 3, faculty: "Faculty of Engineering", department: "Computer Engineering", level: 300, semester: 1, session: "2024/2025", type: "compulsory" },
];

export const MOCK_RESULTS: Record<string, Result[]> = {
  "1": [
    { courseId: "r1", courseCode: "CSC 201", courseTitle: "Computer Programming II", units: 3, grade: "A", score: 78, semester: 1, session: "2023/2024", level: 200 },
    { courseId: "r2", courseCode: "CSC 203", courseTitle: "Discrete Mathematics", units: 3, grade: "B", score: 68, semester: 1, session: "2023/2024", level: 200 },
    { courseId: "r3", courseCode: "CSC 205", courseTitle: "Computer Architecture", units: 3, grade: "A", score: 75, semester: 1, session: "2023/2024", level: 200 },
    { courseId: "r4", courseCode: "MTH 201", courseTitle: "Mathematical Methods I", units: 3, grade: "B", score: 65, semester: 1, session: "2023/2024", level: 200 },
    { courseId: "r5", courseCode: "CSC 202", courseTitle: "Object-Oriented Programming", units: 3, grade: "A", score: 82, semester: 2, session: "2023/2024", level: 200 },
    { courseId: "r6", courseCode: "CSC 204", courseTitle: "Introduction to Databases", units: 3, grade: "B", score: 63, semester: 2, session: "2023/2024", level: 200 },
    { courseId: "r7", courseCode: "CSC 206", courseTitle: "Systems Programming", units: 3, grade: "A", score: 71, semester: 2, session: "2023/2024", level: 200 },
    { courseId: "r8", courseCode: "STA 202", courseTitle: "Statistics for Sciences", units: 3, grade: "C", score: 55, semester: 2, session: "2023/2024", level: 200 },
  ],
};

export function gradePoint(grade: string): number {
  const map: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  return map[grade] ?? 0;
}

export function calculateGPA(results: Result[]): number {
  if (results.length === 0) return 0;
  const totalQP = results.reduce((s, r) => s + gradePoint(r.grade) * r.units, 0);
  const totalUnits = results.reduce((s, r) => s + r.units, 0);
  return totalUnits > 0 ? Number((totalQP / totalUnits).toFixed(2)) : 0;
}
