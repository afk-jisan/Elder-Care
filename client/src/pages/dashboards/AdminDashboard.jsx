import DashboardLayout from '../../components/DashboardLayout';

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin overview">
      <p>
        Platform operations for Elder Care. Use the sidebar to open Users
        (FR-16) and later vetting, SOS, disputes, and analytics.
      </p>
    </DashboardLayout>
  );
}
