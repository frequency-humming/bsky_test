import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  playlist: string;
  thumbnail: string;
  aspectRatio?: { width: number; height: number };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playlist, thumbnail, aspectRatio }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playlist) return;

    let hls: Hls | null = null;
    setIsLoading(true);
    setError(null);

    try {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          setIsLoading(false);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError('Failed to load video');
            console.error('HLS error:', data);
          }
        });

        hls.loadSource(playlist);
        hls.attachMedia(video);
      } 
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playlist;
        video.addEventListener('loadeddata', () => setIsLoading(false));
        video.addEventListener('error', () => {
          setError('Failed to load video');
        });
      } 
      else {
        setError('Your browser does not support video playback');
      }
    } catch (err) {
      setError('Error initializing video player');
      console.error('Video player error:', err);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.removeEventListener('loadeddata', () => setIsLoading(false));
        video.removeEventListener('error', () => setError('Failed to load video'));
      }
    };
  }, [playlist]);

  // Dynamic styling based on aspect ratio
  const containerStyle = {
    position: 'relative' as const,
    width: '100%',
    maxWidth: aspectRatio && aspectRatio.width > 1000 ? '800px' : '600px',
    aspectRatio: aspectRatio ? `${aspectRatio.width}/${aspectRatio.height}` : '16/9'
  };

  if (!playlist) return null;

  return (
    <div className={`flex justify-center w-full my-4 ${error ? 'bg-red-50' : ''}`}>
      <div style={containerStyle} className="overflow-hidden rounded-lg shadow-lg">
        {error ? (
          <div className="w-full h-full flex items-center justify-center bg-black/5 text-red-500 p-4">
            {error}
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                <div className="animate-pulse">Loading video...</div>
              </div>
            )}
            <video 
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              controls 
              playsInline 
              crossOrigin="anonymous"
              poster={thumbnail}
              preload="metadata"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;