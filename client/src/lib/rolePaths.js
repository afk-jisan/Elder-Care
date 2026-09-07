export const ROLE_HOME = {
  admin: '/admin',
  family: '/family/care-plan',
  caregiver: '/caregiver',
  doctor: '/doctor/sessions',
};

export function homePathForRole(role) {
  return ROLE_HOME[role] ?? '/login';
}
