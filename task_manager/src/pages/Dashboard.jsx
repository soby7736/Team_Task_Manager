
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../services/authService";
import { clearCredentials } from "../redux/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  function handleLogout() {
    // Step 1: Remove token
    logout();

    // Step 2: Clear Redux state
    dispatch(clearCredentials());

    // Step 3: Navigate to login
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.firstName || "User"}!
      </h1>

      <p className="mb-6">
        You are successfully logged in.
      </p>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
