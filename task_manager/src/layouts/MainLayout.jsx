
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../services/authService";
import { clearCredentials } from "../redux/authSlice";

function MainLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  function handleLogout() {
    logout();
    dispatch(clearCredentials());
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">
          Task Manager
        </h1>

        <div className="flex items-center gap-4">
          <span>Hi, {user?.firstName || "User"}</span>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow p-5">
          <nav className="flex flex-col gap-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-gray-600"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-gray-600"
              }
            >
              Projects
            </NavLink>
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
