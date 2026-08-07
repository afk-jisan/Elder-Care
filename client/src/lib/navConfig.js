export const ROLE_NAV = {
  admin: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/users', label: 'Users' },
  ],
  family: [
    { to: '/family', label: 'Overview', end: true },
    { to: '/family/care-plan', label: 'Care plan' },
  ],
  caregiver: [
    { to: '/caregiver', label: 'Overview', end: true },
    { to: '/caregiver/check-in', label: 'Check-in' },
  ],
  doctor: [
    { to: '/doctor', label: 'Overview', end: true },
    { to: '/doctor/availability', label: 'Availability' },
  ],
};
