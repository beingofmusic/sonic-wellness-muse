
import React, { useState } from "react";
import VideoErrorBoundary from "./VideoErrorBoundary";

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleError = () => {
    console.error('Video failed to load:', formattedUrl);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium mb-2 text-white">Video Currently Unavailable</h3>
          <p className="text-white/70 text-sm mb-4">
            This video is temporarily unavailable. Please try refreshing the page or contact support if this issue persists.
          </p>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="px-4 py-2 bg-music-primary hover:bg-music-primary/80 text-white rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <VideoErrorBoundary>
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        
        {isYouTubeUrl ? (
          <iframe
            src={formattedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={handleError}
            onLoad={handleLoad}
          />
        ) : (
          <video
            src={formattedUrl}
            controls
            className="w-full h-full"
            title={title}
            onError={handleError}
            onLoadedData={handleLoad}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </VideoErrorBoundary>
  );
};

export default VideoPlayer;
