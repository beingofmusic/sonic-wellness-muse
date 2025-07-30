
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileData } from "@/hooks/useUserProfile";

interface ProfileHeaderProps {
  profileData: ProfileData | null;
  isLoading: boolean;
  showEmail?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileData, isLoading, showEmail = true }) => {
  // Function to get name display
  const getFullName = () => {
    if (profileData?.first_name) {
      const lastName = profileData.last_name ? ` ${profileData.last_name}` : '';
      return `${profileData.first_name}${lastName}`;
    }
    if (profileData?.username) return profileData.username;
    return "User";
  };

  // Function to get initials for avatar
  const getInitials = () => {
    if (profileData?.first_name) {
      const firstInitial = profileData.first_name.charAt(0);
      const lastInitial = profileData.last_name ? profileData.last_name.charAt(0) : '';
      return `${firstInitial}${lastInitial}`;
    }
    if (profileData?.username) return profileData.username.charAt(0).toUpperCase();
    return "U";
  };

  // Format join date
  const getJoinedDate = () => {
    if (!profileData?.created_at) return "Recently joined";
    return `Joined ${formatDistanceToNow(new Date(profileData.created_at), { addSuffix: true })}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <Skeleton className="h-7 w-40 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-60 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
      <Avatar className="w-24 h-24 rounded-full border-2 border-white/10">
        {profileData?.avatar_url ? (
          <AvatarImage 
            src={profileData.avatar_url} 
            alt={getFullName()} 
            className="object-cover"
          />
        ) : (
          <AvatarFallback className="bg-music-primary/20 text-music-primary text-3xl">
            {getInitials()}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 space-y-2 text-center md:text-left">
        <h2 className="text-2xl font-bold">{getFullName()}</h2>
        {showEmail && <p className="text-white/70">{profileData?.email || "No email provided"}</p>}
        <p className="text-white/50 text-sm">{getJoinedDate()}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
