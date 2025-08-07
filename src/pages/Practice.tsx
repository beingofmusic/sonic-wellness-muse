import React, { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Play, Zap, Settings, Star } from "lucide-react";
import PracticeGoals from "@/components/practice/goals/PracticeGoals";
const Practice: React.FC = () => {
  useEffect(() => {
    document.title = "Practice Studio | Being of Music";
    const desc = "Start open practice, browse guided routines, or create custom routines. Track goals and stay motivated.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);
  return <Layout>
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Practice Studio
          </h1>
          <p className="text-white/70 text-lg">
            Your personal space to build, practice, and master your musical skills
          </p>
        </div>

        {/* Hero CTAs */}
        <Card className="p-8 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border-white/10 shadow-2xl animate-fade-in">
          <div className="relative mb-8">
            <h2 className="text-xl font-semibold text-center">Ready to Practice?</h2>
            <p className="text-white/60 text-center mt-2">Choose how you'd like to start your musical journey today</p>
            <Link to="/practice/history" className="absolute right-0 top-0">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                View History
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Open Practice */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover-scale">
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
            <div className="group relative overflow-hidden bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl p-6 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10 hover-scale">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-secondary/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Browse Guided Routines</h3>
                <p className="text-sm text-white/60 mb-4">Follow structured routines and templates</p>
                <Link to="/practice/templates">
                  <Button variant="secondary" className="w-full bg-secondary/80 hover:bg-secondary text-white">Explore Library</Button>
                </Link>
              </div>
            </div>

            {/* Custom Routine */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl p-6 border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover-scale">
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

        {/* Practice Goals */}
        <section className="animate-fade-in">
          <PracticeGoals />
        </section>
      </div>
    </Layout>;
};
export default Practice;