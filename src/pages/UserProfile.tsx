import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import BadgeCollection from "@/components/profile/BadgeCollection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfileById } from "@/hooks/useUserProfileById";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { profileData, isLoading, error } = useUserProfileById(userId);

  if (!userId) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p>Invalid user profile.</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-red-400 mb-4">Error loading profile: {error}</p>
          <Link to="/community">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/10 rounded w-48"></div>
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-48 bg-white/10 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = user?.id === userId;
  const displayName = profileData?.first_name && profileData?.last_name 
    ? `${profileData.first_name} ${profileData.last_name}`
    : profileData?.username || "User";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/community" className="text-sm text-white/60 hover:text-white mb-2 inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Back to Community
            </Link>
            <h1 className="text-3xl font-bold">
              {isOwnProfile ? "Your Profile" : `${displayName}'s Profile`}
            </h1>
          </div>
          
          {!isOwnProfile && (
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
          )}
        </div>

        <div className="grid gap-8">
          {/* Profile Header Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileHeader 
                profileData={profileData} 
                isLoading={isLoading} 
                showEmail={false}
              />
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Practice Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileStats isLoading={isLoading} userId={userId} />
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Achievements</CardTitle>
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

export default UserProfile;