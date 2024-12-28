import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  playlist: string;
  thumbnail: string;
  aspectRatio?: { width: number; height: number };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playlist, thumbnail, aspectRatio }) => {
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
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlist;
    }
  }, [playlist]);

  const containerStyle = {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '600px',
    aspectRatio: aspectRatio ? `${aspectRatio.width}/${aspectRatio.height}` : '16/9'
  };

  return (
    <div style={containerStyle} className="overflow-hidden">
      <video 
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        controls 
        playsInline 
        crossOrigin="anonymous"
        poster={thumbnail}
      />
    </div>
  );
};

export default VideoPlayer;