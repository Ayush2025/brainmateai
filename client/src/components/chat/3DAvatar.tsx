import { useEffect, useRef, useState } from 'react';

interface Avatar3DProps {
  avatarUrl: string;
  isActive: boolean;
  isSpeaking: boolean;
  name: string;
}

export function Avatar3D({ avatarUrl, isActive, isSpeaking, name }: Avatar3DProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ready Player Me avatar URLs
  const readyPlayerMeAvatars = [
    "https://models.readyplayer.me/64f8c5a0b5c6a4001234567f.glb",
    "https://models.readyplayer.me/65a1b2c3d4e5f6007890abcd.glb", 
    "https://models.readyplayer.me/66b2c3d4e5f6g7008901bcde.glb",
    "https://models.readyplayer.me/67c3d4e5f6g7h8009012cdef.glb"
  ];

  // Sketchfab embedded models
  const sketchfabModels = [
    "https://sketchfab.com/models/abc123def456/embed?autostart=1&ui_animations=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0",
    "https://sketchfab.com/models/def456ghi789/embed?autostart=1&ui_animations=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0",
    "https://sketchfab.com/models/ghi789jkl012/embed?autostart=1&ui_animations=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0"
  ];

  // VRM Avatar viewer
  const vrmViewerUrl = `https://hub.vroid.com/characters/embed?id=${avatarUrl}&animation=${isSpeaking ? 'talking' : 'idle'}`;

  useEffect(() => {
    if (iframeRef.current && isLoaded) {
      // Send animation commands to 3D avatar based on state
      const message = {
        type: 'animation',
        animation: isSpeaking ? 'talking' : isActive ? 'thinking' : 'idle',
        intensity: isSpeaking ? 0.8 : 0.3
      };
      
      try {
        iframeRef.current.contentWindow?.postMessage(message, '*');
      } catch (error) {
        console.log('Could not send message to 3D avatar');
      }
    }
  }, [isSpeaking, isActive, isLoaded]);

  return (
    <div className="relative w-full h-full">
      {/* 3D Model Viewer */}
      <iframe
        ref={iframeRef}
        src={vrmViewerUrl}
        className="w-full h-full border-0 rounded-full"
        title={`3D Avatar - ${name}`}
        onLoad={() => setIsLoaded(true)}
        allow="camera; microphone; xr-spatial-tracking"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          filter: isSpeaking ? 'brightness(1.1) saturate(1.2)' : isActive ? 'brightness(1.05)' : 'brightness(1)'
        }}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-600">Loading 3D Avatar...</p>
          </div>
        </div>
      )}

      {/* Status overlays */}
      {isSpeaking && isLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1 bg-blue-500/80 rounded-full px-2 py-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-3 bg-white rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '0.6s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isActive && !isSpeaking && isLoaded && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
      )}
    </div>
  );
}