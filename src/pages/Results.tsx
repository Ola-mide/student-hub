import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";
import { SESSIONS, SEMESTERS, calculateGPA, Result } from "@/data/mockData";
import { getStudentAPI } from "@/services/api";

const gradeColor = (grade: string) => {
  if (grade === "A") return "default";
  if (grade === "B") return "secondary";
  if (grade === "C") return "outline";
  return "destructive" as const;
};

const gradeLabel = (grade: string) => {
  const labels: Record<string, string> = {
    A: "Excellent",
    B: "Very Good",
    C: "Good",
    D: "Pass",
    E: "Pass",
    F: "Fail",
  };
  return labels[grade] ?? grade;
};

// Printable result sheet component — rendered off-screen, used for print
const PrintSheet = ({
  student,
  results,
  title,
  subtitle,
  semesterSections,
}: {
  student: any;
  results: Result[];
  title: string;
  subtitle: string;
  semesterSections?: { label: string; rows: Result[] }[];
}) => {
  const gpa = calculateGPA(results);
  const totalUnits = results.reduce((s, r) => s + r.units, 0);
  const totalQP = results.reduce((s, r) => {
    const gp: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    return s + (gp[r.grade] ?? 0) * r.units;
  }, 0);

  const renderRows = (rows: Result[]) =>
    rows.map((r, i) => (
      <tr key={r.courseId} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff" }}>
        <td style={td}>{r.courseCode}</td>
        <td style={td}>{r.courseTitle}</td>
        <td style={{ ...td, textAlign: "center" }}>{r.units}</td>
        <td style={{ ...td, textAlign: "center" }}>{r.score}</td>
        <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{r.grade}</td>
        <td style={{ ...td, textAlign: "center" }}>{gradeLabel(r.grade)}</td>
      </tr>
    ));

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#111", padding: "40px 48px", maxWidth: 780, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "3px double #1e3a6e", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, color: "#1e3a6e" }}>
          FEDERAL UNIVERSITY OF TECHNOLOGY
        </div>
        <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
          Academic Affairs Division — Student Result Transcript
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#555" }}>{subtitle}</div>
      </div>

      {/* Student Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 32px", marginBottom: 24, fontSize: 13 }}>
        {[
          ["Student Name", student?.fullName],
          ["Matric Number", student?.matricNumber],
          ["Faculty", student?.faculty],
          ["Department", student?.department],
          ["Level", `${student?.level} Level`],
          ["Email", student?.email],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", gap: 8 }}>
            <span style={{ color: "#555", minWidth: 110 }}>{label}:</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Sections */}
      {semesterSections ? (
        semesterSections.map((section) => (
          <div key={section.label} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a6e", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {section.label}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#1e3a6e", color: "#fff" }}>
                  {["Course Code", "Course Title", "Units", "Score", "Grade", "Remark"].map((h) => (
                    <th key={h} style={{ ...th, textAlign: h === "Course Title" ? "left" : "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderRows(section.rows)}</tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, fontSize: 12, marginTop: 6, color: "#555" }}>
              <span>Units: <b>{section.rows.reduce((s, r) => s + r.units, 0)}</b></span>
              <span>GPA: <b>{calculateGPA(section.rows).toFixed(2)}</b></span>
            </div>
          </div>
        ))
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#1e3a6e", color: "#fff" }}>
              {["Course Code", "Course Title", "Units", "Score", "Grade", "Remark"].map((h) => (
                <th key={h} style={{ ...th, textAlign: h === "Course Title" ? "left" : "center" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows(results)}</tbody>
        </table>
      )}

      {/* Summary */}
      <div style={{ marginTop: 24, borderTop: "2px solid #1e3a6e", paddingTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ background: "#f0f4ff", border: "1px solid #c7d4f0", borderRadius: 6, padding: "12px 24px", textAlign: "center", minWidth: 200 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>Summary</div>
          <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
            <div><div style={{ color: "#555", fontSize: 11 }}>Total Units</div><div style={{ fontWeight: 700, fontSize: 18 }}>{totalUnits}</div></div>
            <div><div style={{ color: "#555", fontSize: 11 }}>Total Quality Points</div><div style={{ fontWeight: 700, fontSize: 18 }}>{totalQP}</div></div>
            <div><div style={{ color: "#555", fontSize: 11 }}>{semesterSections ? "CGPA" : "GPA"}</div><div style={{ fontWeight: 700, fontSize: 18, color: "#1e3a6e" }}>{gpa.toFixed(2)}</div></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, fontSize: 11, color: "#888", borderTop: "1px solid #ddd", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Generated: {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</span>
        <span>This is a computer-generated document and requires no signature.</span>
      </div>
    </div>
  );
};

// Inline styles for the print sheet
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 12 };
const th: React.CSSProperties = { padding: "8px 10px", fontWeight: 600, fontSize: 12 };
const td: React.CSSProperties = { padding: "7px 10px", borderBottom: "1px solid #e5e7eb" };

// ── Main Results Page ─────────────────────────────────────────────────────────

const Results = () => {
  const { student, isAuthenticated } = useAuth();
  const [session, setSession] = useState("2023/2024");
  const [semester, setSemester] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [allResults, setAllResults] = useState<Result[]>([]);
  const [error, setError] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  // Fetch results on component mount and when session changes
  useEffect(() => {
    if (!isAuthenticated || !student) {
      setError("You must be logged in to view results");
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError("");
      try {
        const api = getStudentAPI();
        const data = await api.getAllResults(session);
        // Transform API response to match Result format
        const transformedResults: Result[] = data.courses.map((course) => ({
          courseId: course.id,
          courseCode: course.course.courseCode,
          courseTitle: course.course.courseTitle,
          units: course.course.creditUnits,
          grade: course.grade,
          score: course.totalScore,
          semester: parseInt(course.semester),
          session: course.session,
          level: 300, // This should come from student data
        }));
        setAllResults(transformedResults);
      } catch (err) {
        const errorMsg = typeof err === "object" && err !== null && "error" in err
          ? (err as any).error
          : "Failed to load results";
        console.error("Failed to fetch results:", err);
        setError(errorMsg);
        setAllResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [student, session, isAuthenticated]);

  const filtered = allResults.filter(
    (r) => r.session === session && r.semester === Number(semester)
  );
  const sessionResults = allResults.filter((r) => r.session === session);

  const gpa = calculateGPA(filtered);
  const cgpa = calculateGPA(allResults);
  const totalUnits = filtered.reduce((s, r) => s + r.units, 0);

  // Trigger browser print on the hidden div
  const handlePrint = (content: React.ReactNode, filename: string) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const container = document.createElement("div");
    container.id = "print-root";

    const { createRoot } = require("react-dom/client");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #fff; }
            @media print {
              @page { size: A4; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body><div id="print-root"></div></body>
      </html>
    `);
    printWindow.document.close();

    // Small delay so the document is ready
    setTimeout(() => {
      const root = createRoot(printWindow.document.getElementById("print-root")!);
      root.render(content);
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    }, 100);
  };

  const downloadSemester = () => {
    if (filtered.length === 0) return;
    handlePrint(
      <PrintSheet
        student={student}
        results={filtered}
        title={`${session} — Semester ${semester} Result`}
        subtitle={`${student?.department} · ${student?.level} Level`}
      />,
      `Result_${session.replace("/", "-")}_Sem${semester}`
    );
  };

  const downloadSession = async () => {
    if (sessionResults.length === 0) return;
    setIsDownloading(true);
    
    // Simulate a small delay for API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const sem1 = sessionResults.filter((r) => r.semester === 1);
    const sem2 = sessionResults.filter((r) => r.semester === 2);
    const sections = [
      ...(sem1.length ? [{ label: `Semester 1 — ${session}`, rows: sem1 }] : []),
      ...(sem2.length ? [{ label: `Semester 2 — ${session}`, rows: sem2 }] : []),
    ];
    handlePrint(
      <PrintSheet
        student={student}
        results={sessionResults}
        title={`${session} — Full Session Result`}
        subtitle={`${student?.department} · ${student?.level} Level`}
        semesterSections={sections}
      />,
      `Result_${session.replace("/", "-")}_FullSession`
    );
    
    setIsDownloading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Academic Results</h1>
            <p className="text-muted-foreground">View and download your results</p>
          </div>

          {/* Download buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSession}
              disabled={sessionResults.length === 0 || isDownloading || isLoading}
              className="gap-2"
            >
              {isDownloading && <Loader2 className="h-4 w-4 animate-spin" />}
              <FileText className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Full Session Result"}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading your results...</p>
            </div>
          </div>
        ) : !isAuthenticated || !student ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>Authentication required. Please log in to view results.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
                <CardContent><div className="text-3xl font-bold">{calculateGPA(filtered).toFixed(2)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cumulative GPA</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold">{calculateGPA(allResults).toFixed(2)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Units This Semester</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold">{filtered.reduce((s, r) => s + r.units, 0)}</div></CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base">
                  Results — {session}, Semester {semester}
                </CardTitle>
                {filtered.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => downloadSession()} 
                    disabled={isDownloading}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    {isDownloading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <Download className="h-3.5 w-3.5" />
                    {isDownloading ? "Downloading..." : "Download this semester"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No results available for the selected semester.
                  </p>
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
          </>
        )}
      </div>

      {/* Hidden print container (fallback ref, not actively used) */}
      <div ref={printRef} className="hidden" aria-hidden />
    </DashboardLayout>
  );
};

export default Results;