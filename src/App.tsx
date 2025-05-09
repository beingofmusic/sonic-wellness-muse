
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
              <Route path="/signin" element={<RootRoute component={SignIn} />} />
              <Route path="/signup" element={<RootRoute component={SignUp} />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
              <Route path="/practice" element={<ProtectedRoute component={Practice} />} />
              <Route path="/routine-builder" element={<ProtectedRoute component={RoutineBuilder} />} />
              <Route path="/routine-builder/:routineId" element={<ProtectedRoute component={RoutineBuilder} />} />
              <Route path="/practice/:routineId" element={<ProtectedRoute component={RoutinePlayer} />} />
              <Route path="/practice-history" element={<ProtectedRoute component={PracticeHistory} />} />
              <Route path="/courses" element={<ProtectedRoute component={Courses} />} />
              <Route path="/courses/:courseId" element={<ProtectedRoute component={CourseDetail} />} />
              <Route path="/lessons/:lessonId" element={<ProtectedRoute component={LessonViewer} />} />
              <Route path="/wellness" element={<ProtectedRoute component={Wellness} />} />
              <Route path="/wellness/practice/:practiceId" element={<ProtectedRoute component={WellnessPractice} />} />
              <Route path="/wellness/journal/:promptId?" element={<ProtectedRoute component={JournalingPage} />} />
              <Route path="/calendar" element={<ProtectedRoute component={Calendar} />} />
              <Route path="/community" element={<ProtectedRoute component={Community} />} />
              <Route path="/shop" element={<ProtectedRoute component={Shop} />} />
              <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
              <Route path="/settings" element={<ProtectedRoute component={Settings} />} />
              
              {/* Team/Admin Routes */}
              <Route
                path="/team"
                element={
                  <PermissionRoute
                    component={TeamDashboard}
                    requiredPermission="access_team_dashboard"
                  />
                }
              />
              <Route
                path="/admin"
                element={
                  <PermissionRoute
                    component={AdminPanel}
                    requiredPermission="access_admin"
                  />
                }
              />
              <Route
                path="/courses/manage/:courseId?"
                element={
                  <PermissionRoute
                    component={CourseManagement}
                    requiredPermission="manage_courses"
                  />
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
