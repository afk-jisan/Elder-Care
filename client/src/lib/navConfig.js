import {
  Home01Icon,
  UserGroupIcon,
  CheckListIcon,
  Notebook01Icon,
  NewsIcon,
  FolderLibraryIcon,
  Wallet01Icon,
  Invoice01Icon,
  Location01Icon,
  TaskDaily01Icon,
  HealthIcon,
  PrescriptionIcon,
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
    { to: '/family/feed', label: 'Care feed', icon: NewsIcon },
    { to: '/family/vault', label: 'Vault', icon: FolderLibraryIcon },
    { to: '/family/wallet', label: 'Wallet', icon: Wallet01Icon },
    { to: '/family/utilities', label: 'Utilities', icon: Invoice01Icon },
  ],
  caregiver: [
    { to: '/caregiver', label: 'Overview', end: true, icon: Home01Icon },
    { to: '/caregiver/check-in', label: 'Check-in', icon: Location01Icon },
    { to: '/caregiver/tasks', label: 'Tasks', icon: TaskDaily01Icon },
    { to: '/caregiver/vitals', label: 'Vitals', icon: HealthIcon },
    {
      to: '/caregiver/prescriptions',
      label: 'Prescriptions',
      icon: PrescriptionIcon,
    },
  ],
  doctor: [
    { to: '/doctor', label: 'Overview', end: true, icon: Home01Icon },
    { to: '/doctor/availability', label: 'Availability', icon: Calendar03Icon },
  ],
};
