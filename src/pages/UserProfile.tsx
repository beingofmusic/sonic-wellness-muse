import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useUserProfileById } from '@/hooks/useUserProfileById';
import { usePracticeStatsById } from '@/hooks/usePracticeStatsById';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import { Skeleton } from '@/components/ui/skeleton';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { profileData, isLoading: profileLoading } = useUserProfileById(userId || '');
  const { stats, isLoading: statsLoading } = usePracticeStatsById(userId || '');

  if (profileLoading || statsLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-white/60">This user profile could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <ProfileHeader 
          profileData={{
            username: profileData.username,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: null, // Don't show email for other users
            avatar_url: profileData.avatar_url,
            created_at: profileData.created_at,
            earned_badges: []
          }}
          isOwnProfile={false}
        />
        
        <ProfileStats stats={stats} isLoading={statsLoading} />
      </div>
    </Layout>
  );
};

export default UserProfile;