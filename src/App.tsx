
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './App.css';

// Auth Provider
import { AuthProvider } from './context/AuthContext';

// Toast Provider
import { Toaster } from './components/ui/toaster';

// AI Assistant Provider
import { AIAssistantProvider, AIAssistant } from './components/AIAssistant';

// Routes
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import RoutineBuilder from './pages/RoutineBuilder';
import RoutinePlayer from './pages/RoutinePlayer';
import PracticeHistory from './pages/PracticeHistory';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import CourseManagement from './pages/CourseManagement';
import Wellness from './pages/Wellness';
import WellnessPractice from './pages/wellness/WellnessPractice';
import JournalingPage from './pages/wellness/JournalingPage';
import Calendar from './pages/Calendar';
import Community from './pages/Community';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import TeamDashboard from './pages/TeamDashboard';
import AdminPanel from './pages/AdminPanel';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';
import RootRoute from './components/RootRoute';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AIAssistantProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<RootRoute><SignIn /></RootRoute>} />
              <Route path="/signup" element={<RootRoute><SignUp /></RootRoute>} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
              <Route path="/routine-builder" element={<ProtectedRoute><RoutineBuilder /></ProtectedRoute>} />
              <Route path="/routine-builder/:routineId" element={<ProtectedRoute><RoutineBuilder /></ProtectedRoute>} />
              <Route path="/practice/:routineId" element={<ProtectedRoute><RoutinePlayer /></ProtectedRoute>} />
              <Route path="/practice-history" element={<ProtectedRoute><PracticeHistory /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/lessons/:lessonId" element={<ProtectedRoute><LessonViewer /></ProtectedRoute>} />
              <Route path="/wellness" element={<ProtectedRoute><Wellness /></ProtectedRoute>} />
              <Route path="/wellness/practice/:practiceId" element={<ProtectedRoute><WellnessPractice /></ProtectedRoute>} />
              <Route path="/wellness/journal/:promptId?" element={<ProtectedRoute><JournalingPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              {/* Team/Admin Routes */}
              <Route
                path="/team"
                element={
                  <PermissionRoute requiredPermission="access_team_dashboard">
                    <TeamDashboard />
                  </PermissionRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PermissionRoute requiredPermission="access_admin">
                    <AdminPanel />
                  </PermissionRoute>
                }
              />
              <Route
                path="/courses/manage/:courseId?"
                element={
                  <PermissionRoute requiredPermission="manage_courses">
                    <CourseManagement />
                  </PermissionRoute>
                }
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          
            {/* AI Assistant available on all pages */}
            <AIAssistant />
          
            <Toaster />
          </Router>
        </AIAssistantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
