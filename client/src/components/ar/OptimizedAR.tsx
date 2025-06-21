import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OptimizedARProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function OptimizedAR({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "Atom",
  onSessionEnd 
}: OptimizedARProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const getModel3D = (model: string) => {
    const models: { [key: string]: string } = {
      "Atom": `
        <a-sphere 
          position="0 0 0" 
          radius="0.3" 
          color="#4FC3F7" 
          material="metalness: 0.3; roughness: 0.4"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"
        >
          <a-sphere position="0.5 0 0" radius="0.05" color="#FFB74D"></a-sphere>
          <a-sphere position="-0.5 0 0" radius="0.05" color="#FFB74D"></a-sphere>
          <a-torus 
            position="0 0 0" 
            radius="0.5" 
            radius-tubular="0.02" 
            color="#81C784" 
            rotation="90 0 0"
            animation="property: rotation; to: 90 360 0; loop: true; dur: 3000"
          ></a-torus>
        </a-sphere>
      `,
      "Electromagnetic Field": `
        <a-entity>
          <a-cylinder 
            position="0 0 0" 
            radius="0.03" 
            height="1.5" 
            color="#E91E63"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 3000"
          ></a-cylinder>
          <a-torus 
            position="0 0.3 0" 
            radius="0.2" 
            radius-tubular="0.015" 
            color="#2196F3"
            animation="property: rotation; to: 360 0 0; loop: true; dur: 2000"
          ></a-torus>
          <a-torus 
            position="0 0 0" 
            radius="0.3" 
            radius-tubular="0.015" 
            color="#2196F3"
            animation="property: rotation; to: 360 0 0; loop: true; dur: 2500"
          ></a-torus>
          <a-torus 
            position="0 -0.3 0" 
            radius="0.2" 
            radius-tubular="0.015" 
            color="#2196F3"
            animation="property: rotation; to: 360 0 0; loop: true; dur: 2000"
          ></a-torus>
        </a-entity>
      `,
      "DNA Helix": `
        <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 6000">
          <a-cylinder position="0.2 0 0" radius="0.015" height="1.5" color="#4CAF50" rotation="0 0 30"></a-cylinder>
          <a-cylinder position="-0.2 0 0" radius="0.015" height="1.5" color="#FF5722" rotation="0 0 -30"></a-cylinder>
          <a-sphere position="0.2 0.6 0" radius="0.03" color="#2196F3"></a-sphere>
          <a-sphere position="-0.2 0.6 0" radius="0.03" color="#FFC107"></a-sphere>
          <a-sphere position="0.2 -0.6 0" radius="0.03" color="#9C27B0"></a-sphere>
          <a-sphere position="-0.2 -0.6 0" radius="0.03" color="#FF9800"></a-sphere>
        </a-entity>
      `,
      "Molecular Structure": `
        <a-entity animation="property: rotation; to: 360 360 0; loop: true; dur: 8000">
          <a-sphere position="0 0 0" radius="0.1" color="#F44336"></a-sphere>
          <a-sphere position="0.25 0.25 0" radius="0.07" color="#2196F3"></a-sphere>
          <a-sphere position="-0.25 0.25 0" radius="0.07" color="#2196F3"></a-sphere>
          <a-sphere position="0.25 -0.25 0" radius="0.07" color="#4CAF50"></a-sphere>
          <a-sphere position="-0.25 -0.25 0" radius="0.07" color="#4CAF50"></a-sphere>
          <a-cylinder position="0.125 0.125 0" radius="0.005" height="0.25" color="#666" rotation="0 0 45"></a-cylinder>
          <a-cylinder position="-0.125 0.125 0" radius="0.005" height="0.25" color="#666" rotation="0 0 -45"></a-cylinder>
          <a-cylinder position="0.125 -0.125 0" radius="0.005" height="0.25" color="#666" rotation="0 0 -45"></a-cylinder>
          <a-cylinder position="-0.125 -0.125 0" radius="0.005" height="0.25" color="#666" rotation="0 0 45"></a-cylinder>
        </a-entity>
      `
    };
    return models[model] || models["Atom"];
  };

  const initializeAR = async () => {
    if (!containerRef.current) {
      console.log("Container not available for AR initialization");
      return;
    }

    console.log("Starting AR initialization...");

    try {
      // Clear any existing content
      containerRef.current.innerHTML = '';

      // Check for WebXR support
      const hasWebXR = 'xr' in navigator;
      const hasGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

      console.log("Device capabilities:", { hasWebXR, hasGetUserMedia });

      if (!hasGetUserMedia) {
        console.warn("Camera access not available, using fallback");
        throw new Error("Camera access not available");
      }

      // Create AR scene with marker tracking
      const arScene = `
        <a-scene
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          loading-screen="enabled: false"
          renderer="antialias: true; alpha: true; precision: medium;"
          background="transparent: true"
        >
          <!-- Hiro marker -->
          <a-marker 
            preset="hiro" 
            id="hiro-marker"
            raycaster="objects: .clickable"
            emitevents="true"
            cursor="fuse: false; rayOrigin: mouse;"
          >
            <a-entity 
              id="model-anchor"
              position="0 0.5 0"
              scale="0.8 0.8 0.8"
            >
              ${getModel3D(selectedModel)}
            </a-entity>
          </a-marker>

          <!-- Pattern marker (custom) -->
          <a-marker 
            type="pattern" 
            url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            id="pattern-marker"
            raycaster="objects: .clickable"
            emitevents="true"
            cursor="fuse: false; rayOrigin: mouse;"
          >
            <a-entity 
              id="pattern-model-anchor"
              position="0 0.5 0"
              scale="0.8 0.8 0.8"
            >
              ${getModel3D(selectedModel)}
            </a-entity>
          </a-marker>

          <!-- Barcode marker (fallback) -->
          <a-marker 
            type="barcode" 
            value="0"
            id="barcode-marker"
            raycaster="objects: .clickable"
            emitevents="true"
            cursor="fuse: false; rayOrigin: mouse;"
          >
            <a-entity 
              id="barcode-model-anchor"
              position="0 0.5 0"
              scale="0.8 0.8 0.8"
            >
              ${getModel3D(selectedModel)}
            </a-entity>
          </a-marker>

          <!-- Camera entity -->
          <a-entity 
            camera
            look-controls-enabled="false"
            arjs-look-controls="smoothingFactor: 0.7"
            arjs-device-orientation-controls="smoothingFactor: 0.7"
          ></a-entity>
        </a-scene>
      `;

      containerRef.current.innerHTML = arScene;
      console.log("AR scene HTML injected");

      // Set timeout fallback in case AR doesn't initialize
      const fallbackTimeout = setTimeout(() => {
        console.warn("AR initialization timeout, switching to fallback");
        initializeFallback();
      }, 8000);

      // Wait for scene initialization
      setTimeout(() => {
        try {
          const scene = containerRef.current?.querySelector('a-scene');
          if (scene) {
            console.log("AR scene found, setting up event listeners");
            
            // Add marker found/lost event listeners
            const markers = scene.querySelectorAll('a-marker');
            console.log(`Found ${markers.length} markers`);
            
            markers.forEach(marker => {
              marker.addEventListener('markerFound', () => {
                console.log('Marker found:', marker.id);
                toast({
                  title: "AR Marker Detected",
                  description: `${selectedModel} model is now visible`,
                });
              });

              marker.addEventListener('markerLost', () => {
                console.log('Marker lost:', marker.id);
              });
            });

            clearTimeout(fallbackTimeout);
            setIsLoaded(true);
            setIsLoading(false);
            console.log("AR initialization completed successfully");
          } else {
            console.error("Scene element not found");
            throw new Error("Scene failed to initialize");
          }
        } catch (sceneError) {
          console.error("Scene setup error:", sceneError);
          clearTimeout(fallbackTimeout);
          initializeFallback();
        }
      }, 4000);

    } catch (err) {
      console.error("AR initialization error:", err);
      setError(err instanceof Error ? err.message : "AR initialization failed");
      // Fallback to 3D viewer
      initializeFallback();
    }
  };

  const initializeFallback = () => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `
      <a-scene
        embedded
        style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        background="color: #1a1a2e"
      >
        <a-entity position="0 0 -2" scale="1.5 1.5 1.5">
          ${getModel3D(selectedModel)}
        </a-entity>

        <a-camera 
          position="0 1.6 0" 
          look-controls="enabled: true" 
          wasd-controls="enabled: true"
        ></a-camera>
        
        <a-light type="ambient" color="#404040" intensity="0.6"></a-light>
        <a-light type="directional" position="1 1 0.5" color="#ffffff" intensity="0.8"></a-light>
        <a-sky color="#0f0f23"></a-sky>
      </a-scene>
    `;

    setTimeout(() => {
      setIsLoaded(true);
      setIsLoading(false);
      toast({
        title: "3D Viewer Mode",
        description: `${selectedModel} loaded in fallback mode`,
      });
    }, 2000);
  };

  const loadLibraries = () => {
    setIsLoading(true);
    setError("");
    console.log("Loading 3D framework for reliable viewing...");

    // Use fallback mode for reliable operation
    if ((window as any).AFRAME) {
      console.log("A-Frame available, using 3D viewer mode");
      setTimeout(() => {
        const waitForContainer = () => {
          if (containerRef.current) {
            console.log("Container ready, initializing 3D viewer");
            initializeFallback();
          } else {
            console.log("Waiting for container...");
            setTimeout(waitForContainer, 100);
          }
        };
        waitForContainer();
      }, 500);
      return;
    }

    console.log("Loading A-Frame framework...");
    const aframeScript = document.createElement('script');
    aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    aframeScript.onload = () => {
      console.log("A-Frame loaded successfully");
      setTimeout(() => {
        const waitForContainer = () => {
          if (containerRef.current) {
            console.log("Container ready, initializing 3D viewer");
            initializeFallback();
          } else {
            console.log("Waiting for container...");
            setTimeout(waitForContainer, 100);
          }
        };
        waitForContainer();
      }, 500);
    };
    aframeScript.onerror = () => {
      console.error("A-Frame failed to load");
      setError("Failed to load 3D framework");
      setIsLoading(false);
    };
    document.head.appendChild(aframeScript);
  };

  useEffect(() => {
    loadLibraries();
    
    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [selectedModel]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Initializing AR</h3>
          <p className="text-gray-300">Loading {selectedModel} model...</p>
          <p className="text-sm text-gray-400 mt-2">Point camera at Hiro marker or flat surface</p>
        </div>
      </div>
    );
  }

  if (error && !isLoaded) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-xl font-bold mb-2 text-red-400">AR Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={onSessionEnd} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* AR Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ position: 'relative' }}
      />
      
      {/* Exit Button */}
      <Button
        onClick={onSessionEnd}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        <X className="w-4 h-4 mr-1" />
        Exit AR
      </Button>
      
      {/* Instructions Overlay */}
      <div className="absolute top-4 left-4 right-16 z-50">
        <div className="bg-black/80 rounded-lg p-3 text-white text-sm border border-white/20">
          <h3 className="font-bold text-blue-400">{selectedModel} - {subject}</h3>
          <p className="opacity-90 mt-1">
            {error ? "3D Viewer Mode - Drag to rotate" : "Point camera at Hiro marker or any flat surface"}
          </p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-center z-50">
        <div className="bg-black/80 rounded-lg px-4 py-2 text-white text-center border border-white/20">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoaded ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-sm">
              {error ? "Fallback Mode" : "AR Mode Active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}