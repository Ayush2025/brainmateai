import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX, 
  Maximize,
  Minimize,
  Info,
  Zap,
  Sparkles,
  RotateCcw,
  Move3D
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleARViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  onSessionEnd: () => void;
}

export function SimpleARViewer({ tutorId, tutorName, subject, onSessionEnd }: SimpleARViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>("molecule");
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const { toast } = useToast();

  // AR models based on subject
  const arModels = {
    "Chemistry": [
      { id: "molecule", name: "3D Molecule", color: "#ff6b6b" },
      { id: "periodic", name: "Periodic Table", color: "#4ecdc4" },
      { id: "reaction", name: "Chemical Reactions", color: "#45b7d1" }
    ],
    "Physics": [
      { id: "atom", name: "Atomic Model", color: "#96ceb4" },
      { id: "wave", name: "Wave Motion", color: "#ffeaa7" },
      { id: "circuit", name: "Electric Circuits", color: "#dda0dd" }
    ],
    "Biology": [
      { id: "cell", name: "Cell Structure", color: "#98d8c8" },
      { id: "dna", name: "DNA Helix", color: "#f7dc6f" },
      { id: "organ", name: "Human Organs", color: "#bb8fce" }
    ],
    "Mathematics": [
      { id: "geometry", name: "3D Shapes", color: "#85c1e9" },
      { id: "graph", name: "Function Graphs", color: "#f8c471" },
      { id: "fractal", name: "Fractals", color: "#82e0aa" }
    ],
    "default": [
      { id: "text", name: "3D Text", color: "#aed6f1" },
      { id: "diagram", name: "Diagrams", color: "#fadbd8" },
      { id: "animation", name: "Animations", color: "#d5dbdb" }
    ]
  };

  const getModelsForSubject = () => {
    return arModels[subject as keyof typeof arModels] || arModels.default;
  };

  const requestCameraPermission = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          const video = videoRef.current!;
          if (video.readyState >= 2) {
            resolve(true);
          } else {
            video.addEventListener('loadeddata', () => resolve(true), { once: true });
          }
        });
      }
      
      setHasPermission(true);
      toast({
        title: "Camera Access Granted",
        description: "You can now start AR tutoring session.",
      });
    } catch (error) {
      console.error("Camera permission denied:", error);
      setHasPermission(false);
      toast({
        title: "Camera Permission Required",
        description: "Please enable camera access to use AR features.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startARSession = () => {
    if (!hasPermission || !videoRef.current || !canvasRef.current) {
      console.log("AR Session start failed:", { hasPermission, video: !!videoRef.current, canvas: !!canvasRef.current });
      return;
    }

    console.log("Starting AR session with video:", {
      readyState: videoRef.current.readyState,
      videoWidth: videoRef.current.videoWidth,
      videoHeight: videoRef.current.videoHeight,
      srcObject: !!videoRef.current.srcObject
    });

    setIsActive(true);
    startRenderLoop();
    
    toast({
      title: "AR Session Started",
      description: `Interactive ${subject} content is now available!`,
    });
  };

  const startRenderLoop = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!isActive) return;

      // Wait for video to be ready
      if (video.readyState < 2) {
        requestAnimationFrame(render);
        return;
      }

      // Set canvas size to match video or default size
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw video frame
      try {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          ctx.drawImage(video, 0, 0, width, height);
        } else {
          // Video not ready yet, show loading pattern
          ctx.fillStyle = '#2a2a2a';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#4a4a4a';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Loading Camera...', width / 2, height / 2);
        }
      } catch (error) {
        console.error("Error drawing video frame:", error);
        // If video can't be drawn, fill with dark background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Camera Error', width / 2, height / 2);
      }

      // Render AR overlay
      renderAROverlay(ctx, width, height);

      const frameId = requestAnimationFrame(render);
      setAnimationFrame(frameId);
    };

    render();
  };

  const renderAROverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const model = getModelsForSubject().find(m => m.id === currentModel);
    if (!model) return;

    // Center point for AR content
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.002;

    // Render animated 3D-like content based on model type
    ctx.save();
    
    switch (currentModel) {
      case "molecule":
        renderMolecule(ctx, centerX, centerY, time, model.color);
        break;
      case "atom":
        renderAtom(ctx, centerX, centerY, time, model.color);
        break;
      case "cell":
        renderCell(ctx, centerX, centerY, time, model.color);
        break;
      case "geometry":
        renderGeometry(ctx, centerX, centerY, time, model.color);
        break;
      default:
        renderDefault(ctx, centerX, centerY, time, model.color);
    }
    
    ctx.restore();

    // Render UI overlay
    renderUIOverlay(ctx, width, height, model);
  };

  const renderMolecule = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    // Animated molecular structure
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + time;
      const radius = 60 + Math.sin(time + i) * 10;
      const atomX = x + Math.cos(angle) * radius;
      const atomY = y + Math.sin(angle) * radius;

      // Draw atom
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(atomX, atomY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw bonds
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(atomX, atomY);
      ctx.stroke();
    }

    // Central atom
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    // Nucleus
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Electron orbitals
    for (let i = 0; i < 3; i++) {
      const radius = 50 + i * 30;
      const rotation = time * (i + 1) * 0.5;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.3, rotation, 0, Math.PI * 2);
      ctx.stroke();

      // Electron
      const electronX = x + Math.cos(rotation * 3) * radius;
      const electronY = y + Math.sin(rotation * 3) * radius * 0.3;
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(electronX, electronY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const renderCell = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    // Cell membrane
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Nucleus
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - 20, y - 10, 25, 0, Math.PI * 2);
    ctx.fill();

    // Organelles
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8 + time * 0.2;
      const radius = 40 + Math.sin(time + i) * 5;
      const orgX = x + Math.cos(angle) * radius;
      const orgY = y + Math.sin(angle) * radius;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(orgX, orgY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  const renderGeometry = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    // Rotating cube wireframe
    const size = 60;
    const rotation = time;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    // Simple 3D cube projection
    const vertices = [
      [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
      [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]
    ];

    const projected = vertices.map(([vx, vy, vz]) => {
      // Rotate around Y axis
      const rx = vx * Math.cos(rotation) - vz * Math.sin(rotation);
      const rz = vx * Math.sin(rotation) + vz * Math.cos(rotation);
      
      // Simple perspective projection
      const scale = 300 / (300 + rz);
      return [x + rx * scale, y + vy * scale];
    });

    // Draw edges
    const edges = [
      [0,1], [1,2], [2,3], [3,0], // back face
      [4,5], [5,6], [6,7], [7,4], // front face
      [0,4], [1,5], [2,6], [3,7]  // connecting edges
    ];

    edges.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(projected[start][0], projected[start][1]);
      ctx.lineTo(projected[end][0], projected[end][1]);
      ctx.stroke();
    });
  };

  const renderDefault = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    // Pulsing circle with text
    const radius = 50 + Math.sin(time * 2) * 10;
    
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1;
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("AR", x, y + 7);
  };

  const renderUIOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, model: any) => {
    // Model info overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 200, 60);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(model.name, 20, 35);
    ctx.font = "12px Arial";
    ctx.fillText(`Subject: ${subject}`, 20, 55);
  };

  const stopARSession = () => {
    setIsActive(false);
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }

    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setHasPermission(null);
    
    toast({
      title: "AR Session Ended",
      description: "AR tutoring session has been stopped.",
    });
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    if (!fullscreen && canvasRef.current) {
      canvasRef.current.requestFullscreen?.();
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [animationFrame]);

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full'}`}>
      {/* Camera Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
        onLoadedData={() => console.log("Video loaded successfully")}
        onError={(e) => console.error("Video error:", e)}
      />

      {/* AR Canvas */}
      <canvas
        ref={canvasRef}
        className={`${fullscreen ? 'w-full h-full' : 'w-full h-96'} bg-gray-900 rounded-lg`}
        style={{ objectFit: 'cover' }}
      />

      {/* Debug info for camera issues */}
      {isActive && (
        <div className="absolute top-20 right-4 bg-black/80 text-white p-2 rounded text-xs">
          <div>Video Ready: {videoRef.current?.readyState ? (videoRef.current.readyState >= 2 ? 'Yes' : 'No') : 'N/A'}</div>
          <div>Stream: {videoRef.current?.srcObject ? 'Active' : 'None'}</div>
          <div>Size: {videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}</div>
        </div>
      )}

      {/* AR Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="bg-black/80 rounded-lg p-3 text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AR {subject} Tutoring
          </h3>
          <p className="text-sm opacity-80">{tutorName}</p>
          <Badge variant="secondary" className="mt-1">
            {getModelsForSubject().find(m => m.id === currentModel)?.name}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={audioEnabled ? "default" : "outline"}
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="bg-black/80 hover:bg-black/60"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            className="bg-black/80 hover:bg-black/60 text-white"
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/80 rounded-lg p-4 text-white">
          {/* Model Selection */}
          <div className="mb-4">
            <p className="text-sm opacity-80 mb-2">AR Models:</p>
            <div className="flex gap-2 flex-wrap">
              {getModelsForSubject().map((model) => (
                <Button
                  key={model.id}
                  size="sm"
                  variant={currentModel === model.id ? "default" : "outline"}
                  onClick={() => setCurrentModel(model.id)}
                  className="text-xs"
                  style={{ 
                    backgroundColor: currentModel === model.id ? model.color : undefined 
                  }}
                >
                  {model.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {!hasPermission ? (
              <Button 
                onClick={requestCameraPermission}
                disabled={isLoading}
                className="flex-1 mr-2"
              >
                <Camera className="mr-2 h-4 w-4" />
                {isLoading ? "Requesting Access..." : "Enable Camera"}
              </Button>
            ) : !isActive ? (
              <Button 
                onClick={startARSession}
                disabled={isLoading}
                className="flex-1 mr-2"
              >
                <Zap className="mr-2 h-4 w-4" />
                Start AR Session
              </Button>
            ) : (
              <Button 
                onClick={stopARSession}
                variant="destructive"
                className="flex-1 mr-2"
              >
                <CameraOff className="mr-2 h-4 w-4" />
                Stop AR
              </Button>
            )}

            <Button variant="outline" onClick={onSessionEnd}>
              Exit
            </Button>
          </div>

          {isActive && (
            <div className="mt-3 p-2 bg-blue-500/20 rounded-lg">
              <p className="text-xs opacity-80 text-center flex items-center justify-center gap-2">
                <Move3D className="h-3 w-3" />
                AR content is overlaid on your camera feed - move your device to explore!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-medium">Initializing AR Session...</p>
          </div>
        </div>
      )}
    </div>
  );
}