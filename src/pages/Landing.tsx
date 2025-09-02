
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, BookOpen, Heart, MessagesSquare, Check, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold bg-gradient-to-r from-music-light via-white to-white/80 bg-clip-text text-transparent mb-6">
                Enhance Your Musical Journey
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                A holistic platform designed for music students to practice effectively,
                nurture wellbeing, and connect with a community of passionate musicians.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button className="music-button px-6 py-6 text-lg">
                    Join Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" className="music-button-secondary px-6 py-6 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-black/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Your All-in-One Musical Companion
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Music className="h-6 w-6 text-music-primary" />}
                title="Interactive Practice Builder"
                description="Create a customized practice routine with our intuitive drag and drop interface. Organize your musical growth efficiently."
              />
              <FeatureCard
                icon={<BookOpen className="h-6 w-6 text-music-primary" />}
                title="Comprehensive Learning"
                description="Access a library of courses, challenges, and educational resources designed to enhance your musical skills."
              />
              <FeatureCard
                icon={<Heart className="h-6 w-6 text-music-primary" />}
                title="Musician's Wellness Hub"
                description="Techniques for physical and mental wellbeing specifically designed for musicians, from breathing exercises to mindfulness practices."
              />
              <FeatureCard
                icon={<MessagesSquare className="h-6 w-6 text-music-primary" />}
                title="M.U.S.E. Community"
                description="Connect with fellow musicians in our vibrant community forum to share experiences, seek advice, and grow together."
              />
              <FeatureCard
                icon={<Check className="h-6 w-6 text-music-primary" />}
                title="Progress Tracking"
                description="Monitor your practice streaks, total hours, and skill development with visual analytics and achievement badges."
              />
              <FeatureCard
                icon={<Music className="h-6 w-6 text-music-primary" />}
                title="Personalized Coaching"
                description="Book one-on-one sessions with experienced music coaches for personalized guidance and feedback."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  Ready to Transform Your Musical Practice?
                </h2>
                <p className="text-white/80 mb-8">
                  Join thousands of students who have improved their skills and wellbeing with Being of Music.
                  Start your journey for free today.
                </p>
                <Link to="/signup">
                  <Button className="music-button px-8 py-6 text-lg">
                    Join the Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;
