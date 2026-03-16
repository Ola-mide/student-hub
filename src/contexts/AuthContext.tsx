import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MOCK_STUDENTS, Student } from "@/data/mockData";

interface AuthContextType {
  student: Student | null;
  login: (matricNumber: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(() => {
    const saved = localStorage.getItem("student_session");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (student) {
      localStorage.setItem("student_session", JSON.stringify(student));
      // Set a mock auth token so API calls include Authorization header
      if (!localStorage.getItem("auth_token")) {
        localStorage.setItem("auth_token", `mock_token_${student.id}`);
      }
    } else {
      localStorage.removeItem("student_session");
      localStorage.removeItem("auth_token");
    }
  }, [student]);

  const login = (matricNumber: string, password: string) => {
    const found = MOCK_STUDENTS.find(
      (s) =>
        s.matricNumber.toLowerCase() === matricNumber.toLowerCase() &&
        s.password === password
    );
    if (found) {
      setStudent(found);
      // Store a mock token for API calls
      localStorage.setItem("auth_token", `mock_token_${found.id}`);
      return { success: true };
    }
    return { success: false, error: "Invalid matric number or password" };
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ student, login, logout, isAuthenticated: !!student }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};
