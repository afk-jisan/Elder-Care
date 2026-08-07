import DashboardLayout from '../../components/DashboardLayout';
import PlaceholderPage from '../../components/PlaceholderPage';

export default function AdminUsersPage() {
  return (
    <DashboardLayout title="Users">
      <PlaceholderPage
        featureId="FR-16"
        nextStep="Implement create, edit, and deactivate on branch feature/FR-16-admin-users."
      />
    </DashboardLayout>
  );
}
