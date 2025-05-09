
import React from "react";
import { Clock, Calendar, Music, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import PracticeRoutineCard from "@/components/PracticeRoutineCard";
import UserCourseProgress from "@/components/dashboard/UserCourseProgress";
import CommunityPostCard from "@/components/CommunityPostCard";
import PracticeStats from "@/components/practice/stats/PracticeStats";
import PracticeLeaderboard from "@/components/practice/leaderboard/PracticeLeaderboard";
import { useUserRoutines } from "@/hooks/useUserRoutines";

const Dashboard: React.FC = () => {
  const {
    profile,
    isAdmin,
    isTeamMember
  } = useAuth();
  
  // Get user's routines
  const { routines: userRoutines = [], isLoading: loadingRoutines } = useUserRoutines(2); // Limit to 2 for dashboard

  // Get user's full name or fallback to username or a default
  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.first_name) {
      return profile.first_name;
    } else if (profile?.username) {
      return profile.username;
    }
    return 'Music Lover';
  };

  // Custom welcome message based on user role
  const getWelcomeMessage = () => {
    if (isAdmin) {
      return "Welcome to your admin dashboard!";
    } else if (isTeamMember) {
      return "Welcome to your team dashboard!";
    } else {
      return "Here's an overview of your musical journey";
    }
  };
  return <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">Welcome Back, {getFullName()}</h1>
        <p className="text-white/70">{getWelcomeMessage()}</p>
        
        {/* Role-specific action buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          {isAdmin && <Link to="/admin">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                Admin Panel
              </Button>
            </Link>}
          
          {isTeamMember && <Link to="/team">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                Team Dashboard
              </Button>
            </Link>}
        </div>
      </header>
      
      {/* Practice Stats */}
      <div className="mb-8 md:mb-10">
        <PracticeStats />
      </div>
      
      {/* Practice Routines */}
      <section className="mb-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Your Practice Routines</h2>
          <Link to="/practice/builder">
            <Button variant="outline" size="sm" className="text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10">
              <Plus className="h-4 w-4 mr-1" />
              Create Routine
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {loadingRoutines ? (
            // Loading state
            <div className="col-span-2 p-6 rounded-lg bg-white/5 flex items-center justify-center h-36">
              <div className="animate-pulse text-white/70">Loading your routines...</div>
            </div>
          ) : userRoutines.length > 0 ? (
            // Display user routines
            userRoutines.map(routine => (
              <PracticeRoutineCard 
                key={routine.id}
                title={routine.title}
                duration={`${routine.duration} min`}
                progress={routine.progress || 0}
                onContinue={() => window.location.href = `/practice/routine/${routine.id}`}
                onSchedule={() => window.location.href = `/calendar?routine=${routine.id}`}
              />
            ))
          ) : (
            // Empty state
            <div className="col-span-2 p-6 rounded-lg bg-white/5 flex flex-col items-center justify-center h-36">
              <Music className="h-10 w-10 text-white/30 mb-2" />
              <p className="text-center text-white/70 mb-3">No routines yet. Create your first one to begin your musical journey.</p>
              <Link to="/practice/builder">
                <Button 
                  variant="outline" 
                  className="text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create New Routine
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Course Progress - Our updated component will now use real data */}
      <UserCourseProgress />
      
      {/* Split Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Practice Leaderboard */}
        <div className="dashboard-section">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Practice Leaderboard</h3>
          </div>
          <PracticeLeaderboard />
        </div>
        
        {/* Upcoming Events */}
        <div className="dashboard-section">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Upcoming Events</h3>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-xs bg-transparent border border-white/10 hover:bg-white/5 text-white/70">Add Event</Button>
              <Button variant="ghost" className="text-xs bg-transparent border border-white/10 hover:bg-white/5 text-white/70">View All</Button>
            </div>
          </div>
          
          <div className="flex flex-col h-48 items-center justify-center text-center text-white/50">
            <Calendar className="h-12 w-12 mb-2 opacity-30" />
            <p>No upcoming events</p>
            <p className="text-sm">Schedule a practice session</p>
          </div>
        </div>
      </div>
      
      {/* Community Highlights */}
      <section>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-medium">M.U.S.E. Community Highlights</h2>
          <Button variant="outline" className="text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10 mt-2 sm:mt-0">
            Join the conversation
          </Button>
        </div>
        
        <div className="space-y-4">
          <CommunityPostCard userName="Bill Chicken" timeAgo="30 days ago" message="First message..." reactionCount={0} />
          <CommunityPostCard userName="Bill Chicken" timeAgo="20 days ago" message="Testing..." reactionCount={0} />
        </div>
      </section>
    </Layout>;
};
export default Dashboard;
