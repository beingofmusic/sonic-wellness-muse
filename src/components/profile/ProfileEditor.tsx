
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ProfileData } from "@/hooks/useUserProfile";
import { Loader2 } from "lucide-react";

interface ProfileEditorProps {
  profileData: ProfileData | null;
  isLoading: boolean;
  onSave: (data: { first_name?: string; last_name?: string; avatar_url?: string }) => Promise<boolean>;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profileData, isLoading, onSave }) => {
  const [firstName, setFirstName] = useState(profileData?.first_name || "");
  const [lastName, setLastName] = useState(profileData?.last_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div>
      <SheetHeader className="mb-6">
        <SheetTitle className="text-white">Edit Your Profile</SheetTitle>
        <SheetDescription>
          Update your personal information and profile picture
        </SheetDescription>
      </SheetHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading || isSaving}
            className="music-button"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
