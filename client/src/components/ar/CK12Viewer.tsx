import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CK12ViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function CK12Viewer({ 
  selectedModel = "Atomic Structure",
  subject,
  onSessionEnd 
}: CK12ViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSimulation, setCurrentSimulation] = useState('');
  const [savedScrollPosition, setSavedScrollPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // CK-12 simulation mapping
  const getCK12Simulation = (modelType: string, subjectArea: string) => {
    const simulations: Record<string, string> = {
      // Physics Simulations
      "Motion and Forces": "https://www.ck12.org/simulations/physics/motion-forces",
      "Waves and Sound": "https://www.ck12.org/simulations/physics/waves-sound", 
      "Electric Circuits": "https://www.ck12.org/simulations/physics/electric-circuits",
      
      // Chemistry Simulations
      "Atomic Structure": "https://www.ck12.org/simulations/chemistry/atomic-structure",
      "Chemical Bonding": "https://www.ck12.org/simulations/chemistry/chemical-bonding",
      "Periodic Table": "https://www.ck12.org/simulations/chemistry/periodic-table",
      
      // Biology Simulations
      "Cell Structure": "https://www.ck12.org/simulations/biology/cell-structure",
      "Genetics": "https://www.ck12.org/simulations/biology/genetics",
      "Ecosystems": "https://www.ck12.org/simulations/biology/ecosystems",
      
      // Mathematics Simulations
      "Algebra Concepts": "https://www.ck12.org/simulations/math/algebra",
      "Geometry Tools": "https://www.ck12.org/simulations/math/geometry",
      "Statistics": "https://www.ck12.org/simulations/math/statistics"
    };

    const subjectFallbacks: Record<string, string> = {
      "Physics": "https://www.ck12.org/simulations/physics",
      "Chemistry": "https://www.ck12.org/simulations/chemistry", 
      "Biology": "https://www.ck12.org/simulations/biology",
      "Mathematics": "https://www.ck12.org/simulations/math"
    };

    return simulations[modelType] || subjectFallbacks[subjectArea] || "https://www.ck12.org/simulations";
  };

  useEffect(() => {
    console.log("Initializing CK-12 simulation for:", selectedModel);
    
    // Save current scroll position
    const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    setSavedScrollPosition({ x: currentScrollX, y: currentScrollY });
    
    const simulationUrl = getCK12Simulation(selectedModel, subject);
    setCurrentSimulation(simulationUrl);
    
    const createCK12Viewer = () => {
      const existingContainer = document.getElementById('ck12-viewer-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Prevent body scroll while simulation is open
      document.body.style.overflow = 'hidden';
      
      const container = document.createElement('div');
      container.id = 'ck12-viewer-container';
      container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 50; background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);';
      document.body.appendChild(container);

      createCK12Interface(container, simulationUrl);
    };

    const createCK12Interface = (container: HTMLElement, simUrl: string) => {
      const interfaceHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
          <!-- Header with controls -->
          <div style="position: absolute; top: 0; left: 0; right: 0; z-index: 100; background: linear-gradient(135deg, rgba(30,58,138,0.95), rgba(55,48,163,0.95)); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="color: white; font-size: 24px; font-weight: bold; margin: 0;">${selectedModel} - CK-12 Simulation</h2>
                <p style="color: #93c5fd; font-size: 14px; margin: 4px 0 0 0;">CK-12 Foundation • Interactive Learning Tools</p>
              </div>
              <div style="display: flex; gap: 12px; align-items: center;">
                <button onclick="window.refreshCK12()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <span>🔄</span> Reload
                </button>
                <button onclick="window.openCK12Direct()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <span>🔗</span> Open Direct
                </button>
                <button onclick="window.closeCK12Viewer()" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 16px; cursor: pointer;">
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
          
          <!-- CK-12 Simulation Frame -->
          <iframe 
            id="ck12-simulation-frame"
            src="${simUrl}"
            style="position: absolute; top: 80px; left: 0; width: 100%; height: calc(100% - 80px); border: none; background: white;"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
            onload="window.handleCK12Load()"
            onerror="window.handleCK12Error()"
            loading="eager"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          
          <!-- Loading overlay -->
          <div id="ck12-loading" style="position: absolute; top: 80px; left: 0; width: 100%; height: calc(100% - 80px); background: linear-gradient(135deg, #1e40af, #3b82f6); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">
            <div style="text-align: center;">
              <div style="width: 64px; height: 64px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px;"></div>
              <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Loading CK-12 Simulation</h3>
              <p style="font-size: 16px; opacity: 0.9; margin-bottom: 8px;">CK-12 Foundation</p>
              <p style="font-size: 14px; opacity: 0.7;">Interactive ${subject} simulation loading...</p>
            </div>
          </div>
          
          <!-- Error overlay (hidden by default) -->
          <div id="ck12-error" style="position: absolute; top: 80px; left: 0; width: 100%; height: calc(100% - 80px); background: linear-gradient(135deg, #dc2626, #ef4444); display: none; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 40px;">
            <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">⚠️ Simulation Loading Issue</h3>
            <p style="font-size: 16px; margin-bottom: 24px; max-width: 600px;">The CK-12 simulation is taking longer than expected to load. This might be due to network connectivity or the simulation server.</p>
            <div style="display: flex; gap: 16px;">
              <button onclick="window.refreshCK12()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer;">
                Try Again
              </button>
              <button onclick="window.openCK12Direct()" style="background: rgba(255,255,255,0.9); color: #dc2626; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      container.innerHTML = interfaceHTML;

      // Global functions for CK-12 interaction
      (window as any).closeCK12Viewer = () => {
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove container
        container?.remove();
        
        // Restore scroll position after a brief delay
        setTimeout(() => {
          window.scrollTo(savedScrollPosition.x, savedScrollPosition.y);
        }, 50);
        
        onSessionEnd();
      };

      (window as any).refreshCK12 = () => {
        const frame = document.getElementById('ck12-simulation-frame') as HTMLIFrameElement;
        const loading = document.getElementById('ck12-loading');
        const error = document.getElementById('ck12-error');
        
        if (frame && loading && error) {
          loading.style.display = 'flex';
          error.style.display = 'none';
          frame.src = frame.src; // Reload iframe
        }
      };

      (window as any).openCK12Direct = () => {
        window.open(simUrl, '_blank', 'noopener,noreferrer');
      };

      (window as any).handleCK12Load = () => {
        console.log("CK-12 simulation loaded successfully");
        const loading = document.getElementById('ck12-loading');
        const frame = document.getElementById('ck12-simulation-frame') as HTMLIFrameElement;
        
        if (loading) {
          loading.style.display = 'none';
        }
        
        // Additional stability check for iframe content
        if (frame && frame.contentWindow) {
          try {
            frame.contentWindow.postMessage('ping', '*');
          } catch (e) {
            console.warn("CK-12 iframe may have loading issues:", e);
          }
        }
        
        setIsLoaded(true);
        setIsLoading(false);
        
        toast({
          title: "CK-12 Simulation Ready",
          description: `${selectedModel} simulation loaded from CK-12 Foundation`,
        });
      };

      (window as any).handleCK12Error = () => {
        console.error("CK-12 simulation failed to load");
        const loading = document.getElementById('ck12-loading');
        const error = document.getElementById('ck12-error');
        const frame = document.getElementById('ck12-simulation-frame') as HTMLIFrameElement;
        
        if (loading && error) {
          loading.style.display = 'none';
          error.style.display = 'flex';
        }
        
        // Clear problematic iframe
        if (frame) {
          frame.src = 'about:blank';
          setTimeout(() => {
            frame.src = simulationUrl;
          }, 1000);
        }
        
        setIsLoading(false);
        toast({
          title: "Simulation Loading Issue",
          description: "CK-12 simulation is taking longer than expected to load",
          variant: "destructive"
        });
      };

      // Multiple timeout checks for better reliability
      let timeoutId: NodeJS.Timeout;
      let secondaryTimeoutId: NodeJS.Timeout;
      
      // Primary timeout - 20 seconds
      timeoutId = setTimeout(() => {
        if (isLoading && !isLoaded) {
          console.warn("CK-12 simulation loading timeout (20s)");
          (window as any).handleCK12Error();
        }
      }, 20000);
      
      // Secondary check - 10 seconds for initial response
      secondaryTimeoutId = setTimeout(() => {
        const frame = document.getElementById('ck12-simulation-frame') as HTMLIFrameElement;
        if (frame && isLoading) {
          try {
            if (!frame.contentDocument && !frame.contentWindow) {
              console.warn("CK-12 iframe not responding, attempting reload");
              frame.src = frame.src;
            }
          } catch (e) {
            console.warn("CK-12 iframe access error:", e);
          }
        }
      }, 10000);
      
      // Cleanup timeouts
      (window as any).cleanupCK12Timeouts = () => {
        clearTimeout(timeoutId);
        clearTimeout(secondaryTimeoutId);
      };
    };

    createCK12Viewer();

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      
      const container = document.getElementById('ck12-viewer-container');
      if (container) {
        container.remove();
      }
      
      // Restore scroll position on cleanup
      setTimeout(() => {
        window.scrollTo(savedScrollPosition.x, savedScrollPosition.y);
      }, 50);
      
      // Cleanup timeouts
      if ((window as any).cleanupCK12Timeouts) {
        (window as any).cleanupCK12Timeouts();
      }
    };
  }, [selectedModel, subject, savedScrollPosition.x, savedScrollPosition.y]);

  if (isLoading && !isLoaded) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Starting CK-12 Simulation</h2>
          <p className="text-blue-200">Loading {selectedModel}...</p>
        </div>
      </div>
    );
  }

  return null; // The viewer is rendered as a global overlay
}