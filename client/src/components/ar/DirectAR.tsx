import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DirectARProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function DirectAR({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "atom",
  onSessionEnd 
}: DirectARProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rotation, setRotation] = useState(0);
  
  const { toast } = useToast();

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const startCamera = async () => {
    setStatus('requesting');
    setErrorMessage('');
    
    // Add timeout for camera permission
    const timeoutId = setTimeout(() => {
      if (status === 'requesting') {
        setStatus('error');
        setErrorMessage('Camera permission timeout - please allow camera access');
        toast({
          title: "Permission Required",
          description: "Please allow camera access and try again",
          variant: "destructive",
        });
      }
    }, 10000); // 10 second timeout
    
    try {
      console.log("Direct camera request...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      clearTimeout(timeoutId);

      if (videoRef.current) {
        const video = videoRef.current;
        streamRef.current = stream;
        
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        
        // Wait for video to load
        video.onloadedmetadata = () => {
          video.play().then(() => {
            console.log("Camera active, starting AR...");
            setStatus('active');
            startAnimation();
            
            toast({
              title: "AR Started",
              description: `Displaying ${selectedModel}`,
            });
          }).catch(playErr => {
            console.error("Video play error:", playErr);
            setStatus('error');
            setErrorMessage('Video playback failed');
          });
        };
      }
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Camera failed:", error);
      setStatus('error');
      
      if (error?.name === 'NotAllowedError') {
        setErrorMessage('Camera permission denied - please allow camera access');
      } else if (error?.name === 'NotFoundError') {
        setErrorMessage('No camera found on this device');
      } else if (error?.name === 'NotReadableError') {
        setErrorMessage('Camera is being used by another application');
      } else {
        setErrorMessage('Camera access failed - ' + (error?.message || 'Unknown error'));
      }
      
      toast({
        title: "Camera Error",
        description: "Please check camera permissions",
        variant: "destructive",
      });
    }
  };

  const startAnimation = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (status !== 'active') return;

      canvas.width = video.offsetWidth || 640;
      canvas.height = video.offsetHeight || 480;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setRotation(prev => prev + 0.03);
      drawModel(ctx, canvas.width, canvas.height, rotation);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const drawModel = (ctx: CanvasRenderingContext2D, width: number, height: number, rot: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rot);

    switch (selectedModel) {
      case "Electromagnetic Field":
        drawElectricField(ctx);
        break;
      case "Atomic Structure":
        drawAtom(ctx);
        break;
      case "Molecular Bonding":
        drawMolecule(ctx);
        break;
      case "Wave Interference":
        drawWave(ctx);
        break;
      case "Chemical Reactions":
        drawReaction(ctx);
        break;
      case "Periodic Elements":
        drawPeriodic(ctx);
        break;
      default:
        drawCube(ctx);
    }

    ctx.restore();

    // Info overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(10, height - 70, 200, 50);
    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.fillText(selectedModel, 20, height - 45);
    ctx.font = "10px Arial";
    ctx.fillText(`Subject: ${subject}`, 20, height - 25);
  };

  const drawElectricField = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#00bfff";
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 80, Math.sin(angle) * 80);
      ctx.stroke();
      
      ctx.fillStyle = "#00bfff";
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 60, Math.sin(angle) * 60, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawAtom = (ctx: CanvasRenderingContext2D) => {
    // Nucleus
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Orbits
    for (let i = 0; i < 3; i++) {
      const radius = 40 + i * 25;
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Electrons
      const electrons = 2 + i;
      for (let e = 0; e < electrons; e++) {
        const angle = (e / electrons) * Math.PI * 2 + i * 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        ctx.fillStyle = "#4ecdc4";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawMolecule = (ctx: CanvasRenderingContext2D) => {
    const atoms = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      atoms.push({
        x: Math.cos(angle) * 60,
        y: Math.sin(angle) * 60
      });
    }
    
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    for (let i = 0; i < atoms.length; i++) {
      const current = atoms[i];
      const next = atoms[(i + 1) % atoms.length];
      
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    
    atoms.forEach((atom, index) => {
      ctx.fillStyle = index % 2 === 0 ? "#ff6b6b" : "#4ecdc4";
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawWave = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    for (let x = -100; x <= 100; x += 5) {
      const y = Math.sin(x * 0.05) * 25;
      if (x === -100) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 60;
      const y = Math.sin(x * 0.05) * 25;
      
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawReaction = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(-60, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-30, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(5, -5);
    ctx.moveTo(10, 0);
    ctx.lineTo(5, 5);
    ctx.stroke();
    
    ctx.fillStyle = "#4ecdc4";
    ctx.beginPath();
    ctx.arc(40, -10, 13, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(40, 10, 13, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPeriodic = (ctx: CanvasRenderingContext2D) => {
    const elements = [
      { symbol: "H", x: -60, y: -30, color: "#ff6b6b" },
      { symbol: "He", x: -20, y: -30, color: "#4ecdc4" },
      { symbol: "Li", x: -60, y: 0, color: "#ffeb3b" },
      { symbol: "Be", x: -20, y: 0, color: "#ff9800" },
      { symbol: "C", x: 20, y: 0, color: "#2196f3" },
      { symbol: "N", x: 60, y: 0, color: "#00bcd4" },
      { symbol: "O", x: 20, y: 30, color: "#4caf50" },
      { symbol: "F", x: 60, y: 30, color: "#cddc39" }
    ];
    
    elements.forEach(element => {
      ctx.fillStyle = element.color;
      ctx.fillRect(element.x - 10, element.y - 10, 20, 20);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(element.x - 10, element.y - 10, 20, 20);
      
      ctx.fillStyle = "#000";
      ctx.font = "bold 8px Arial";
      ctx.textAlign = "center";
      ctx.fillText(element.symbol, element.x, element.y + 2);
    });
  };

  const drawCube = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(-30, -30, 60, 60);
    ctx.strokeRect(-15, -15, 60, 60);
    
    ctx.beginPath();
    ctx.moveTo(-30, -30);
    ctx.lineTo(-15, -15);
    ctx.moveTo(30, -30);
    ctx.lineTo(45, -15);
    ctx.moveTo(30, 30);
    ctx.lineTo(45, 45);
    ctx.moveTo(-30, 30);
    ctx.lineTo(-15, 45);
    ctx.stroke();
  };

  if (status === 'idle') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md p-6">
          <Camera className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-bold mb-2">AR Ready</h2>
          <p className="mb-4 text-gray-300">Start AR to view {selectedModel} in 3D</p>
          <div className="space-x-2">
            <Button size="lg" onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Start AR
            </Button>
            <Button variant="outline" onClick={onSessionEnd}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'requesting') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md p-6">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-lg font-bold mb-2">Camera Permission Required</h2>
          <p className="mb-4 text-gray-300">
            Your browser is asking for camera access. Please click "Allow" in the permission dialog.
          </p>
          <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-3 mb-4 text-sm">
            <p>Look for a camera icon in your browser's address bar or a permission popup.</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onSessionEnd}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md p-6">
          <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Camera Error</h2>
          <p className="mb-4 text-gray-300">{errorMessage}</p>
          <div className="space-x-2">
            <Button onClick={startCamera}>Try Again</Button>
            <Button variant="outline" onClick={onSessionEnd}>Exit</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

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
          onClick={() => {
            cleanup();
            onSessionEnd();
          }}
          className="bg-red-600 text-white border-red-600 hover:bg-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute bottom-6 left-4 right-4 flex justify-center z-10">
        <div className="bg-black/70 rounded-lg p-3 text-white text-center">
          <h3 className="font-bold">{selectedModel}</h3>
          <p className="text-xs opacity-75">Auto-rotating • {subject}</p>
        </div>
      </div>
    </div>
  );
}