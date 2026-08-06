import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleHomeRedirect from './pages/RoleHomeRedirect';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import CaregiverDashboard from './pages/dashboards/CaregiverDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<RoleHomeRedirect />} />
            <Route path="/dashboard" element={<RoleHomeRedirect />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['family']} />}>
              <Route path="/family" element={<FamilyDashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['caregiver']} />}>
              <Route path="/caregiver" element={<CaregiverDashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
            </Route>
            <Route path="*" element={<RoleHomeRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
