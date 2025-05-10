
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Practice from './pages/Practice';
import PracticeHistory from './pages/PracticeHistory';
import RoutineBuilder from './pages/RoutineBuilder';
import RoutinePlayer from './pages/RoutinePlayer';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Community from './pages/Community';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';
import AdminPanel from './pages/AdminPanel';
import TeamDashboard from './pages/TeamDashboard';
import CourseManagement from './pages/CourseManagement';
import LessonViewer from './pages/LessonViewer';
import './App.css';
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import RootRoute from './components/RootRoute';
import Wellness from './pages/Wellness';
import WellnessPractice from './pages/wellness/WellnessPractice';
import JournalingPage from './pages/wellness/JournalingPage';
import Journal from './pages/Journal';
import JournalSection from './pages/JournalSection';
import JournalPrompt from './pages/JournalPrompt';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/practice" element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            } />
            <Route path="/practice/history" element={
              <ProtectedRoute>
                <PracticeHistory />
              </ProtectedRoute>
            } />
            <Route path="/practice/routine/:id" element={
              <ProtectedRoute>
                <RoutineBuilder />
              </ProtectedRoute>
            } />
            <Route path="/practice/play/:id" element={
              <ProtectedRoute>
                <RoutinePlayer />
              </ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            } />
            <Route path="/courses/:id" element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            } />
            <Route path="/courses/:courseId/lessons/:lessonId" element={
              <ProtectedRoute>
                <LessonViewer />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/shop" element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            } />
            <Route path="/wellness" element={
              <ProtectedRoute>
                <Wellness />
              </ProtectedRoute>
            } />
            <Route path="/wellness/practice/:id" element={
              <ProtectedRoute>
                <WellnessPractice />
              </ProtectedRoute>
            } />
            <Route path="/wellness/journal/:id" element={
              <ProtectedRoute>
                <JournalingPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Journal routes */}
            <Route path="/journal" element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            } />
            <Route path="/journal/:section" element={
              <ProtectedRoute>
                <JournalSection />
              </ProtectedRoute>
            } />
            <Route path="/journal/prompt/:id" element={
              <ProtectedRoute>
                <JournalPrompt />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/courses" element={
              <PermissionRoute permission="manage_courses">
                <CourseManagement />
              </PermissionRoute>
            } />
            
            <Route path="/admin" element={
              <PermissionRoute permission="admin">
                <AdminPanel />
              </PermissionRoute>
            } />
            
            <Route path="/team" element={
              <PermissionRoute permission="team">
                <TeamDashboard />
              </PermissionRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
