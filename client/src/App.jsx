import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleHomeRedirect from './pages/RoleHomeRedirect';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminUsersPage from './pages/dashboards/AdminUsersPage';
import AdminVettingPage from './pages/dashboards/AdminVettingPage';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import FamilyCarePlanPage from './pages/dashboards/FamilyCarePlanPage';
import FamilyCareFeedPage from './pages/dashboards/FamilyCareFeedPage';
import FamilyVaultPage from './pages/dashboards/FamilyVaultPage';
import CaregiverDashboard from './pages/dashboards/CaregiverDashboard';
import CaregiverCheckInPage from './pages/dashboards/CaregiverCheckInPage';
import CaregiverTasksPage from './pages/dashboards/CaregiverTasksPage';
import CaregiverVitalsPage from './pages/dashboards/CaregiverVitalsPage';
import CaregiverPrescriptionsPage from './pages/dashboards/CaregiverPrescriptionsPage';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import DoctorAvailabilityPage from './pages/dashboards/DoctorAvailabilityPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleHomeRedirect />} />
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
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['family']} />}>
            <Route path="/family" element={<FamilyDashboard />} />
            <Route path="/family/care-plan" element={<FamilyCarePlanPage />} />
            <Route path="/family/feed" element={<FamilyCareFeedPage />} />
            <Route path="/family/vault" element={<FamilyVaultPage />} />
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
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route
              path="/doctor/availability"
              element={<DoctorAvailabilityPage />}
            />
          </Route>
          <Route path="*" element={<RoleHomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
