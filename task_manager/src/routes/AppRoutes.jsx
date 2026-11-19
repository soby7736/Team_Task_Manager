
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import TaskDetails from "../pages/TaskDetails";
import MyTasks from "../pages/MyTasks";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Routes requiring login */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin-only dashboard */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          {/* Admin-only projects */}
          <Route
            path="/projects"
            element={
              <AdminRoute>
                <Projects />
              </AdminRoute>
            }
          />

          {/* Admin-only project details */}
          <Route
            path="/projects/:id"
            element={
              <AdminRoute>
                <ProjectDetails />
              </AdminRoute>
            }
          />

          {/* Admin-only task management */}
          <Route
            path="/projects/:id/tasks/:taskId"
            element={
              <AdminRoute>
                <TaskDetails />
              </AdminRoute>
            }
          />

          {/* Employee task list */}
          <Route
            path="/my-tasks"
            element={<MyTasks />}
          />
        </Route>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
