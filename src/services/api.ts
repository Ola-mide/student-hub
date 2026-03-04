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
    // Handle authentication errors
    if (response.status === 401) {
      // Clear auth data on 401
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

// Student API endpoints
export const studentAPI = {
  // Registration
  register: async (data: StudentRegistrationData) => {
    return apiCall("/students/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Profile
  getProfile: async (): Promise<StudentProfile> => {
    return apiCall("/students/profile");
  },

  updateProfile: async (data: StudentProfileUpdate) => {
    return apiCall("/students/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Password
  changePassword: async (data: PasswordChangeRequest) => {
    return apiCall("/students/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Course Registration
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

  // Results
  getAllResults: async (session?: string) => {
    const params = new URLSearchParams();
    if (session) params.append("session", session);
    const query = params.toString();
    return apiCall<ResultsResponse>(
      `/students/results${query ? `?${query}` : ""}`
    );
  },

  getCourseResult: async (courseId: string) => {
    return apiCall<CourseResultDetail>(
      `/students/results/${courseId}`
    );
  },
};

// Mock API for development (falls back to mock data if API not available)
export const mockStudentAPI = {
  register: async (data: StudentRegistrationData) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const id = `student${Math.random().toString(36).substr(2, 9)}`;
    return {
      message: "Student registration completed successfully",
      student: {
        id,
        registrationNumber: `${data.admissionYear.toString().slice(-2)}/FAC/DEPT/${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        email: data.email,
      },
    };
  },

  getProfile: async (): Promise<StudentProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      id: "student001",
      registrationNumber: "23/MAT/15001",
      firstName: "James",
      lastName: "Johnson",
      email: "james.johnson@student.edu",
      phoneNumber: "08012345678",
      dateOfBirth: "2002-05-15",
      gender: "Male",
      address: "123 Main Street, Lagos",
      profilePhotoURL: null,
      faculty: { id: "fac001", name: "Faculty of Science" },
      department: { id: "dept001", name: "Department of Mathematics" },
      levelCode: "100",
      session: "2023/2024",
      admissionYear: 2023,
      status: "active",
      createdAt: "2024-01-01T08:00:00Z",
      updatedAt: "2024-01-01T08:00:00Z",
      maritalStatus: "Single",
      bloodGroup: "O+",
      religion: "Christianity",
    };
  },

  updateProfile: async (data: StudentProfileUpdate) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { message: "Profile updated successfully" };
  },

  changePassword: async (data: PasswordChangeRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
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
      courses: [
        {
          id: "reg001",
          course: {
            id: "course001",
            courseCode: "MTH101",
            courseTitle: "Calculus I",
            creditUnits: 3,
          },
          session: session || "2023/2024",
          semester: semester || "first",
          status: "active",
          enrollmentDate: "2024-01-15",
          registeredAt: "2024-01-15T10:00:00Z",
        },
      ],
      totalCredits: 3,
      totalCourses: 1,
      session: session || "2023/2024",
      semester: semester,
    };
  },

  deregisterCourse: async (courseId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { message: "Course deregistration successful" };
  },

  getAllResults: async (session?: string): Promise<ResultsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      courses: [
        {
          id: "result001",
          studentName: "James Johnson",
          registrationNumber: "23/MAT/15001",
          course: {
            id: "course001",
            courseCode: "MTH101",
            courseTitle: "Calculus I",
            creditUnits: 3,
          },
          session: session || "2023/2024",
          semester: "first",
          totalScore: 85,
          grade: "A",
          gradePoint: 5,
          status: "approved",
          uploadedAt: "2024-03-02T10:00:00Z",
          approvedAt: "2024-03-02T10:15:00Z",
        },
      ],
      gpa: 5.0,
      totalCredits: 3,
      totalGradePoint: 15,
      session: session || "2023/2024",
    };
  },

  getCourseResult: async (courseId: string): Promise<CourseResultDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      courseCode: "MTH101",
      courseTitle: "Calculus I",
      creditUnits: 3,
      continuousAssessment: 20,
      examination: 65,
      totalScore: 85,
      grade: "A",
      gradePoint: 5,
      remark: "Pass",
      status: "approved",
      uploadedAt: "2024-03-02T10:00:00Z",
      approvedAt: "2024-03-02T10:15:00Z",
    };
  },
};

// Export a function to choose which API to use
export function getStudentAPI() {
  // For development, use mock API if actual API is not available
  const useReal = !!import.meta.env.VITE_API_URL;
  return useReal ? studentAPI : mockStudentAPI;
}
