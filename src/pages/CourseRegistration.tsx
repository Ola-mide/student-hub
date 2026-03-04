import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getStudentAPI } from "@/services/api";
import { SESSIONS, SEMESTERS } from "@/data/mockData";

// Extended dummy courses for presentation purposes
const ALL_COURSES = [
  // Computer Science – 300L – Semester 1
  { id: "c1",  code: "CSC 301", title: "Data Structures and Algorithms",   units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c3",  code: "CSC 305", title: "Database Management Systems",      units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c2",  code: "CSC 303", title: "Operating Systems",                units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c4",  code: "CSC 307", title: "Computer Networks",                units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c5",  code: "CSC 309", title: "Artificial Intelligence",          units: 3, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c6",  code: "CSC 311", title: "Theory of Computation",            units: 3, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c7",  code: "CSC 313", title: "Human-Computer Interaction",       units: 2, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c8",  code: "MTH 301", title: "Numerical Methods",                units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c9",  code: "GST 301", title: "Entrepreneurship Studies",         units: 2, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },
  { id: "c10", code: "STA 301", title: "Probability and Statistics",       units: 3, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 1, session: "2025/2026" },

  // Computer Science – 300L – Semester 2
  { id: "c11", code: "CSC 302", title: "Software Engineering",             units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c12", code: "CSC 304", title: "Compiler Design",                  units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c13", code: "CSC 306", title: "Web Technology",                   units: 3, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c14", code: "CSC 308", title: "Numerical Computing",              units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c15", code: "CSC 310", title: "Computer Graphics",                units: 3, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c16", code: "CSC 312", title: "Information Security",             units: 3, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c17", code: "CSC 314", title: "Mobile Application Development",   units: 2, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c18", code: "MTH 302", title: "Linear Algebra",                   units: 3, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c19", code: "GST 302", title: "Communication Skills",             units: 2, type: "compulsory", faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },
  { id: "c20", code: "CSC 316", title: "Cloud Computing",                  units: 2, type: "elective",   faculty: "Faculty of Science",      department: "Computer Science",      level: 300, semester: 2, session: "2025/2026" },

  // Computer Engineering – 300L – Semester 1
  { id: "e1",  code: "CPE 301", title: "Digital Systems Design",           units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },
  { id: "e2",  code: "CPE 303", title: "Microprocessor Systems",           units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },
  { id: "e3",  code: "CPE 305", title: "Signals and Systems",              units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },
  { id: "e4",  code: "CPE 307", title: "Embedded Systems",                 units: 3, type: "elective",   faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },
  { id: "e5",  code: "CPE 309", title: "Control Systems Engineering",      units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },
  { id: "e6",  code: "EEE 301", title: "Electromagnetics",                 units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },
  { id: "e7",  code: "GST 301", title: "Entrepreneurship Studies",         units: 2, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },
  { id: "e8",  code: "CPE 311", title: "VLSI Design",                      units: 3, type: "elective",   faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 1, session: "2024/2025" },

  // Computer Engineering – 300L – Semester 2
  { id: "e9",  code: "CPE 302", title: "Computer Architecture",            units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 2, session: "2024/2025" },
  { id: "e10", code: "CPE 304", title: "Digital Communications",           units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 2, session: "2024/2025" },
  { id: "e11", code: "CPE 306", title: "Real-Time Systems",                units: 3, type: "elective",   faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 2, session: "2024/2025" },
  { id: "e12", code: "CPE 308", title: "Internet of Things",               units: 3, type: "elective",   faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 2, session: "2024/2025" },
  { id: "e13", code: "EEE 302", title: "Power Electronics",                units: 3, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 2, session: "2024/2025" },
  { id: "e14", code: "GST 302", title: "Communication Skills",             units: 2, type: "compulsory", faculty: "Faculty of Engineering",  department: "Computer Engineering",  level: 300, semester: 2, session: "2024/2025" },
];

const CourseRegistration = () => {
  const { student, isAuthenticated } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || !student) {
      setError("You must be authenticated to register for courses");
    }
  }, [student, isAuthenticated]);
  const faculty = student?.faculty || "";
  const department = student?.department || "";
  const level = String(student?.level || "");
  const session = SESSIONS[SESSIONS.length - 1];

  // Student only picks semester
  const [semester, setSemester] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const baseCourses = useMemo(
    () =>
      ALL_COURSES.filter(
        (c) =>
          c.faculty === faculty &&
          c.department === department &&
          c.level === Number(level) &&
          c.session === session &&
          (semester ? c.semester === Number(semester) : false)
      ),
    [faculty, department, level, session, semester]
  );

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return baseCourses;
    return baseCourses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    );
  }, [baseCourses, searchQuery]);

  const toggleCourse = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCourses = baseCourses.filter((c) => selected.has(c.id));
  const totalUnits = selectedCourses.reduce((s, c) => s + c.units, 0);

  const handleRegister = async () => {
    if (!semester) {
      toast.error("Please select a semester first");
      return;
    }
    if (selected.size === 0) {
      toast.error("Please select at least one course");
      return;
    }
    
    setIsRegistering(true);
    try {
      const api = getStudentAPI();
      await api.registerCourses({
        courseIds: Array.from(selected),
      });
      toast.success(
        `Successfully registered for ${selected.size} course(s) totalling ${totalUnits} units`
      );
      setSelected(new Set());
      setSearchQuery("");
    } catch (err) {
      const errorMsg = typeof err === "object" && err !== null && "error" in err 
        ? (err as any).error 
        : "Registration failed";
      toast.error(errorMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSemesterChange = (v: string) => {
    setSemester(v);
    setSelected(new Set());
    setSearchQuery("");
  };

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
          <h1 className="text-2xl font-bold">Course Registration</h1>
          <p className="text-muted-foreground">Select your courses for the semester</p>
        </div>

        {/* Registration Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Faculty",    value: faculty     || "—" },
                { label: "Department", value: department  || "—" },
                { label: "Level",      value: level ? `${level} Level` : "—" },
                { label: "Session",    value: session },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">{label}</label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground truncate">
                    {value}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Semester <span className="text-destructive">*</span>
                </label>
                <Select value={semester} onValueChange={handleSemesterChange} disabled={isRegistering}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Selection — shown only after semester is picked */}
        {semester ? (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">
                Available Courses — Semester {semester}{" "}
                <span className="text-muted-foreground font-normal">
                  ({filteredCourses.length}{searchQuery ? ` of ${baseCourses.length}` : ""})
                </span>
              </CardTitle>
              <div className="text-sm text-muted-foreground shrink-0">
                Selected:{" "}
                <span className="font-semibold text-foreground">{selected.size}</span>{" "}
                course{selected.size !== 1 ? "s" : ""} ·{" "}
                <span className="font-semibold text-foreground">{totalUnits}</span> units
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by course code, title or type…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isRegistering}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    disabled={isRegistering}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Course table */}
              {filteredCourses.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  {searchQuery
                    ? `No courses match "${searchQuery}". Try a different search term.`
                    : "No courses available for your department this semester."}
                </p>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-28">Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-center w-16">Units</TableHead>
                        <TableHead className="text-center w-28">Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow
                          key={course.id}
                          className={`cursor-pointer transition-colors ${
                            selected.has(course.id) ? "bg-primary/5" : ""
                          } ${isRegistering ? "opacity-50 cursor-default" : ""}`}
                          onClick={() => !isRegistering && toggleCourse(course.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selected.has(course.id)}
                              onCheckedChange={() => !isRegistering && toggleCourse(course.id)}
                              disabled={isRegistering}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">
                            {course.code}
                          </TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell className="text-center">{course.units}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={course.type === "compulsory" ? "default" : "secondary"}>
                              {course.type}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Selected courses summary chips */}
              {selected.size > 0 && (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-primary">
                    Selected Courses ({selected.size})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourses.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {c.code} · {c.units}u
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            !isRegistering && toggleCourse(c.id);
                          }}
                          disabled={isRegistering}
                          className="hover:text-destructive transition-colors disabled:opacity-50"
                          aria-label={`Remove ${c.code}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total:{" "}
                    <span className="font-semibold text-foreground">{totalUnits}</span> units
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleRegister} 
                  disabled={selected.size === 0 || isRegistering}
                >
                  {isRegistering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isRegistering 
                    ? "Registering..."
                    : `Register ${
                      selected.size > 0
                        ? `${selected.size} Course${selected.size > 1 ? "s" : ""}`
                        : "Courses"
                    }`
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Prompt state when no semester selected */
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground gap-2">
            <Search className="h-8 w-8 opacity-30" />
            <p className="font-medium">Select a semester to view available courses</p>
            <p className="text-sm">
              Your faculty, department, level, and session are pre-filled from your profile.
            </p>
          </div>
        )}
        </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default CourseRegistration;

