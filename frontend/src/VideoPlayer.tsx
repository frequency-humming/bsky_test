import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  playlist: string;
  thumbnail: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playlist, thumbnail }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playlist);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }
    // For browsers with native HLS support like Safari
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlist;
    }
  }, [playlist]);

  return (
    <video 
      ref={videoRef}
      className="w-full h-full object-contain"
      controls 
      playsInline 
      crossOrigin="anonymous"
      poster={thumbnail}
    />
  );
};

export default VideoPlayer;