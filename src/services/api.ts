// API Service for Student Hub

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Types
export interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  facultyId: string;
  departmentId: string;
  levelCode: string;
  session: string;
  admissionYear: number;
  admissionSemester: "first" | "second";
  matriculationNumber: string;
}

export interface StudentProfile {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  profilePhotoURL: string | null;
  faculty: { id: string; name: string };
  department: { id: string; name: string };
  levelCode: string;
  session: string;
  admissionYear: number;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
  maritalStatus?: string;
  bloodGroup?: string;
  religion?: string;
}

export interface StudentProfileUpdate {
  phoneNumber?: string;
  address?: string;
  profilePhotoURL?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  religion?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CourseRegistrationRequest {
  courseIds: string[];
}

export interface RegisteredCourse {
  id: string;
  course: {
    id: string;
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
  };
  session: string;
  semester: string;
  status: "active";
  enrollmentDate: string;
  registeredAt: string;
}

export interface RegisteredCoursesResponse {
  courses: RegisteredCourse[];
  totalCredits: number;
  totalCourses: number;
  session: string;
  semester?: string;
}

export interface ResultData {
  id: string;
  studentName: string;
  registrationNumber: string;
  course: {
    id: string;
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
  };
  session: string;
  semester: string;
  totalScore: number;
  grade: string;
  gradePoint: number;
  status: "approved" | "pending" | "rejected";
  uploadedAt: string;
  approvedAt: string;
}

export interface ResultsResponse {
  courses: ResultData[];
  gpa: number;
  totalCredits: number;
  totalGradePoint: number;
  session: string;
}

export interface CourseResultDetail {
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  continuousAssessment: number;
  examination: number;
  totalScore: number;
  grade: string;
  gradePoint: number;
  remark: string;
  status: "approved" | "pending" | "rejected";
  uploadedAt: string;
  approvedAt: string;
}

export interface ApiError {
  error: string;
  code: number;
}

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof options.headers === "object" && options.headers !== null
      ? Object.fromEntries(
          options.headers instanceof Headers
            ? options.headers.entries()
            : Object.entries(options.headers)
        )
      : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("student_session");
      const error: ApiError = {
        error: "Session expired. Please log in again.",
        code: 401,
      };
      throw error;
    }

    const error = await response.json().catch(() => ({
      error: response.statusText,
      code: response.status,
    }));
    throw error;
  }

  return response.json();
}

// Real API endpoints
export const studentAPI = {
  register: async (data: StudentRegistrationData) => {
    return apiCall("/students/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProfile: async (): Promise<StudentProfile> => {
    return apiCall("/students/profile");
  },

  updateProfile: async (data: StudentProfileUpdate) => {
    return apiCall("/students/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: PasswordChangeRequest) => {
    return apiCall("/students/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  registerCourses: async (data: CourseRegistrationRequest) => {
    return apiCall("/students/courses/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getRegisteredCourses: async (session?: string, semester?: string) => {
    const params = new URLSearchParams();
    if (session) params.append("session", session);
    if (semester) params.append("semester", semester);
    const query = params.toString();
    return apiCall<RegisteredCoursesResponse>(
      `/students/courses${query ? `?${query}` : ""}`
    );
  },

  deregisterCourse: async (courseId: string) => {
    return apiCall(`/students/courses/${courseId}/deregister`, {
      method: "DELETE",
    });
  },

  getAllResults: async (session?: string) => {
    const params = new URLSearchParams();
    if (session) params.append("session", session);
    const query = params.toString();
    return apiCall<ResultsResponse>(
      `/students/results${query ? `?${query}` : ""}`
    );
  },

  getCourseResult: async (courseId: string) => {
    return apiCall<CourseResultDetail>(`/students/results/${courseId}`);
  },
};

// Helper: get current logged-in student from localStorage
function getSessionStudent() {
  try {
    const saved = localStorage.getItem("student_session");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Mock results keyed by student id — mirrors mockData.ts MOCK_RESULTS
const MOCK_RESULT_DATA: Record<string, ResultData[]> = {
  "1": [
    {
      id: "r1",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r1", courseCode: "CSC 201", courseTitle: "Computer Programming II", creditUnits: 3 },
      session: "2023/2024",
      semester: "1",
      totalScore: 78,
      grade: "A",
      gradePoint: 5,
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    },
    {
      id: "r2",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r2", courseCode: "CSC 203", courseTitle: "Discrete Mathematics", creditUnits: 3 },
      session: "2023/2024",
      semester: "1",
      totalScore: 68,
      grade: "B",
      gradePoint: 4,
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    },
    {
      id: "r3",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r3", courseCode: "CSC 205", courseTitle: "Computer Architecture", creditUnits: 3 },
      session: "2023/2024",
      semester: "1",
      totalScore: 75,
      grade: "A",
      gradePoint: 5,
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    },
    {
      id: "r4",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r4", courseCode: "MTH 201", courseTitle: "Mathematical Methods I", creditUnits: 3 },
      session: "2023/2024",
      semester: "1",
      totalScore: 65,
      grade: "B",
      gradePoint: 4,
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    },
    {
      id: "r5",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r5", courseCode: "CSC 202", courseTitle: "Object-Oriented Programming", creditUnits: 3 },
      session: "2023/2024",
      semester: "2",
      totalScore: 82,
      grade: "A",
      gradePoint: 5,
      status: "approved",
      uploadedAt: "2024-07-02T10:00:00Z",
      approvedAt: "2024-07-02T10:15:00Z",
    },
    {
      id: "r6",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r6", courseCode: "CSC 204", courseTitle: "Introduction to Databases", creditUnits: 3 },
      session: "2023/2024",
      semester: "2",
      totalScore: 63,
      grade: "B",
      gradePoint: 4,
      status: "approved",
      uploadedAt: "2024-07-02T10:00:00Z",
      approvedAt: "2024-07-02T10:15:00Z",
    },
    {
      id: "r7",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r7", courseCode: "CSC 206", courseTitle: "Systems Programming", creditUnits: 3 },
      session: "2023/2024",
      semester: "2",
      totalScore: 71,
      grade: "A",
      gradePoint: 5,
      status: "approved",
      uploadedAt: "2024-07-02T10:00:00Z",
      approvedAt: "2024-07-02T10:15:00Z",
    },
    {
      id: "r8",
      studentName: "Adebayo Johnson",
      registrationNumber: "CSC/2021/001",
      course: { id: "r8", courseCode: "STA 202", courseTitle: "Statistics for Sciences", creditUnits: 3 },
      session: "2023/2024",
      semester: "2",
      totalScore: 55,
      grade: "C",
      gradePoint: 3,
      status: "approved",
      uploadedAt: "2024-07-02T10:00:00Z",
      approvedAt: "2024-07-02T10:15:00Z",
    },
  ],
  "2": [
    {
      id: "e1",
      studentName: "Chioma Okafor",
      registrationNumber: "ENG/2021/015",
      course: { id: "e1", courseCode: "CPE 201", courseTitle: "Digital Logic Design", creditUnits: 3 },
      session: "2023/2024",
      semester: "1",
      totalScore: 72,
      grade: "A",
      gradePoint: 5,
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    },
    {
      id: "e2",
      studentName: "Chioma Okafor",
      registrationNumber: "ENG/2021/015",
      course: { id: "e2", courseCode: "EEE 201", courseTitle: "Circuit Analysis", creditUnits: 3 },
      session: "2023/2024",
      semester: "1",
      totalScore: 65,
      grade: "B",
      gradePoint: 4,
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    },
    {
      id: "e3",
      studentName: "Chioma Okafor",
      registrationNumber: "ENG/2021/015",
      course: { id: "e3", courseCode: "MTH 201", courseTitle: "Engineering Mathematics I", creditUnits: 3 },
      session: "2023/2024",
      semester: "1",
      totalScore: 59,
      grade: "C",
      gradePoint: 3,
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    },
    {
      id: "e4",
      studentName: "Chioma Okafor",
      registrationNumber: "ENG/2021/015",
      course: { id: "e4", courseCode: "CPE 202", courseTitle: "Microelectronics", creditUnits: 3 },
      session: "2023/2024",
      semester: "2",
      totalScore: 77,
      grade: "A",
      gradePoint: 5,
      status: "approved",
      uploadedAt: "2024-07-02T10:00:00Z",
      approvedAt: "2024-07-02T10:15:00Z",
    },
    {
      id: "e5",
      studentName: "Chioma Okafor",
      registrationNumber: "ENG/2021/015",
      course: { id: "e5", courseCode: "EEE 202", courseTitle: "Electromagnetics I", creditUnits: 3 },
      session: "2023/2024",
      semester: "2",
      totalScore: 61,
      grade: "B",
      gradePoint: 4,
      status: "approved",
      uploadedAt: "2024-07-02T10:00:00Z",
      approvedAt: "2024-07-02T10:15:00Z",
    },
  ],
};

// Mock profile data keyed by student id
const MOCK_PROFILE_DATA: Record<string, StudentProfile> = {
  "1": {
    id: "1",
    registrationNumber: "CSC/2021/001",
    firstName: "Adebayo",
    lastName: "Johnson",
    email: "adebayo.johnson@student.edu.ng",
    phoneNumber: "08012345678",
    dateOfBirth: "2002-05-15",
    gender: "Male",
    address: "12 Adeola Street, Lagos",
    profilePhotoURL: null,
    faculty: { id: "fac001", name: "Faculty of Science" },
    department: { id: "dept001", name: "Computer Science" },
    levelCode: "300",
    session: "2024/2025",
    admissionYear: 2021,
    status: "active",
    createdAt: "2021-09-01T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    maritalStatus: "Single",
    bloodGroup: "O+",
    religion: "Christianity",
  },
  "2": {
    id: "2",
    registrationNumber: "ENG/2021/015",
    firstName: "Chioma",
    lastName: "Okafor",
    email: "chioma.okafor@student.edu.ng",
    phoneNumber: "08098765432",
    dateOfBirth: "2001-11-20",
    gender: "Female",
    address: "45 Nnamdi Azikiwe Road, Enugu",
    profilePhotoURL: null,
    faculty: { id: "fac002", name: "Faculty of Engineering" },
    department: { id: "dept002", name: "Computer Engineering" },
    levelCode: "300",
    session: "2024/2025",
    admissionYear: 2021,
    status: "active",
    createdAt: "2021-09-01T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    maritalStatus: "Single",
    bloodGroup: "A+",
    religion: "Christianity",
  },
};

// In-memory profile overrides (simulates PUT /profile persisting within the session)
const profileOverrides: Record<string, Partial<StudentProfile>> = {};

// Mock API — uses session student data for realistic responses
export const mockStudentAPI = {
  register: async (data: StudentRegistrationData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      message: "Student registration completed successfully",
      student: {
        id: `student_${Math.random().toString(36).substr(2, 9)}`,
        registrationNumber: `${data.admissionYear.toString().slice(-2)}/REG/${Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase()}`,
        email: data.email,
      },
    };
  },

  getProfile: async (): Promise<StudentProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const student = getSessionStudent();
    const id = student?.id || "1";
    const base = MOCK_PROFILE_DATA[id] || MOCK_PROFILE_DATA["1"];
    return { ...base, ...(profileOverrides[id] || {}) };
  },

  updateProfile: async (data: StudentProfileUpdate) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const student = getSessionStudent();
    const id = student?.id || "1";
    profileOverrides[id] = { ...(profileOverrides[id] || {}), ...data };
    return { message: "Profile updated successfully" };
  },

  changePassword: async (data: PasswordChangeRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const student = getSessionStudent();
    // Validate current password against the mock student data
    if (student && data.currentPassword !== student.password) {
      throw { error: "Current password is incorrect", code: 400 };
    }
    return { message: "Password changed successfully" };
  },

  registerCourses: async (data: CourseRegistrationRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      message: "Course registration completed successfully",
      registeredCount: data.courseIds.length,
      courseIds: data.courseIds,
    };
  },

  getRegisteredCourses: async (
    session?: string,
    semester?: string
  ): Promise<RegisteredCoursesResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      courses: [],
      totalCredits: 0,
      totalCourses: 0,
      session: session || "2024/2025",
      semester,
    };
  },

  deregisterCourse: async (courseId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { message: "Course deregistration successful" };
  },

  getAllResults: async (session?: string): Promise<ResultsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const student = getSessionStudent();
    const id = student?.id || "1";
    const allCourses = MOCK_RESULT_DATA[id] || MOCK_RESULT_DATA["1"];

    // Filter by session if provided
    const courses = session
      ? allCourses.filter((r) => r.session === session)
      : allCourses;

    const totalCredits = courses.reduce((s, r) => s + r.course.creditUnits, 0);
    const totalGradePoint = courses.reduce((s, r) => s + r.gradePoint * r.course.creditUnits, 0);
    const gpa = totalCredits > 0 ? Number((totalGradePoint / totalCredits).toFixed(2)) : 0;

    return {
      courses,
      gpa,
      totalCredits,
      totalGradePoint,
      session: session || "2023/2024",
    };
  },

  getCourseResult: async (courseId: string): Promise<CourseResultDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const student = getSessionStudent();
    const id = student?.id || "1";
    const allCourses = MOCK_RESULT_DATA[id] || [];
    const found = allCourses.find((r) => r.id === courseId);

    if (found) {
      return {
        courseCode: found.course.courseCode,
        courseTitle: found.course.courseTitle,
        creditUnits: found.course.creditUnits,
        continuousAssessment: Math.round(found.totalScore * 0.3),
        examination: Math.round(found.totalScore * 0.7),
        totalScore: found.totalScore,
        grade: found.grade,
        gradePoint: found.gradePoint,
        remark: found.grade === "F" ? "Fail" : "Pass",
        status: found.status,
        uploadedAt: found.uploadedAt,
        approvedAt: found.approvedAt,
      };
    }

    throw { error: "Result not found", code: 404 };
  },
};

// Export a function to choose which API to use
export function getStudentAPI() {
  const useReal = !!import.meta.env.VITE_API_URL;
  return useReal ? studentAPI : mockStudentAPI;
}
