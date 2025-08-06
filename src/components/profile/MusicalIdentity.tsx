import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Users, MapPin, Target } from "lucide-react";
import { ProfileData } from "@/hooks/useUserProfile";
import { UserProfileData } from "@/hooks/useUserProfileById";

interface MusicalIdentityProps {
  profileData: ProfileData | UserProfileData | null;
  isLoading: boolean;
}

const MusicalIdentity: React.FC<MusicalIdentityProps> = ({ profileData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // Helper function to check if any musical identity fields are filled
  const hasMusicalIdentity = () => {
    return (
      (profileData?.primary_instruments && profileData.primary_instruments.length > 0) ||
      (profileData?.secondary_instruments && profileData.secondary_instruments.length > 0) ||
      (profileData?.musical_interests && profileData.musical_interests.length > 0) ||
      profileData?.skill_level ||
      profileData?.location ||
      (profileData?.looking_for && profileData.looking_for.length > 0) ||
      profileData?.about_me
    );
  };

  if (!hasMusicalIdentity()) {
    return null;
  }

  const formatSkillLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Instruments Section */}
      {((profileData?.primary_instruments && profileData.primary_instruments.length > 0) ||
        (profileData?.secondary_instruments && profileData.secondary_instruments.length > 0)) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Music className="h-4 w-4 text-music-primary" />
            <h3 className="font-semibold">Instruments</h3>
          </div>
          
          <div className="space-y-2">
            {profileData?.primary_instruments && profileData.primary_instruments.length > 0 && (
              <div>
                <p className="text-sm text-white/70 mb-2">Primary:</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.primary_instruments.map((instrument, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-music-primary/20 text-music-primary border-music-primary/30"
                    >
                      {instrument}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {profileData?.secondary_instruments && profileData.secondary_instruments.length > 0 && (
              <div>
                <p className="text-sm text-white/70 mb-2">Secondary:</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.secondary_instruments.map((instrument, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="border-white/30 text-white/90"
                    >
                      {instrument}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skill Level & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileData?.skill_level && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-music-secondary" />
              <h4 className="font-medium">Skill Level</h4>
            </div>
            <Badge variant="secondary" className="bg-music-secondary/20 text-music-secondary">
              {formatSkillLevel(profileData.skill_level)}
            </Badge>
          </div>
        )}

        {profileData?.location && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-music-secondary" />
              <h4 className="font-medium">Location</h4>
            </div>
            <p className="text-white/90">{profileData.location}</p>
          </div>
        )}
      </div>

      {/* Musical Interests */}
      {profileData?.musical_interests && profileData.musical_interests.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Musical Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.musical_interests.map((interest, index) => (
              <Badge 
                key={index} 
                className="bg-gradient-to-r from-music-primary/30 to-music-secondary/30 text-white border-music-primary/40"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Looking For */}
      {profileData?.looking_for && profileData.looking_for.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-music-primary" />
            <h3 className="font-semibold">Looking For</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.looking_for.map((item, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-music-light/10 text-music-light border-music-light/30"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* About Me */}
      {profileData?.about_me && (
        <div>
          <h3 className="font-semibold mb-3">About Me</h3>
          <p className="text-white/90 leading-relaxed">{profileData.about_me}</p>
        </div>
      )}
    </div>
  );
};

export default MusicalIdentity;