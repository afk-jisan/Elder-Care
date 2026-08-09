import {
  Home01Icon,
  UserGroupIcon,
  CheckListIcon,
  Notebook01Icon,
  Location01Icon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons';

export const ROLE_NAV = {
  admin: [
    { to: '/admin', label: 'Overview', end: true, icon: Home01Icon },
    { to: '/admin/users', label: 'Users', icon: UserGroupIcon },
    { to: '/admin/vetting', label: 'Vetting', icon: CheckListIcon },
  ],
  family: [
    { to: '/family', label: 'Overview', end: true, icon: Home01Icon },
    { to: '/family/care-plan', label: 'Care plan', icon: Notebook01Icon },
  ],
  caregiver: [
    { to: '/caregiver', label: 'Overview', end: true, icon: Home01Icon },
    { to: '/caregiver/check-in', label: 'Check-in', icon: Location01Icon },
  ],
  doctor: [
    { to: '/doctor', label: 'Overview', end: true, icon: Home01Icon },
    { to: '/doctor/availability', label: 'Availability', icon: Calendar03Icon },
  ],
};
