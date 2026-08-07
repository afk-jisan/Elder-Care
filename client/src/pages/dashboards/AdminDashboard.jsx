import DashboardLayout from '../../components/DashboardLayout';

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin overview">
      <p>
        Platform operations for Elder Care. Open <strong>Users</strong> in the
        sidebar to create, edit, or deactivate accounts (FR-16). History is kept
        when an account is deactivated.
      </p>
    </DashboardLayout>
  );
}
