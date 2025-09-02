import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const Pricing: React.FC = () => {
  const { user, profile } = useAuth();
  const isSupportingMember = profile?.membership_tier === 'supporting_member';

  const features = {
    free: [
      "Core practice tools & timer",
      "Basic routine builder",
      "M.U.S.E. Community access", 
      "Basic progress tracking",
      "Course previews",
      "Basic wellness practices"
    ],
    pro: [
      "Everything in Free",
      "AI-powered routine generation",
      "Full course library access",
      "Premium wellness content",
      "Advanced analytics & insights",
      "Priority community support",
      "Supporting Member badge",
      "Exclusive content & early access",
      "Coaching session discounts",
      "Advanced goal tracking"
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">
              Choose Your Musical Journey
            </h1>
            <p className="text-lg text-white/80">
              Start free and upgrade to Supporting Member when you're ready for premium features and to support our mission.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="bg-card/50 backdrop-blur-sm border border-white/20 relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Free</CardTitle>
                <CardDescription className="text-white/70">
                  Perfect for getting started
                </CardDescription>
                <div className="py-4">
                  <span className="text-4xl font-bold">Free</span>
                  <p className="text-white/60 text-sm mt-2">Always free, forever</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-music-primary flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                {!user ? (
                  <Link to="/signup">
                    <Button className="w-full music-button py-3">
                      Join Free
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full py-3">
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Supporting Member Tier */}
            <Card className="bg-card/50 backdrop-blur-sm border border-music-primary relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-music-primary text-white px-3 py-1 text-xs font-semibold">
                MOST POPULAR
              </div>
              
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-6 w-6 text-music-primary" />
                  <CardTitle className="text-2xl">Supporting Member</CardTitle>
                  <Star className="h-6 w-6 text-music-primary" />
                </div>
                <CardDescription className="text-white/70">
                  Full access + support our mission
                </CardDescription>
                <div className="py-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-4xl font-bold">$19</span>
                      <span className="text-white/60">/month</span>
                    </div>
                    <div className="text-white/60">
                      or <span className="font-semibold">$159/year</span> (save $69)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {features.pro.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-music-primary flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                {!user ? (
                  <Link to="/signup">
                    <Button className="w-full music-button py-3">
                      Start Free, Upgrade Later
                    </Button>
                  </Link>
                ) : isSupportingMember ? (
                  <div className="space-y-2">
                    <Button disabled className="w-full py-3">
                      Current Plan
                    </Button>
                    <p className="text-center text-sm text-white/60">
                      Thank you for supporting our mission! 💚
                    </p>
                  </div>
                ) : (
                  <Button className="w-full music-button py-3">
                    Become a Supporting Member
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
                <p className="text-white/70">
                  Yes! You can upgrade to Supporting Member or cancel your subscription at any time. 
                  Free users always keep their free access.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What makes Being of Music different?</h3>
                <p className="text-white/70">
                  We're the only platform that combines practice tools, wellness resources, and community 
                  specifically designed for music students. Our holistic approach helps you grow as both 
                  a musician and a person.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do Supporting Members support the mission?</h3>
                <p className="text-white/70">
                  Supporting Member subscriptions directly fund platform development, content creation, 
                  and help us keep the core features free for all students. You're investing in the future 
                  of music education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;