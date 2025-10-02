import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Session from './pages/Session.jsx';
import ParticipantJoin from './pages/ParticipantJoin.jsx';
import ParticipantPoll from './pages/ParticipantPoll.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="loading-container">Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join" element={<ParticipantJoin />} />
          <Route path="/participant/:session_id" element={<ParticipantPoll />} />
          
          {/* Protected Routes (Host only) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/session/:session_id" element={
            <ProtectedRoute>
              <Session />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;