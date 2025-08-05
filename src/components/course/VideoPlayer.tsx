
import React from "react";

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  // Function to convert YouTube URLs to proper embed format
  const formatYouTubeUrl = (url: string): string => {
    if (!url) return '';
    
    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Handle standard YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    return url;
  };

  // Check if the URL is a YouTube URL (any format)
  const isYouTubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
  const formattedUrl = isYouTubeUrl ? formatYouTubeUrl(url) : url;
  
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      {isYouTubeUrl ? (
        <iframe
          src={formattedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          referrerPolicy="strict-origin-when-cross-origin"
          onError={(e) => {
            console.error('Video failed to load:', formattedUrl);
          }}
        />
      ) : (
        <video
          src={formattedUrl}
          controls
          className="w-full h-full"
          title={title}
          onError={(e) => {
            console.error('Video failed to load:', formattedUrl);
          }}
        >
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Fallback message overlay - only shows if iframe fails to load properly */}
      <div className="hidden absolute inset-0 flex items-center justify-center bg-black/80 text-white text-center p-6">
        <div>
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Video Currently Unavailable</h3>
          <p className="text-white/70 text-sm">
            This video is temporarily unavailable. Please check back later or contact support if this issue persists.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
