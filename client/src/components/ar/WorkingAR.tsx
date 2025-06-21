import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkingARProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function WorkingAR({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "Atom",
  onSessionEnd 
}: WorkingARProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getModel = (model: string) => {
    const models: { [key: string]: string } = {
      "Atom": `
        <a-sphere position="0 0 0" radius="0.5" color="#4FC3F7" animation="property: rotation; to: 0 360 0; loop: true; dur: 4000">
          <a-sphere position="0.8 0 0" radius="0.1" color="#FFB74D" animation="property: rotation; to: 0 0 360; loop: true; dur: 2000"></a-sphere>
          <a-sphere position="-0.8 0 0" radius="0.1" color="#FFB74D" animation="property: rotation; to: 0 0 -360; loop: true; dur: 2000"></a-sphere>
          <a-torus position="0 0 0" radius="0.8" radius-tubular="0.02" color="#81C784" rotation="90 0 0" animation="property: rotation; to: 90 360 0; loop: true; dur: 3000"></a-torus>
        </a-sphere>
      `,
      "Electromagnetic Field": `
        <a-entity>
          <a-cylinder position="0 0 0" radius="0.05" height="2" color="#E91E63" animation="property: rotation; to: 0 360 0; loop: true; dur: 3000"></a-cylinder>
          <a-torus position="0 0.5 0" radius="0.3" radius-tubular="0.02" color="#2196F3" animation="property: rotation; to: 360 0 0; loop: true; dur: 2000"></a-torus>
          <a-torus position="0 0 0" radius="0.5" radius-tubular="0.02" color="#2196F3" animation="property: rotation; to: 360 0 0; loop: true; dur: 2500"></a-torus>
          <a-torus position="0 -0.5 0" radius="0.3" radius-tubular="0.02" color="#2196F3" animation="property: rotation; to: 360 0 0; loop: true; dur: 2000"></a-torus>
        </a-entity>
      `,
      "DNA Helix": `
        <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 6000">
          <a-cylinder position="0.3 0 0" radius="0.02" height="2" color="#4CAF50" rotation="0 0 45"></a-cylinder>
          <a-cylinder position="-0.3 0 0" radius="0.02" height="2" color="#FF5722" rotation="0 0 -45"></a-cylinder>
          <a-sphere position="0.3 0.8 0" radius="0.05" color="#2196F3"></a-sphere>
          <a-sphere position="-0.3 0.8 0" radius="0.05" color="#FFC107"></a-sphere>
          <a-sphere position="0.3 -0.8 0" radius="0.05" color="#9C27B0"></a-sphere>
          <a-sphere position="-0.3 -0.8 0" radius="0.05" color="#FF9800"></a-sphere>
        </a-entity>
      `,
      "Molecular Structure": `
        <a-entity animation="property: rotation; to: 360 360 0; loop: true; dur: 8000">
          <a-sphere position="0 0 0" radius="0.15" color="#F44336"></a-sphere>
          <a-sphere position="0.4 0.4 0" radius="0.1" color="#2196F3"></a-sphere>
          <a-sphere position="-0.4 0.4 0" radius="0.1" color="#2196F3"></a-sphere>
          <a-sphere position="0.4 -0.4 0" radius="0.1" color="#4CAF50"></a-sphere>
          <a-sphere position="-0.4 -0.4 0" radius="0.1" color="#4CAF50"></a-sphere>
          <a-cylinder position="0.2 0.2 0" radius="0.01" height="0.4" color="#666" rotation="0 0 45"></a-cylinder>
          <a-cylinder position="-0.2 0.2 0" radius="0.01" height="0.4" color="#666" rotation="0 0 -45"></a-cylinder>
          <a-cylinder position="0.2 -0.2 0" radius="0.01" height="0.4" color="#666" rotation="0 0 -45"></a-cylinder>
          <a-cylinder position="-0.2 -0.2 0" radius="0.01" height="0.4" color="#666" rotation="0 0 45"></a-cylinder>
        </a-entity>
      `
    };
    return models[model] || models["Atom"];
  };

  const createScene = () => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `
      <a-scene
        embedded
        style="height: 100vh; width: 100vw; display: block;"
        vr-mode-ui="enabled: false"
        loading-screen="enabled: false"
        background="color: #1a1a2e"
      >
        <a-entity position="0 0 -3">
          ${getModel(selectedModel)}
        </a-entity>

        <a-camera 
          position="0 1.6 0" 
          look-controls="enabled: true" 
          wasd-controls="enabled: true"
        >
        </a-camera>
        
        <a-light type="ambient" color="#404040" intensity="0.6"></a-light>
        <a-light type="directional" position="1 1 0.5" color="#ffffff" intensity="0.8"></a-light>
        <a-light type="point" position="0 2 -1" color="#4FC3F7" intensity="0.4"></a-light>
        
        <a-sky color="#0f0f23"></a-sky>
      </a-scene>
    `;

    setTimeout(() => {
      setIsLoaded(true);
      setIsLoading(false);
      toast({
        title: "3D Model Ready",
        description: `${selectedModel} is now interactive`,
      });
    }, 2000);
  };

  const loadFramework = () => {
    setIsLoading(true);
    
    if ((window as any).AFRAME) {
      createScene();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.onload = () => {
      setTimeout(createScene, 1000);
    };
    script.onerror = () => {
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
          <h3 className="text-xl font-bold mb-2">Loading 3D Viewer</h3>
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
        style={{ position: 'relative' }}
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
          <p className="text-xs mt-1 opacity-75">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}