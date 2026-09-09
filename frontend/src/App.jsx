import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RegisterCadet from './pages/RegisterCadet';
import RegisterMentor from './pages/RegisterMentor';
import AdminHome from './pages/AdminHome';
import MentorHome from './pages/MentorHome';
import CadetHome from './pages/CadetHome';
import Leaderboard from './pages/Leaderboard';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'var(--paper-dim)', padding: 40 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/cadet" element={<RegisterCadet />} />
          <Route path="/register/mentor" element={<RegisterMentor />} />

          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/admin" element={<ProtectedRoute allowRoles={['admin']}><AdminHome /></ProtectedRoute>} />
            <Route path="/mentor" element={<ProtectedRoute allowRoles={['mentor']}><MentorHome /></ProtectedRoute>} />
            <Route path="/cadet" element={<ProtectedRoute allowRoles={['cadet']}><CadetHome /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>

          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
