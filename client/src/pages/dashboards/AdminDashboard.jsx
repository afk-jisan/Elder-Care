import DashboardLayout from '../../components/DashboardLayout';

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin overview">
      <p>
        Platform operations for Elder Care. Use <strong>Users</strong> for
        accounts (FR-16) and <strong>Vetting</strong> for the caregiver
        background pipeline (FR-17). Only activated caregivers appear in the
        family assignment pool.
      </p>
    </DashboardLayout>
  );
}
