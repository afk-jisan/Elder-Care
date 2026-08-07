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
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import FamilyCarePlanPage from './pages/dashboards/FamilyCarePlanPage';
import CaregiverDashboard from './pages/dashboards/CaregiverDashboard';
import CaregiverCheckInPage from './pages/dashboards/CaregiverCheckInPage';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import DoctorAvailabilityPage from './pages/dashboards/DoctorAvailabilityPage';
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
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['family']} />}>
            <Route path="/family" element={<FamilyDashboard />} />
            <Route path="/family/care-plan" element={<FamilyCarePlanPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['caregiver']} />}>
            <Route path="/caregiver" element={<CaregiverDashboard />} />
            <Route
              path="/caregiver/check-in"
              element={<CaregiverCheckInPage />}
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
