import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DirectViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function DirectViewer({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "Atom",
  onSessionEnd 
}: DirectViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const createScene = () => {
    if (!containerRef.current) return;

    const modelData = {
      "Atom": {
        color: "#4FC3F7",
        shape: "sphere",
        description: "Atomic structure with electrons orbiting nucleus"
      },
      "Electromagnetic Field": {
        color: "#E91E63", 
        shape: "torus",
        description: "Electromagnetic field visualization"
      },
      "DNA Helix": {
        color: "#4CAF50",
        shape: "helix", 
        description: "DNA double helix structure"
      },
      "Molecular Structure": {
        color: "#F44336",
        shape: "molecule",
        description: "Complex molecular arrangement"
      }
    };

    const model = modelData[selectedModel as keyof typeof modelData] || modelData["Atom"];

    containerRef.current.innerHTML = `
      <a-scene
        embedded
        style="width: 100%; height: 100%; display: block;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        background="color: #1a1a2e"
      >
        <!-- Main 3D Model -->
        <a-entity position="0 0 -3" id="main-model">
          <!-- Atom Structure -->
          ${selectedModel === "Atom" ? `
            <a-sphere 
              position="0 0 0" 
              radius="0.4" 
              color="${model.color}" 
              material="metalness: 0.3; roughness: 0.4"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 6000"
            >
              <a-sphere position="0.7 0 0" radius="0.06" color="#FFB74D" 
                animation="property: rotation; to: 0 0 360; loop: true; dur: 3000"></a-sphere>
              <a-sphere position="-0.7 0 0" radius="0.06" color="#FFB74D"
                animation="property: rotation; to: 0 0 -360; loop: true; dur: 3000"></a-sphere>
              <a-sphere position="0 0.7 0" radius="0.06" color="#81C784"
                animation="property: rotation; to: 360 0 0; loop: true; dur: 4000"></a-sphere>
              <a-torus position="0 0 0" radius="0.7" radius-tubular="0.02" color="#81C784" 
                rotation="90 0 0" animation="property: rotation; to: 90 360 0; loop: true; dur: 5000"></a-torus>
              <a-torus position="0 0 0" radius="0.5" radius-tubular="0.015" color="#9C27B0" 
                rotation="0 45 0" animation="property: rotation; to: 0 405 0; loop: true; dur: 4000"></a-torus>
            </a-sphere>
          ` : ""}

          <!-- Electromagnetic Field -->
          ${selectedModel === "Electromagnetic Field" ? `
            <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 4000">
              <a-cylinder position="0 0 0" radius="0.04" height="2" color="${model.color}"></a-cylinder>
              <a-torus position="0 0.6 0" radius="0.3" radius-tubular="0.02" color="#2196F3"
                animation="property: rotation; to: 360 0 0; loop: true; dur: 2500"></a-torus>
              <a-torus position="0 0.3 0" radius="0.4" radius-tubular="0.02" color="#03A9F4"
                animation="property: rotation; to: 360 0 0; loop: true; dur: 3000"></a-torus>
              <a-torus position="0 0 0" radius="0.5" radius-tubular="0.02" color="#2196F3"
                animation="property: rotation; to: 360 0 0; loop: true; dur: 3500"></a-torus>
              <a-torus position="0 -0.3 0" radius="0.4" radius-tubular="0.02" color="#03A9F4"
                animation="property: rotation; to: 360 0 0; loop: true; dur: 3000"></a-torus>
              <a-torus position="0 -0.6 0" radius="0.3" radius-tubular="0.02" color="#2196F3"
                animation="property: rotation; to: 360 0 0; loop: true; dur: 2500"></a-torus>
            </a-entity>
          ` : ""}

          <!-- DNA Helix -->
          ${selectedModel === "DNA Helix" ? `
            <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 8000">
              <a-cylinder position="0.25 0 0" radius="0.02" height="2.5" color="${model.color}" rotation="0 0 20"></a-cylinder>
              <a-cylinder position="-0.25 0 0" radius="0.02" height="2.5" color="#FF5722" rotation="0 0 -20"></a-cylinder>
              
              <a-sphere position="0.25 1 0" radius="0.04" color="#2196F3"></a-sphere>
              <a-sphere position="-0.25 1 0" radius="0.04" color="#FFC107"></a-sphere>
              <a-sphere position="0.25 0.5 0" radius="0.04" color="#9C27B0"></a-sphere>
              <a-sphere position="-0.25 0.5 0" radius="0.04" color="#FF9800"></a-sphere>
              <a-sphere position="0.25 0 0" radius="0.04" color="#4CAF50"></a-sphere>
              <a-sphere position="-0.25 0 0" radius="0.04" color="#E91E63"></a-sphere>
              <a-sphere position="0.25 -0.5 0" radius="0.04" color="#2196F3"></a-sphere>
              <a-sphere position="-0.25 -0.5 0" radius="0.04" color="#FFC107"></a-sphere>
              <a-sphere position="0.25 -1 0" radius="0.04" color="#9C27B0"></a-sphere>
              <a-sphere position="-0.25 -1 0" radius="0.04" color="#FF9800"></a-sphere>
              
              ${Array.from({length: 10}, (_, i) => {
                const y = 1 - (i * 0.2);
                return `<a-cylinder position="0 ${y} 0" radius="0.008" height="0.5" color="#666" rotation="0 0 90"></a-cylinder>`;
              }).join('')}
            </a-entity>
          ` : ""}

          <!-- Molecular Structure -->
          ${selectedModel === "Molecular Structure" ? `
            <a-entity animation="property: rotation; to: 360 360 0; loop: true; dur: 10000">
              <a-sphere position="0 0 0" radius="0.12" color="${model.color}"></a-sphere>
              <a-sphere position="0.35 0.35 0" radius="0.08" color="#2196F3"></a-sphere>
              <a-sphere position="-0.35 0.35 0" radius="0.08" color="#2196F3"></a-sphere>
              <a-sphere position="0.35 -0.35 0" radius="0.08" color="#4CAF50"></a-sphere>
              <a-sphere position="-0.35 -0.35 0" radius="0.08" color="#4CAF50"></a-sphere>
              <a-sphere position="0 0 0.4" radius="0.08" color="#FF9800"></a-sphere>
              <a-sphere position="0 0 -0.4" radius="0.08" color="#9C27B0"></a-sphere>
              
              <a-cylinder position="0.175 0.175 0" radius="0.008" height="0.35" color="#666" rotation="0 0 45"></a-cylinder>
              <a-cylinder position="-0.175 0.175 0" radius="0.008" height="0.35" color="#666" rotation="0 0 -45"></a-cylinder>
              <a-cylinder position="0.175 -0.175 0" radius="0.008" height="0.35" color="#666" rotation="0 0 -45"></a-cylinder>
              <a-cylinder position="-0.175 -0.175 0" radius="0.008" height="0.35" color="#666" rotation="0 0 45"></a-cylinder>
              <a-cylinder position="0 0 0.2" radius="0.008" height="0.4" color="#666" rotation="90 0 0"></a-cylinder>
              <a-cylinder position="0 0 -0.2" radius="0.008" height="0.4" color="#666" rotation="90 0 0"></a-cylinder>
            </a-entity>
          ` : ""}
        </a-entity>

        <!-- Interactive Camera -->
        <a-camera 
          position="0 1.6 0" 
          look-controls="enabled: true" 
          wasd-controls="enabled: true"
          cursor="rayOrigin: mouse"
        ></a-camera>
        
        <!-- Environment Lighting -->
        <a-light type="ambient" color="#404040" intensity="0.6"></a-light>
        <a-light type="directional" position="2 4 2" color="#ffffff" intensity="0.9"></a-light>
        <a-light type="point" position="0 2 -1" color="${model.color}" intensity="0.3"></a-light>
        
        <!-- Background -->
        <a-sky color="#0f0f23"></a-sky>
        
        <!-- Ground plane for reference -->
        <a-plane position="0 -2 0" rotation="-90 0 0" width="10" height="10" color="#1a1a2e" opacity="0.8"></a-plane>
      </a-scene>
    `;

    setTimeout(() => {
      setIsLoaded(true);
      setIsLoading(false);
      toast({
        title: "3D Model Ready",
        description: `${selectedModel} loaded successfully`,
      });
    }, 2000);
  };

  const loadFramework = () => {
    console.log("Loading 3D framework...");
    
    if ((window as any).AFRAME) {
      console.log("A-Frame available, waiting for container...");
      const waitForContainer = () => {
        if (containerRef.current) {
          console.log("Container ready, creating scene");
          createScene();
        } else {
          console.log("Container not ready, retrying...");
          setTimeout(waitForContainer, 100);
        }
      };
      setTimeout(waitForContainer, 200);
      return;
    }

    console.log("Loading A-Frame script...");
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.onload = () => {
      console.log("A-Frame loaded, waiting for container...");
      const waitForContainer = () => {
        if (containerRef.current) {
          console.log("Container ready, creating scene");
          createScene();
        } else {
          console.log("Container not ready, retrying...");
          setTimeout(waitForContainer, 100);
        }
      };
      setTimeout(waitForContainer, 1000);
    };
    script.onerror = () => {
      console.error("Failed to load A-Frame");
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load 3D framework",
        variant: "destructive"
      });
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    loadFramework();
  }, [selectedModel]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Loading 3D Model</h3>
          <p className="text-gray-300">Preparing {selectedModel}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      
      <Button
        onClick={onSessionEnd}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
        size="sm"
      >
        <X className="w-4 h-4 mr-1" />
        Exit
      </Button>
      
      <div className="absolute bottom-6 left-4 right-4 flex justify-center z-50">
        <div className="bg-black/80 rounded-lg p-4 text-white text-center border border-white/20">
          <h3 className="font-bold text-lg text-blue-400">{selectedModel}</h3>
          <p className="text-sm opacity-90">Subject: {subject}</p>
          <p className="text-xs mt-1 opacity-75">Mouse: Look around • WASD: Move • Scroll: Zoom</p>
        </div>
      </div>
    </div>
  );
}