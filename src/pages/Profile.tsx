
import React from "react";
import { Layout } from "@/components/Layout";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import BadgeCollection from "@/components/profile/BadgeCollection";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profileData, isLoading, updateProfile } = useUserProfile();

  if (!user) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p>Please sign in to view your profile.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-white/70">
            View and edit your profile information and check your achievements
          </p>
        </div>

        <div className="grid gap-8">
          {/* Profile Header Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-background/95 backdrop-blur border-white/10">
                  <ProfileEditor 
                    profileData={profileData} 
                    isLoading={isLoading} 
                    onSave={updateProfile}
                  />
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <ProfileHeader profileData={profileData} isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Practice Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileStats isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Your Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeCollection 
                badges={profileData?.earned_badges || []}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
