
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionRoute from "@/components/PermissionRoute";
import RootRoute from "@/components/RootRoute";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminPanel from "./pages/AdminPanel";
import TeamDashboard from "./pages/TeamDashboard";
import Practice from "./pages/Practice";
import RoutineBuilder from "./pages/RoutineBuilder";
import RoutinePlayer from "./pages/RoutinePlayer";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LessonViewer from "./pages/LessonViewer";
import CourseManagement from "./pages/CourseManagement";
import Community from "./pages/Community";
import Wellness from "./pages/Wellness";
import Calendar from "./pages/Calendar";
import Shop from "./pages/Shop";
import Settings from "./pages/Settings";
import PracticeHistory from "./pages/PracticeHistory";
import Profile from "./pages/Profile";
// Import new wellness pages
import WellnessPractice from "./pages/wellness/WellnessPractice";
import JournalingPage from "./pages/wellness/JournalingPage";

// Placeholder page for templates list - will be implemented later
const TemplatesList = () => <div className="p-6"><h1>All Templates</h1><p>Coming soon</p></div>;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice" 
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice/history" 
              element={
                <ProtectedRoute>
                  <PracticeHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice/builder" 
              element={
                <ProtectedRoute>
                  <RoutineBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice/builder/:id" 
              element={
                <ProtectedRoute>
                  <RoutineBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice/routine/:id" 
              element={
                <ProtectedRoute>
                  <RoutinePlayer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice/template/:id" 
              element={
                <ProtectedRoute>
                  <RoutinePlayer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice/templates" 
              element={
                <ProtectedRoute>
                  <TemplatesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/manage" 
              element={
                <ProtectedRoute>
                  <PermissionRoute permission="manage_courses">
                    <CourseManagement />
                  </PermissionRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId" 
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/lessons/:lessonId" 
              element={
                <ProtectedRoute>
                  <LessonViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wellness" 
              element={
                <ProtectedRoute>
                  <Wellness />
                </ProtectedRoute>
              } 
            />
            {/* New wellness routes */}
            <Route 
              path="/wellness/practice/:id" 
              element={
                <ProtectedRoute>
                  <WellnessPractice />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wellness/journal/:id" 
              element={
                <ProtectedRoute>
                  <JournalingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop" 
              element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <PermissionRoute permission="manage_users">
                    <AdminPanel />
                  </PermissionRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <PermissionRoute permission="contribute_content">
                    <TeamDashboard />
                  </PermissionRoute>
                </ProtectedRoute>
              } 
            />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
