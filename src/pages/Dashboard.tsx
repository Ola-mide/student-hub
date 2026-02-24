import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ClipboardList, GraduationCap, User } from "lucide-react";
import { MOCK_RESULTS, calculateGPA } from "@/data/mockData";

const Dashboard = () => {
  const { student } = useAuth();
  const results = student ? MOCK_RESULTS[student.id] || [] : [];
  const gpa = calculateGPA(results);
  const totalUnits = results.reduce((s, r) => s + r.units, 0);

  const stats = [
    { label: "Current Level", value: `${student?.level} Level`, icon: GraduationCap, color: "text-secondary" },
    { label: "CGPA", value: gpa.toFixed(2), icon: BookOpen, color: "text-green-600" },
    { label: "Total Units", value: totalUnits, icon: ClipboardList, color: "text-blue-600" },
    { label: "Department", value: student?.department || "—", icon: User, color: "text-purple-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                <div className="text-2xl font-bold">{stat.value}</div>
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
