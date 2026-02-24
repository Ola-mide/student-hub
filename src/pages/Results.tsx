import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_RESULTS, SESSIONS, SEMESTERS, calculateGPA, Result } from "@/data/mockData";

const gradeColor = (grade: string) => {
  if (grade === "A") return "default";
  if (grade === "B") return "secondary";
  if (grade === "C") return "outline";
  return "destructive" as const;
};

const Results = () => {
  const { student } = useAuth();
  const allResults = student ? MOCK_RESULTS[student.id] || [] : [];
  const [session, setSession] = useState("2023/2024");
  const [semester, setSemester] = useState<string>("1");

  const filtered = allResults.filter(
    (r) => r.session === session && r.semester === Number(semester)
  );

  const gpa = calculateGPA(filtered);
  const cgpa = calculateGPA(allResults);
  const totalUnits = filtered.reduce((s, r) => s + r.units, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Academic Results</h1>
          <p className="text-muted-foreground">View your results by semester and session</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1.5 w-full sm:w-48">
            <label className="text-sm font-medium">Session</label>
            <Select value={session} onValueChange={setSession}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SESSIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 w-full sm:w-48">
            <label className="text-sm font-medium">Semester</label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Semester GPA</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{gpa.toFixed(2)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cumulative GPA</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{cgpa.toFixed(2)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Units This Semester</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{totalUnits}</div></CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Results — {session}, Semester {semester}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No results available for the selected semester.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Units</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.courseId}>
                      <TableCell className="font-medium">{r.courseCode}</TableCell>
                      <TableCell>{r.courseTitle}</TableCell>
                      <TableCell className="text-center">{r.units}</TableCell>
                      <TableCell className="text-center">{r.score}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={gradeColor(r.grade)}>{r.grade}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Results;
