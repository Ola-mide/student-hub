import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { getStudentAPI, type StudentProfile as StudentProfileData, type StudentProfileUpdate } from "@/services/api";

const StudentProfile = () => {
  const { student, isAuthenticated } = useAuth();
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [editData, setEditData] = useState<StudentProfileUpdate>({});

  useEffect(() => {
    if (!isAuthenticated) {
      setError("You must be logged in to view your profile");
      setIsFetching(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const api = getStudentAPI();
        const data = await api.getProfile();
        setProfile(data);
        setEditData({
          phoneNumber: data.phoneNumber,
          address: data.address,
          profilePhotoURL: data.profilePhotoURL || "",
          maritalStatus: data.maritalStatus,
          bloodGroup: data.bloodGroup,
          religion: data.religion,
        });
        setError("");
      } catch (err) {
        const errorMsg = typeof err === "object" && err !== null && "error" in err 
          ? (err as any).error 
          : "Failed to load profile";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsFetching(false);
      }
    };

    if (student) {
      fetchProfile();
    }
  }, [student, isAuthenticated]);

  const handleInputChange = (field: keyof StudentProfileUpdate, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const api = getStudentAPI();
      await api.updateProfile(editData);
      setProfile((prev) => prev ? { ...prev, ...editData } : null);
      setSuccess(true);
      setIsEditing(false);
      toast.success("Profile updated successfully");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = typeof err === "object" && err !== null && "error" in err 
        ? (err as any).error 
        : "Failed to update profile";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditData({
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        profilePhotoURL: profile.profilePhotoURL || "",
        maritalStatus: profile.maritalStatus,
        bloodGroup: profile.bloodGroup,
        religion: profile.religion,
      });
    }
    setIsEditing(false);
    setError("");
  };

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || !student) {
    return (
      <DashboardLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Authentication required. Please log in to view your profile.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load profile. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="default">
              Edit Profile
            </Button>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Your profile has been updated successfully
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your name, email, and registration details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Registration Number", value: profile.registrationNumber },
                { label: "First Name", value: profile.firstName },
                { label: "Last Name", value: profile.lastName },
                { label: "Email", value: profile.email },
                { label: "Date of Birth", value: profile.dateOfBirth },
                { label: "Gender", value: profile.gender },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium mt-1">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>Your faculty, department, and admission details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Faculty", value: profile.faculty.name },
                { label: "Department", value: profile.department.name },
                { label: "Level", value: `${profile.levelCode} Level` },
                { label: "Session", value: profile.session },
                { label: "Admission Year", value: String(profile.admissionYear) },
                { label: "Status", value: profile.status },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium mt-1">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Address */}
        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Contact & Address</CardTitle>
              <CardDescription>Update your contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editData.phoneNumber || ""}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="08012345678"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street, City"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo URL</Label>
                <Input
                  id="photo"
                  value={editData.profilePhotoURL || ""}
                  onChange={(e) => handleInputChange("profilePhotoURL", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marital">Marital Status</Label>
                  <Select value={editData.maritalStatus || ""} onValueChange={(v) => handleInputChange("maritalStatus", v)} disabled={isSaving}>
                    <SelectTrigger id="marital">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood">Blood Group</Label>
                  <Select value={editData.bloodGroup || ""} onValueChange={(v) => handleInputChange("bloodGroup", v)} disabled={isSaving}>
                    <SelectTrigger id="blood">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Select value={editData.religion || ""} onValueChange={(v) => handleInputChange("religion", v)} disabled={isSaving}>
                  <SelectTrigger id="religion">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    <SelectItem value="Christianity">Christianity</SelectItem>
                    <SelectItem value="Islam">Islam</SelectItem>
                    <SelectItem value="Judaism">Judaism</SelectItem>
                    <SelectItem value="Buddhism">Buddhism</SelectItem>
                    <SelectItem value="Hinduism">Hinduism</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Contact & Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Phone Number", value: profile.phoneNumber },
                  { label: "Address", value: profile.address },
                  { label: "Marital Status", value: profile.maritalStatus || "Not specified" },
                  { label: "Blood Group", value: profile.bloodGroup || "Not specified" },
                  { label: "Religion", value: profile.religion || "Not specified" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Important Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  label: "Account Created",
                  value: new Date(profile.createdAt).toLocaleString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
                {
                  label: "Last Updated",
                  value: new Date(profile.updatedAt).toLocaleString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium mt-1">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
