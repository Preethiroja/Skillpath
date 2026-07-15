import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SocketProvider } from './context/SocketContext';

// Pages import
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PathsList from './pages/PathsList';
import LearningPathDetail from './pages/LearningPathDetail';
import AiMentor from './pages/AiMentor';
import QuizViewer from './pages/QuizViewer';
import ResumeReviewer from './pages/ResumeReviewer';
import LiveSupportChat from './pages/LiveSupportChat';
import Certificates from './pages/Certificates';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminMentors from './pages/AdminMentors';
import AdminCourses from './pages/AdminCourses';
import AdminResources from './pages/AdminResources';
import ProfilePage from './pages/ProfilePage';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';
import StudyTimer from './pages/StudyTimer';
import Notes from './pages/Notes';
import Wishlist from './pages/Wishlist';
import CareerDiscovery from './pages/CareerDiscovery';
import Assessment from './pages/Assessment';
import AssessmentReport from './pages/AssessmentReport';

// Protected Route components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paths"
            element={
              <ProtectedRoute>
                <PathsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paths/:id"
            element={
              <ProtectedRoute>
                <LearningPathDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-mentor"
            element={
              <ProtectedRoute>
                <AiMentor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-viewer"
            element={
              <ProtectedRoute>
                <QuizViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-reviewer"
            element={
              <ProtectedRoute>
                <ResumeReviewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-chat"
            element={
              <ProtectedRoute>
                <LiveSupportChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Badges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-timer"
            element={
              <ProtectedRoute>
                <StudyTimer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-discovery"
            element={
              <ProtectedRoute>
                <CareerDiscovery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:id/report"
            element={
              <ProtectedRoute>
                <AssessmentReport />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <AdminRoute>
                <AdminStudents />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/mentors"
            element={
              <AdminRoute>
                <AdminMentors />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <AdminCourses />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <AdminRoute>
                <AdminResources />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;
