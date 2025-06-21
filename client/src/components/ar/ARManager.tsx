import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  Camera,
  Box,
  Atom,
  Dna,
  Calculator,
  Zap,
  Play,
  Info,
  Smartphone,
  Monitor,
  Star,
  Beaker,
  Lock,
  Crown,
  ArrowRight,
  Rocket,
  Globe,
  Telescope
} from "lucide-react";
import { AdvancedViewer } from "./AdvancedViewer";
import { PhETViewer } from "./PhETViewer";
import { NASAViewer } from "./NASAViewer";
import { useToast } from "@/hooks/use-toast";

interface ARManagerProps {
  tutorId?: number;
  tutorName?: string;
  subject?: string;
  onClose: () => void;
}

export function ARManager({ tutorId, tutorName, subject, onClose }: ARManagerProps) {
  const [activeARSession, setActiveARSession] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Check if user has premium access
  const hasSimulationAccess = () => {
    if (!isAuthenticated || !user) return false;
    
    // Special users always have access
    const specialEmails = ['yadavayush4239@gmail.com', 'viveksolanki8013@gmail.com'];
    if ((user as any).email && specialEmails.includes((user as any).email)) return true;
    
    // Pro and Premium subscribers have access
    return (user as any).subscriptionTier === 'pro' || (user as any).subscriptionTier === 'premium';
  };

  const startPhETSession = (modelName: string, subjectName: string) => {
    if (!hasSimulationAccess()) {
      toast({
        title: "Premium Feature",
        description: "Interactive PhET Simulations are available for Pro and Premium subscribers only. Upgrade to access!",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting PhET simulation:", modelName, "Subject:", subjectName);
    setActiveARSession(`phet-${subjectName}-${modelName}`);
    
    toast({
      title: "PhET Simulation Starting",
      description: `Loading ${modelName} from University of Colorado Boulder...`,
    });
  };

  const startNASASession = (modelName: string) => {
    if (!hasSimulationAccess()) {
      toast({
        title: "Premium Feature",
        description: "NASA Space Simulations are available for Pro and Premium subscribers only. Upgrade to access!",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting NASA simulation:", modelName);
    setActiveARSession(`nasa-${modelName}`);
    
    toast({
      title: "NASA Simulation Starting",
      description: `Loading ${modelName} from NASA JPL...`,
    });
  };



  const endARSession = () => {
    setActiveARSession(null);
  };

  // Render active session
  if (activeARSession) {
    if (activeARSession.startsWith('phet-')) {
      const parts = activeARSession.split('-');
      const selectedModel = parts.length > 2 ? parts.slice(2).join(' ') : parts[1];
      
      return (
        <PhETViewer
          tutorId={tutorId!}
          tutorName={tutorName!}
          subject={subject!}
          selectedModel={selectedModel}
          onSessionEnd={endARSession}
        />
      );
    } else if (activeARSession.startsWith('nasa-')) {
      const modelName = activeARSession.split('-').slice(1).join(' ');
      
      return (
        <NASAViewer
          modelName={modelName}
          onSessionEnd={endARSession}
        />
      );
    } else {
      const selectedModel = activeARSession.includes('-') 
        ? activeARSession.split('-')[1] 
        : activeARSession;
      
      return (
        <AdvancedViewer
          tutorId={tutorId!}
          tutorName={tutorName!}
          subject={subject!}
          selectedModel={selectedModel}
          onSessionEnd={endARSession}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Interactive Simulations</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Explore PhET interactive simulations to enhance learning
          </p>
          {tutorName && subject && (
            <Badge variant="secondary" className="text-xs sm:text-sm">
              🎓 {tutorName} • {subject}
            </Badge>
          )}
        </div>

        <Tabs defaultValue="phet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
            <TabsTrigger value="phet" className="text-xs sm:text-sm">PhET Simulations</TabsTrigger>
            <TabsTrigger value="setup" className="text-xs sm:text-sm">Controls Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="phet" className="mt-4 sm:mt-6 space-y-4">
            <div className="text-center space-y-2 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">PhET Interactive Simulations</h2>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Authentic physics and chemistry simulations from University of Colorado Boulder
              </p>
              {hasSimulationAccess() ? (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  🎓 University-Grade • Premium Access • Research-Based
                </Badge>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Badge variant="outline" className="text-xs sm:text-sm border-amber-200 bg-amber-50 text-amber-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Feature - Upgrade Required
                  </Badge>
                  <Button 
                    size="sm" 
                    className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={() => window.location.href = '/subscription'}
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade Now
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Physics Simulations */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  Physics Simulations
                </h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-blue-500/20 hover:border-l-blue-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Build an Atom", "Physics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Atom className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Build an Atom</h4>
                            <Badge variant="secondary" className="text-xs">Interactive</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Build atoms out of protons, neutrons, and electrons. Test your understanding of isotopes and ions.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Atomic Structure</Badge>
                        <Badge variant="outline" className="text-xs">Elements</Badge>
                        <Badge variant="outline" className="text-xs">Isotopes</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-green-500/20 hover:border-l-green-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Pendulum Lab", "Physics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Play className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Pendulum Lab</h4>
                            <Badge variant="secondary" className="text-xs">Beginner</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Play with one or two pendulums and discover how the period depends on the length and mass.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Oscillation</Badge>
                        <Badge variant="outline" className="text-xs">Period</Badge>
                        <Badge variant="outline" className="text-xs">Motion</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-indigo-500/20 hover:border-l-indigo-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Forces and Motion", "Physics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Box className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Forces and Motion</h4>
                            <Badge variant="secondary" className="text-xs">Beginner</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Explore the forces at work when pulling against a cart, and pushing a refrigerator or crate.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Newton's Laws</Badge>
                        <Badge variant="outline" className="text-xs">Force</Badge>
                        <Badge variant="outline" className="text-xs">Friction</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-emerald-500/20 hover:border-l-emerald-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Energy Skate Park", "Physics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Play className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Energy Skate Park</h4>
                            <Badge variant="secondary" className="text-xs">Intermediate</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Learn about conservation of energy by building your own skating tracks, ramps, and jumps.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Energy Conservation</Badge>
                        <Badge variant="outline" className="text-xs">Kinetic Energy</Badge>
                        <Badge variant="outline" className="text-xs">Potential Energy</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-yellow-500/20 hover:border-l-yellow-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Wave Interference", "Physics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Wave Interference</h4>
                            <Badge variant="secondary" className="text-xs">Advanced</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Make waves with a dripping faucet, audio speaker, or laser! Add a second source to create interference patterns.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Wave Interference</Badge>
                        <Badge variant="outline" className="text-xs">Superposition</Badge>
                        <Badge variant="outline" className="text-xs">Standing Waves</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-violet-500/20 hover:border-l-violet-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Faraday's Law", "Physics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-violet-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Faraday's Law</h4>
                            <Badge variant="secondary" className="text-xs">Advanced</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Move a bar magnet near one or two coils to make a light bulb glow. View the magnetic field lines.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Electromagnetic</Badge>
                        <Badge variant="outline" className="text-xs">Magnetic Fields</Badge>
                        <Badge variant="outline" className="text-xs">Electric Current</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Chemistry Simulations */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Atom className="h-4 w-4 sm:h-5 sm:w-5" />
                  Chemistry Simulations
                </h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-orange-500/20 hover:border-l-orange-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Molecule Shapes", "Chemistry")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Atom className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Molecule Shapes</h4>
                            <Badge variant="secondary" className="text-xs">Intermediate</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Explore molecule shapes by building molecules in 3D! How does molecule shape change with different numbers of bonds and electron pairs?
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">VSEPR Theory</Badge>
                        <Badge variant="outline" className="text-xs">Molecular Geometry</Badge>
                        <Badge variant="outline" className="text-xs">3D Structures</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-red-500/20 hover:border-l-red-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Balancing Chemical Equations", "Chemistry")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Chemical Equations</h4>
                            <Badge variant="secondary" className="text-xs">Beginner</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Balance chemical equations. Discover what it means for chemical reactions to be balanced and practice balancing equations.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Chemical Equations</Badge>
                        <Badge variant="outline" className="text-xs">Conservation of Mass</Badge>
                        <Badge variant="outline" className="text-xs">Stoichiometry</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-purple-500/20 hover:border-l-purple-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("pH Scale", "Chemistry")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">pH Scale</h4>
                            <Badge variant="secondary" className="text-xs">Intermediate</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Test the pH of everyday liquids such as coffee, spit, and soap to determine whether they are acidic, basic, or neutral.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Acids and Bases</Badge>
                        <Badge variant="outline" className="text-xs">pH Scale</Badge>
                        <Badge variant="outline" className="text-xs">Chemical Properties</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Biology & Math */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Dna className="h-4 w-4 sm:h-5 sm:w-5" />
                  Biology & Mathematics
                </h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-green-500/20 hover:border-l-green-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Gene Expression Essentials", "Biology")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Dna className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Gene Expression</h4>
                            <Badge variant="secondary" className="text-xs">Advanced</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        See how genes are turned on and off by DNA transcription, mRNA translation, and regulatory proteins.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">DNA</Badge>
                        <Badge variant="outline" className="text-xs">RNA</Badge>
                        <Badge variant="outline" className="text-xs">Protein Synthesis</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-blue-500/20 hover:border-l-blue-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Function Builder", "Mathematics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Function Builder</h4>
                            <Badge variant="secondary" className="text-xs">Intermediate</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Build a function by putting math operations in a chain. Your function machine awaits!
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Functions</Badge>
                        <Badge variant="outline" className="text-xs">Operations</Badge>
                        <Badge variant="outline" className="text-xs">Mathematical Thinking</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-pink-500/20 hover:border-l-pink-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startPhETSession("Graphing Lines", "Mathematics")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Graphing Lines</h4>
                            <Badge variant="secondary" className="text-xs">Beginner</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Explore the world of lines. Investigate the relationship between linear equations, slope, and graphs of lines.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Linear Equations</Badge>
                        <Badge variant="outline" className="text-xs">Slope</Badge>
                        <Badge variant="outline" className="text-xs">Graphing</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* NASA Space Simulations */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Rocket className="h-4 w-4 sm:h-5 sm:w-5" />
                  NASA Space Simulations
                </h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-indigo-500/20 hover:border-l-indigo-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startNASASession("NASA Eyes on the Solar System")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Solar System Explorer</h4>
                            <Badge variant="secondary" className="text-xs">NASA Official</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Real-time 3D simulation of the solar system. Explore planets, moons, spacecraft trajectories, and celestial events.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Solar System</Badge>
                        <Badge variant="outline" className="text-xs">Real-time</Badge>
                        <Badge variant="outline" className="text-xs">NASA JPL</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-purple-500/20 hover:border-l-purple-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startNASASession("Spacecraft Missions")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Spacecraft Tracker</h4>
                            <Badge variant="secondary" className="text-xs">Advanced</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Track real spacecraft like Voyager, Artemis, and Perseverance. View past, present, and future mission trajectories.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Missions</Badge>
                        <Badge variant="outline" className="text-xs">Trajectories</Badge>
                        <Badge variant="outline" className="text-xs">Time Travel</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`transition-all border-l-4 ${
                      hasSimulationAccess() 
                        ? "hover:shadow-lg cursor-pointer border-l-cyan-500/20 hover:border-l-cyan-500" 
                        : "opacity-75 cursor-not-allowed border-l-gray-300 relative"
                    }`}
                    onClick={() => startNASASession("Celestial Events")}
                  >
                    {!hasSimulationAccess() && (
                      <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <Lock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Telescope className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-500" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">Eclipse & Alignments</h4>
                            <Badge variant="secondary" className="text-xs">Interactive</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        Witness solar eclipses, planetary alignments, and other rare celestial events from any point in time.
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">Eclipses</Badge>
                        <Badge variant="outline" className="text-xs">Alignments</Badge>
                        <Badge variant="outline" className="text-xs">Astronomy</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </TabsContent>

          <TabsContent value="setup" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <div className="text-center space-y-2 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">PhET Simulation Controls</h2>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Learn how to navigate and interact with PhET simulations effectively
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                    Touch Controls
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Essential touch gestures for mobile devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Single Tap</span>
                    <span className="text-muted-foreground">Select/Activate</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Drag</span>
                    <span className="text-muted-foreground">Move objects</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Pinch</span>
                    <span className="text-muted-foreground">Zoom in/out</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Two-finger drag</span>
                    <span className="text-muted-foreground">Pan view</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
                    Desktop Controls
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Mouse and keyboard shortcuts for desktop users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Left Click</span>
                    <span className="text-muted-foreground">Select/Activate</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Click & Drag</span>
                    <span className="text-muted-foreground">Move objects</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Scroll Wheel</span>
                    <span className="text-muted-foreground">Zoom in/out</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded text-xs sm:text-sm">
                    <span className="font-medium">Space Bar</span>
                    <span className="text-muted-foreground">Play/Pause</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                    Getting Started
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Tips for your first PhET simulation experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</div>
                    <p className="text-xs sm:text-sm">Choose a simulation that matches your current learning topic</p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</div>
                    <p className="text-xs sm:text-sm">Wait for the simulation to fully load before interacting</p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">3</div>
                    <p className="text-xs sm:text-sm">Explore by clicking on different elements and controls</p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">4</div>
                    <p className="text-xs sm:text-sm">Use the reset button if you want to start over</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                    Best Practices
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Maximize your learning with these recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">✓</div>
                    <p className="text-xs sm:text-sm">Take notes of what you observe during experiments</p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">✓</div>
                    <p className="text-xs sm:text-sm">Try changing one variable at a time to see its effect</p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">✓</div>
                    <p className="text-xs sm:text-sm">Discuss your findings with classmates or teachers</p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">✓</div>
                    <p className="text-xs sm:text-sm">Connect simulation results to real-world examples</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Close Button */}
        <div className="flex justify-center pt-4 sm:pt-6">
          <Button onClick={onClose} variant="outline" className="px-4 sm:px-6 text-sm sm:text-base">
            Close Simulations
          </Button>
        </div>
      </div>
    </div>
  );
}