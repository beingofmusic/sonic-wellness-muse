
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="py-24 px-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-background to-background/50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-music-primary to-purple-500">
              Elevate Your Musical Journey
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Structured practice, guided wellness, and a supportive community for musicians at every stage of development.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button className="music-button px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="outline" className="px-8 py-6 text-lg border-white/10 bg-white/5 hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 px-6 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Designed for Your Musical Growth
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-card/50 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="bg-music-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-music-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Structured Practice</h3>
                <p className="text-white/70">
                  Create personalized practice routines with our drag-and-drop builder and track your progress over time.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="p-6 bg-card/50 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Wellness Hub</h3>
                <p className="text-white/70">
                  Access guided meditations, stretching routines, and mental performance techniques designed for musicians.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="p-6 bg-card/50 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="bg-pink-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">M.U.S.E Community</h3>
                <p className="text-white/70">
                  Connect with fellow musicians, share your progress, and get support from a community that understands your journey.
                </p>
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
