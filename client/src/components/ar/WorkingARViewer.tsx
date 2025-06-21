import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX, 
  Maximize,
  Minimize,
  Sparkles,
  Move3D
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkingARViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  onSessionEnd: () => void;
}

export function WorkingARViewer({ tutorId, tutorName, subject, onSessionEnd }: WorkingARViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>("algorithm");
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
    "Computer Science": [
      { id: "algorithm", name: "Algorithms", color: "#aed6f1" },
      { id: "data", name: "Data Structures", color: "#fadbd8" },
      { id: "network", name: "Networks", color: "#d5dbdb" }
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
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
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
    if (!hasPermission || !videoRef.current) {
      console.log("AR session start blocked - missing camera or permission");
      return;
    }

    console.log("Starting AR session...");
    setIsActive(true);
    startAROverlay();
    
    toast({
      title: "AR Session Started",
      description: `Interactive ${subject} content is now available!`,
    });
  };

  const startAROverlay = () => {
    const canvas = overlayRef.current;
    if (!canvas) {
      console.log("Canvas not available");
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log("Canvas context not available");
      return;
    }

    const renderLoop = () => {
      if (!isActive) return;

      const rect = videoRef.current?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      } else {
        canvas.width = 640;
        canvas.height = 480;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render AR content
      renderARContent(ctx, canvas.width, canvas.height);

      const frameId = requestAnimationFrame(renderLoop);
      setAnimationFrame(frameId);
    };

    renderLoop();
  };

  const renderARContent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const model = getModelsForSubject().find(m => m.id === currentModel);
    if (!model) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.001;

    ctx.save();
    
    // Render based on model type
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
      case "algorithm":
        renderAlgorithm(ctx, centerX, centerY, time, model.color);
        break;
      case "data":
        renderDataStructure(ctx, centerX, centerY, time, model.color);
        break;
      case "network":
        renderNetwork(ctx, centerX, centerY, time, model.color);
        break;
      default:
        renderDefault(ctx, centerX, centerY, time, model.color);
    }
    
    ctx.restore();

    // Render UI info
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 200, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(model.name, 20, 35);
    ctx.font = "12px Arial";
    ctx.fillText(`Subject: ${subject}`, 20, 55);
  };

  const renderMolecule = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + time;
      const radius = 60 + Math.sin(time + i) * 10;
      const atomX = x + Math.cos(angle) * radius;
      const atomY = y + Math.sin(angle) * radius;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(atomX, atomY);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(atomX, atomY, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const radius = 50 + i * 30;
      const rotation = time * (i + 1) * 0.5;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.3, rotation, 0, Math.PI * 2);
      ctx.stroke();

      const electronX = x + Math.cos(rotation * 3) * radius;
      const electronY = y + Math.sin(rotation * 3) * radius * 0.3;
      ctx.fillStyle = "#ffff00";
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(electronX, electronY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const renderCell = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - 20, y - 10, 25, 0, Math.PI * 2);
    ctx.fill();

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
    const size = 60;
    const rotation = time;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    const vertices = [
      [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
      [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]
    ];

    const projected = vertices.map(([vx, vy, vz]) => {
      const rx = vx * Math.cos(rotation) - vz * Math.sin(rotation);
      const rz = vx * Math.sin(rotation) + vz * Math.cos(rotation);
      const scale = 300 / (300 + rz);
      return [x + rx * scale, y + vy * scale];
    });

    const edges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];

    edges.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(projected[start][0], projected[start][1]);
      ctx.lineTo(projected[end][0], projected[end][1]);
      ctx.stroke();
    });
  };

  const renderAlgorithm = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    const bars = 8;
    const barWidth = 15;
    const spacing = 20;
    const totalWidth = bars * (barWidth + spacing);
    const startX = x - totalWidth / 2;

    for (let i = 0; i < bars; i++) {
      const height = 30 + Math.sin(time + i * 0.5) * 20 + Math.sin(time * 2 + i) * 15;
      const barX = startX + i * (barWidth + spacing);
      const barY = y - height / 2;

      const highlight = Math.floor((time * 2) % bars) === i;
      ctx.fillStyle = highlight ? "#ffff00" : color;
      ctx.fillRect(barX, barY, barWidth, height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(Math.floor(height/5).toString(), barX + barWidth/2, barY + height + 20);
    }
  };

  const renderDataStructure = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    const nodeRadius = 25;
    const levelHeight = 70;
    
    // Root node
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - levelHeight, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("A", x, y - levelHeight + 6);

    // Second level
    const level2Y = y;
    const level2Distance = 60;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - level2Distance, level2Y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText("B", x - level2Distance, level2Y + 6);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + level2Distance, level2Y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText("C", x + level2Distance, level2Y + 6);

    // Connections
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y - levelHeight + nodeRadius);
    ctx.lineTo(x - level2Distance, level2Y - nodeRadius);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - levelHeight + nodeRadius);
    ctx.lineTo(x + level2Distance, level2Y - nodeRadius);
    ctx.stroke();
  };

  const renderNetwork = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    const nodes = [
      { x: x, y: y - 60, label: "Router" },
      { x: x - 80, y: y, label: "PC1" },
      { x: x + 80, y: y, label: "PC2" },
      { x: x - 40, y: y + 60, label: "Server" },
      { x: x + 40, y: y + 60, label: "Switch" }
    ];

    const connections = [[0, 1], [0, 2], [0, 3], [0, 4], [3, 4]];

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    connections.forEach(([from, to], index) => {
      const fromNode = nodes[from];
      const toNode = nodes[to];
      
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();

      const packetProgress = (time + index * 0.7) % 2;
      if (packetProgress < 1) {
        const packetX = fromNode.x + (toNode.x - fromNode.x) * packetProgress;
        const packetY = fromNode.y + (toNode.y - fromNode.y) * packetProgress;
        
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    nodes.forEach((node, index) => {
      const pulse = 1 + Math.sin(time * 3 + index) * 0.15;
      const radius = 20 * pulse;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y - radius - 10);
    });
  };

  const renderDefault = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string) => {
    const radius = 50 + Math.sin(time * 2) * 10;
    
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1;
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("AR", x, y + 8);
  };

  const stopARSession = () => {
    setIsActive(false);
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }
    
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
      <div className="relative">
        {/* Camera Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`${fullscreen ? 'w-full h-full' : 'w-full h-96'} bg-gray-900 rounded-lg object-cover`}
        />

        {/* AR Overlay Canvas */}
        <canvas
          ref={overlayRef}
          className={`absolute inset-0 pointer-events-none z-10 ${!isActive ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* AR Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
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
        <div className="absolute bottom-4 left-4 right-4 z-20">
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
                  <Sparkles className="mr-2 h-4 w-4" />
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
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-medium">Initializing AR Session...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}