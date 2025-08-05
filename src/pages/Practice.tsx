
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, ChevronDown, Play, Target, Bot, Sparkles } from "lucide-react";
import FeaturedTemplates from "@/components/practice/FeaturedTemplates";
import CreateRoutineCta from "@/components/practice/CreateRoutineCta";
import MyRoutines from "@/components/practice/MyRoutines";
import PracticeGoals from "@/components/practice/goals/PracticeGoals";

const Practice: React.FC = () => {
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Practice Studio
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your musical journey with personalized practice routines, AI-powered guidance, and progress tracking
            </p>
          </div>
          
          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/routine-builder">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                <Play className="h-5 w-5 mr-2" />
                Start Practicing Now
              </Button>
            </Link>
            <Link to="/practice/history">
              <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary/40 px-6 py-6">
                <Clock className="h-5 w-5 mr-2" />
                View History
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-6">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-border/50">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Explore Templates
              </TabsTrigger>
              <TabsTrigger value="routines" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                My Routines
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Generator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6 animate-fade-in">
              <Card className="bg-background/40 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Featured Practice Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeaturedTemplates />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routines" className="space-y-6 animate-fade-in">
              <Card className="bg-background/40 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    My Practice Routines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MyRoutines />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6 animate-fade-in">
              <Card className="bg-background/40 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI-Powered Routine Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateRoutineCta />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Practice Goals - Collapsible Section */}
          <Collapsible open={isGoalsOpen} onOpenChange={setIsGoalsOpen}>
            <CollapsibleTrigger asChild>
              <Card className="bg-background/40 border-border/50 cursor-pointer hover:bg-background/60 transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Practice Goals & Progress
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isGoalsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-accordion-down">
              <Card className="bg-background/40 border-border/50 border-t-0 rounded-t-none">
                <CardContent className="pt-6">
                  <PracticeGoals />
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </Layout>
  );
};

export default Practice;
