export const ROLE_HOME = {
  admin: '/admin',
  family: '/family',
  caregiver: '/caregiver',
  doctor: '/doctor',
};

export function homePathForRole(role) {
  return ROLE_HOME[role] ?? '/login';
}
