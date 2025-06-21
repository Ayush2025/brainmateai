import { useEffect, useRef, useState } from "react";
import * as ZapparWebAR from "@zappar/zappar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Settings,
  Maximize,
  Minimize,
  Info,
  Zap,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ARTutoringSessionProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  onSessionEnd: () => void;
  isFullscreen?: boolean;
}

export function ARTutoringSession({ 
  tutorId, 
  tutorName, 
  subject, 
  onSessionEnd,
  isFullscreen = false 
}: ARTutoringSessionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(isFullscreen);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [currentModel, setCurrentModel] = useState<string>("molecule");
  const { toast } = useToast();

  // AR models and content based on subject
  const arModels = {
    "Chemistry": [
      { id: "molecule", name: "3D Molecule", description: "Interactive molecular structures" },
      { id: "periodic", name: "Periodic Table", description: "3D periodic elements" },
      { id: "reaction", name: "Chemical Reactions", description: "Animated reactions" }
    ],
    "Physics": [
      { id: "atom", name: "Atomic Model", description: "Electron orbital visualization" },
      { id: "wave", name: "Wave Motion", description: "Sound and light waves" },
      { id: "circuit", name: "Electric Circuits", description: "Current flow visualization" }
    ],
    "Biology": [
      { id: "cell", name: "Cell Structure", description: "3D cell components" },
      { id: "dna", name: "DNA Helix", description: "Double helix structure" },
      { id: "organ", name: "Human Organs", description: "Anatomical models" }
    ],
    "Mathematics": [
      { id: "geometry", name: "3D Shapes", description: "Interactive geometric forms" },
      { id: "graph", name: "Function Graphs", description: "3D mathematical plots" },
      { id: "fractal", name: "Fractals", description: "Mathematical patterns" }
    ],
    "default": [
      { id: "text", name: "3D Text", description: "Educational content in 3D" },
      { id: "diagram", name: "Diagrams", description: "Interactive 3D diagrams" },
      { id: "animation", name: "Animations", description: "Educational animations" }
    ]
  };

  const getModelsForSubject = () => {
    return arModels[subject as keyof typeof arModels] || arModels.default;
  };

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    try {
      // Check if WebAR is supported
      const incompatibility = ZapparWebAR.browserIncompatible();
      const supported = incompatibility === null;
      setArSupported(supported);
      
      if (!supported) {
        console.log("AR incompatibility:", incompatibility);
        toast({
          title: "AR Not Supported",
          description: "Your device/browser doesn't support WebAR features.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("AR Support check failed:", error);
      setArSupported(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
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

  const startARSession = async () => {
    if (!canvasRef.current || !hasPermission || !arSupported) return;

    try {
      setIsLoading(true);
      
      // Initialize Zappar
      ZapparWebAR.glContextSet(canvasRef.current.getContext("webgl") || canvasRef.current.getContext("experimental-webgl"));
      ZapparWebAR.initialize();

      // Set up camera
      const camera = new ZapparWebAR.Camera();
      await camera.start();

      // Create instant tracker for markerless tracking
      const instantTracker = new ZapparWebAR.InstantWorldTracker();

      setIsARActive(true);
      
      // Start render loop
      startRenderLoop(camera, instantTracker);
      
      toast({
        title: "AR Session Started",
        description: `Interactive ${subject} content is now available in AR!`,
      });
    } catch (error) {
      console.error("Failed to start AR session:", error);
      toast({
        title: "AR Initialization Failed",
        description: "Could not start AR session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRenderLoop = (camera: any, tracker: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const render = () => {
      if (!isARActive) return;

      // Update camera frame
      camera.updateFrame();
      
      // Set up rendering
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Render camera background
      camera.drawBackground();

      // Update tracker
      tracker.updateFrame(camera);

      // Render 3D content based on current model
      if (tracker.visible.get()) {
        renderARContent(gl, tracker, currentModel);
      }

      requestAnimationFrame(render);
    };

    render();
  };

  const renderARContent = (gl: WebGLRenderingContext, tracker: any, modelType: string) => {
    // Set up projection and model-view matrices
    const projectionMatrix = tracker.camera.projectionMatrix();
    const cameraMatrix = tracker.camera.poseWithOrigin(tracker.anchor.origin);

    // Render different content based on model type and subject
    switch (modelType) {
      case "molecule":
        renderMolecule(gl, projectionMatrix, cameraMatrix);
        break;
      case "atom":
        renderAtom(gl, projectionMatrix, cameraMatrix);
        break;
      case "cell":
        renderCell(gl, projectionMatrix, cameraMatrix);
        break;
      case "geometry":
        renderGeometry(gl, projectionMatrix, cameraMatrix);
        break;
      default:
        renderDefault3DContent(gl, projectionMatrix, cameraMatrix);
    }
  };

  const renderMolecule = (gl: WebGLRenderingContext, projection: Float32Array, modelView: Float32Array) => {
    // Render 3D molecular structure
    // This would contain actual WebGL rendering code for molecules
    console.log("Rendering molecule in AR");
  };

  const renderAtom = (gl: WebGLRenderingContext, projection: Float32Array, modelView: Float32Array) => {
    // Render atomic model with electron orbitals
    console.log("Rendering atom in AR");
  };

  const renderCell = (gl: WebGLRenderingContext, projection: Float32Array, modelView: Float32Array) => {
    // Render cell structure with organelles
    console.log("Rendering cell in AR");
  };

  const renderGeometry = (gl: WebGLRenderingContext, projection: Float32Array, modelView: Float32Array) => {
    // Render 3D geometric shapes
    console.log("Rendering geometry in AR");
  };

  const renderDefault3DContent = (gl: WebGLRenderingContext, projection: Float32Array, modelView: Float32Array) => {
    // Render default educational content
    console.log("Rendering default AR content");
  };

  const stopARSession = () => {
    setIsARActive(false);
    if (canvasRef.current) {
      const gl = canvasRef.current.getContext("webgl");
      if (gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
    }
    
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

  if (arSupported === false) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            AR Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your device or browser doesn't support WebAR features. Please use a compatible device with camera access.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={onSessionEnd} className="w-full mt-4">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full'}`}>
      {/* AR Canvas */}
      <canvas
        ref={canvasRef}
        className={`${fullscreen ? 'w-full h-full' : 'w-full h-96'} bg-gray-900 rounded-lg`}
        width={fullscreen ? window.innerWidth : 800}
        height={fullscreen ? window.innerHeight : 600}
      />

      {/* AR Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="bg-black/80 rounded-lg p-3 text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AR {subject} Tutoring
          </h3>
          <p className="text-sm opacity-80">{tutorName}</p>
          <Badge variant="secondary" className="mt-1">
            Model: {getModelsForSubject().find(m => m.id === currentModel)?.name}
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
            ) : !isARActive ? (
              <Button 
                onClick={startARSession}
                disabled={isLoading}
                className="flex-1 mr-2"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isLoading ? "Starting AR..." : "Start AR Session"}
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

          {isARActive && (
            <p className="text-xs opacity-60 mt-2 text-center">
              Point your camera at a flat surface and tap to place 3D models
            </p>
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