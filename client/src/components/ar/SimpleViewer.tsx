import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function SimpleViewer({ 
  selectedModel = "Atom",
  onSessionEnd 
}: SimpleViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Initializing 3D viewer for:", selectedModel);
    
    // Prevent multiple initializations
    if (isLoaded) return;
    
    // Force immediate scene creation
    const createViewer = () => {
      // Remove any existing container to prevent duplicates
      const existingContainer = document.getElementById('ar-viewer-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create new container
      const container = document.createElement('div');
      container.id = 'ar-viewer-container';
      container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 50; background: black;';
      document.body.appendChild(container);

      // Load A-Frame if needed
      if (!(window as any).AFRAME) {
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
        script.onload = () => {
          console.log("A-Frame loaded, creating scene for:", selectedModel);
          setTimeout(() => injectScene(container), 500);
        };
        document.head.appendChild(script);
      } else {
        console.log("A-Frame available, creating scene for:", selectedModel);
        injectScene(container);
      }
    };

    const injectScene = (container: HTMLElement) => {
      const modelInfo = getModelInfo(selectedModel);
      const sceneHTML = `
        <a-scene embedded style="width: 100%; height: 100%;" background="color: #1a1a2e">
          <!-- ${selectedModel} Model -->
          <a-entity position="0 0 -2" scale="1.2 1.2 1.2">
            ${getModelForType(selectedModel)}
          </a-entity>
          
          <!-- Camera -->
          <a-camera position="0 1.6 0" look-controls wasd-controls></a-camera>
          
          <!-- Lighting -->
          <a-light type="ambient" color="#404040" intensity="0.6"></a-light>
          <a-light type="directional" position="2 4 2" color="#ffffff" intensity="0.9"></a-light>
          <a-light type="point" position="0 2 -1" color="${modelInfo.primaryColor}" intensity="0.3"></a-light>
          
          <!-- Background -->
          <a-sky color="#0f0f23"></a-sky>
          
          <!-- Ground plane for reference -->
          <a-plane position="0 -2 0" rotation="-90 0 0" width="10" height="10" color="#1a1a2e" opacity="0.8"></a-plane>
        </a-scene>
        
        <!-- UI Overlay -->
        <div style="position: absolute; top: 20px; right: 20px; z-index: 100;">
          <button onclick="window.closeViewer()" style="background: #ef4444; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 16px; cursor: pointer;">
            ✕ Exit
          </button>
        </div>
        
        <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; text-align: center; z-index: 100;">
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);">
            <h3 style="margin: 0 0 8px 0; color: ${modelInfo.primaryColor}; font-size: 18px; font-weight: bold;">${selectedModel}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; opacity: 0.8;">${modelInfo.description}</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Mouse: Look around • WASD: Move • Scroll: Zoom</p>
          </div>
        </div>
      `;

      container.innerHTML = sceneHTML;

      // Add close function
      (window as any).closeViewer = () => {
        container?.remove();
        onSessionEnd();
      };

      setIsLoaded(true);
      setIsLoading(false);
      
      toast({
        title: "3D Model Ready",
        description: `${selectedModel} visualization loaded`,
      });
    };

    createViewer();

    return () => {
      const container = document.getElementById('ar-viewer-container');
      if (container) {
        container.remove();
      }
      delete (window as any).closeViewer;
    };
  }, []);

  const getModelInfo = (model: string) => {
    const infoMapping: { [key: string]: { primaryColor: string; description: string } } = {
      "Atomic Structure": { primaryColor: "#4FC3F7", description: "Explore atomic nucleus with orbiting electrons and energy levels" },
      "Atom": { primaryColor: "#4FC3F7", description: "Interactive atomic model with electron orbitals" },
      "Electromagnetic Field": { primaryColor: "#E91E63", description: "Visualize electromagnetic waves and field interactions" },
      "Wave Interference": { primaryColor: "#FF5722", description: "Observe wave patterns and interference phenomena" },
      "Molecular Bonding": { primaryColor: "#F44336", description: "Complex molecular structures with chemical bonds" },
      "Chemical Reactions": { primaryColor: "#FF9800", description: "Dynamic chemical reaction processes" },
      "Periodic Elements": { primaryColor: "#9C27B0", description: "3D periodic table element arrangement" },
      "DNA Double Helix": { primaryColor: "#4CAF50", description: "Genetic code structure with base pairs" },
      "Cell Division": { primaryColor: "#2196F3", description: "Mitosis process with chromosome separation" },
      "Organ Systems": { primaryColor: "#795548", description: "Human organ system interconnections" },
      "3D Geometric Shapes": { primaryColor: "#607D8B", description: "Mathematical geometric forms and properties" },
      "Function Graphs": { primaryColor: "#3F51B5", description: "Interactive mathematical function visualization" },
      "Fractal Patterns": { primaryColor: "#E91E63", description: "Complex mathematical fractal structures" }
    };
    
    return infoMapping[model] || { primaryColor: "#4FC3F7", description: "Interactive 3D educational model" };
  };

  const getModelForType = (model: string) => {
    console.log("Creating model for:", model);
    
    // Map AR session names to model types
    const modelMapping: { [key: string]: string } = {
      "Atomic Structure": "atom",
      "Atom": "atom",
      "Electromagnetic Field": "electromagnetic",
      "Wave Interference": "wave",
      "Quantum Mechanics": "quantum",
      "Gravitational Waves": "gravity",
      "Molecular Bonding": "molecule",
      "Chemical Reactions": "reaction",
      "Periodic Elements": "periodic",
      "Protein Folding": "protein",
      "Crystal Structures": "crystal",
      "DNA Double Helix": "dna",
      "Cell Division": "cell",
      "Organ Systems": "organ",
      "Neural Networks": "neural",
      "Ecosystem Dynamics": "ecosystem",
      "Photosynthesis": "photosynthesis",
      "3D Geometric Shapes": "geometry",
      "Function Graphs": "graph",
      "Fractal Patterns": "fractal",
      "Topology Surfaces": "topology",
      "Vector Fields": "vectors",
      "Probability Distributions": "probability",
      "interactive": "atom",
      "immersive": "electromagnetic"
    };
    
    const modelType = modelMapping[model] || "atom";
    console.log("Model type:", modelType);
    
    switch (modelType) {
      case "atom":
        return `
          <a-sphere radius="0.4" color="#4FC3F7" animation="property: rotation; to: 0 360 0; loop: true; dur: 6000">
            <a-sphere position="0.7 0 0" radius="0.06" color="#FFB74D" animation="property: rotation; to: 0 0 360; loop: true; dur: 3000"></a-sphere>
            <a-sphere position="-0.7 0 0" radius="0.06" color="#FFB74D" animation="property: rotation; to: 0 0 -360; loop: true; dur: 3000"></a-sphere>
            <a-sphere position="0 0.7 0" radius="0.06" color="#81C784" animation="property: rotation; to: 360 0 0; loop: true; dur: 4000"></a-sphere>
            <a-torus radius="0.7" radius-tubular="0.02" color="#81C784" rotation="90 0 0" animation="property: rotation; to: 90 360 0; loop: true; dur: 5000"></a-torus>
            <a-torus radius="0.5" radius-tubular="0.015" color="#9C27B0" rotation="0 45 0" animation="property: rotation; to: 0 405 0; loop: true; dur: 4000"></a-torus>
          </a-sphere>
        `;
      case "electromagnetic":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 4000">
            <a-cylinder radius="0.04" height="2" color="#E91E63"></a-cylinder>
            <a-torus position="0 0.6 0" radius="0.3" radius-tubular="0.02" color="#2196F3" animation="property: rotation; to: 360 0 0; loop: true; dur: 2500"></a-torus>
            <a-torus position="0 0.3 0" radius="0.4" radius-tubular="0.02" color="#03A9F4" animation="property: rotation; to: 360 0 0; loop: true; dur: 3000"></a-torus>
            <a-torus position="0 0 0" radius="0.5" radius-tubular="0.02" color="#2196F3" animation="property: rotation; to: 360 0 0; loop: true; dur: 3500"></a-torus>
            <a-torus position="0 -0.3 0" radius="0.4" radius-tubular="0.02" color="#03A9F4" animation="property: rotation; to: 360 0 0; loop: true; dur: 3000"></a-torus>
            <a-torus position="0 -0.6 0" radius="0.3" radius-tubular="0.02" color="#2196F3" animation="property: rotation; to: 360 0 0; loop: true; dur: 2500"></a-torus>
          </a-entity>
        `;
      case "wave":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 6000">
            <a-cylinder position="0 0 -1" radius="0.02" height="3" color="#FF5722" rotation="0 0 30" animation="property: position; to: 0 0 1; loop: true; dur: 2000; dir: alternate"></a-cylinder>
            <a-cylinder position="0.5 0 -1" radius="0.02" height="3" color="#FFC107" rotation="0 0 30" animation="property: position; to: 0.5 0 1; loop: true; dur: 2000; dir: alternate; delay: 200"></a-cylinder>
            <a-cylinder position="-0.5 0 -1" radius="0.02" height="3" color="#4CAF50" rotation="0 0 30" animation="property: position; to: -0.5 0 1; loop: true; dur: 2000; dir: alternate; delay: 400"></a-cylinder>
            <a-cylinder position="1 0 -1" radius="0.02" height="3" color="#2196F3" rotation="0 0 30" animation="property: position; to: 1 0 1; loop: true; dur: 2000; dir: alternate; delay: 600"></a-cylinder>
            <a-cylinder position="-1 0 -1" radius="0.02" height="3" color="#9C27B0" rotation="0 0 30" animation="property: position; to: -1 0 1; loop: true; dur: 2000; dir: alternate; delay: 800"></a-cylinder>
          </a-entity>
        `;
      case "molecule":
        return `
          <a-entity animation="property: rotation; to: 360 360 0; loop: true; dur: 10000">
            <a-sphere radius="0.12" color="#F44336"></a-sphere>
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
          </a-entity>
        `;
      case "dna":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 8000">
            <a-cylinder position="0.25 0 0" radius="0.02" height="2.5" color="#4CAF50" rotation="0 0 20"></a-cylinder>
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
          </a-entity>
        `;
      case "reaction":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 6000">
            <!-- Reactant molecules -->
            <a-sphere position="-1.5 0.3 0" radius="0.15" color="#FF5722" animation="property: position; to: -0.3 0.3 0; loop: true; dur: 3000; dir: alternate"></a-sphere>
            <a-sphere position="-1.5 -0.3 0" radius="0.15" color="#2196F3" animation="property: position; to: -0.3 -0.3 0; loop: true; dur: 3000; dir: alternate"></a-sphere>
            
            <!-- Catalyst -->
            <a-cylinder position="0 0 0" radius="0.08" height="0.4" color="#FFC107" animation="property: scale; to: 1.2 1.2 1.2; loop: true; dur: 1500; dir: alternate"></a-cylinder>
            
            <!-- Product molecules -->
            <a-entity position="1.5 0 0" animation="property: position; to: 0.5 0 0; loop: true; dur: 3000; dir: alternate; delay: 1500">
              <a-sphere position="0.2 0.2 0" radius="0.12" color="#4CAF50"></a-sphere>
              <a-sphere position="-0.2 -0.2 0" radius="0.12" color="#9C27B0"></a-sphere>
              <a-cylinder position="0 0 0" radius="0.02" height="0.4" color="#666" rotation="45 0 0"></a-cylinder>
            </a-entity>
            
            <!-- Energy particles -->
            <a-sphere position="0 0.8 0" radius="0.03" color="#FFEB3B" animation="property: position; to: 0 -0.8 0; loop: true; dur: 2000; dir: alternate"></a-sphere>
            <a-sphere position="0.5 0.6 0" radius="0.03" color="#FFEB3B" animation="property: position; to: -0.5 -0.6 0; loop: true; dur: 2200; dir: alternate"></a-sphere>
            <a-sphere position="-0.5 0.6 0" radius="0.03" color="#FFEB3B" animation="property: position; to: 0.5 -0.6 0; loop: true; dur: 1800; dir: alternate"></a-sphere>
          </a-entity>
        `;
      case "periodic":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 12000">
            <!-- Periodic table 3D arrangement -->
            <a-sphere position="0 0 0" radius="0.08" color="#E91E63" animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 2000; dir: alternate"></a-sphere>
            <a-sphere position="0.4 0 0" radius="0.06" color="#9C27B0"></a-sphere>
            <a-sphere position="-0.4 0 0" radius="0.06" color="#3F51B5"></a-sphere>
            <a-sphere position="0 0.4 0" radius="0.06" color="#2196F3"></a-sphere>
            <a-sphere position="0 -0.4 0" radius="0.06" color="#00BCD4"></a-sphere>
            <a-sphere position="0 0 0.4" radius="0.06" color="#4CAF50"></a-sphere>
            <a-sphere position="0 0 -0.4" radius="0.06" color="#8BC34A"></a-sphere>
            
            <!-- Electron shells -->
            <a-ring position="0 0 0" radius-inner="0.3" radius-outer="0.32" color="#81C784" rotation="90 0 0" animation="property: rotation; to: 90 360 0; loop: true; dur: 4000"></a-ring>
            <a-ring position="0 0 0" radius-inner="0.5" radius-outer="0.52" color="#64B5F6" rotation="45 45 0" animation="property: rotation; to: 45 405 0; loop: true; dur: 6000"></a-ring>
            <a-ring position="0 0 0" radius-inner="0.7" radius-outer="0.72" color="#FFB74D" rotation="0 0 45" animation="property: rotation; to: 0 360 45; loop: true; dur: 8000"></a-ring>
          </a-entity>
        `;
      case "cell":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 10000">
            <!-- Cell membrane -->
            <a-sphere position="0 0 0" radius="0.8" color="#795548" opacity="0.3" animation="property: scale; to: 1.1 1.1 1.1; loop: true; dur: 4000; dir: alternate"></a-sphere>
            
            <!-- Nucleus -->
            <a-sphere position="0 0 0" radius="0.25" color="#673AB7" animation="property: rotation; to: 360 0 0; loop: true; dur: 5000"></a-sphere>
            
            <!-- Chromosomes -->
            <a-entity position="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 8000">
              <a-cylinder position="0.15 0 0" radius="0.02" height="0.3" color="#E91E63" rotation="30 0 0"></a-cylinder>
              <a-cylinder position="-0.15 0 0" radius="0.02" height="0.3" color="#F44336" rotation="-30 0 0"></a-cylinder>
              <a-cylinder position="0 0.15 0" radius="0.02" height="0.3" color="#9C27B0" rotation="0 30 0"></a-cylinder>
              <a-cylinder position="0 -0.15 0" radius="0.02" height="0.3" color="#3F51B5" rotation="0 -30 0"></a-cylinder>
            </a-entity>
            
            <!-- Mitochondria -->
            <a-entity animation="property: rotation; to: 360 0 0; loop: true; dur: 6000">
              <a-cylinder position="0.4 0.2 0" radius="0.05" height="0.2" color="#FF5722" rotation="45 0 0"></a-cylinder>
              <a-cylinder position="-0.4 -0.2 0" radius="0.05" height="0.2" color="#FF5722" rotation="-45 0 0"></a-cylinder>
              <a-cylinder position="0.2 -0.4 0" radius="0.05" height="0.2" color="#FF5722" rotation="0 45 0"></a-cylinder>
            </a-entity>
            
            <!-- Cell division process -->
            <a-entity animation="property: position; to: 0.5 0 0; loop: true; dur: 6000; dir: alternate">
              <a-sphere radius="0.15" color="#4CAF50" opacity="0.7"></a-sphere>
            </a-entity>
            <a-entity animation="property: position; to: -0.5 0 0; loop: true; dur: 6000; dir: alternate">
              <a-sphere radius="0.15" color="#4CAF50" opacity="0.7"></a-sphere>
            </a-entity>
          </a-entity>
        `;
      case "organ":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 15000">
            <!-- Heart -->
            <a-entity position="0 0.5 0" animation="property: scale; to: 1.2 1.2 1.2; loop: true; dur: 1200; dir: alternate">
              <a-sphere position="0 0 0" radius="0.15" color="#F44336"></a-sphere>
              <a-sphere position="0.1 0.05 0" radius="0.12" color="#E53935"></a-sphere>
              <a-sphere position="-0.1 0.05 0" radius="0.12" color="#E53935"></a-sphere>
            </a-entity>
            
            <!-- Lungs -->
            <a-entity position="-0.4 0.3 0">
              <a-sphere radius="0.12" color="#FF9800" animation="property: scale; to: 1.1 1.1 1.1; loop: true; dur: 2000; dir: alternate"></a-sphere>
            </a-entity>
            <a-entity position="0.4 0.3 0">
              <a-sphere radius="0.12" color="#FF9800" animation="property: scale; to: 1.1 1.1 1.1; loop: true; dur: 2000; dir: alternate; delay: 1000"></a-sphere>
            </a-entity>
            
            <!-- Brain -->
            <a-entity position="0 0.8 0">
              <a-sphere radius="0.18" color="#9C27B0" animation="property: rotation; to: 360 0 0; loop: true; dur: 8000"></a-sphere>
              <a-cylinder position="0 -0.15 0" radius="0.03" height="0.1" color="#7B1FA2"></a-cylinder>
            </a-entity>
            
            <!-- Digestive system -->
            <a-entity position="0 -0.3 0">
              <a-cylinder radius="0.08" height="0.4" color="#4CAF50" animation="property: rotation; to: 0 0 360; loop: true; dur: 5000"></a-cylinder>
              <a-torus position="0 -0.3 0" radius="0.15" radius-tubular="0.03" color="#8BC34A" animation="property: rotation; to: 360 0 0; loop: true; dur: 6000"></a-torus>
            </a-entity>
            
            <!-- Blood vessels -->
            <a-cylinder position="0.2 0.1 0" radius="0.01" height="0.8" color="#D32F2F" rotation="15 0 0"></a-cylinder>
            <a-cylinder position="-0.2 0.1 0" radius="0.01" height="0.8" color="#1976D2" rotation="-15 0 0"></a-cylinder>
            
            <!-- Nervous system -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 10000">
              <a-cylinder position="0 0 0" radius="0.005" height="1.2" color="#FFEB3B"></a-cylinder>
              <a-cylinder position="0.1 0 0" radius="0.003" height="0.6" color="#FFC107" rotation="30 0 0"></a-cylinder>
              <a-cylinder position="-0.1 0 0" radius="0.003" height="0.6" color="#FFC107" rotation="-30 0 0"></a-cylinder>
            </a-entity>
          </a-entity>
        `;
      case "geometry":
        return `
          <a-entity animation="property: rotation; to: 360 360 360; loop: true; dur: 8000">
            <!-- Platonic solids -->
            <a-tetrahedron position="0 0 0" radius="0.3" color="#4CAF50" animation="property: rotation; to: 360 0 0; loop: true; dur: 4000"></a-tetrahedron>
            <a-box position="1.2 0 0" width="0.5" height="0.5" depth="0.5" color="#2196F3" animation="property: rotation; to: 0 360 0; loop: true; dur: 5000"></a-box>
            <a-octahedron position="-1.2 0 0" radius="0.25" color="#FF5722" animation="property: rotation; to: 0 0 360; loop: true; dur: 3500"></a-octahedron>
            <a-dodecahedron position="0 1.2 0" radius="0.2" color="#FFC107" animation="property: rotation; to: 360 360 0; loop: true; dur: 6000"></a-dodecahedron>
            <a-icosahedron position="0 -1.2 0" radius="0.25" color="#9C27B0" animation="property: rotation; to: 0 360 360; loop: true; dur: 4500"></a-icosahedron>
            
            <!-- Mathematical curves -->
            <a-torus position="0.6 0.6 0" radius="0.2" radius-tubular="0.05" color="#E91E63" animation="property: rotation; to: 360 0 0; loop: true; dur: 3000"></a-torus>
            <a-cone position="-0.6 -0.6 0" radius-bottom="0.2" height="0.6" color="#FF9800" animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"></a-cone>
            
            <!-- Wireframe connections -->
            <a-cylinder position="0.6 0 0" radius="0.01" height="1.2" color="#666" rotation="0 0 90"></a-cylinder>
            <a-cylinder position="0 0.6 0" radius="0.01" height="1.2" color="#666"></a-cylinder>
            <a-cylinder position="-0.6 0 0" radius="0.01" height="1.2" color="#666" rotation="0 0 90"></a-cylinder>
            <a-cylinder position="0 -0.6 0" radius="0.01" height="1.2" color="#666"></a-cylinder>
          </a-entity>
        `;
      case "graph":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 12000">
            <!-- 3D coordinate system -->
            <a-cylinder position="0 0 0" radius="0.01" height="3" color="#FF0000" rotation="0 0 90"></a-cylinder>
            <a-cylinder position="0 0 0" radius="0.01" height="3" color="#00FF00"></a-cylinder>
            <a-cylinder position="0 0 0" radius="0.01" height="3" color="#0000FF" rotation="90 0 0"></a-cylinder>
            
            <!-- Function curve visualization -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 8000">
              ${Array.from({length: 20}, (_, i) => {
                const x = (i - 10) * 0.1;
                const y = Math.sin(x * 2) * 0.5;
                const z = Math.cos(x * 2) * 0.3;
                return `<a-sphere position="${x} ${y} ${z}" radius="0.02" color="#E91E63"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Parabola -->
            <a-entity animation="property: rotation; to: 360 0 0; loop: true; dur: 10000">
              ${Array.from({length: 15}, (_, i) => {
                const x = (i - 7) * 0.15;
                const y = x * x * 0.3;
                return `<a-sphere position="${x} ${y} 0.5" radius="0.02" color="#2196F3"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Spiral -->
            <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 6000">
              ${Array.from({length: 30}, (_, i) => {
                const angle = i * 0.5;
                const radius = i * 0.02;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = i * 0.02 - 0.3;
                return `<a-sphere position="${x} ${y} ${z}" radius="0.015" color="#4CAF50"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Grid lines -->
            ${Array.from({length: 11}, (_, i) => {
              const pos = (i - 5) * 0.2;
              return `
                <a-cylinder position="${pos} 0 0" radius="0.002" height="2" color="#333" rotation="0 0 90" opacity="0.3"></a-cylinder>
                <a-cylinder position="0 ${pos} 0" radius="0.002" height="2" color="#333" opacity="0.3"></a-cylinder>
              `;
            }).join('')}
          </a-entity>
        `;
      case "quantum":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 20000">
            <!-- Quantum probability clouds -->
            <a-entity position="0 0 0" animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 3000; dir: alternate">
              <!-- Electron probability orbitals -->
              <a-sphere position="0 0 0" radius="0.3" color="#4FC3F7" opacity="0.3" animation="property: rotation; to: 360 0 0; loop: true; dur: 8000"></a-sphere>
              <a-sphere position="0 0 0" radius="0.5" color="#E91E63" opacity="0.2" animation="property: rotation; to: -360 0 0; loop: true; dur: 12000"></a-sphere>
              <a-sphere position="0 0 0" radius="0.7" color="#9C27B0" opacity="0.1" animation="property: rotation; to: 360 0 0; loop: true; dur: 16000"></a-sphere>
            </a-entity>
            
            <!-- Wave-particle duality visualization -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 10000">
              ${Array.from({length: 50}, (_, i) => {
                const angle = i * 7.2 * Math.PI / 180;
                const radius = 0.8 + Math.sin(i * 0.5) * 0.3;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(i * 0.8) * 0.4;
                const opacity = 0.3 + Math.sin(i * 0.3) * 0.4;
                return `<a-sphere position="${x} ${y} ${z}" radius="0.01" color="#FFEB3B" opacity="${opacity}" animation="property: scale; to: 2 2 2; loop: true; dur: ${2000 + i * 50}; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Quantum tunneling effect -->
            <a-entity animation="property: position; to: 2 0 0; loop: true; dur: 4000; dir: alternate">
              <a-box width="0.1" height="0.1" depth="0.1" color="#00E676" animation="property: opacity; to: 0.1; loop: true; dur: 2000; dir: alternate"></a-box>
            </a-entity>
            <a-box position="0 0 0" width="0.05" height="1" depth="1" color="#FF5722" opacity="0.8"></a-box>
            
            <!-- Superposition states -->
            <a-entity position="0 1 0">
              <a-sphere radius="0.08" color="#4CAF50" animation="property: position; to: 0.5 0 0; loop: true; dur: 1500; dir: alternate"></a-sphere>
              <a-sphere radius="0.08" color="#2196F3" animation="property: position; to: -0.5 0 0; loop: true; dur: 1500; dir: alternate"></a-sphere>
            </a-entity>
          </a-entity>
        `;
      case "gravity":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 25000">
            <!-- Spacetime grid distortion -->
            <a-entity position="0 0 0">
              ${Array.from({length: 20}, (_, i) => {
                const x = (i - 10) * 0.2;
                return Array.from({length: 20}, (_, j) => {
                  const z = (j - 10) * 0.2;
                  const distance = Math.sqrt(x*x + z*z);
                  const warp = Math.max(0, 0.3 - distance * 0.1);
                  const y = -warp;
                  return `<a-sphere position="${x} ${y} ${z}" radius="0.01" color="#9C27B0" opacity="0.6"></a-sphere>`;
                }).join('');
              }).join('')}
            </a-entity>
            
            <!-- Massive objects causing curvature -->
            <a-sphere position="0 0 0" radius="0.3" color="#FF9800" animation="property: scale; to: 1.2 1.2 1.2; loop: true; dur: 4000; dir: alternate"></a-sphere>
            <a-sphere position="2 0 1" radius="0.15" color="#4CAF50" animation="property: rotation; to: 360 0 0; loop: true; dur: 8000"></a-sphere>
            
            <!-- Gravitational waves -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 6000">
              ${Array.from({length: 12}, (_, i) => {
                const angle = i * 30 * Math.PI / 180;
                const radius = 1 + i * 0.1;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                return `<a-ring position="${x} 0 ${z}" radius-inner="${0.05 + i * 0.02}" radius-outer="${0.07 + i * 0.02}" color="#E91E63" opacity="${0.8 - i * 0.05}" rotation="90 0 0" animation="property: scale; to: 2 2 2; loop: true; dur: ${3000 + i * 200}; dir: alternate; delay: ${i * 300}"></a-ring>`;
              }).join('')}
            </a-entity>
            
            <!-- Light bending -->
            <a-entity animation="property: rotation; to: 360 0 0; loop: true; dur: 12000">
              ${Array.from({length: 30}, (_, i) => {
                const t = i / 30;
                const x = t * 3 - 1.5;
                const y = Math.sin(t * Math.PI * 2) * 0.3;
                const z = Math.cos(t * Math.PI * 2) * 0.3;
                return `<a-sphere position="${x} ${y} ${z}" radius="0.008" color="#FFEB3B" animation="property: opacity; to: 0.2; loop: true; dur: 2000; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      case "protein":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 18000">
            <!-- Protein backbone (alpha helix) -->
            <a-entity animation="property: rotation; to: 360 0 0; loop: true; dur: 12000">
              ${Array.from({length: 40}, (_, i) => {
                const angle = i * 36 * Math.PI / 180;
                const radius = 0.3;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = (i - 20) * 0.05;
                const color = i % 4 === 0 ? "#E91E63" : i % 4 === 1 ? "#2196F3" : i % 4 === 2 ? "#4CAF50" : "#FF9800";
                return `<a-sphere position="${x} ${y} ${z}" radius="0.03" color="${color}" animation="property: scale; to: 1.5 1.5 1.5; loop: true; dur: 3000; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Beta sheets -->
            <a-entity position="1.2 0 0" animation="property: rotation; to: 0 0 360; loop: true; dur: 15000">
              ${Array.from({length: 8}, (_, i) => {
                const y = (i - 4) * 0.1;
                return Array.from({length: 6}, (_, j) => {
                  const x = (j - 3) * 0.1;
                  const color = (i + j) % 2 === 0 ? "#9C27B0" : "#673AB7";
                  return `<a-sphere position="${x} ${y} 0" radius="0.025" color="${color}"></a-sphere>`;
                }).join('');
              }).join('')}
            </a-entity>
            
            <!-- Active site -->
            <a-entity position="0 0.8 0" animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 2000; dir: alternate">
              <a-sphere radius="0.08" color="#FF5722" opacity="0.8"></a-sphere>
              <a-sphere position="0.1 0 0" radius="0.04" color="#FFC107" animation="property: position; to: -0.1 0 0; loop: true; dur: 1500; dir: alternate"></a-sphere>
              <a-sphere position="0 0.1 0" radius="0.04" color="#00BCD4" animation="property: position; to: 0 -0.1 0; loop: true; dur: 1800; dir: alternate"></a-sphere>
            </a-entity>
            
            <!-- Folding animation -->
            <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 20000">
              ${Array.from({length: 20}, (_, i) => {
                const angle = i * 18 * Math.PI / 180;
                const radius = 0.6 + Math.sin(i * 0.5) * 0.2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(i * 0.8) * 0.3;
                return `<a-cylinder position="${x} ${y} ${z}" radius="0.008" height="0.05" color="#795548" rotation="${i * 10} 0 0" animation="property: rotation; to: ${i * 10 + 360} 0 0; loop: true; dur: 8000"></a-cylinder>`;
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      case "crystal":
        return `
          <a-entity animation="property: rotation; to: 360 360 360; loop: true; dur: 16000">
            <!-- Diamond crystal lattice -->
            <a-entity position="0 0 0">
              ${Array.from({length: 3}, (_, i) => {
                return Array.from({length: 3}, (_, j) => {
                  return Array.from({length: 3}, (_, k) => {
                    const x = (i - 1) * 0.4;
                    const y = (j - 1) * 0.4;
                    const z = (k - 1) * 0.4;
                    const color = (i + j + k) % 2 === 0 ? "#E91E63" : "#2196F3";
                    return `<a-sphere position="${x} ${y} ${z}" radius="0.06" color="${color}" animation="property: scale; to: 1.2 1.2 1.2; loop: true; dur: 3000; dir: alternate; delay: ${(i + j + k) * 200}"></a-sphere>`;
                  }).join('');
                }).join('');
              }).join('')}
            </a-entity>
            
            <!-- Crystal bonds -->
            <a-entity>
              <a-cylinder position="0.2 0 0" radius="0.01" height="0.4" color="#666" rotation="0 0 90"></a-cylinder>
              <a-cylinder position="0 0.2 0" radius="0.01" height="0.4" color="#666"></a-cylinder>
              <a-cylinder position="0 0 0.2" radius="0.01" height="0.4" color="#666" rotation="90 0 0"></a-cylinder>
              <a-cylinder position="-0.2 0 0" radius="0.01" height="0.4" color="#666" rotation="0 0 90"></a-cylinder>
              <a-cylinder position="0 -0.2 0" radius="0.01" height="0.4" color="#666"></a-cylinder>
              <a-cylinder position="0 0 -0.2" radius="0.01" height="0.4" color="#666" rotation="90 0 0"></a-cylinder>
            </a-entity>
            
            <!-- Crystal defects -->
            <a-entity position="0.6 0.6 0" animation="property: position; to: 0.8 0.8 0; loop: true; dur: 4000; dir: alternate">
              <a-sphere radius="0.04" color="#FF5722" animation="property: opacity; to: 0.3; loop: true; dur: 2000; dir: alternate"></a-sphere>
            </a-entity>
            
            <!-- Unit cell boundaries -->
            <a-entity opacity="0.3">
              ${Array.from({length: 12}, (_, i) => {
                const edges = [
                  "0.4 0.4 0.4 to -0.4 0.4 0.4",
                  "0.4 0.4 0.4 to 0.4 -0.4 0.4",
                  "0.4 0.4 0.4 to 0.4 0.4 -0.4",
                  "-0.4 -0.4 -0.4 to 0.4 -0.4 -0.4",
                  "-0.4 -0.4 -0.4 to -0.4 0.4 -0.4",
                  "-0.4 -0.4 -0.4 to -0.4 -0.4 0.4"
                ];
                return `<a-cylinder position="0 0 0" radius="0.005" height="0.8" color="#FFC107" rotation="45 45 ${i * 30}" opacity="0.5"></a-cylinder>`;
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      case "neural":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 22000">
            <!-- Neural network structure -->
            <a-entity position="0 0 0">
              <!-- Input layer -->
              ${Array.from({length: 4}, (_, i) => {
                const y = (i - 1.5) * 0.3;
                return `<a-sphere position="-1.5 ${y} 0" radius="0.08" color="#4CAF50" animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 2000; dir: alternate; delay: ${i * 300}"></a-sphere>`;
              }).join('')}
              
              <!-- Hidden layer 1 -->
              ${Array.from({length: 6}, (_, i) => {
                const y = (i - 2.5) * 0.25;
                return `<a-sphere position="-0.5 ${y} 0" radius="0.06" color="#2196F3" animation="property: opacity; to: 0.5; loop: true; dur: 1500; dir: alternate; delay: ${i * 200}"></a-sphere>`;
              }).join('')}
              
              <!-- Hidden layer 2 -->
              ${Array.from({length: 6}, (_, i) => {
                const y = (i - 2.5) * 0.25;
                return `<a-sphere position="0.5 ${y} 0" radius="0.06" color="#9C27B0" animation="property: opacity; to: 0.5; loop: true; dur: 1500; dir: alternate; delay: ${i * 250}"></a-sphere>`;
              }).join('')}
              
              <!-- Output layer -->
              ${Array.from({length: 3}, (_, i) => {
                const y = (i - 1) * 0.4;
                return `<a-sphere position="1.5 ${y} 0" radius="0.08" color="#FF5722" animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 2000; dir: alternate; delay: ${i * 400}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Synaptic connections -->
            <a-entity animation="property: opacity; to: 0.3; loop: true; dur: 3000; dir: alternate">
              ${Array.from({length: 50}, (_, i) => {
                const startX = -1.5 + Math.random() * 3;
                const startY = -1 + Math.random() * 2;
                const endX = startX + (Math.random() - 0.5) * 1;
                const endY = startY + (Math.random() - 0.5) * 1;
                const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
                const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                return `<a-cylinder position="${(startX + endX) / 2} ${(startY + endY) / 2} 0" radius="0.003" height="${length}" color="#FFEB3B" rotation="0 0 ${angle}" animation="property: opacity; to: 0.1; loop: true; dur: ${1000 + Math.random() * 2000}; dir: alternate; delay: ${i * 50}"></a-cylinder>`;
              }).join('')}
            </a-entity>
            
            <!-- Action potentials -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 8000">
              ${Array.from({length: 15}, (_, i) => {
                const angle = i * 24 * Math.PI / 180;
                const x = Math.cos(angle) * 0.8;
                const y = Math.sin(angle) * 0.8;
                return `<a-sphere position="${x} ${y} 0" radius="0.02" color="#00E676" animation="property: position; to: ${x * 1.2} ${y * 1.2} 0; loop: true; dur: 2000; dir: alternate; delay: ${i * 200}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Neurotransmitters -->
            <a-entity>
              ${Array.from({length: 30}, (_, i) => {
                const x = -1 + Math.random() * 2;
                const y = -1 + Math.random() * 2;
                const z = -0.5 + Math.random();
                return `<a-sphere position="${x} ${y} ${z}" radius="0.008" color="#E91E63" animation="property: position; to: ${x + (Math.random() - 0.5) * 0.5} ${y + (Math.random() - 0.5) * 0.5} ${z + (Math.random() - 0.5) * 0.5}; loop: true; dur: ${3000 + Math.random() * 2000}; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      case "ecosystem":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 30000">
            <!-- Food web visualization -->
            <a-entity position="0 0 0">
              <!-- Primary producers (plants) -->
              ${Array.from({length: 12}, (_, i) => {
                const angle = i * 30 * Math.PI / 180;
                const x = Math.cos(angle) * 1.2;
                const z = Math.sin(angle) * 1.2;
                return `<a-cylinder position="${x} -0.5 ${z}" radius="0.03" height="0.2" color="#4CAF50" animation="property: scale; to: 1 1.5 1; loop: true; dur: 4000; dir: alternate; delay: ${i * 200}"></a-cylinder>`;
              }).join('')}
              
              <!-- Primary consumers (herbivores) -->
              ${Array.from({length: 8}, (_, i) => {
                const angle = i * 45 * Math.PI / 180;
                const x = Math.cos(angle) * 0.8;
                const z = Math.sin(angle) * 0.8;
                return `<a-sphere position="${x} 0 ${z}" radius="0.05" color="#8BC34A" animation="property: position; to: ${x * 1.1} 0.1 ${z * 1.1}; loop: true; dur: 5000; dir: alternate; delay: ${i * 300}"></a-sphere>`;
              }).join('')}
              
              <!-- Secondary consumers (carnivores) -->
              ${Array.from({length: 6}, (_, i) => {
                const angle = i * 60 * Math.PI / 180;
                const x = Math.cos(angle) * 0.5;
                const z = Math.sin(angle) * 0.5;
                return `<a-sphere position="${x} 0.3 ${z}" radius="0.06" color="#FF9800" animation="property: rotation; to: 360 0 0; loop: true; dur: 6000; delay: ${i * 400}"></a-sphere>`;
              }).join('')}
              
              <!-- Apex predators -->
              ${Array.from({length: 3}, (_, i) => {
                const angle = i * 120 * Math.PI / 180;
                const x = Math.cos(angle) * 0.3;
                const z = Math.sin(angle) * 0.3;
                return `<a-sphere position="${x} 0.6 ${z}" radius="0.08" color="#F44336" animation="property: scale; to: 1.2 1.2 1.2; loop: true; dur: 3000; dir: alternate; delay: ${i * 500}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Energy flow arrows -->
            <a-entity animation="property: opacity; to: 0.4; loop: true; dur: 2000; dir: alternate">
              ${Array.from({length: 20}, (_, i) => {
                const angle = i * 18 * Math.PI / 180;
                const x = Math.cos(angle) * (0.7 + Math.sin(i) * 0.3);
                const z = Math.sin(angle) * (0.7 + Math.sin(i) * 0.3);
                const y = 0.2 + Math.sin(i * 0.5) * 0.3;
                return `<a-cone position="${x} ${y} ${z}" radius-bottom="0.02" height="0.08" color="#FFEB3B" rotation="0 ${i * 18} 0" animation="property: position; to: ${x * 1.2} ${y + 0.1} ${z * 1.2}; loop: true; dur: 3000; dir: alternate; delay: ${i * 150}"></a-cone>`;
              }).join('')}
            </a-entity>
            
            <!-- Decomposers -->
            <a-entity position="0 -0.8 0" animation="property: rotation; to: 360 0 0; loop: true; dur: 8000">
              ${Array.from({length: 20}, (_, i) => {
                const x = (Math.random() - 0.5) * 2;
                const z = (Math.random() - 0.5) * 2;
                return `<a-sphere position="${x} 0 ${z}" radius="0.01" color="#795548" animation="property: scale; to: 2 2 2; loop: true; dur: ${2000 + Math.random() * 3000}; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Population dynamics -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 12000">
              ${Array.from({length: 30}, (_, i) => {
                const t = i / 30;
                const x = Math.sin(t * Math.PI * 4) * 1.5;
                const y = Math.cos(t * Math.PI * 3) * 0.5 + 0.5;
                const z = Math.sin(t * Math.PI * 2) * 0.8;
                const size = 0.02 + Math.sin(t * Math.PI * 6) * 0.01;
                return `<a-sphere position="${x} ${y} ${z}" radius="${size}" color="#9C27B0" opacity="0.7" animation="property: opacity; to: 0.2; loop: true; dur: 4000; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      case "photosynthesis":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 20000">
            <!-- Chloroplast structure -->
            <a-entity position="0 0 0">
              <!-- Outer membrane -->
              <a-sphere radius="0.8" color="#4CAF50" opacity="0.2"></a-sphere>
              <!-- Inner membrane -->
              <a-sphere radius="0.75" color="#388E3C" opacity="0.3"></a-sphere>
              
              <!-- Thylakoids -->
              ${Array.from({length: 8}, (_, i) => {
                const y = (i - 3.5) * 0.15;
                return `<a-cylinder position="0 ${y} 0" radius="0.4" height="0.05" color="#2E7D32" animation="property: opacity; to: 0.8; loop: true; dur: 3000; dir: alternate; delay: ${i * 200}"></a-cylinder>`;
              }).join('')}
              
              <!-- Grana stacks -->
              ${Array.from({length: 6}, (_, i) => {
                const angle = i * 60 * Math.PI / 180;
                const x = Math.cos(angle) * 0.3;
                const z = Math.sin(angle) * 0.3;
                return `<a-cylinder position="${x} 0 ${z}" radius="0.08" height="0.3" color="#1B5E20" animation="property: scale; to: 1 1.2 1; loop: true; dur: 2500; dir: alternate; delay: ${i * 300}"></a-cylinder>`;
              }).join('')}
            </a-entity>
            
            <!-- Light reactions -->
            <a-entity animation="property: rotation; to: 360 0 0; loop: true; dur: 8000">
              <!-- Photons -->
              ${Array.from({length: 20}, (_, i) => {
                const angle = i * 18 * Math.PI / 180;
                const x = Math.cos(angle) * 1.5;
                const z = Math.sin(angle) * 1.5;
                return `<a-sphere position="${x} 1 ${z}" radius="0.03" color="#FFEB3B" animation="property: position; to: 0 0 0; loop: true; dur: 2000; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
              
              <!-- Chlorophyll molecules -->
              ${Array.from({length: 12}, (_, i) => {
                const angle = i * 30 * Math.PI / 180;
                const x = Math.cos(angle) * 0.5;
                const z = Math.sin(angle) * 0.5;
                return `<a-sphere position="${x} 0.2 ${z}" radius="0.04" color="#4CAF50" animation="property: color; to: #FFEB3B; loop: true; dur: 1500; dir: alternate; delay: ${i * 150}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Electron transport chain -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 10000">
              ${Array.from({length: 15}, (_, i) => {
                const t = i / 15;
                const x = Math.sin(t * Math.PI * 2) * 0.6;
                const y = Math.cos(t * Math.PI * 2) * 0.3;
                const z = t * 0.8 - 0.4;
                return `<a-sphere position="${x} ${y} ${z}" radius="0.02" color="#E91E63" animation="property: position; to: ${x * 1.2} ${y * 1.2} ${z}; loop: true; dur: 1800; dir: alternate; delay: ${i * 120}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- ATP synthesis -->
            <a-entity position="0 -0.5 0" animation="property: rotation; to: 360 360 0; loop: true; dur: 6000">
              <a-cylinder radius="0.15" height="0.3" color="#FF9800" animation="property: scale; to: 1.2 1.2 1.2; loop: true; dur: 2000; dir: alternate"></a-cylinder>
              ${Array.from({length: 8}, (_, i) => {
                const angle = i * 45 * Math.PI / 180;
                const x = Math.cos(angle) * 0.2;
                const z = Math.sin(angle) * 0.2;
                return `<a-sphere position="${x} 0.2 ${z}" radius="0.02" color="#FFC107" animation="property: position; to: ${x * 1.5} 0.3 ${z * 1.5}; loop: true; dur: 1500; dir: alternate; delay: ${i * 200}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Calvin cycle -->
            <a-entity position="0 0.6 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 15000">
              <!-- CO2 molecules -->
              ${Array.from({length: 6}, (_, i) => {
                const angle = i * 60 * Math.PI / 180;
                const x = Math.cos(angle) * 0.4;
                const z = Math.sin(angle) * 0.4;
                return `<a-sphere position="${x} 0 ${z}" radius="0.03" color="#607D8B" animation="property: position; to: 0 0 0; loop: true; dur: 3000; delay: ${i * 500}"></a-sphere>`;
              }).join('')}
              
              <!-- Glucose formation -->
              <a-entity animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 4000; dir: alternate">
                <a-sphere radius="0.06" color="#8BC34A"></a-sphere>
                ${Array.from({length: 6}, (_, i) => {
                  const angle = i * 60 * Math.PI / 180;
                  const x = Math.cos(angle) * 0.08;
                  const z = Math.sin(angle) * 0.08;
                  return `<a-sphere position="${x} 0 ${z}" radius="0.02" color="#CDDC39"></a-sphere>`;
                }).join('')}
              </a-entity>
            </a-entity>
          </a-entity>
        `;
      case "topology":
        return `
          <a-entity animation="property: rotation; to: 360 360 360; loop: true; dur: 18000">
            <!-- Klein bottle -->
            <a-entity position="-1 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 12000">
              ${Array.from({length: 50}, (_, i) => {
                const u = i * 0.12;
                const v = i * 0.08;
                const x = Math.cos(u) * (3 + Math.cos(v));
                const y = Math.sin(u) * (3 + Math.cos(v));
                const z = Math.sin(v);
                const scale = 0.1;
                return `<a-sphere position="${x * scale} ${y * scale} ${z * scale}" radius="0.008" color="#E91E63" opacity="0.8" animation="property: scale; to: 1.5 1.5 1.5; loop: true; dur: 3000; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Möbius strip -->
            <a-entity position="1 0 0" animation="property: rotation; to: 0 0 360; loop: true; dur: 10000">
              ${Array.from({length: 40}, (_, i) => {
                const t = i / 40 * 2 * Math.PI;
                const x = Math.cos(t) * (1 + 0.3 * Math.cos(t / 2));
                const y = Math.sin(t) * (1 + 0.3 * Math.cos(t / 2));
                const z = 0.3 * Math.sin(t / 2);
                const scale = 0.3;
                return `<a-box position="${x * scale} ${y * scale} ${z * scale}" width="0.02" height="0.02" depth="0.08" color="#2196F3" rotation="0 0 ${t * 180 / Math.PI / 2}" animation="property: opacity; to: 0.4; loop: true; dur: 2000; dir: alternate; delay: ${i * 50}"></a-box>`;
              }).join('')}
            </a-entity>
            
            <!-- Torus knot -->
            <a-entity position="0 1 0" animation="property: rotation; to: 360 0 360; loop: true; dur: 14000">
              ${Array.from({length: 100}, (_, i) => {
                const t = i / 100 * 2 * Math.PI;
                const p = 3, q = 2;
                const x = Math.cos(p * t) * (2 + Math.cos(q * t));
                const y = Math.sin(p * t) * (2 + Math.cos(q * t));
                const z = Math.sin(q * t);
                const scale = 0.15;
                const color = i % 3 === 0 ? "#4CAF50" : i % 3 === 1 ? "#FF9800" : "#9C27B0";
                return `<a-sphere position="${x * scale} ${y * scale} ${z * scale}" radius="0.01" color="${color}" animation="property: scale; to: 2 2 2; loop: true; dur: 4000; dir: alternate; delay: ${i * 40}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Hyperbolic paraboloid -->
            <a-entity position="0 -1 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 16000">
              ${Array.from({length: 20}, (_, i) => {
                const u = (i - 10) * 0.1;
                return Array.from({length: 20}, (_, j) => {
                  const v = (j - 10) * 0.1;
                  const x = u;
                  const y = u * v * 0.5;
                  const z = v;
                  const color = (i + j) % 2 === 0 ? "#FFEB3B" : "#FF5722";
                  return `<a-sphere position="${x} ${y} ${z}" radius="0.008" color="${color}" opacity="0.7" animation="property: position; to: ${x} ${y * 1.2} ${z}; loop: true; dur: 3000; dir: alternate; delay: ${(i + j) * 50}"></a-sphere>`;
                }).join('');
              }).join('')}
            </a-entity>
            
            <!-- Surface deformation -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 20000">
              ${Array.from({length: 60}, (_, i) => {
                const angle = i * 6 * Math.PI / 180;
                const radius = 0.8 + Math.sin(i * 0.3) * 0.3;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(i * 0.2) * 0.4;
                return `<a-sphere position="${x} ${y} ${z}" radius="0.006" color="#795548" opacity="0.6" animation="property: opacity; to: 0.2; loop: true; dur: 2500; dir: alternate; delay: ${i * 80}"></a-sphere>`;
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      case "vectors":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 25000">
            <!-- 3D coordinate system -->
            <a-cylinder position="1.5 0 0" radius="0.01" height="3" color="#FF0000" rotation="0 0 90"></a-cylinder>
            <a-cylinder position="0 1.5 0" radius="0.01" height="3" color="#00FF00"></a-cylinder>
            <a-cylinder position="0 0 1.5" radius="0.01" height="3" color="#0000FF" rotation="90 0 0"></a-cylinder>
            
            <!-- Vector field visualization -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 15000">
              ${Array.from({length: 8}, (_, i) => {
                const x = (i % 4 - 1.5) * 0.5;
                return Array.from({length: 8}, (_, j) => {
                  const y = (j % 4 - 1.5) * 0.5;
                  return Array.from({length: 8}, (_, k) => {
                    const z = (k % 4 - 1.5) * 0.5;
                    const vx = Math.sin(y) * 0.2;
                    const vy = Math.cos(x) * 0.2;
                    const vz = Math.sin(x + y) * 0.2;
                    const magnitude = Math.sqrt(vx*vx + vy*vy + vz*vz);
                    const color = magnitude > 0.15 ? "#E91E63" : magnitude > 0.1 ? "#FF9800" : "#2196F3";
                    return `<a-cone position="${x} ${y} ${z}" radius-bottom="0.01" height="0.08" color="${color}" rotation="0 0 0" animation="property: position; to: ${x + vx} ${y + vy} ${z + vz}; loop: true; dur: 2000; dir: alternate; delay: ${(i + j + k) * 100}"></a-cone>`;
                  }).join('');
                }).join('');
              }).join('')}
            </a-entity>
            
            <!-- Curl visualization -->
            <a-entity position="1.2 0 0" animation="property: rotation; to: 360 0 0; loop: true; dur: 8000">
              ${Array.from({length: 20}, (_, i) => {
                const angle = i * 18 * Math.PI / 180;
                const radius = 0.3 + Math.sin(i * 0.5) * 0.1;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(i * 0.3) * 0.2;
                return `<a-cone position="${x} ${y} ${z}" radius-bottom="0.008" height="0.04" color="#9C27B0" rotation="0 ${i * 18} 0" animation="property: rotation; to: 0 ${i * 18 + 360} 0; loop: true; dur: 4000"></a-cone>`;
              }).join('')}
            </a-entity>
            
            <!-- Divergence visualization -->
            <a-entity position="-1.2 0 0" animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 3000; dir: alternate">
              ${Array.from({length: 16}, (_, i) => {
                const angle = i * 22.5 * Math.PI / 180;
                const x = Math.cos(angle) * 0.1;
                const z = Math.sin(angle) * 0.1;
                return `<a-cone position="${x} 0 ${z}" radius-bottom="0.008" height="0.06" color="#4CAF50" rotation="0 ${i * 22.5} 0" animation="property: position; to: ${x * 3} 0 ${z * 3}; loop: true; dur: 2500; dir: alternate; delay: ${i * 150}"></a-cone>`;
              }).join('')}
            </a-entity>
            
            <!-- Gradient field -->
            <a-entity position="0 1.2 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 12000">
              ${Array.from({length: 30}, (_, i) => {
                const t = i / 30;
                const x = Math.sin(t * Math.PI * 4) * 0.6;
                const z = Math.cos(t * Math.PI * 3) * 0.6;
                const y = Math.sin(t * Math.PI * 6) * 0.3;
                const intensity = Math.abs(Math.sin(t * Math.PI * 8));
                const color = intensity > 0.7 ? "#FF5722" : intensity > 0.4 ? "#FF9800" : "#FFC107";
                return `<a-sphere position="${x} ${y} ${z}" radius="${0.01 + intensity * 0.02}" color="${color}" animation="property: scale; to: ${1 + intensity}; loop: true; dur: 2000; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Flow lines -->
            <a-entity animation="property: rotation; to: 0 0 360; loop: true; dur: 18000">
              ${Array.from({length: 12}, (_, i) => {
                const startAngle = i * 30 * Math.PI / 180;
                return Array.from({length: 20}, (_, j) => {
                  const t = j / 20;
                  const angle = startAngle + t * Math.PI * 2;
                  const radius = 0.8 - t * 0.5;
                  const x = Math.cos(angle) * radius;
                  const z = Math.sin(angle) * radius;
                  const y = Math.sin(t * Math.PI * 3) * 0.4;
                  return `<a-sphere position="${x} ${y} ${z}" radius="0.005" color="#00BCD4" opacity="${1 - t * 0.7}" animation="property: opacity; to: ${0.3 - t * 0.3}; loop: true; dur: 3000; dir: alternate; delay: ${(i * 20 + j) * 50}"></a-sphere>`;
                }).join('');
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      case "probability":
        return `
          <a-entity animation="property: rotation; to: 0 360 0; loop: true; dur: 20000">
            <!-- 3D probability density function -->
            <a-entity position="0 0 0">
              ${Array.from({length: 20}, (_, i) => {
                const x = (i - 10) * 0.1;
                return Array.from({length: 20}, (_, j) => {
                  const z = (j - 10) * 0.1;
                  const distance = Math.sqrt(x*x + z*z);
                  const height = Math.exp(-distance * distance * 2) * 0.8;
                  const opacity = height + 0.2;
                  const color = height > 0.6 ? "#E91E63" : height > 0.3 ? "#FF9800" : "#2196F3";
                  return `<a-cylinder position="${x} ${height / 2} ${z}" radius="0.02" height="${height}" color="${color}" opacity="${opacity}" animation="property: scale; to: 1 1.2 1; loop: true; dur: 3000; dir: alternate; delay: ${(i + j) * 50}"></a-cylinder>`;
                }).join('');
              }).join('')}
            </a-entity>
            
            <!-- Normal distribution curve -->
            <a-entity position="1.5 0 0" animation="property: rotation; to: 0 0 360; loop: true; dur: 12000">
              ${Array.from({length: 40}, (_, i) => {
                const x = (i - 20) * 0.05;
                const y = Math.exp(-x * x * 8) * 0.6;
                const color = Math.abs(x) < 0.3 ? "#4CAF50" : Math.abs(x) < 0.6 ? "#FF9800" : "#F44336";
                return `<a-sphere position="${x} ${y} 0" radius="0.01" color="${color}" animation="property: scale; to: 1.5 1.5 1.5; loop: true; dur: 2000; dir: alternate; delay: ${i * 50}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Scatter plot with correlation -->
            <a-entity position="-1.5 0 0" animation="property: rotation; to: 360 0 0; loop: true; dur: 10000">
              ${Array.from({length: 50}, (_, i) => {
                const x = (Math.random() - 0.5) * 1.2;
                const y = x * 0.7 + (Math.random() - 0.5) * 0.4;
                const z = (Math.random() - 0.5) * 0.2;
                const correlation = Math.abs(x * 0.7 - y);
                const color = correlation < 0.2 ? "#9C27B0" : correlation < 0.4 ? "#3F51B5" : "#2196F3";
                return `<a-sphere position="${x} ${y} ${z}" radius="0.015" color="${color}" animation="property: opacity; to: 0.4; loop: true; dur: 2500; dir: alternate; delay: ${i * 100}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Monte Carlo simulation -->
            <a-entity position="0 1.2 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 15000">
              <a-ring radius-inner="0.48" radius-outer="0.5" color="#666" rotation="90 0 0"></a-ring>
              <a-box width="1" height="0.01" depth="1" color="#444" rotation="90 0 0"></a-box>
              ${Array.from({length: 100}, (_, i) => {
                const x = (Math.random() - 0.5);
                const z = (Math.random() - 0.5);
                const distance = Math.sqrt(x*x + z*z);
                const inside = distance <= 0.5;
                const color = inside ? "#4CAF50" : "#F44336";
                return `<a-sphere position="${x} 0.01 ${z}" radius="0.008" color="${color}" animation="property: position; to: ${x + (Math.random() - 0.5) * 0.1} 0.01 ${z + (Math.random() - 0.5) * 0.1}; loop: true; dur: ${3000 + Math.random() * 2000}; dir: alternate; delay: ${i * 50}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Bayesian network -->
            <a-entity position="0 -1.2 0" animation="property: rotation; to: 0 0 360; loop: true; dur: 18000">
              <!-- Prior -->
              <a-sphere position="0 0.4 0" radius="0.06" color="#E91E63" animation="property: scale; to: 1.3 1.3 1.3; loop: true; dur: 2000; dir: alternate"></a-sphere>
              <!-- Likelihood -->
              <a-sphere position="-0.4 0 0" radius="0.05" color="#2196F3" animation="property: opacity; to: 0.5; loop: true; dur: 1800; dir: alternate"></a-sphere>
              <a-sphere position="0.4 0 0" radius="0.05" color="#2196F3" animation="property: opacity; to: 0.5; loop: true; dur: 1800; dir: alternate; delay: 200"></a-sphere>
              <!-- Posterior -->
              <a-sphere position="0 -0.4 0" radius="0.07" color="#4CAF50" animation="property: scale; to: 1.4 1.4 1.4; loop: true; dur: 2200; dir: alternate"></a-sphere>
              
              <!-- Connections -->
              <a-cylinder position="0 0.2 0" radius="0.005" height="0.4" color="#666"></a-cylinder>
              <a-cylinder position="-0.2 0 0" radius="0.005" height="0.4" color="#666" rotation="0 0 45"></a-cylinder>
              <a-cylinder position="0.2 0 0" radius="0.005" height="0.4" color="#666" rotation="0 0 -45"></a-cylinder>
              <a-cylinder position="0 -0.2 0" radius="0.005" height="0.4" color="#666"></a-cylinder>
            </a-entity>
          </a-entity>
        `;
      case "fractal":
        return `
          <a-entity animation="property: rotation; to: 360 360 360; loop: true; dur: 15000">
            <!-- 3D Mandelbrot set -->
            <a-entity position="0 0.5 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 8000">
              ${Array.from({length: 50}, (_, i) => {
                const angle = i * 7.2 * Math.PI / 180;
                const radius = 0.3 + Math.sin(i * 0.1) * 0.2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(i * 0.2) * 0.4;
                const iteration = Math.floor(Math.sin(i * 0.05) * 5 + 5);
                const color = iteration > 7 ? "#E91E63" : iteration > 5 ? "#9C27B0" : iteration > 3 ? "#3F51B5" : "#2196F3";
                return `<a-sphere position="${x} ${y} ${z}" radius="${0.008 + iteration * 0.002}" color="${color}" animation="property: scale; to: ${1 + iteration * 0.1}; loop: true; dur: ${2000 + iteration * 200}; dir: alternate; delay: ${i * 80}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Julia set -->
            <a-entity position="0 -0.5 0" animation="property: rotation; to: 0 0 360; loop: true; dur: 10000">
              ${Array.from({length: 40}, (_, i) => {
                const t = i / 40 * 2 * Math.PI;
                const r = 0.7545 + 0.1121 * Math.cos(2 * t);
                const x = r * Math.cos(t);
                const z = r * Math.sin(t);
                const y = Math.sin(3 * t) * 0.2;
                const complexity = Math.abs(Math.sin(5 * t));
                const color = complexity > 0.8 ? "#FF5722" : complexity > 0.5 ? "#FF9800" : "#FFC107";
                return `<a-sphere position="${x} ${y} ${z}" radius="${0.01 + complexity * 0.02}" color="${color}" animation="property: rotation; to: 360 0 0; loop: true; dur: ${3000 + i * 50}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- Dragon curve -->
            <a-entity position="1 0 0" animation="property: rotation; to: 360 0 360; loop: true; dur: 12000">
              ${Array.from({length: 64}, (_, i) => {
                let direction = 0;
                let x = 0, y = 0;
                for (let j = 0; j < i; j++) {
                  const turn = ((j & -j) << 1) & j ? 1 : -1;
                  direction = (direction + turn) & 3;
                  switch (direction) {
                    case 0: x += 0.03; break;
                    case 1: y += 0.03; break;
                    case 2: x -= 0.03; break;
                    case 3: y -= 0.03; break;
                  }
                }
                const z = Math.sin(i * 0.1) * 0.2;
                const intensity = Math.sin(i * 0.05) * 0.5 + 0.5;
                const color = intensity > 0.7 ? "#9C27B0" : intensity > 0.4 ? "#673AB7" : "#3F51B5";
                return `<a-sphere position="${x} ${y} ${z}" radius="0.008" color="${color}" animation="property: opacity; to: ${0.3 + intensity * 0.5}; loop: true; dur: 2000; dir: alternate; delay: ${i * 50}"></a-sphere>`;
              }).join('')}
            </a-entity>
            
            <!-- L-system tree -->
            <a-entity position="-1 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 14000">
              ${(() => {
                let branches = [];
                function drawBranch(x, y, z, angle, length, depth) {
                  if (depth > 0 && length > 0.02) {
                    const endX = x + Math.cos(angle) * length;
                    const endZ = z + Math.sin(angle) * length;
                    const endY = y + length * 0.5;
                    const color = depth > 3 ? "#4CAF50" : depth > 2 ? "#8BC34A" : "#795548";
                    branches.push(`<a-cylinder position="${(x + endX) / 2} ${(y + endY) / 2} ${(z + endZ) / 2}" radius="${0.008 * depth}" height="${length}" color="${color}" rotation="0 ${angle * 180 / Math.PI} ${Math.atan2(endY - y, Math.sqrt((endX - x) ** 2 + (endZ - z) ** 2)) * 180 / Math.PI}" animation="property: scale; to: 1 ${1 + depth * 0.1} 1; loop: true; dur: ${2000 + depth * 300}; dir: alternate; delay: ${depth * 200}"></a-cylinder>`);
                    drawBranch(endX, endY, endZ, angle - 0.5, length * 0.7, depth - 1);
                    drawBranch(endX, endY, endZ, angle + 0.5, length * 0.7, depth - 1);
                  }
                }
                drawBranch(0, -0.5, 0, Math.PI / 2, 0.3, 5);
                return branches.join('');
              })()}
            </a-entity>
            
            <!-- Sierpinski gasket 3D -->
            <a-entity position="0 1.2 0" animation="property: rotation; to: 360 360 0; loop: true; dur: 16000">
              ${Array.from({length: 4}, level => {
                const size = 0.6 / Math.pow(2, level);
                const spacing = size * 2;
                const positions = [];
                for (let i = 0; i < Math.pow(3, level); i++) {
                  let temp = i;
                  let x = 0, y = 0, z = 0;
                  for (let j = 0; j < level; j++) {
                    const digit = temp % 3;
                    temp = Math.floor(temp / 3);
                    x += (digit === 1 ? spacing : digit === 2 ? -spacing : 0) / Math.pow(2, j);
                    y += (digit === 2 ? spacing : 0) / Math.pow(2, j);
                    z += (digit === 1 ? spacing : 0) / Math.pow(2, j);
                  }
                  const color = level === 0 ? "#E91E63" : level === 1 ? "#9C27B0" : level === 2 ? "#673AB7" : "#3F51B5";
                  positions.push(`<a-sphere position="${x} ${y} ${z}" radius="${size * 0.8}" color="${color}" opacity="${0.9 - level * 0.2}" animation="property: scale; to: ${1.2 - level * 0.1}; loop: true; dur: ${3000 + level * 500}; dir: alternate; delay: ${i * 100}"></a-sphere>`);
                }
                return positions.join('');
              }).join('')}
            </a-entity>
          </a-entity>
        `;
      default:
        return `
          <a-sphere radius="0.4" color="#4FC3F7" animation="property: rotation; to: 0 360 0; loop: true; dur: 6000">
            <a-sphere position="0.7 0 0" radius="0.06" color="#FFB74D" animation="property: rotation; to: 0 0 360; loop: true; dur: 3000"></a-sphere>
            <a-sphere position="-0.7 0 0" radius="0.06" color="#FFB74D" animation="property: rotation; to: 0 0 -360; loop: true; dur: 3000"></a-sphere>
            <a-torus radius="0.7" radius-tubular="0.02" color="#81C784" rotation="90 0 0" animation="property: rotation; to: 90 360 0; loop: true; dur: 5000"></a-torus>
            <a-torus radius="0.5" radius-tubular="0.015" color="#9C27B0" rotation="0 45 0" animation="property: rotation; to: 0 405 0; loop: true; dur: 4000"></a-torus>
          </a-sphere>
        `;
    }
  };

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

  // The actual viewer is injected directly into the DOM
  return null;
}