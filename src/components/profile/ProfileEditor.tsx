
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ProfileData } from "@/hooks/useUserProfile";
import { Loader2 } from "lucide-react";
import ProfileEditorFields from "./ProfileEditorFields";

interface ProfileEditorProps {
  profileData: ProfileData | null;
  isLoading: boolean;
  onSave: (data: { 
    first_name?: string; 
    last_name?: string; 
    avatar_url?: string;
    primary_instruments?: string[];
    secondary_instruments?: string[];
    musical_interests?: string[];
    skill_level?: string;
    location?: string;
    looking_for?: string[];
    about_me?: string;
  }) => Promise<boolean>;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profileData, isLoading, onSave }) => {
  const [firstName, setFirstName] = useState(profileData?.first_name || "");
  const [lastName, setLastName] = useState(profileData?.last_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Musical identity fields
  const [primaryInstruments, setPrimaryInstruments] = useState<string[]>(profileData?.primary_instruments || []);
  const [secondaryInstruments, setSecondaryInstruments] = useState<string[]>(profileData?.secondary_instruments || []);
  const [musicalInterests, setMusicalInterests] = useState<string[]>(profileData?.musical_interests || []);
  const [skillLevel, setSkillLevel] = useState(profileData?.skill_level || "");
  const [location, setLocation] = useState(profileData?.location || "");
  const [lookingFor, setLookingFor] = useState<string[]>(profileData?.looking_for || []);
  const [aboutMe, setAboutMe] = useState(profileData?.about_me || "");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        primary_instruments: primaryInstruments.length > 0 ? primaryInstruments : null,
        secondary_instruments: secondaryInstruments.length > 0 ? secondaryInstruments : null,
        musical_interests: musicalInterests.length > 0 ? musicalInterests : null,
        skill_level: skillLevel.trim() || null,
        location: location.trim() || null,
        looking_for: lookingFor.length > 0 ? lookingFor : null,
        about_me: aboutMe.trim() || null,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="mb-6 flex-shrink-0">
        <SheetTitle className="text-white">Edit Your Profile</SheetTitle>
        <SheetDescription>
          Update your personal information and profile picture
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6 pb-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              disabled={isLoading || isSaving}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Your last name"
              disabled={isLoading || isSaving}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="avatarUrl">Profile Picture URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={isLoading || isSaving}
            />
            <p className="text-xs text-white/50">
              Enter a URL for your profile picture. For best results, use a square image.
            </p>
          </div>
          
          {avatarUrl && (
            <div className="pt-2">
              <p className="text-sm mb-2">Preview:</p>
              <div className="w-20 h-20 rounded-full border border-white/10 overflow-hidden">
                <img 
                  src={avatarUrl} 
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Musical Identity Fields */}
        <ProfileEditorFields
          primaryInstruments={primaryInstruments}
          secondaryInstruments={secondaryInstruments}
          musicalInterests={musicalInterests}
          skillLevel={skillLevel}
          location={location}
          lookingFor={lookingFor}
          aboutMe={aboutMe}
          setPrimaryInstruments={setPrimaryInstruments}
          setSecondaryInstruments={setSecondaryInstruments}
          setMusicalInterests={setMusicalInterests}
          setSkillLevel={setSkillLevel}
          setLocation={setLocation}
          setLookingFor={setLookingFor}
          setAboutMe={setAboutMe}
          disabled={isLoading || isSaving}
        />
        </form>
      </div>
      
      <div className="flex justify-end pt-6 border-t border-white/10 flex-shrink-0 bg-music-dark/95">
        <Button 
          type="submit" 
          form="profile-form"
          disabled={isLoading || isSaving}
          className="music-button"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditor;
