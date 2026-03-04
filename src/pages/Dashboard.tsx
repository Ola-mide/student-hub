import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ClipboardList, GraduationCap, User, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getStudentAPI } from "@/services/api";
import { ResultData } from "@/services/api";

const Dashboard = () => {
  const { student, isAuthenticated } = useAuth();
  const [results, setResults] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || !student) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const api = getStudentAPI();
        const data = await api.getAllResults();
        setResults(data.courses);
        setError("");
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setResults([]);
        setError("Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [student, isAuthenticated]);

  // Calculate GPA from results
  const calculateGPA = (courseResults: ResultData[]): number => {
    if (courseResults.length === 0) return 0;
    const gradePoints: Record<string, number> = {
      A: 5, B: 4, C: 3, D: 2, F: 0
    };
    const totalQP = courseResults.reduce((sum, r) => sum + (gradePoints[r.grade] || 0) * r.course.creditUnits, 0);
    const totalUnits = courseResults.reduce((sum, r) => sum + r.course.creditUnits, 0);
    return totalUnits > 0 ? Number((totalQP / totalUnits).toFixed(2)) : 0;
  };

  const gpa = calculateGPA(results);
  const totalUnits = results.reduce((s, r) => s + r.course.creditUnits, 0);

  const stats = [
    { label: "Current Level", value: `${student?.level} Level`, icon: GraduationCap, color: "text-secondary" },
    { label: "CGPA", value: gpa.toFixed(2), icon: BookOpen, color: "text-green-600", loading: isLoading },
    { label: "Total Units", value: totalUnits, icon: ClipboardList, color: "text-blue-600", loading: isLoading },
    { label: "Department", value: student?.department || "—", icon: User, color: "text-purple-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {!error ? (
        <>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {student?.fullName}</h1>
          <p className="text-muted-foreground">{student?.faculty} • {student?.department}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {stat.loading && isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ["Full Name", student?.fullName],
                ["Matric Number", student?.matricNumber],
                ["Email", student?.email],
                ["Faculty", student?.faculty],
                ["Department", student?.department],
                ["Level", `${student?.level} Level`],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
