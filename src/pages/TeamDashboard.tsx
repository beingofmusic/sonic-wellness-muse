
import React from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const TeamDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Team Dashboard</h1>
          <p className="text-white/70">Welcome, {profile?.username || 'Team Member'}!</p>
        </header>
        
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <Card className="bg-card/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Content Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-white/80">
                    As a team member, you can create and manage content for our music platform.
                    Use this dashboard to upload lessons, create practice routines, and develop
                    wellness resources.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-white/10">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-music-primary/20 flex items-center justify-center mb-4">
                          <svg className="h-6 w-6 text-music-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                          </svg>
                        </div>
                        <h3 className="font-medium mb-1">Music Lessons</h3>
                        <p className="text-white/60 text-sm">Create interactive lessons</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-white/10">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-music-secondary/20 flex items-center justify-center mb-4">
                          <svg className="h-6 w-6 text-music-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <h3 className="font-medium mb-1">Practice Routines</h3>
                        <p className="text-white/60 text-sm">Design effective routines</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-white/10">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-music-tertiary/20 flex items-center justify-center mb-4">
                          <svg className="h-6 w-6 text-music-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </div>
                        <h3 className="font-medium mb-1">Wellness Resources</h3>
                        <p className="text-white/60 text-sm">Add wellness content</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="moderation">
            <Card className="bg-card/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Community Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-white/60">
                  <p>Community moderation tools will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeamDashboard;
