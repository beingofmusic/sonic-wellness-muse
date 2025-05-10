import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
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

// Import our new journal pages
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
  const [isInitialized, setIsInitialized] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
      >
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/history" element={<PracticeHistory />} />
            <Route path="/practice/routine/:id" element={<RoutineBuilder />} />
            <Route path="/practice/play/:id" element={<RoutinePlayer />} />
            <Route path="/community" element={<Community />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/wellness/practice/:id" element={<WellnessPractice />} />
            <Route path="/wellness/journal/:id" element={<JournalingPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Add new routes for the Musical Self-Composition Suite */}
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:section" element={<JournalSection />} />
            <Route path="/journal/prompt/:id" element={<JournalPrompt />} />
            
            <Route element={<PermissionRoute permission="manage_courses" />}>
              <Route path="/admin/courses" element={<CourseManagement />} />
            </Route>

            <Route element={<PermissionRoute permission="admin" />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            <Route element={<PermissionRoute permission="team" />}>
              <Route path="/team" element={<TeamDashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
