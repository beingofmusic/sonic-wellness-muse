
import React from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Play, Zap, Settings, Star } from "lucide-react";
import FeaturedTemplates from "@/components/practice/FeaturedTemplates";
import MyRoutines from "@/components/practice/MyRoutines";
import PracticeGoals from "@/components/practice/goals/PracticeGoals";

const Practice: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Practice Studio
          </h1>
          <p className="text-white/70 text-lg">
            Your personal space to build, practice, and master your musical skills
          </p>
        </div>

        {/* Hero CTAs */}
        <Card className="p-8 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Ready to Practice?</h2>
            <p className="text-white/60">Choose how you'd like to start your musical journey today</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Open Practice */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-primary/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Begin Open Practice</h3>
                <p className="text-sm text-white/60 mb-4">Free-form practice session with tools and timer</p>
                <Link to="/practice/routine/open-practice">
                  <Button className="w-full bg-primary/80 hover:bg-primary text-white">
                    Start Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Guided Practice */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl p-6 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-secondary/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Begin Guided Practice</h3>
                <p className="text-sm text-white/60 mb-4">Follow structured routines and templates</p>
                <Link to="/practice/templates">
                  <Button variant="secondary" className="w-full bg-secondary/80 hover:bg-secondary text-white">
                    Start Guided
                  </Button>
                </Link>
              </div>
            </div>

            {/* Custom Routine */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl p-6 border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-accent/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Create Custom Routine</h3>
                <p className="text-sm text-white/60 mb-4">Build your own practice routine manually or with AI</p>
                <div className="flex gap-2">
                  <Link to="/practice/routine-builder" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-accent/30 hover:bg-accent/10">
                      Manual
                    </Button>
                  </Link>
                  <Link to="/practice/ai-routine" className="flex-1">
                    <Button size="sm" className="w-full bg-accent/80 hover:bg-accent text-white">
                      <Zap className="h-3 w-3 mr-1" />
                      AI
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Secondary Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Practice Hub</h2>
          <Link to="/practice/history">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              View History
            </Button>
          </Link>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Featured Templates */}
          <section>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Featured Practice Templates</h3>
              <p className="text-white/60">Discover popular and effective practice routines created by music educators</p>
            </div>
            <FeaturedTemplates />
          </section>

          {/* My Routines */}
          <section>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Saved Routines</h3>
              <p className="text-white/60">Continue working on your custom practice routines</p>
            </div>
            <MyRoutines />
          </section>

          {/* Practice Goals */}
          <section>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Practice Goals</h3>
              <p className="text-white/60">Track your progress and stay motivated with personalized goals</p>
            </div>
            <PracticeGoals />
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Practice;
