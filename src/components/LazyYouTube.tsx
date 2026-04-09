import { useState } from 'react';
import { IconPlayerPlayFilled } from '@tabler/icons-react';

interface LazyYouTubeProps {
  videoId: string;
  title: string;
  className?: string;
}

export default function LazyYouTube({ videoId, title, className = '' }: LazyYouTubeProps) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <div 
        onClick={() => setLoaded(true)} 
        className={`relative cursor-pointer group bg-black ${className}`}
      >
        <img 
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <IconPlayerPlayFilled size={32} className="text-primary ml-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
