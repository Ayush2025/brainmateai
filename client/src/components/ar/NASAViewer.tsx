import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, Rocket, ExternalLink, Maximize2, Clock, Zap, RotateCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NASAViewerProps {
  modelName: string;
  onSessionEnd: () => void;
}

export function NASAViewer({ modelName, onSessionEnd }: NASAViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const simulationUrl = "https://eyes.nasa.gov/apps/solar-system/#/home?embed=true&controls=false&ui=minimal";

  useEffect(() => {
    console.log("Initializing NASA simulation for:", modelName);
    
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).msFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    // Show mobile instructions on mobile devices
    if (isMobile) {
      // Show instructions first, then auto-enter fullscreen
      setShowMobileInstructions(true);
      const instructionTimer = setTimeout(() => {
        setShowMobileInstructions(false);
      }, 4000);
      
      // Try to lock orientation to landscape
      if ((screen as any).orientation && (screen as any).orientation.lock) {
        (screen as any).orientation.lock('landscape').catch(() => {
          console.log('Orientation lock not supported');
        });
      }
      
      // Auto-enter fullscreen after instructions
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(instructionTimer);
        // Restore body overflow when leaving
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Unlock orientation when leaving
        if ((screen as any).orientation && (screen as any).orientation.unlock) {
          (screen as any).orientation.unlock();
        }
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      };
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isMobile, modelName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("NASA simulation loaded successfully");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const enterFullscreen = () => {
    setIsFullscreen(true);
    
    // Hide browser UI on mobile
    if (isMobile) {
      // Set viewport to fullscreen
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no');
      }
      
      // Hide mobile browser UI
      window.scrollTo(0, 1);
      
      // Add fullscreen styles
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    
    // Try native fullscreen API with better error handling
    const element = (containerRef.current || document.documentElement) as any;
    try {
      if (element.requestFullscreen && typeof element.requestFullscreen === 'function') {
        element.requestFullscreen().catch((err: any) => {
          console.log("Fullscreen request failed:", err);
          // Continue with simulation even if fullscreen fails
        });
      } else if (element.webkitRequestFullscreen && typeof element.webkitRequestFullscreen === 'function') {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen && typeof element.msRequestFullscreen === 'function') {
        element.msRequestFullscreen();
      } else {
        console.log("Fullscreen API not supported, using viewport optimization");
      }
    } catch (error) {
      console.log("Fullscreen error handled:", error);
      // Continue with simulation regardless of fullscreen status
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    
    // Check if document is currently in fullscreen mode before attempting to exit
    const doc = document as any;
    const isCurrentlyFullscreen = doc.fullscreenElement || 
                                 doc.webkitFullscreenElement || 
                                 doc.msFullscreenElement;
    
    if (!isCurrentlyFullscreen) {
      console.log("Document not in fullscreen mode, skipping exit");
      return;
    }

    try {
      if (doc.exitFullscreen && typeof doc.exitFullscreen === 'function') {
        doc.exitFullscreen().catch((error: Error) => {
          console.warn("Exit fullscreen failed:", error);
        });
      } else if (doc.webkitExitFullscreen && typeof doc.webkitExitFullscreen === 'function') {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen && typeof doc.msExitFullscreen === 'function') {
        doc.msExitFullscreen();
      }
    } catch (error) {
      console.warn("Exit fullscreen error:", error);
    }
  };

  const openInNewTab = () => {
    window.open(simulationUrl, '_blank');
  };

  const handleSessionEnd = () => {
    // Restore mobile styles when exiting
    if (isMobile) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    }
    
    if (isFullscreen) {
      exitFullscreen();
    }
    onSessionEnd();
  };

  return (
    <div className={`simulation-page min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 ${isFullscreen ? 'p-0' : isMobile ? 'p-0 m-0 w-screen' : ''}`}>
      {/* Mobile Instructions Overlay */}
      {showMobileInstructions && isMobile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-gradient-to-br from-blue-900/90 to-indigo-900/90 border-blue-500/30 max-w-sm mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <RotateCw className="h-6 w-6 text-blue-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white">Best Viewing Experience</h3>
              <div className="space-y-3 text-sm text-blue-200">
                <p>For the optimal NASA simulation experience:</p>
                <div className="space-y-2">
                  <p>• Rotate your device to landscape mode</p>
                  <p>• Tap the fullscreen button when it appears</p>
                  <p>• Use touch gestures to explore space</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowMobileInstructions(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Got it!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div ref={containerRef} className={`${isFullscreen ? 'h-screen w-screen' : isMobile ? 'min-h-screen w-screen' : 'min-h-screen w-full'}`}>
        {/* Header - Hide in fullscreen, optimized for mobile */}
        {!isFullscreen && !isMobile && (
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <Button
              onClick={handleSessionEnd}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Simulations
            </Button>
          
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600 text-white">
                <Rocket className="h-3 w-3 mr-1" />
                NASA JPL
              </Badge>
              <Badge className="bg-green-600 text-white">
                Premium Access
              </Badge>
            </div>
          </div>
        )}

        {/* Minimalist Mobile Header - Only in non-fullscreen */}
        {isMobile && !isFullscreen && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-3 py-2">
              <Button
                onClick={handleSessionEnd}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Exit</span>
              </Button>
              
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/30 rounded">
                <Rocket className="h-3 w-3 text-blue-300" />
                <span className="text-xs text-blue-200">NASA</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`${isFullscreen ? 'h-full' : isMobile ? 'fixed inset-0 w-screen h-screen p-0 m-0 z-10' : 'max-w-7xl mx-auto px-4 py-6 space-y-6'}`}>

          {/* Desktop Title Section */}
          {!isFullscreen && !isMobile && (
            <div className="text-center space-y-4 mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {modelName}
              </h1>
              <p className="text-lg text-blue-100 max-w-3xl mx-auto">
                Explore the universe with NASA's official interactive simulation platform
              </p>
            </div>
          )}

          {/* Premium Simulation Container - Perfectly Centered */}
          <div className={`${isFullscreen ? 'h-full w-full' : isMobile ? 'fixed inset-0 w-screen h-screen' : 'w-full flex justify-center'}`}>
            <div className={`${
              isFullscreen 
                ? 'h-full w-full bg-black' 
                : isMobile 
                  ? 'w-screen h-screen bg-black' 
                  : 'w-full max-w-5xl bg-gradient-to-br from-slate-900/95 to-gray-900/95 backdrop-blur-md border border-gray-700/40 rounded-2xl shadow-2xl overflow-hidden mx-auto'
            }`} style={!isFullscreen && !isMobile ? { transform: 'translateX(0)' } : {}}>
              {/* Professional Header - Desktop Only */}
              {!isFullscreen && !isMobile && (
                <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm p-4 border-b border-gray-600/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Rocket className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">NASA Eyes on the Solar System</h3>
                        <p className="text-xs text-blue-200">Real-time interactive simulation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        LIVE
                      </Badge>
                      <Button
                        onClick={openInNewTab}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className={`${isMobile ? 'h-full' : isFullscreen ? 'h-full' : 'h-[600px]'} flex flex-col items-center justify-center space-y-8 bg-gradient-to-br from-slate-900 via-blue-900/50 to-indigo-900/50`}>
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 animate-pulse"></div>
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-500 border-r-indigo-500"></div>
                    <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-cyan-400 border-l-purple-500" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
                  </div>
                  
                  <div className="text-center space-y-4 max-w-md mx-auto px-4">
                    <div className="flex items-center gap-3 justify-center">
                      <Globe className="h-6 w-6 text-blue-400 animate-pulse" />
                      <h3 className="text-xl font-semibold text-white">Initializing NASA Simulation</h3>
                    </div>
                    <p className="text-blue-300 text-base">Connecting to NASA Jet Propulsion Laboratory servers...</p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-xs text-gray-400">Real-time Data</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        </div>
                        <p className="text-xs text-gray-400">3D Rendering</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        </div>
                        <p className="text-xs text-gray-400">Interactive Controls</p>
                      </div>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className={`${isFullscreen ? 'h-full' : isMobile ? 'h-full' : ''}`}>
                    {/* Premium Simulation Iframe Container */}
                    <div className={`${
                      isFullscreen 
                        ? 'h-full w-full bg-black' 
                        : isMobile 
                          ? 'w-screen h-screen bg-black' 
                          : 'relative overflow-hidden h-[600px] bg-black rounded-xl'
                    }`}>
                      <iframe
                        src={simulationUrl}
                        className="w-full h-full border-0"
                        title={`NASA ${modelName}`}
                        allow="fullscreen; accelerometer; gyroscope"
                        loading="lazy"
                        style={isMobile ? { 
                          background: 'black', 
                          width: '100vw', 
                          height: '100vh',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          margin: 0,
                          padding: 0
                        } : { background: 'black' }}
                      />
                      
                      {/* Desktop Controls */}
                      {!isFullscreen && !isMobile && (
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                          <Button
                            onClick={handleSessionEnd}
                            size="sm"
                            className="bg-red-600/90 text-white hover:bg-red-700 shadow-xl backdrop-blur-sm"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Exit
                          </Button>
                          <Button
                            onClick={enterFullscreen}
                            size="sm"
                            className="bg-blue-600/90 text-white hover:bg-blue-700 shadow-xl backdrop-blur-sm"
                          >
                            <Maximize2 className="h-4 w-4 mr-1" />
                            Fullscreen
                          </Button>
                          <Button
                            onClick={openInNewTab}
                            size="sm"
                            className="bg-white/10 text-white hover:bg-white/20 shadow-xl backdrop-blur-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Mobile Exit Button - Always Visible on Mobile */}
                      {isMobile && (
                        <div className="fixed top-4 left-4 z-50">
                          <Button
                            onClick={handleSessionEnd}
                            size="sm"
                            className="bg-red-600/95 text-white hover:bg-red-700 shadow-2xl border-0"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Exit
                          </Button>
                        </div>
                      )}

                      {/* Mobile Fullscreen Button */}
                      {isMobile && !isFullscreen && (
                        <div className="fixed bottom-6 right-6 z-50">
                          <Button
                            onClick={enterFullscreen}
                            size="lg"
                            className="bg-blue-600 text-white hover:bg-blue-700 shadow-2xl border-0 rounded-full w-16 h-16 p-0"
                          >
                            <Maximize2 className="h-6 w-6" />
                          </Button>
                        </div>
                      )}

                      {/* Fullscreen Exit Button */}
                      {isFullscreen && (
                        <div className="fixed top-4 left-4 z-50">
                          <Button
                            onClick={handleSessionEnd}
                            size="sm"
                            className="bg-red-600/95 text-white hover:bg-red-700 shadow-2xl border-0 backdrop-blur-sm"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Exit Simulation
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Manual Fullscreen Controls */}
                    {!isFullscreen && !isMobile && (
                      <div className="flex justify-center gap-4 mt-6">
                        <Button
                          onClick={enterFullscreen}
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-xl"
                        >
                          <Maximize2 className="h-5 w-5 mr-2" />
                          Launch Fullscreen Mode
                        </Button>
                        <Button
                          onClick={openInNewTab}
                          size="lg"
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-6 py-3 text-lg font-semibold"
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    )}

                    {/* Desktop Feature Showcase */}
                    {!isFullscreen && !isMobile && (
                      <div className="mt-6 space-y-6 mx-auto max-w-5xl">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-400/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Globe className="h-5 w-5 text-white" />
                              </div>
                              <h4 className="font-semibold text-white text-lg">Real-time Data</h4>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                              Live planetary positions and spacecraft trajectories updated from NASA's JPL databases.
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:border-green-400/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Clock className="h-5 w-5 text-white" />
                              </div>
                              <h4 className="font-semibold text-white text-lg">Time Travel</h4>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                              Navigate through time to observe celestial events and historical mission data.
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Zap className="h-5 w-5 text-white" />
                              </div>
                              <h4 className="font-semibold text-white text-lg">Interactive</h4>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                              Click celestial objects for detailed information and explore deep space missions.
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
                          <h4 className="font-semibold text-amber-300 text-lg mb-4 flex items-center gap-2">
                            <Rocket className="h-5 w-5" />
                            Quick Start Guide
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                Click and drag to rotate the solar system
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                Use mouse wheel to zoom in and out
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                Click on planets for detailed information
                              </li>
                            </ul>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                Use time controls to travel through space-time
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                Explore spacecraft missions and trajectories
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                Launch in fullscreen for immersive experience
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}