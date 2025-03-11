
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Key,
  Home,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Building,
  LogOut,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  role: string;
  concernId: string;
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const isSuperAdmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";
  const isUser = currentUser?.role === "user";

  return (
    <div
      className={cn(
        "h-screen bg-sidebar transition-all duration-300 border-r flex flex-col",
        collapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div className={cn("flex items-center", collapsed && "justify-center")}>
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-xl">
            CC
          </div>
          {!collapsed && (
            <span className="ml-3 font-semibold">City Checklist</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-2">
          <Link
            to="/"
            className={cn(
              "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/") &&
                "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              collapsed && "justify-center px-2"
            )}
          >
            <Home className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="ml-3">Dashboard</span>}
          </Link>

          {/* Super Admin Only Routes */}
          {isSuperAdmin && (
            <>
              <Link
                to="/users"
                className={cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive("/users") &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  collapsed && "justify-center px-2"
                )}
              >
                <Users className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="ml-3">Manage Users</span>}
              </Link>

              <Link
                to="/cities"
                className={cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive("/cities") &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  collapsed && "justify-center px-2"
                )}
              >
                <Building className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="ml-3">Manage Cities</span>}
              </Link>
            </>
          )}

          {/* Admin and Super Admin Routes */}
          {(isAdmin || isSuperAdmin) && (
            <Link
              to="/reports"
              className={cn(
                "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive("/reports") &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                collapsed && "justify-center px-2"
              )}
            >
              <FileText className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="ml-3">Reports</span>}
            </Link>
          )}

          {/* Tasks route for all users (content differs based on role) */}
          <Link
            to="/tasks"
            className={cn(
              "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/tasks") &&
                "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              collapsed && "justify-center px-2"
            )}
          >
            <FileSpreadsheet className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="ml-3">
                {isUser ? "My Tasks" : "Manage Tasks"}
              </span>
            )}
          </Link>

          <Link
            to="/password"
            className={cn(
              "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/password") &&
                "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              collapsed && "justify-center px-2"
            )}
          >
            <Key className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="ml-3">Change Password</span>}
          </Link>
        </nav>
      </div>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
