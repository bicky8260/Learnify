import type { CSSProperties } from "react";
import { Link2, LogOut, ChevronRight, UserIcon, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { routes, getDefaultRouteForRole } from "../../../routes";
import { userStore, useSideBarStore } from "../../../state/global";
import useRouter from "../../../hooks/useRouter";
import { SidebarShell } from "../primitives";
import { modernMedia } from "../../../assets/modernMedia";

export default function AsideLeft({ style }: { style?: CSSProperties }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = useSideBarStore((state) => state.isCollapsed);
  const router = useRouter();
  const user = userStore((state) => state.user);
  const userRole = user?.role;
  const setToken = userStore((state) => state.setToken);
  const setUser = userStore((state) => state.setUser);

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("erpbugs-auth-jwt-token");
    localStorage.removeItem("erpbugs-user-client");
    navigate("/");
  };

  // Filter routes based on user role
  const filteredRoutes = routes.filter((route) => {
    if (!route.menu) return false;
    if (!route.role || route.role === "ALL") return true;
    return route.role === userRole;
  });

  // Get role badge styling
  const getRoleBadge = () => {
    switch (userRole) {
      case "ADMIN":
        return {
          bg: "bg-gradient-to-r from-red-500/20 to-rose-500/20",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-500/30",
          dot: "bg-red-500",
        };
      case "MODERATOR":
        return {
          bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-500/30",
          dot: "bg-blue-500",
        };
      case "CONTRIBUTOR":
        return {
          bg: "bg-gradient-to-r from-purple-500/20 to-violet-500/20",
          text: "text-purple-600 dark:text-purple-400",
          border: "border-purple-500/30",
          dot: "bg-purple-500",
        };
      case "STUDENT":
        return {
          bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
          text: "text-green-600 dark:text-green-400",
          border: "border-green-500/30",
          dot: "bg-green-500",
        };
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-500/30",
          dot: "bg-gray-500",
        };
    }
  };

  const roleBadge = getRoleBadge();

  if (isCollapsed) {
    return (
      <SidebarShell
        className="border-r border-[var(--sidebar-border)]/70"
        style={{ width: style?.width }}
      >
        <div className="flex items-center justify-center p-4 mb-6">
          <button
            onClick={() => navigate(getDefaultRouteForRole(userRole))}
            className="relative theme-glass p-2 rounded-2xl hover:scale-105 shadow-sm transition-transform duration-300"
            title="Go to Dashboard"
          >
            <img
              src={modernMedia.logo}
              className="relative h-9 w-9 object-contain rounded-lg"
              alt="Learnify logo"
            />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-3 overflow-y-auto scrollbar-sm">
          {filteredRoutes.map((route) => {
            const isActive = getIsActive(route.path, location.pathname);

            return (
              <button
                key={route.path}
                onClick={() =>
                  router.replace(
                    route.path,
                    route.name ? route.name : route.path.replace("/", "")
                  )
                }
                className={`relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-lg animate-scale-in"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/65 hover:text-[var(--foreground)] hover:scale-105"
                }`}
                title={route.name}
              >
                <span className="flex items-center justify-center">
                  {route.icon || <Link2 className="w-5 h-5" />}
                </span>

                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-[var(--sidebar-primary)]/20 blur-md -z-10" />
                )}

                {/* Tooltip */}
                <div className="absolute left-14 theme-panel text-[var(--foreground)] px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg scale-95 group-hover:scale-100">
                  {route.name || route.path.replace("/", "")}
                  <ChevronRight className="absolute -left-1 w-3 h-3 text-[var(--border)]" />
                </div>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[var(--sidebar-border)]/80 bg-[var(--sidebar)]/40 p-3">
          <div className="flex flex-col gap-2">
            {/* Notification Button */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative group flex items-center justify-center w-10 h-10 rounded-xl text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/65 hover:text-[var(--foreground)] transition-all duration-300 hover:scale-105"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--destructive)] animate-pulse" />
              <div className="absolute left-14 theme-panel text-[var(--foreground)] px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg scale-95 group-hover:scale-100">
                Notifications
              </div>
            </button>

            {/* Profile Circle */}
            <button
              onClick={() => navigate("/profile")}
              className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
              title={user?.name || "Profile"}
            >
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-2 border-[var(--sidebar-primary)] shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--sidebar-primary)] to-[var(--accent-foreground)] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || <UserIcon size={18} />}
                </div>
              )}
              <div className="absolute left-14 theme-panel text-[var(--foreground)] px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg scale-95 group-hover:scale-100">
                Profile
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="relative group flex items-center justify-center w-10 h-10 rounded-xl text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300 hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <div className="absolute left-14 theme-panel text-[var(--foreground)] px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg scale-95 group-hover:scale-100">
                Logout
              </div>
            </button>
          </div>
        </div>
      </SidebarShell>
    );
  }

  return (
    <SidebarShell
      className="border-r border-[var(--sidebar-border)]/70"
      style={{ width: style?.width }}
    >
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[var(--sidebar)] via-[var(--sidebar)]/85 to-transparent p-5 pb-7">
        <button
          onClick={() => navigate(getDefaultRouteForRole(userRole))}
          className="flex items-center gap-3 cursor-pointer theme-glass p-3 rounded-2xl hover:scale-[1.01] group transition-all duration-300"
          title="Go to Dashboard"
        >
          <div className="relative flex-shrink-0">
            <img
              src={modernMedia.logo}
              className="relative h-14 w-14 rounded-lg"
              alt="Learnify logo"
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-[var(--sidebar-foreground)]">Learnify</p>
            <p className="text-xs text-[var(--muted-foreground)]">Empowering Knowledge and Growth</p>
          </div>
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 px-3 py-2 overflow-y-auto scrollbar-sm">
        {filteredRoutes.map((route) => {
          const isActive = getIsActive(route.path, location.pathname);

          return (
            <button
              key={route.path}
              onClick={() =>
                router.replace(
                  route.path,
                  route.name ? route.name : route.path.replace("/", "")
                )
              }
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] font-semibold border border-[var(--sidebar-primary)]/30 shadow-lg"
                  : "text-[var(--sidebar-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]/60 hover:translate-x-0.5"
              }`}
            >
              {/* Active glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-[var(--sidebar-primary)]/15 blur-lg -z-10" />
              )}

              <span
                className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                  isActive ? "text-[var(--sidebar-primary)]" : ""
                }`}
              >
                {route.icon || <Link2 className="w-5 h-5" />}
              </span>
              <span className="truncate text-sm font-medium">
                {route.name || route.path.replace("/", "")}
              </span>

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute right-2 w-1.5 h-6 bg-[var(--sidebar-primary-foreground)]/85 rounded-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[var(--sidebar-border)]/80 p-3 bg-gradient-to-t from-[var(--sidebar)] via-[var(--sidebar)]/90 to-transparent space-y-2">
        {/* Notification Button */}
        <button
          onClick={() => navigate("/notifications")}
          className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--sidebar-accent)]/40 transition-all duration-300 text-[var(--sidebar-foreground)]"
        >
          <span className="flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--destructive)] animate-pulse" />
          </span>
          <span className="truncate text-sm font-medium">Notifications</span>
        </button>

        {/* Profile Button with Role Badge */}
        <button
          onClick={() => navigate("/profile")}
          className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--sidebar-accent)]/40 transition-all duration-300"
        >
          <div className="flex-shrink-0">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[var(--sidebar-primary)] shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sidebar-primary)] to-[var(--accent-foreground)] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || <UserIcon size={18} />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {user?.name || "User"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot}`} />
                {((userRole === "STUDENT" && (user as any)?.currentStatus) ? (user as any).currentStatus.toUpperCase() : userRole) || "GUEST"}
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300 font-medium"
        >
          <span className="flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5">
            <LogOut className="w-5 h-5" />
          </span>
          <span className="truncate text-sm">Logout</span>
        </button>
      </div>
    </SidebarShell>
  );
}

function getIsActive(routePath: string, currentPath: string): boolean {
  if (routePath === currentPath) return true;

  const route = routes.find((r) => r.path === routePath);
  if (!route) return false;

  if (currentPath.startsWith(routePath)) return true;

  return (route.activeFor || []).some((path) => currentPath.startsWith(path));
}
