
import React from "react";

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  // Check if the URL is a YouTube embed URL
  const isYouTubeEmbed = url.includes('youtube.com/embed') || url.includes('youtu.be');
  
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      {isYouTubeEmbed ? (
        <iframe
          src={url}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <video
          src={url}
          controls
          className="w-full h-full"
          title={title}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
