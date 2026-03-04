import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getStudentAPI } from "@/services/api";

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          disabled={disabled}
          className="pr-10"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

// Password strength rules
const rules = [
  { label: "At least 8 characters",          test: (p: string) => p.length >= 8 },
  { label: "Contains an uppercase letter",    test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains a lowercase letter",     test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains a number",               test: (p: string) => /\d/.test(p) },
];

const StrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null;
  const passed = rules.filter((r) => r.test(password)).length;
  const colors = ["bg-destructive", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-2 mt-1">
      {/* Bar */}
      <div className="flex gap-1">
        {rules.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < passed ? colors[passed - 1] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${passed >= 3 ? "text-green-600" : "text-muted-foreground"}`}>
        Password strength: {labels[passed - 1] ?? "Too weak"}
      </p>
      {/* Rule checklist */}
      <ul className="space-y-1">
        {rules.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-muted-foreground"}`}>
              {ok
                ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                : <XCircle className="h-3.5 w-3.5 shrink-0" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};;

const ChangePassword = () => {
  const { student, isAuthenticated } = useAuth();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || !student) {
      setError("You must be logged in to change your password");
    }
  }, [student, isAuthenticated]);

  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [loading, setLoading]                   = useState(false);
  const [errors, setErrors]                     = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!currentPassword)
      errs.currentPassword = "Please enter your current password.";

    if (!newPassword)
      errs.newPassword = "Please enter a new password.";
    else if (!rules.every((r) => r.test(newPassword)))
      errs.newPassword = "Password does not meet all requirements.";
    else if (newPassword === currentPassword)
      errs.newPassword = "New password must be different from your current password.";

    if (!confirmPassword)
      errs.confirmPassword = "Please confirm your new password.";
    else if (confirmPassword !== newPassword)
      errs.confirmPassword = "Passwords do not match.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const api = getStudentAPI();
      await api.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err) {
      const errorMsg = typeof err === "object" && err !== null && "error" in err 
        ? (err as any).error 
        : "Failed to change password";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="text-muted-foreground">Update your account password</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {!error && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Security</CardTitle>
              <CardDescription>Choose a strong password you haven't used before.</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errors.submit && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  {errors.submit}
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1">
                <PasswordInput
                  id="current-password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(v) => {
                    setCurrentPassword(v);
                    if (errors.currentPassword) setErrors((e) => ({ ...e, currentPassword: "" }));
                  }}
                  disabled={loading}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="border-t pt-5 space-y-5">
                {/* New Password */}
                <div className="space-y-1">
                  <PasswordInput
                    id="new-password"
                    label="New Password"
                    value={newPassword}
                    onChange={(v) => {
                      setNewPassword(v);
                      if (errors.newPassword) setErrors((e) => ({ ...e, newPassword: "" }));
                    }}
                    disabled={loading}
                  />
                  <StrengthIndicator password={newPassword} />
                  {errors.newPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <PasswordInput
                    id="confirm-password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(v) => {
                      setConfirmPassword(v);
                      if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: "" }));
                    }}
                    disabled={loading}
                  />
                  {/* Match indicator */}
                  {confirmPassword && newPassword && (
                    <p className={`text-xs flex items-center gap-1 mt-1 ${confirmPassword === newPassword ? "text-green-600" : "text-destructive"}`}>
                      {confirmPassword === newPassword
                        ? <><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Passwords match</>
                        : <><XCircle className="h-3.5 w-3.5 shrink-0" /> Passwords do not match</>}
                    </p>
                  )}
                  {errors.confirmPassword && !confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {loading ? "Updating…" : "Update Password"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>)}

        {/* Tip */}
        <p className="text-xs text-muted-foreground px-1">
          Tip: Use a mix of uppercase letters, lowercase letters, and numbers. Avoid using easily guessable information like your name or matric number.
        </p>
        
      </div>
    </DashboardLayout>
  );
};

export default ChangePassword;
