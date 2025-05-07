
import React from "react";
import Sidebar from "@/components/Sidebar";
import { Clock, Calendar, Music } from "lucide-react";
import ProgressCard from "@/components/ProgressCard";
import PracticeRoutineCard from "@/components/PracticeRoutineCard";
import CourseProgressCard from "@/components/CourseProgressCard";
import CommunityPostCard from "@/components/CommunityPostCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { profile, isAdmin, isTeamMember, hasPermission } = useAuth();

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Welcome Back, {profile?.username || 'Music Lover'}</h1>
          <p className="text-white/70">{getWelcomeMessage()}</p>
          
          {/* Role-specific action buttons */}
          <div className="flex gap-3 mt-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                  Admin Panel
                </Button>
              </Link>
            )}
            
            {isTeamMember && (
              <Link to="/team">
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                  Team Dashboard
                </Button>
              </Link>
            )}
          </div>
        </header>
        
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ProgressCard
            icon={<Clock className="h-5 w-5 text-music-primary" />}
            title="Total Practice Time"
            value="0 min"
          />
          <ProgressCard
            icon={<Calendar className="h-5 w-5 text-music-secondary" />}
            title="Current Streak"
            value="0 days"
          />
          <ProgressCard
            icon={<Music className="h-5 w-5 text-music-tertiary" />}
            title="Completed Routines"
            value="0"
          />
        </div>
        
        {/* Practice Routines */}
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Your Practice Routines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PracticeRoutineCard
              title="Morning Warmup Routine"
              duration="30 min"
              progress={25}
            />
            <PracticeRoutineCard
              title="Evening Technical Practice"
              duration="45 min"
              progress={15}
            />
          </div>
        </section>
        
        {/* Course Progress */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Course Progress</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Your Courses in Progress</span>
              <button className="text-sm text-white/70 hover:text-white transition-colors">All Courses</button>
            </div>
          </div>
          
          <div className="dashboard-section">
            <CourseProgressCard
              title="Music Theory Fundamentals"
              progress={65}
            />
            <CourseProgressCard
              title="Mindfulness for Musicians"
              progress={30}
              color="bg-music-secondary"
            />
            <CourseProgressCard
              title="Sight Reading Mastery"
              progress={10}
              color="bg-music-tertiary"
            />
          </div>
        </section>
        
        {/* Split Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Practice Leaderboard */}
          <div className="dashboard-section">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Practice Leaderboard</h3>
            </div>
            <p className="text-white/70 text-sm">Inspire. Challenge. Grow together.</p>
            <div className="mt-8 text-center text-white/50">
              <p>Unable to load leaderboard data</p>
            </div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">M.U.S.E. Community Highlights</h2>
            <Button variant="outline" className="text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10">
              Join the conversation
            </Button>
          </div>
          
          <div className="space-y-4">
            <CommunityPostCard
              userName="Bill Chicken"
              timeAgo="30 days ago"
              message="First message..."
              reactionCount={0}
            />
            <CommunityPostCard
              userName="Bill Chicken"
              timeAgo="20 days ago"
              message="Testing..."
              reactionCount={0}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
