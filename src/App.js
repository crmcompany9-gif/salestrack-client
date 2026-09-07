import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CallLogs from './pages/CallLogs';
import Clients from './pages/Clients';
import LogCall from './pages/LogCall';
import Targets from './pages/Targets';
import Team from './pages/Team';
import ChangePassword from './pages/ChangePassword';

const Private = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const ManagerOnly = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'manager' ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><Layout /></Private>}>
          <Route index element={<Dashboard />} />
          <Route path="calls"   element={<CallLogs />} />
          <Route path="clients" element={<Clients />} />
          <Route path="log"     element={<LogCall />} />
          <Route path="password" element={<ChangePassword />} />  
          <Route path="targets" element={<ManagerOnly><Targets /></ManagerOnly>} />
          <Route path="team"    element={<ManagerOnly><Team /></ManagerOnly>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
