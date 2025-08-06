import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useUserProfileById } from "@/hooks/useUserProfileById";
import { usePracticeStatsById } from "@/hooks/usePracticeStatsById";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import BadgeCollection from "@/components/profile/BadgeCollection";
import MusicalIdentity from "@/components/profile/MusicalIdentity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  
  if (!userId) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p>Invalid user profile URL.</p>
        </div>
      </Layout>
    );
  }

  const { profileData, isLoading: profileLoading, error } = useUserProfileById(userId);
  const { stats, isLoading: statsLoading } = usePracticeStatsById(userId);

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </Layout>
    );
  }

  const displayName = profileData?.first_name 
    ? `${profileData.first_name}${profileData.last_name ? ` ${profileData.last_name}` : ''}`
    : profileData?.username || 'User';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{displayName}'s Profile</h1>
          <p className="text-white/70">
            View {displayName}'s achievements and practice statistics
          </p>
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
                isLoading={profileLoading}
                isOwnProfile={false}
              />
              
              {/* Musical Identity Section */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <MusicalIdentity profileData={profileData} isLoading={profileLoading} />
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Practice Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileStats 
                isLoading={statsLoading} 
                customStats={stats}
                isOwnProfile={false}
              />
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
                isLoading={profileLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;