import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  CameraOff, 
  RotateCcw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReliableARViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function ReliableARViewer({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "atom",
  onSessionEnd 
}: ReliableARViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (hasPermission && videoReady && !isActive) {
      setTimeout(() => {
        startARSession();
      }, 500);
    }
  }, [hasPermission, videoReady]);

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const initializeCamera = async () => {
    setIsLoading(true);
    console.log("Starting camera initialization...");
    
    try {
      // Simple camera request
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: { ideal: 'environment' }
        },
        audio: false
      };

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log("Setting video stream...");
        videoRef.current.srcObject = stream;
        
        const video = videoRef.current;
        
        // Set video attributes
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        
        // Add event listeners
        video.onloadedmetadata = () => {
          console.log("Video metadata loaded, dimensions:", video.videoWidth, "x", video.videoHeight);
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoReady(true);
          }
        };

        video.oncanplay = () => {
          console.log("Video can play");
          setVideoReady(true);
        };

        video.onplaying = () => {
          console.log("Video is playing");
          setVideoReady(true);
        };

        video.onerror = (e) => {
          console.error("Video error:", e);
        };

        // Enhanced video initialization with multiple retry strategies
        const startVideo = async (attempt = 1) => {
          console.log(`Video start attempt ${attempt}...`);
          
          try {
            // Method 1: Direct play
            await video.play();
            console.log("Video playing, waiting for dimensions...");
            
            // Wait for video dimensions with timeout
            let dimensionChecks = 0;
            const checkDimensions = () => {
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                console.log("Success! Video dimensions:", video.videoWidth, "x", video.videoHeight);
                setVideoReady(true);
                return true;
              }
              
              dimensionChecks++;
              if (dimensionChecks < 10) {
                setTimeout(checkDimensions, 200);
              } else {
                console.log("Timeout waiting for dimensions, trying recovery...");
                
                // Method 2: Reload stream with simpler constraints
                if (attempt === 1) {
                  video.srcObject = null;
                  navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                  }).then(newStream => {
                    video.srcObject = newStream;
                    streamRef.current = newStream;
                    startVideo(2);
                  }).catch(err => {
                    console.error("Stream reload failed:", err);
                  });
                } else {
                  // Method 3: Force visibility and play
                  video.style.visibility = 'visible';
                  video.style.display = 'block';
                  video.load();
                  video.play().then(() => {
                    console.log("Forced play successful");
                    setVideoReady(true);
                  });
                }
              }
              return false;
            };
            
            checkDimensions();
            
          } catch (playError) {
            console.error(`Video play failed on attempt ${attempt}:`, playError);
            
            if (attempt === 1) {
              // Show help message
              toast({
                title: "Camera Loading",
                description: "Tap 'Start Camera Feed' button if video doesn't appear",
              });
            }
          }
        };
        
        setTimeout(() => startVideo(), 300);
      }

      setHasPermission(true);
      console.log("Camera permission granted");
      
      toast({
        title: "Camera Connected",
        description: "Ready to display 3D models",
      });
      
    } catch (error) {
      console.error("Camera initialization failed:", error);
      setHasPermission(false);
      toast({
        title: "Camera Access Required",
        description: "Please enable camera to use AR features",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startARSession = () => {
    if (!hasPermission || !videoReady) {
      console.log("AR start blocked - camera not ready");
      return;
    }

    console.log("Starting AR rendering...");
    setIsActive(true);
    startRendering();
    
    toast({
      title: "AR Active",
      description: `Displaying ${selectedModel} for ${subject}`,
    });
  };

  const startRendering = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) {
      console.log("Canvas or video not available");
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log("Canvas context not available");
      return;
    }

    const render = () => {
      if (!isActive || !canvas || !video || !ctx) return;

      // Match canvas size to video dimensions
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render 3D model overlay
      renderModel(ctx, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const renderModel = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.001;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.rotate(rotation + time * 0.5);

    // Render different models based on selection
    switch (selectedModel) {
      case "Electromagnetic Field":
        renderElectromagneticField(ctx);
        break;
      case "Atomic Structure":
        renderAtomicStructure(ctx);
        break;
      case "Molecular Bonding":
        renderMolecularBonding(ctx);
        break;
      case "Wave Interference":
        renderWaveInterference(ctx, time);
        break;
      case "Chemical Reactions":
        renderChemicalReactions(ctx);
        break;
      case "Periodic Elements":
        renderPeriodicElements(ctx);
        break;
      default:
        renderDefaultModel(ctx);
    }

    ctx.restore();

    // Model info overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(20, height - 120, 300, 80);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.fillText(selectedModel, 30, height - 85);
    ctx.font = "14px Arial";
    ctx.fillText(`Subject: ${subject}`, 30, height - 60);
    ctx.fillText(`3D Model Active • Scale: ${scale.toFixed(1)}x`, 30, height - 40);
  };

  const renderElectromagneticField = (ctx: CanvasRenderingContext2D) => {
    // Electric field lines
    ctx.strokeStyle = "#00bfff";
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = 150;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.stroke();
      
      // Field strength indicators
      for (let j = 1; j <= 3; j++) {
        const dist = (j / 3) * length;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 191, 255, ${1 - j * 0.2})`;
        ctx.fill();
      }
    }
    
    // Central charge
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4444";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const renderAtomicStructure = (ctx: CanvasRenderingContext2D) => {
    // Nucleus
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
    
    // Electron orbits
    for (let orbit = 0; orbit < 3; orbit++) {
      const radius = 80 + orbit * 50;
      
      // Orbit path
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Electrons
      const electronCount = 2 + orbit;
      for (let e = 0; e < electronCount; e++) {
        const angle = (e / electronCount) * Math.PI * 2 + orbit * 0.5 + Date.now() * 0.001;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#4ecdc4";
        ctx.fill();
      }
    }
  };

  const renderMolecularBonding = (ctx: CanvasRenderingContext2D) => {
    // Benzene ring structure
    const atoms = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      atoms.push({
        x: Math.cos(angle) * 100,
        y: Math.sin(angle) * 100
      });
    }
    
    // Bonds
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    for (let i = 0; i < atoms.length; i++) {
      const current = atoms[i];
      const next = atoms[(i + 1) % atoms.length];
      
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    
    // Atoms
    atoms.forEach((atom, index) => {
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = index % 2 === 0 ? "#ff6b6b" : "#4ecdc4";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const renderWaveInterference = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    
    // Wave 1
    ctx.beginPath();
    for (let x = -200; x <= 200; x += 5) {
      const y = Math.sin((x + time * 100) * 0.02) * 50;
      if (x === -200) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Wave 2
    ctx.strokeStyle = "#ff69b4";
    ctx.beginPath();
    for (let x = -200; x <= 200; x += 5) {
      const y = Math.sin((x - time * 80) * 0.02) * 40;
      if (x === -200) {
        ctx.moveTo(x, y + 20);
      } else {
        ctx.lineTo(x, y + 20);
      }
    }
    ctx.stroke();
    
    // Interference pattern
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -200; x <= 200; x += 5) {
      const y1 = Math.sin((x + time * 100) * 0.02) * 50;
      const y2 = Math.sin((x - time * 80) * 0.02) * 40;
      const interference = (y1 + y2) / 2 - 60;
      
      if (x === -200) {
        ctx.moveTo(x, interference);
      } else {
        ctx.lineTo(x, interference);
      }
    }
    ctx.stroke();
  };

  const renderChemicalReactions = (ctx: CanvasRenderingContext2D) => {
    // Reactants
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(-120, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-60, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Arrow
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(10, -10);
    ctx.moveTo(20, 0);
    ctx.lineTo(10, 10);
    ctx.stroke();
    
    // Products
    ctx.fillStyle = "#4ecdc4";
    ctx.beginPath();
    ctx.arc(80, -20, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(80, 20, 25, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderPeriodicElements = (ctx: CanvasRenderingContext2D) => {
    // Periodic table grid
    const elements = [
      { symbol: "H", x: -150, y: -80, color: "#ff6b6b" },
      { symbol: "He", x: -50, y: -80, color: "#4ecdc4" },
      { symbol: "Li", x: -150, y: -20, color: "#ffeb3b" },
      { symbol: "Be", x: -100, y: -20, color: "#ff9800" },
      { symbol: "B", x: -50, y: -20, color: "#9c27b0" },
      { symbol: "C", x: 0, y: -20, color: "#2196f3" },
      { symbol: "N", x: 50, y: -20, color: "#00bcd4" },
      { symbol: "O", x: 100, y: -20, color: "#4caf50" },
      { symbol: "F", x: 150, y: -20, color: "#cddc39" },
      { symbol: "Ne", x: -50, y: 40, color: "#ffc107" }
    ];
    
    elements.forEach(element => {
      ctx.fillStyle = element.color;
      ctx.fillRect(element.x - 15, element.y - 15, 30, 30);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(element.x - 15, element.y - 15, 30, 30);
      
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(element.symbol, element.x, element.y + 4);
    });
  };

  const renderDefaultModel = (ctx: CanvasRenderingContext2D) => {
    // Default 3D cube
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    
    // Front face
    ctx.strokeRect(-50, -50, 100, 100);
    
    // Back face (offset for 3D effect)
    ctx.strokeRect(-30, -30, 100, 100);
    
    // Connect corners
    ctx.beginPath();
    ctx.moveTo(-50, -50);
    ctx.lineTo(-30, -30);
    ctx.moveTo(50, -50);
    ctx.lineTo(70, -30);
    ctx.moveTo(50, 50);
    ctx.lineTo(70, 70);
    ctx.moveTo(-50, 50);
    ctx.lineTo(-30, 70);
    ctx.stroke();
  };

  const adjustScale = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(2.5, prev + delta)));
  };

  const resetRotation = () => {
    setRotation(0);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Starting Camera...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md p-6">
          <CameraOff className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Camera Required</h2>
          <p className="mb-4">Allow camera access to view 3D AR models</p>
          <div className="space-x-2">
            <Button onClick={initializeCamera}>
              <Camera className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
            <Button variant="outline" onClick={onSessionEnd}>
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleScreenTap = async () => {
    if (videoRef.current) {
      try {
        console.log("Manual video start attempt...");
        const video = videoRef.current;
        
        // Force reload the stream if dimensions are 0
        if (video.videoWidth === 0 && streamRef.current) {
          console.log("Reloading video stream...");
          video.srcObject = null;
          await new Promise(resolve => setTimeout(resolve, 100));
          video.srcObject = streamRef.current;
        }
        
        // Force play
        await video.play();
        console.log("Video started manually, checking size...");
        
        // Wait a bit for dimensions to update
        setTimeout(() => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            console.log("Video now has dimensions:", video.videoWidth, "x", video.videoHeight);
            setVideoReady(true);
          } else {
            console.log("Video still has no dimensions, trying different approach...");
            
            // Try forcing specific constraints
            navigator.mediaDevices.getUserMedia({
              video: {
                width: 640,
                height: 480,
                facingMode: 'user' // Try front camera if back camera fails
              }
            }).then(newStream => {
              video.srcObject = newStream;
              streamRef.current = newStream;
              video.play().then(() => {
                console.log("New stream started");
                setVideoReady(true);
              });
            }).catch(e => {
              console.error("Failed to get new stream:", e);
            });
          }
        }, 500);
        
      } catch (e) {
        console.error("Failed to start video manually:", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50" onClick={handleScreenTap}>
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover bg-gray-900"
        autoPlay
        playsInline
        muted
        controls={false}
        style={{ 
          transform: 'scaleX(-1)',
          zIndex: 1,
          backgroundColor: '#1a1a1a'
        }}
        onLoadStart={() => console.log("Video load started")}
        onLoadedData={() => console.log("Video data loaded")}
        onCanPlay={() => console.log("Video can play event")}
        onPlaying={() => console.log("Video playing event")}
        onWaiting={() => console.log("Video waiting")}
        onStalled={() => console.log("Video stalled")}
        onSuspend={() => console.log("Video suspended")}
        onAbort={() => console.log("Video aborted")}
        onError={(e) => console.error("Video element error:", e)}
      />
      
      {/* 3D model overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <Badge className="bg-blue-600 text-white">
            {selectedModel} - {subject}
          </Badge>
          <Badge variant="outline" className="bg-black/70 text-white border-white/30">
            3D AR Active
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustScale(0.2)}
            className="bg-black/70 text-white border-white/30 hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustScale(-0.2)}
            className="bg-black/70 text-white border-white/30 hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetRotation}
            className="bg-black/70 text-white border-white/30 hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Debug info overlay */}
      <div className="absolute top-20 left-4 z-10 bg-black/80 text-white p-3 rounded text-sm">
        <div>Camera: {hasPermission ? 'Connected' : 'Disconnected'}</div>
        <div>Video Ready: {videoReady ? 'Yes' : 'No'}</div>
        <div>AR Active: {isActive ? 'Yes' : 'No'}</div>
        {videoRef.current && (
          <>
            <div>Video Size: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</div>
            <div>Video Paused: {videoRef.current.paused ? 'Yes' : 'No'}</div>
            <div>Video Ended: {videoRef.current.ended ? 'Yes' : 'No'}</div>
          </>
        )}
      </div>

      {/* Manual video start button if needed */}
      {hasPermission && !videoReady && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
          <div className="text-center text-white">
            <Button
              size="lg"
              onClick={handleScreenTap}
              className="bg-blue-600 hover:bg-blue-700 text-white mb-4"
            >
              <Camera className="w-6 h-6 mr-2" />
              Start Camera Feed
            </Button>
            <p className="text-sm opacity-75">Tap to activate video stream</p>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-center z-10">
        <Button
          size="lg"
          onClick={onSessionEnd}
          className="bg-red-600 hover:bg-red-700 text-white px-8"
        >
          End AR Session
        </Button>
      </div>
    </div>
  );
}