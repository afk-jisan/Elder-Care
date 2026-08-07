import DashboardLayout from '../../components/DashboardLayout';
import PlaceholderPage from '../../components/PlaceholderPage';

export default function FamilyCarePlanPage() {
  return (
    <DashboardLayout title="Care plan">
      <PlaceholderPage
        featureId="FR-06"
        nextStep="Implement elder, plan, and caregiver assignment on branch feature/FR-06-care-plan."
      />
    </DashboardLayout>
  );
}
