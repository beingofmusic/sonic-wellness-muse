
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import BadgeCollection from "@/components/profile/BadgeCollection";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileEditor from "@/components/profile/ProfileEditor";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileData: ownProfileData, isLoading: isOwnProfileLoading, updateProfile } = useUserProfile();
  const [otherProfileData, setOtherProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isOwnProfile = !userId || (user && userId === user.id);
  
  // Fetch another user's profile
  useEffect(() => {
    if (!isOwnProfile && userId) {
      const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
            
          if (profileError) throw profileError;
          
          if (!profileData) {
            navigate("/not-found");
            return;
          }
          
          // Get user's earned badges
          const { data: badgesData, error: badgesError } = await supabase
            .from("user_badges")
            .select(`
              earned_at,
              badges (
                id,
                title,
                description,
                icon,
                condition_type,
                threshold
              )
            `)
            .eq("user_id", userId);
            
          if (badgesError) throw badgesError;
          
          // Format badges data
          const earnedBadges = badgesData.map((item: any) => ({
            ...item.badges,
            earned_at: item.earned_at
          }));
          
          setOtherProfileData({
            ...profileData,
            earned_badges: earnedBadges
          });
        } catch (error) {
          console.error("Error fetching profile data:", error);
          navigate("/not-found");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserProfile();
    } else {
      setIsLoading(isOwnProfileLoading);
    }
  }, [userId, isOwnProfile, isOwnProfileLoading, user, navigate]);
  
  // Use the appropriate profile data based on whether viewing own or other profile
  const profileData = isOwnProfile ? ownProfileData : otherProfileData;
  
  if (!user && isOwnProfile) {
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
          <h1 className="text-3xl font-bold mb-2">
            {isOwnProfile ? "Your Profile" : `${profileData?.first_name || profileData?.username || "User"}'s Profile`}
          </h1>
          <p className="text-white/70">
            {isOwnProfile ? 
              "View and edit your profile information and check your achievements" :
              "View this user's profile and achievements"
            }
          </p>
        </div>

        <div className="grid gap-8">
          {/* Profile Header Section */}
          <Card className="border-white/10 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Profile Information</CardTitle>
              {isOwnProfile && (
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
              )}
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
