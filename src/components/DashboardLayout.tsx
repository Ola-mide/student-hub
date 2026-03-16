import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, ClipboardList, GraduationCap, KeyRound, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/dashboard",       label: "Dashboard",          icon: GraduationCap },
  { to: "/profile",         label: "Profile",            icon: User          },
  { to: "/courses",         label: "Course Registration",icon: ClipboardList  },
  { to: "/results",         label: "Results",            icon: BookOpen       },
  { to: "/change-password", label: "Change Password",    icon: KeyRound       },
];

const SidebarContent = ({
  student,
  logout,
  pathname,
  onNavigate,
}: {
  student: any;
  logout: () => void;
  pathname: string;
  onNavigate?: () => void;
}) => (
  <>
    <div className="p-6 border-b border-primary-foreground/10">
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img src="/faviconn.ico" alt="Logo" className="h-8 w-8 object-contain" />
        <div>
          <h1 className="font-bold text-lg leading-tight">HUST Student Portal</h1>
        </div>
      </Link>
    </div>

    <nav className="flex-1 p-4 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            pathname === item.to
              ? "bg-secondary text-secondary-foreground"
              : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>

    <div className="p-4 border-t border-primary-foreground/10">
      <div className="flex items-center gap-3 mb-3 px-3">
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate">{student?.fullName}</p>
          <p className="text-xs text-primary-foreground/60 truncate">{student?.matricNumber}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  </>
);

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { student, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-primary text-primary-foreground flex flex-col shrink-0">
          <SidebarContent student={student} logout={logout} pathname={location.pathname} />
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-primary text-primary-foreground border-none">
                <SidebarContent
                  student={student}
                  logout={logout}
                  pathname={location.pathname}
                  onNavigate={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <img src="/faviconn.ico" alt="Logo" className="h-6 w-6 object-contain" />
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="font-bold hover:opacity-80 transition-opacity"
            >
              HUST Student Portal
            </Link>
          </header>
        )}

        <main className="flex-1">
          <div className="p-4 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
