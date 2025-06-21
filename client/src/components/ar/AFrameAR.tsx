import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AFrameARProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function AFrameAR({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "atom",
  onSessionEnd 
}: AFrameARProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAFrame();
    return cleanup;
  }, []);

  const cleanup = () => {
    // Clean up A-Frame scene
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  const loadAFrame = () => {
    setIsLoading(true);
    
    // Add timeout for loading
    const loadingTimeout = setTimeout(() => {
      console.log("Loading timeout, proceeding anyway...");
      initializeAR();
    }, 8000);
    
    // Load A-Frame library
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.onload = () => {
      console.log("A-Frame loaded successfully");
      
      // Load AR.js with timeout
      const arScript = document.createElement('script');
      arScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
      
      const arLoadTimeout = setTimeout(() => {
        console.log("AR.js loading timeout, proceeding with basic AR...");
        clearTimeout(loadingTimeout);
        initializeBasicAR();
      }, 5000);
      
      arScript.onload = () => {
        console.log("AR.js loaded successfully");
        clearTimeout(arLoadTimeout);
        clearTimeout(loadingTimeout);
        setTimeout(() => {
          console.log("Initializing AR scene...");
          initializeAR();
        }, 1000);
      };
      
      arScript.onerror = () => {
        console.log("AR.js failed to load, using basic AR...");
        clearTimeout(arLoadTimeout);
        clearTimeout(loadingTimeout);
        initializeBasicAR();
      };
      
      document.head.appendChild(arScript);
    };
    
    script.onerror = () => {
      console.error("A-Frame failed to load");
      clearTimeout(loadingTimeout);
      initializeBasicAR();
    };
    
    document.head.appendChild(script);
  };

  const initializeBasicAR = () => {
    if (!containerRef.current) return;

    const basicScene = `
      <a-scene
        embedded
        style="height: 100vh; width: 100vw;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
      >
        <!-- Basic 3D scene without AR tracking -->
        <a-entity position="0 0 -3" rotation="0 0 0">
          ${getModelHTML(selectedModel)}
        </a-entity>

        <!-- Camera -->
        <a-camera position="0 1.6 0" look-controls="enabled: true" wasd-controls="enabled: true"></a-camera>
        
        <!-- Lighting -->
        <a-light type="ambient" color="#404040"></a-light>
        <a-light type="directional" position="0 1 0" color="#ffffff"></a-light>
      </a-scene>

      <!-- Instructions overlay -->
      <div style="position: fixed; top: 20px; left: 20px; right: 20px; z-index: 1000; color: white; text-align: center; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 10px; font-family: Arial;">
        <h3 style="margin: 0 0 10px 0; color: #00bfff;">${selectedModel} - ${subject}</h3>
        <p style="margin: 0; font-size: 14px;">3D Model View - Drag to rotate, scroll to zoom</p>
      </div>

      <!-- Exit button -->
      <div style="position: fixed; top: 20px; right: 20px; z-index: 1001;">
        <button 
          onclick="window.exitAR()" 
          style="background: #ef4444; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-size: 16px; cursor: pointer;"
        >
          ✕ Exit
        </button>
      </div>
    `;

    containerRef.current.innerHTML = basicScene;

    // Add exit function to window
    (window as any).exitAR = () => {
      onSessionEnd();
    };

    setIsLoaded(true);
    setIsLoading(false);

    toast({
      title: "3D Viewer Ready",
      description: `${selectedModel} model loaded in 3D view`,
    });
  };

  const initializeAR = () => {
    // Wait for container to be available
    const tryInitialize = () => {
      if (!containerRef.current) {
        console.log("Container ref not available, retrying...");
        setTimeout(tryInitialize, 100);
        return;
      }

      console.log("Creating AR scene for:", selectedModel);

      const arScene = `
        <a-scene
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"
          style="height: 100vh; width: 100vw;"
          vr-mode-ui="enabled: false"
          loading-screen="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          <!-- Marker -->
          <a-marker preset="hiro" id="marker">
            ${getModelHTML(selectedModel)}
          </a-marker>

          <!-- Camera -->
          <a-entity camera look-controls-enabled="false" arjs-look-controls="smoothingFactor: 0.1"></a-entity>
        </a-scene>

        <!-- Instructions overlay -->
        <div style="position: fixed; top: 20px; left: 20px; right: 20px; z-index: 1000; color: white; text-align: center; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 10px; font-family: Arial;">
          <h3 style="margin: 0 0 10px 0; color: #00bfff;">${selectedModel} - ${subject}</h3>
          <p style="margin: 0; font-size: 14px;">Point your camera at a flat surface</p>
        </div>

        <!-- Exit button -->
        <div style="position: fixed; top: 20px; right: 20px; z-index: 1001;">
          <button 
            onclick="window.exitAR()" 
            style="background: #ef4444; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-size: 16px; cursor: pointer;"
          >
            ✕ Exit AR
          </button>
        </div>
      `;

      try {
        containerRef.current.innerHTML = arScene;
        console.log("AR scene HTML injected successfully");

        // Add exit function to window
        (window as any).exitAR = () => {
          onSessionEnd();
        };

        setIsLoaded(true);
        setIsLoading(false);

        toast({
          title: "AR Ready",
          description: `${selectedModel} model loaded successfully`,
        });

        console.log("AR initialization completed");
      } catch (error) {
        console.error("Error initializing AR:", error);
        initializeBasicAR();
      }
    };

    tryInitialize();
  };

  const getModelHTML = (model: string) => {
    const animations = `
      animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
      animation__scale="property: scale; to: 1.2 1.2 1.2; dir: alternate; loop: true; dur: 2000"
    `;

    switch (model) {
      case "Electromagnetic Field":
        return `
          <a-entity position="0 0.5 0" ${animations}>
            <!-- Central charge -->
            <a-sphere position="0 0 0" radius="0.1" color="#ff4444" metalness="0.8" roughness="0.2"></a-sphere>
            
            <!-- Electric field lines -->
            <a-cylinder position="0.3 0 0" radius="0.01" height="0.6" color="#00bfff" rotation="0 0 90"></a-cylinder>
            <a-cylinder position="-0.3 0 0" radius="0.01" height="0.6" color="#00bfff" rotation="0 0 90"></a-cylinder>
            <a-cylinder position="0 0.3 0" radius="0.01" height="0.6" color="#00bfff"></a-cylinder>
            <a-cylinder position="0 -0.3 0" radius="0.01" height="0.6" color="#00bfff"></a-cylinder>
            <a-cylinder position="0.2 0.2 0" radius="0.01" height="0.6" color="#00bfff" rotation="0 0 45"></a-cylinder>
            <a-cylinder position="-0.2 -0.2 0" radius="0.01" height="0.6" color="#00bfff" rotation="0 0 45"></a-cylinder>
            <a-cylinder position="0.2 -0.2 0" radius="0.01" height="0.6" color="#00bfff" rotation="0 0 -45"></a-cylinder>
            <a-cylinder position="-0.2 0.2 0" radius="0.01" height="0.6" color="#00bfff" rotation="0 0 -45"></a-cylinder>
            
            <!-- Field points -->
            <a-sphere position="0.4 0 0" radius="0.02" color="#00bfff"></a-sphere>
            <a-sphere position="-0.4 0 0" radius="0.02" color="#00bfff"></a-sphere>
            <a-sphere position="0 0.4 0" radius="0.02" color="#00bfff"></a-sphere>
            <a-sphere position="0 -0.4 0" radius="0.02" color="#00bfff"></a-sphere>
          </a-entity>
        `;

      case "Atomic Structure":
        return `
          <a-entity position="0 0.5 0" ${animations}>
            <!-- Nucleus -->
            <a-sphere position="0 0 0" radius="0.08" color="#ff6b6b" metalness="0.8" roughness="0.2"></a-sphere>
            
            <!-- Electron orbits -->
            <a-torus position="0 0 0" radius-outer="0.3" radius-tubular="0.005" color="white" opacity="0.3"></a-torus>
            <a-torus position="0 0 0" radius-outer="0.5" radius-tubular="0.005" color="white" opacity="0.3" rotation="30 0 0"></a-torus>
            <a-torus position="0 0 0" radius-outer="0.7" radius-tubular="0.005" color="white" opacity="0.3" rotation="60 0 0"></a-torus>
            
            <!-- Electrons -->
            <a-sphere position="0.3 0 0" radius="0.03" color="#4ecdc4" 
              animation="property: rotation; to: 0 360 0; loop: true; dur: 3000"
              animation__orbit="property: position; to: -0.3 0 0; dir: alternate; loop: true; dur: 3000"></a-sphere>
            <a-sphere position="0 0.5 0" radius="0.03" color="#4ecdc4"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"
              animation__orbit="property: position; to: 0 -0.5 0; dir: alternate; loop: true; dur: 4000"></a-sphere>
            <a-sphere position="0.7 0 0" radius="0.03" color="#4ecdc4"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 5000"
              animation__orbit="property: position; to: -0.7 0 0; dir: alternate; loop: true; dur: 5000"></a-sphere>
          </a-entity>
        `;

      case "Molecular Bonding":
        return `
          <a-entity position="0 0.5 0" ${animations}>
            <!-- Benzene ring structure -->
            <a-sphere position="0.3 0 0" radius="0.06" color="#ff6b6b"></a-sphere>
            <a-sphere position="0.15 0.26 0" radius="0.06" color="#4ecdc4"></a-sphere>
            <a-sphere position="-0.15 0.26 0" radius="0.06" color="#ff6b6b"></a-sphere>
            <a-sphere position="-0.3 0 0" radius="0.06" color="#4ecdc4"></a-sphere>
            <a-sphere position="-0.15 -0.26 0" radius="0.06" color="#ff6b6b"></a-sphere>
            <a-sphere position="0.15 -0.26 0" radius="0.06" color="#4ecdc4"></a-sphere>
            
            <!-- Bonds -->
            <a-cylinder position="0.225 0.13 0" radius="0.01" height="0.3" color="white" rotation="0 0 30"></a-cylinder>
            <a-cylinder position="0 0.26 0" radius="0.01" height="0.3" color="white" rotation="0 0 90"></a-cylinder>
            <a-cylinder position="-0.225 0.13 0" radius="0.01" height="0.3" color="white" rotation="0 0 150"></a-cylinder>
            <a-cylinder position="-0.225 -0.13 0" radius="0.01" height="0.3" color="white" rotation="0 0 -150"></a-cylinder>
            <a-cylinder position="0 -0.26 0" radius="0.01" height="0.3" color="white" rotation="0 0 -90"></a-cylinder>
            <a-cylinder position="0.225 -0.13 0" radius="0.01" height="0.3" color="white" rotation="0 0 -30"></a-cylinder>
          </a-entity>
        `;

      case "Wave Interference":
        return `
          <a-entity position="0 0.5 0" ${animations}>
            <!-- Wave representation -->
            <a-curve position="0 0 0">
              <a-curve-point position="-0.5 0 0"></a-curve-point>
              <a-curve-point position="-0.25 0.2 0"></a-curve-point>
              <a-curve-point position="0 0 0"></a-curve-point>
              <a-curve-point position="0.25 -0.2 0"></a-curve-point>
              <a-curve-point position="0.5 0 0"></a-curve-point>
            </a-curve>
            
            <!-- Wave crests -->
            <a-sphere position="-0.25 0.2 0" radius="0.04" color="#ffd700"
              animation="property: scale; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 1000"></a-sphere>
            <a-sphere position="0.25 -0.2 0" radius="0.04" color="#ffd700"
              animation="property: scale; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 1000; delay: 500"></a-sphere>
            
            <!-- Interference pattern -->
            <a-box position="0 -0.3 0" width="1" height="0.02" depth="0.02" color="#00ff00" opacity="0.8"
              animation="property: scale; to: 1.2 1 1; dir: alternate; loop: true; dur: 1500"></a-box>
          </a-entity>
        `;

      case "Chemical Reactions":
        return `
          <a-entity position="0 0.5 0" ${animations}>
            <!-- Reactants -->
            <a-sphere position="-0.4 0 0" radius="0.08" color="#ff6b6b"></a-sphere>
            <a-sphere position="-0.2 0 0" radius="0.06" color="#ff6b6b"></a-sphere>
            
            <!-- Arrow -->
            <a-cylinder position="0 0 0" radius="0.01" height="0.2" color="white" rotation="0 0 90"></a-cylinder>
            <a-cone position="0.1 0 0" radius-bottom="0.03" height="0.06" color="white" rotation="0 0 -90"></a-cone>
            
            <!-- Products -->
            <a-sphere position="0.3 0.1 0" radius="0.07" color="#4ecdc4"></a-sphere>
            <a-sphere position="0.3 -0.1 0" radius="0.07" color="#4ecdc4"></a-sphere>
            
            <!-- Energy animation -->
            <a-sphere position="0 0.2 0" radius="0.02" color="#ffff00" opacity="0.8"
              animation="property: scale; to: 2 2 2; dir: alternate; loop: true; dur: 1000"
              animation__pos="property: position; to: 0 0.4 0; dir: alternate; loop: true; dur: 2000"></a-sphere>
          </a-entity>
        `;

      case "Periodic Elements":
        return `
          <a-entity position="0 0.5 0" ${animations}>
            <!-- Periodic table grid -->
            <a-box position="-0.3 0.2 0" width="0.1" height="0.1" depth="0.02" color="#ff6b6b">
              <a-text value="H" position="0 0 0.02" align="center" color="white" scale="0.5 0.5 0.5"></a-text>
            </a-box>
            <a-box position="-0.1 0.2 0" width="0.1" height="0.1" depth="0.02" color="#4ecdc4">
              <a-text value="He" position="0 0 0.02" align="center" color="white" scale="0.4 0.4 0.4"></a-text>
            </a-box>
            <a-box position="-0.3 0 0" width="0.1" height="0.1" depth="0.02" color="#ffeb3b">
              <a-text value="Li" position="0 0 0.02" align="center" color="black" scale="0.4 0.4 0.4"></a-text>
            </a-box>
            <a-box position="-0.1 0 0" width="0.1" height="0.1" depth="0.02" color="#ff9800">
              <a-text value="Be" position="0 0 0.02" align="center" color="white" scale="0.4 0.4 0.4"></a-text>
            </a-box>
            <a-box position="0.1 0 0" width="0.1" height="0.1" depth="0.02" color="#2196f3">
              <a-text value="C" position="0 0 0.02" align="center" color="white" scale="0.5 0.5 0.5"></a-text>
            </a-box>
            <a-box position="0.3 0 0" width="0.1" height="0.1" depth="0.02" color="#00bcd4">
              <a-text value="N" position="0 0 0.02" align="center" color="white" scale="0.5 0.5 0.5"></a-text>
            </a-box>
            <a-box position="0.1 -0.2 0" width="0.1" height="0.1" depth="0.02" color="#4caf50">
              <a-text value="O" position="0 0 0.02" align="center" color="white" scale="0.5 0.5 0.5"></a-text>
            </a-box>
            <a-box position="0.3 -0.2 0" width="0.1" height="0.1" depth="0.02" color="#cddc39">
              <a-text value="F" position="0 0 0.02" align="center" color="black" scale="0.5 0.5 0.5"></a-text>
            </a-box>
          </a-entity>
        `;

      default:
        return `
          <a-entity position="0 0.5 0" ${animations}>
            <a-box position="0 0 0" width="0.4" height="0.4" depth="0.4" color="#ffffff" wireframe="true"></a-box>
            <a-box position="0.1 0.1 0.1" width="0.4" height="0.4" depth="0.4" color="#00bfff" opacity="0.7"></a-box>
          </a-entity>
        `;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-lg font-bold mb-2">Loading AR Framework</h2>
          <p className="text-gray-300">Initializing 3D models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div ref={containerRef} className="w-full h-full"></div>
      
      {/* Additional UI overlay */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-center z-50">
        <div className="bg-black/80 rounded-lg p-4 text-white text-center border border-white/20">
          <h3 className="font-bold text-lg text-blue-400">{selectedModel}</h3>
          <p className="text-sm opacity-90">Subject: {subject}</p>
          <p className="text-xs mt-1 opacity-75">3D AR Model • Auto-rotating</p>
        </div>
      </div>
    </div>
  );
}