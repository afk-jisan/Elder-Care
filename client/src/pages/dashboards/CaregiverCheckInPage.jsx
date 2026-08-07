import DashboardLayout from '../../components/DashboardLayout';
import PlaceholderPage from '../../components/PlaceholderPage';

export default function CaregiverCheckInPage() {
  return (
    <DashboardLayout title="Check-in">
      <PlaceholderPage
        featureId="FR-01"
        nextStep="Implement GeoIP check-in/out on branch feature/FR-01-check-in."
      />
    </DashboardLayout>
  );
}
