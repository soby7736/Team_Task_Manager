
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { ROLES } from "../config/roles";

function AdminRoute({ children }) {
  const user = useSelector((state) => state.auth.user);

  // Emily has ID 1.
  // We use our own role rules, not DummyJSON's role field.
  const role =
    user && Number(user.id) === 1
      ? ROLES.ADMIN
      : ROLES.EMPLOYEE;

  if (role !== ROLES.ADMIN) {
    return <Navigate to="/my-tasks" replace />;
  }

  return children;
}

export default AdminRoute;
