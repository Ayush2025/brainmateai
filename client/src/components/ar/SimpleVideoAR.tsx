import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleVideoARProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function SimpleVideoAR({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "atom",
  onSessionEnd 
}: SimpleVideoARProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  
  const [cameraActive, setCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelRotation, setModelRotation] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting simple camera...");
      
      // Request camera with basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'environment'
        },
        audio: false
      });

      if (videoRef.current && stream) {
        streamRef.current = stream;
        const video = videoRef.current;
        
        // Simple video setup
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
          console.log("Simple video ready:", video.videoWidth, "x", video.videoHeight);
          video.play().then(() => {
            setCameraActive(true);
            startAROverlay();
            toast({
              title: "AR Active",
              description: `Showing ${selectedModel} model`,
            });
          }).catch(err => {
            console.error("Video play error:", err);
            setError("Could not start video playback");
          });
        };
        
        video.onerror = (e) => {
          console.error("Video error:", e);
          setError("Video error occurred");
        };
      }
      
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or unavailable");
      toast({
        title: "Camera Error",
        description: "Please allow camera access to use AR features",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startAROverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!cameraActive || !canvas || !video || !ctx) return;

      // Match canvas to video size
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update rotation
      setModelRotation(prev => prev + 0.02);

      // Draw 3D model
      drawModel(ctx, canvas.width, canvas.height, modelRotation);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const drawModel = (ctx: CanvasRenderingContext2D, width: number, height: number, rotation: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    // Draw based on selected model
    switch (selectedModel) {
      case "Electromagnetic Field":
        drawElectromagneticField(ctx);
        break;
      case "Atomic Structure":
        drawAtomicStructure(ctx);
        break;
      case "Molecular Bonding":
        drawMolecularBonding(ctx);
        break;
      case "Wave Interference":
        drawWaveInterference(ctx);
        break;
      case "Chemical Reactions":
        drawChemicalReactions(ctx);
        break;
      case "Periodic Elements":
        drawPeriodicElements(ctx);
        break;
      default:
        drawDefaultCube(ctx);
    }

    ctx.restore();

    // Model info
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(10, height - 80, 250, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText(selectedModel, 20, height - 50);
    ctx.font = "12px Arial";
    ctx.fillText(`Subject: ${subject}`, 20, height - 30);
  };

  const drawElectromagneticField = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#00bfff";
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 100, Math.sin(angle) * 100);
      ctx.stroke();
      
      // Electric field points
      ctx.fillStyle = "#00bfff";
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 80, Math.sin(angle) * 80, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Central charge
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawAtomicStructure = (ctx: CanvasRenderingContext2D) => {
    // Nucleus
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Electron orbits
    for (let orbit = 0; orbit < 3; orbit++) {
      const radius = 60 + orbit * 30;
      
      // Orbit ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Electrons
      const electrons = 2 + orbit;
      for (let e = 0; e < electrons; e++) {
        const angle = (e / electrons) * Math.PI * 2 + orbit * 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        ctx.fillStyle = "#4ecdc4";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawMolecularBonding = (ctx: CanvasRenderingContext2D) => {
    // Benzene ring
    const atoms = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      atoms.push({
        x: Math.cos(angle) * 80,
        y: Math.sin(angle) * 80
      });
    }
    
    // Bonds
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
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
      ctx.fillStyle = index % 2 === 0 ? "#ff6b6b" : "#4ecdc4";
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 15, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawWaveInterference = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    
    // Sine wave
    ctx.beginPath();
    for (let x = -120; x <= 120; x += 5) {
      const y = Math.sin(x * 0.05) * 30;
      if (x === -120) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Wave crests
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 60;
      const y = Math.sin(x * 0.05) * 30;
      
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawChemicalReactions = (ctx: CanvasRenderingContext2D) => {
    // Reactants
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(-80, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-40, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Arrow
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(8, -8);
    ctx.moveTo(15, 0);
    ctx.lineTo(8, 8);
    ctx.stroke();
    
    // Products
    ctx.fillStyle = "#4ecdc4";
    ctx.beginPath();
    ctx.arc(50, -15, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(50, 15, 18, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPeriodicElements = (ctx: CanvasRenderingContext2D) => {
    const elements = [
      { symbol: "H", x: -80, y: -40, color: "#ff6b6b" },
      { symbol: "He", x: -40, y: -40, color: "#4ecdc4" },
      { symbol: "Li", x: -80, y: 0, color: "#ffeb3b" },
      { symbol: "Be", x: -40, y: 0, color: "#ff9800" },
      { symbol: "C", x: 0, y: 0, color: "#2196f3" },
      { symbol: "N", x: 40, y: 0, color: "#00bcd4" },
      { symbol: "O", x: 80, y: 0, color: "#4caf50" },
      { symbol: "F", x: 0, y: 40, color: "#cddc39" }
    ];
    
    elements.forEach(element => {
      ctx.fillStyle = element.color;
      ctx.fillRect(element.x - 12, element.y - 12, 24, 24);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(element.x - 12, element.y - 12, 24, 24);
      
      ctx.fillStyle = "#000";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(element.symbol, element.x, element.y + 3);
    });
  };

  const drawDefaultCube = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(-40, -40, 80, 80);
    
    // 3D effect
    ctx.strokeRect(-20, -20, 80, 80);
    
    // Connect corners
    ctx.beginPath();
    ctx.moveTo(-40, -40);
    ctx.lineTo(-20, -20);
    ctx.moveTo(40, -40);
    ctx.lineTo(60, -20);
    ctx.moveTo(40, 40);
    ctx.lineTo(60, 60);
    ctx.moveTo(-40, 40);
    ctx.lineTo(-20, 60);
    ctx.stroke();
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

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md p-6">
          <CameraOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Camera Error</h2>
          <p className="mb-4 text-gray-300">{error}</p>
          <div className="space-x-2">
            <Button onClick={startCamera}>
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onSessionEnd}>
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cameraActive) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md p-6">
          <Camera className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">AR Experience Ready</h2>
          <p className="mb-4 text-gray-300">Start camera to view {selectedModel} in AR</p>
          <div className="space-x-2">
            <Button size="lg" onClick={startCamera}>
              <Camera className="w-4 h-4 mr-2" />
              Start AR Session
            </Button>
            <Button variant="outline" onClick={onSessionEnd}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {/* AR overlay canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <Badge className="bg-blue-600 text-white">
            {selectedModel}
          </Badge>
          <Badge variant="outline" className="bg-black/70 text-white border-white/30">
            AR Active
          </Badge>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onSessionEnd}
          className="bg-black/70 text-white border-white/30 hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-center z-10">
        <div className="bg-black/70 rounded-lg p-4 text-white text-center">
          <h3 className="font-bold text-lg">{selectedModel}</h3>
          <p className="text-sm opacity-90">Subject: {subject}</p>
          <p className="text-xs mt-1 opacity-75">Auto-rotating 3D model</p>
        </div>
      </div>
    </div>
  );
}