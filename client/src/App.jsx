import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SharedDocumentPage from './pages/SharedDocumentPage';
import RoleHomeRedirect from './pages/RoleHomeRedirect';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminUsersPage from './pages/dashboards/AdminUsersPage';
import AdminVettingPage from './pages/dashboards/AdminVettingPage';
import AdminDisputesPage from './pages/dashboards/AdminDisputesPage';
import AdminSosPage from './pages/dashboards/AdminSosPage';
import AdminAnalyticsPage from './pages/dashboards/AdminAnalyticsPage';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import FamilyCarePlanPage from './pages/dashboards/FamilyCarePlanPage';
import FamilyCareFeedPage from './pages/dashboards/FamilyCareFeedPage';
import FamilyVaultPage from './pages/dashboards/FamilyVaultPage';
import FamilyWalletPage from './pages/dashboards/FamilyWalletPage';
import FamilyUtilitiesPage from './pages/dashboards/FamilyUtilitiesPage';
import FamilySessionsPage from './pages/dashboards/FamilySessionsPage';
import CaregiverDashboard from './pages/dashboards/CaregiverDashboard';
import CaregiverCheckInPage from './pages/dashboards/CaregiverCheckInPage';
import CaregiverTasksPage from './pages/dashboards/CaregiverTasksPage';
import CaregiverVitalsPage from './pages/dashboards/CaregiverVitalsPage';
import CaregiverPrescriptionsPage from './pages/dashboards/CaregiverPrescriptionsPage';
import CaregiverVideoPage from './pages/dashboards/CaregiverVideoPage';
import CaregiverPaymentsPage from './pages/dashboards/CaregiverPaymentsPage';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import DoctorAvailabilityPage from './pages/dashboards/DoctorAvailabilityPage';
import DoctorSessionsPage from './pages/dashboards/DoctorSessionsPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/share/:token" element={<SharedDocumentPage />} />
          <Route path="/dashboard" element={<RoleHomeRedirect />} />
          <Route element={<PublicOnlyRoute />}>
            <Route
              path="/login"
              element={
                <div className="app-auth">
                  <LoginPage />
                </div>
              }
            />
            <Route
              path="/register"
              element={
                <div className="app-auth">
                  <RegisterPage />
                </div>
              }
            />
          </Route>
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['admin', 'family', 'caregiver', 'doctor']}
              />
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/vetting" element={<AdminVettingPage />} />
            <Route path="/admin/disputes" element={<AdminDisputesPage />} />
            <Route path="/admin/sos" element={<AdminSosPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['family']} />}>
            <Route path="/family" element={<FamilyDashboard />} />
            <Route path="/family/care-plan" element={<FamilyCarePlanPage />} />
            <Route path="/family/feed" element={<FamilyCareFeedPage />} />
            <Route path="/family/vault" element={<FamilyVaultPage />} />
            <Route path="/family/wallet" element={<FamilyWalletPage />} />
            <Route path="/family/utilities" element={<FamilyUtilitiesPage />} />
            <Route path="/family/sessions" element={<FamilySessionsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['caregiver']} />}>
            <Route path="/caregiver" element={<CaregiverDashboard />} />
            <Route
              path="/caregiver/check-in"
              element={<CaregiverCheckInPage />}
            />
            <Route path="/caregiver/tasks" element={<CaregiverTasksPage />} />
            <Route path="/caregiver/vitals" element={<CaregiverVitalsPage />} />
            <Route
              path="/caregiver/prescriptions"
              element={<CaregiverPrescriptionsPage />}
            />
            <Route path="/caregiver/video" element={<CaregiverVideoPage />} />
            <Route
              path="/caregiver/payments"
              element={<CaregiverPaymentsPage />}
            />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route
              path="/doctor/availability"
              element={<DoctorAvailabilityPage />}
            />
            <Route path="/doctor/sessions" element={<DoctorSessionsPage />} />
          </Route>
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
