
import { useEffect, useState } from "react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { logout } from "../services/authService";
import { clearCredentials } from "../redux/authSlice";
import { isAdmin } from "../config/roles";

function MainLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useSelector(
    (state) => state.auth.user
  );

  const admin = isAdmin(user);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scrolling while mobile menu is open
  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  // Close menu with Escape key
  useEffect(() => {
    if (!sidebarOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen]);

  function handleLogout() {
    setSidebarOpen(false);

    logout();
    dispatch(clearCredentials());

    navigate("/login", { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top navbar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-30">

        {/* Left side */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="main-sidebar"
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-blue-600 truncate">
            Task Manager
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-[100px] sm:max-w-[180px]">
              Hi, {user?.firstName || "User"}
            </p>

            <p className="text-[11px] text-slate-500">
              {admin ? "Administrator" : "Employee"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
        />
      )}

      {/* Main layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">

        {/* Responsive sidebar */}
        <aside
          id="main-sidebar"
          aria-label="Main navigation"
          className={`
            fixed lg:sticky
            top-0 lg:top-16
            left-0
            z-50 lg:z-20
            h-screen lg:h-[calc(100vh-4rem)]
            w-64 lg:w-52 xl:w-56
            shrink-0
            bg-white
            border-r border-slate-200
            overflow-y-auto
            transition-transform duration-300 ease-in-out
            lg:translate-x-0
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 lg:hidden">
            <span className="text-lg font-bold text-blue-600">
              Task Manager
            </span>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex flex-col gap-1.5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-3">
              Navigation
            </p>

            {admin ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                  Dashboard
                </NavLink>

                <NavLink
                  to="/projects"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                  </svg>
                  Projects
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/my-tasks"
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="m8 12 2 2 4-4" />
                  <path d="M8 17h8" />
                </svg>
                My Assigned Tasks
              </NavLink>
            )}
          </nav>
        </aside>

        {/* Responsive page content */}
        <main className="flex-1 min-w-0 w-full p-3 sm:p-4 lg:p-5 xl:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
