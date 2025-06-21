import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, RefreshCw, RotateCw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface PhETViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function PhETViewer({ 
  selectedModel = "Atom",
  subject,
  onSessionEnd 
}: PhETViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSimulation, setCurrentSimulation] = useState('');
  const [savedScrollPosition, setSavedScrollPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Screen orientation and fullscreen functions
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      
      if (isMobile && 'screen' in window && 'orientation' in window.screen) {
        try {
          await (window.screen.orientation as any).lock('landscape');
        } catch (err) {
          console.log("Orientation lock not supported or failed");
        }
      }
      
      setIsFullscreen(true);
    } catch (error) {
      console.log("Fullscreen request failed:", error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      
      if (isMobile && 'screen' in window && 'orientation' in window.screen) {
        try {
          (window.screen.orientation as any).unlock();
        } catch (err) {
          console.log("Orientation unlock not supported or failed");
        }
      }
      
      setIsFullscreen(false);
    } catch (error) {
      console.log("Exit fullscreen failed:", error);
    }
  };

  const handleSessionEnd = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    }
    
    // Restore body scroll and clean up
    document.body.style.overflow = '';
    const container = document.getElementById('phet-viewer-container');
    if (container) {
      container.remove();
    }
    
    // Restore scroll position
    window.scrollTo(savedScrollPosition.x, savedScrollPosition.y);
    
    onSessionEnd();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Comprehensive PhET simulation mapping - exact match with AR Manager card names
  const getPhETSimulation = (modelType: string, subjectArea: string) => {
    const simulations: Record<string, string> = {
      // PHYSICS SIMULATIONS - All verified working PhET URLs
      "Build an Atom": "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html",
      "Charges and Fields": "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_en.html",
      "Wave on a String": "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html",
      "Gravity and Orbits": "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_en.html",
      "Projectile Motion": "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html",
      "Circuit Construction Kit": "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
      "Circuit Construction": "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
      "Pendulum Lab": "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html",
      "Forces and Motion": "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html",
      "Energy Skate Park": "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html",
      "Wave Interference": "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
      "Faraday's Law": "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_en.html",
      "Blackbody Spectrum": "https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum_en.html",
      
      // CHEMISTRY SIMULATIONS - All verified working PhET URLs
      "Molecule Shapes": "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_en.html",
      "States of Matter": "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_en.html",
      "pH Scale": "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html",
      "Balancing Chemical Equations": "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html",
      "Balancing Equations": "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html",
      "Build a Molecule": "https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html",
      "Concentration": "https://phet.colorado.edu/sims/html/concentration/latest/concentration_en.html",
      "Reactions and Rates": "https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_en.html",
      "Reactions & Rates": "https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_en.html",
      "Acid-Base Solutions": "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html",
      "Beer's Law Lab": "https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab_en.html",
      "Isotopes and Atomic Mass": "https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_en.html",
      "Isotopes & Atomic Mass": "https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_en.html",
      "Gas Properties": "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html",
      
      // BIOLOGY SIMULATIONS - Corrected authentic PhET URLs
      "Gene Expression Essentials": "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html",
      "Gene Expression": "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html",
      "Natural Selection": "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html",
      "Neuron": "https://phet.colorado.edu/sims/html/neuron/latest/neuron_en.html",
      "DNA": "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html",
      "Membrane Channels": "https://phet.colorado.edu/sims/html/neuron/latest/neuron_en.html",
      "Biomolecules and Cell Tour": "https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html",
      "Biomolecules": "https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html",
      "Ecological Populations": "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html",
      "Population Ecology": "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html",
      "Photosynthesis": "https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_en.html",
      "Cell Division": "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html",
      
      // MATHEMATICS SIMULATIONS - All verified working PhET URLs
      "Graphing Lines": "https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_en.html",
      "Function Builder": "https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_en.html",
      "Area Builder": "https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_en.html",
      "Fractions Intro": "https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_en.html",
      "Calculus Grapher": "https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher_en.html",
      "Proportion Playground": "https://phet.colorado.edu/sims/html/proportion-playground/latest/proportion-playground_en.html",
      "Unit Rates": "https://phet.colorado.edu/sims/html/unit-rates/latest/unit-rates_en.html",
      "Graphing Quadratics": "https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_en.html",
      "Plinko Probability": "https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability_en.html"
    };

    // Subject-specific fallbacks
    const subjectFallbacks: Record<string, string> = {
      "Physics": "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html",
      "Chemistry": "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_en.html",
      "Biology": "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html",
      "Mathematics": "https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_en.html"
    };

    return simulations[modelType] || subjectFallbacks[subjectArea] || simulations["Build an Atom"];
  };

  useEffect(() => {
    console.log("Initializing PhET simulation for:", selectedModel);
    
    // Save current scroll position when opening simulation
    const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    setSavedScrollPosition({ x: currentScrollX, y: currentScrollY });
    
    const simulationUrl = getPhETSimulation(selectedModel, subject);
    setCurrentSimulation(simulationUrl);
    
    const createPhETViewer = () => {
      const existingContainer = document.getElementById('phet-viewer-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Prevent body scroll while simulation is open
      document.body.style.overflow = 'hidden';
      
      const container = document.createElement('div');
      container.id = 'phet-viewer-container';
      container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 50; background: linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #283593 100%);';
      document.body.appendChild(container);

      createPhETInterface(container, simulationUrl);
    };

    const createPhETInterface = (container: HTMLElement, simUrl: string) => {
      // Auto-enter fullscreen on mobile
      if (isMobile) {
        setTimeout(() => {
          enterFullscreen();
        }, 1000);
      }

      const interfaceHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
          <!-- Header with controls -->
          <div style="position: absolute; top: 0; left: 0; right: 0; z-index: 100; background: linear-gradient(135deg, rgba(12,20,69,0.95), rgba(26,35,126,0.95)); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="color: white; font-size: 24px; font-weight: bold; margin: 0;">${selectedModel} - PhET Simulation</h2>
                <p style="color: #90CAF9; font-size: 14px; margin: 4px 0 0 0;">University of Colorado Boulder • Interactive Physics & Chemistry</p>
              </div>
              <div style="display: flex; gap: 12px; align-items: center;">
                <button onclick="window.refreshPhET()" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <span>🔄</span> Reload
                </button>
                <button onclick="window.openPhETDirect()" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <span>🔗</span> Open Direct
                </button>
                <button onclick="window.closePhETViewer()" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 16px; cursor: pointer;">
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
          
          <!-- PhET Simulation Frame -->
          <iframe 
            id="phet-simulation-frame"
            src="${simUrl}"
            style="position: absolute; top: 80px; left: 0; width: 100%; height: calc(100% - 80px); border: none; background: white;"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
            onload="window.handlePhETLoad()"
            onerror="window.handlePhETError()"
            loading="eager"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          
          <!-- Loading overlay -->
          <div id="phet-loading" style="position: absolute; top: 80px; left: 0; width: 100%; height: calc(100% - 80px); background: linear-gradient(135deg, #1565C0, #1976D2); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">
            <div style="text-align: center;">
              <div style="width: 64px; height: 64px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px;"></div>
              <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Loading PhET Simulation</h3>
              <p style="font-size: 16px; opacity: 0.9; margin-bottom: 8px;">University of Colorado Boulder</p>
              <p style="font-size: 14px; opacity: 0.7;">Interactive ${subject} simulation loading...</p>
            </div>
          </div>
          
          <!-- Error overlay (hidden by default) -->
          <div id="phet-error" style="position: absolute; top: 80px; left: 0; width: 100%; height: calc(100% - 80px); background: linear-gradient(135deg, #d32f2f, #f44336); display: none; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 40px;">
            <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">⚠️ Simulation Loading Issue</h3>
            <p style="font-size: 16px; margin-bottom: 24px; max-width: 600px;">The PhET simulation is taking longer than expected to load. This might be due to network connectivity or the simulation server.</p>
            <div style="display: flex; gap: 16px;">
              <button onclick="window.refreshPhET()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer;">
                Try Again
              </button>
              <button onclick="window.openPhETDirect()" style="background: rgba(255,255,255,0.9); color: #d32f2f; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
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

      // Global functions for PhET interaction
      (window as any).closePhETViewer = () => {
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove container
        container?.remove();
        
        // Restore scroll position after a brief delay to ensure DOM updates
        setTimeout(() => {
          window.scrollTo(savedScrollPosition.x, savedScrollPosition.y);
        }, 50);
        
        onSessionEnd();
      };

      (window as any).refreshPhET = () => {
        const frame = document.getElementById('phet-simulation-frame') as HTMLIFrameElement;
        const loading = document.getElementById('phet-loading');
        const error = document.getElementById('phet-error');
        
        if (frame && loading && error) {
          loading.style.display = 'flex';
          error.style.display = 'none';
          frame.src = frame.src; // Reload iframe
        }
      };

      (window as any).openPhETDirect = () => {
        window.open(simUrl, '_blank', 'noopener,noreferrer');
      };

      (window as any).handlePhETLoad = () => {
        console.log("PhET simulation loaded successfully");
        const loading = document.getElementById('phet-loading');
        const frame = document.getElementById('phet-simulation-frame') as HTMLIFrameElement;
        
        if (loading) {
          loading.style.display = 'none';
        }
        
        // Additional stability check for iframe content
        if (frame && frame.contentWindow) {
          try {
            // Test if iframe content is accessible
            frame.contentWindow.postMessage('ping', '*');
          } catch (e) {
            console.warn("PhET iframe may have loading issues:", e);
          }
        }
        
        setIsLoaded(true);
        setIsLoading(false);
        
        // Simulation loaded successfully - no notification needed
      };

      (window as any).handlePhETError = () => {
        console.error("PhET simulation failed to load");
        const loading = document.getElementById('phet-loading');
        const error = document.getElementById('phet-error');
        const frame = document.getElementById('phet-simulation-frame') as HTMLIFrameElement;
        
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
        // Remove persistent error notifications to prevent spam
      };

      // Multiple timeout checks for better reliability
      let timeoutId: NodeJS.Timeout;
      let secondaryTimeoutId: NodeJS.Timeout;
      
      // Primary timeout - 15 seconds (reduced to prevent spam)
      timeoutId = setTimeout(() => {
        if (isLoading && !isLoaded) {
          console.warn("PhET simulation loading timeout (15s)");
          // Silently handle timeout without toast notifications
          const loading = document.getElementById('phet-loading');
          const error = document.getElementById('phet-error');
          if (loading && error) {
            loading.style.display = 'none';
            error.style.display = 'flex';
          }
          setIsLoading(false);
        }
      }, 15000);
      
      // Secondary check - 10 seconds for initial response
      secondaryTimeoutId = setTimeout(() => {
        const frame = document.getElementById('phet-simulation-frame') as HTMLIFrameElement;
        if (frame && isLoading) {
          // Check if iframe is responding
          try {
            if (!frame.contentDocument && !frame.contentWindow) {
              console.warn("PhET iframe not responding, attempting reload");
              frame.src = frame.src; // Reload iframe
            }
          } catch (e) {
            console.warn("PhET iframe access error:", e);
          }
        }
      }, 10000);
      
      // Cleanup timeouts when component unmounts
      const originalCleanup = () => {
        clearTimeout(timeoutId);
        clearTimeout(secondaryTimeoutId);
      };
      
      // Store cleanup function
      (window as any).cleanupPhETTimeouts = originalCleanup;
    };

    createPhETViewer();

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      
      const container = document.getElementById('phet-viewer-container');
      if (container) {
        container.remove();
      }
      
      // Restore scroll position on cleanup
      setTimeout(() => {
        window.scrollTo(savedScrollPosition.x, savedScrollPosition.y);
      }, 50);
    };
  }, [selectedModel, subject, savedScrollPosition.x, savedScrollPosition.y]);

  if (isLoading && !isLoaded) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-2xl font-weight-bold mb-3">Connecting to PhET</h3>
          <p className="text-blue-200 mb-2">University of Colorado Boulder</p>
          <p className="text-blue-300 text-sm">Loading interactive {subject} simulation...</p>
          <div className="mt-6 w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}