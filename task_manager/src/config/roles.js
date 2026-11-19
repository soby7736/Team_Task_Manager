
export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
};

// Only Emily Johnson is our application's admin
export const ADMIN_USER_ID = 1;

export function getUserRole(user) {
  if (!user) {
    return null;
  }

  // Check the logged-in user's ID
  if (Number(user.id) === ADMIN_USER_ID) {
    return ROLES.ADMIN;
  }

  // Everyone else is an employee
  return ROLES.EMPLOYEE;
}

export function isAdmin(user) {
  return getUserRole(user) === ROLES.ADMIN;
}
