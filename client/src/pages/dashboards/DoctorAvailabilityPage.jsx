import DashboardLayout from '../../components/DashboardLayout';
import PlaceholderPage from '../../components/PlaceholderPage';

export default function DoctorAvailabilityPage() {
  return (
    <DashboardLayout title="Availability">
      <PlaceholderPage
        featureId="FR-14"
        nextStep="Implement day and time availability on branch feature/FR-14-availability."
      />
    </DashboardLayout>
  );
}
