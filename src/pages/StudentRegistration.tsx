import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getStudentAPI, StudentRegistrationData } from "@/services/api";
import { FACULTIES, DEPARTMENTS, LEVELS, SESSIONS } from "@/data/mockData";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<StudentRegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    facultyId: "",
    departmentId: "",
    levelCode: "",
    session: SESSIONS[SESSIONS.length - 1],
    admissionYear: new Date().getFullYear(),
    admissionSemester: "first",
    matriculationNumber: "",
  });

  const handleInputChange = (field: keyof StudentRegistrationData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleFacultyChange = (id: string) => {
    setFacultyId(id);
    handleInputChange("facultyId", id);
    handleInputChange("departmentId", "");
  };

  const getDepartments = () => {
    const facultyName = FACULTIES.find((f) => f.includes(facultyId)) || FACULTIES[0];
    return DEPARTMENTS[facultyName] || [];
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.dateOfBirth) {
      setError("Date of birth is required");
      return false;
    }
    if (!formData.gender) {
      setError("Gender is required");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!formData.facultyId) {
      setError("Faculty is required");
      return false;
    }
    if (!formData.departmentId) {
      setError("Department is required");
      return false;
    }
    if (!formData.levelCode) {
      setError("Level is required");
      return false;
    }
    if (!formData.matriculationNumber.trim()) {
      setError("Matriculation number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const api = getStudentAPI();
      await api.register(formData);
      setSuccess(true);
      toast.success("Registration completed successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMsg = typeof err === "object" && err !== null && "error" in err 
        ? (err as any).error 
        : "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 m-auto" />
              </div>
              <h2 className="text-xl font-bold mb-2">Registration Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your account has been created successfully. Redirecting to login...
              </p>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
            <GraduationCap className="h-8 w-8 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Student Registration</h1>
          <p className="text-primary-foreground/70 mt-2">Create your student account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Setup</CardTitle>
            <CardDescription>Complete your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="08012345678"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)} disabled={isLoading}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street, City"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Academic Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty *</Label>
                    <Select value={facultyId} onValueChange={handleFacultyChange} disabled={isLoading}>
                      <SelectTrigger id="faculty">
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {FACULTIES.map((fac, i) => (
                          <SelectItem key={i} value={`fac${String(i + 1).padStart(3, "0")}`}>
                            {fac}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.departmentId} onValueChange={(v) => handleInputChange("departmentId", v)} disabled={isLoading || !facultyId}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder={facultyId ? "Select department" : "Choose faculty first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getDepartments().map((dept, i) => (
                          <SelectItem key={i} value={`dept${String(i + 1).padStart(3, "0")}`}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level *</Label>
                    <Select value={formData.levelCode} onValueChange={(v) => handleInputChange("levelCode", v)} disabled={isLoading}>
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            {level} Level
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admissionYear">Admission Year *</Label>
                    <Input
                      id="admissionYear"
                      type="number"
                      value={formData.admissionYear}
                      onChange={(e) => handleInputChange("admissionYear", parseInt(e.target.value))}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionSemester">Admission Semester *</Label>
                    <Select value={formData.admissionSemester} onValueChange={(v) => handleInputChange("admissionSemester", v as "first" | "second")} disabled={isLoading}>
                      <SelectTrigger id="admissionSemester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">First</SelectItem>
                        <SelectItem value="second">Second</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session">Session *</Label>
                    <Select value={formData.session} onValueChange={(v) => handleInputChange("session", v)} disabled={isLoading}>
                      <SelectTrigger id="session">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSIONS.map((sess) => (
                          <SelectItem key={sess} value={sess}>
                            {sess}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricNumber">Matriculation Number *</Label>
                  <Input
                    id="matricNumber"
                    placeholder="e.g., 2023/MAT/15001"
                    value={formData.matriculationNumber}
                    onChange={(e) => handleInputChange("matriculationNumber", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-primary hover:underline"
                  disabled={isLoading}
                >
                  Sign In
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentRegistration;
