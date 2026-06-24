import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ReadinessDashboard from './pages/ReadinessDashboard';
import SkillGapAnalyzer from './pages/SkillGapAnalyzer';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AIRoadmap from './pages/AIRoadmap';
import MockInterview from './pages/MockInterview';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Application Layout Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="readiness" element={<ReadinessDashboard />} />
            <Route path="skills" element={<SkillGapAnalyzer />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="roadmap" element={<AIRoadmap />} />
            <Route path="interview" element={<MockInterview />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
