import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Search,
  Sun,
  Ticket,
  UserCircle
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const adminNavigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "All Tickets",
    href: "/tickets",
    icon: Ticket,
  },
  {
    label: "Create Ticket",
    href: "/tickets/new",
    icon: PlusCircle,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

const agentNavigation = [
  {
    label: "Agent Dashboard",
    href: "/agent",
    icon: LayoutDashboard,
  },
  {
    label: "Assigned Tickets",
    href: "/tickets",
    icon: Ticket,
  },
];

const employeeNavigation = [
  {
    label: "My Dashboard",
    href: "/employee",
    icon: LayoutDashboard,
  },
  {
    label: "My Tickets",
    href: "/tickets",
    icon: Ticket,
  },
  {
    label: "Create Ticket",
    href: "/tickets/new",
    icon: PlusCircle,
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation =
    user?.role === "ADMIN"
      ? adminNavigation
      : user?.role === "AGENT"
      ? agentNavigation
      : employeeNavigation;

  function toggleDarkMode() {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-all duration-300 lg:block dark:border-slate-800 dark:bg-slate-950/90",
          collapsed ? "w-24" : "w-72"
        )}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="flex items-center justify-between">
            <Link
              to={
                user?.role === "ADMIN"
                  ? "/admin"
                  : user?.role === "AGENT"
                  ? "/agent"
                  : "/employee"
              }
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Ticket className="h-5 w-5" />
              </div>

              {!collapsed ? (
                <div>
                  <p className="text-sm font-bold tracking-tight">
                    ERP Desk
                  </p>
                  <p className="text-xs text-slate-500">
                    Command center
                  </p>
                </div>
              ) : null}
            </Link>

            <button
              className="btn-secondary h-9 w-9 px-0"
              onClick={() =>
                setCollapsed((value) => !value)
              }
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-200 dark:bg-white dark:text-slate-950 dark:shadow-none"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed ? (
                  <span>{item.label}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            {!collapsed ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Signed in
                </p>

                <p className="mt-2 truncate text-sm font-bold text-slate-900 dark:text-white">
                  {user?.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.role}
                </p>
              </>
            ) : (
              <UserCircle className="mx-auto h-6 w-6 text-slate-500" />
            )}
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 p-4 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="h-full w-72 rounded-3xl bg-white p-4 dark:bg-slate-950"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <nav className="mt-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <div
        className={clsx(
          "transition-all duration-300",
          collapsed ? "lg:pl-24" : "lg:pl-72"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/75 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
          <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              className="btn-secondary h-10 w-10 px-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden flex-1 md:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                className="input max-w-xl pl-11"
                placeholder="Search tickets, users, departments..."
              />
            </div>

            <button
              className="btn-secondary h-10 w-10 px-0"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button className="btn-secondary h-10 w-10 px-0">
              <Bell className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <UserCircle className="h-5 w-5" />
              </div>

              <div className="max-w-36">
                <p className="truncate text-sm font-semibold">
                  {user?.name}
                </p>

                <p className="text-xs text-slate-500">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              className="btn-secondary h-10 w-10 px-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}