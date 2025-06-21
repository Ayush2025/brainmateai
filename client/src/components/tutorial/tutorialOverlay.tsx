import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Lightbulb,
  MousePointer,
  ChevronDown
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll';
  highlight?: boolean;
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  onComplete?: () => void;
}

export function TutorialOverlay({ isOpen, onClose, steps, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  useEffect(() => {
    if (isOpen && steps[currentStep]?.targetElement) {
      const element = document.querySelector(steps[currentStep].targetElement!);
      setHighlightedElement(element);
      
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [currentStep, isOpen, steps]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTutorial = () => {
    setIsPlaying(true);
    setCurrentStep(0);
  };

  const isMobile = () => window.innerWidth < 768;

  const getTooltipPosition = () => {
    if (isMobile()) {
      return {
        bottom: '20px',
        left: '20px',
        right: '20px',
        top: 'auto' as const,
        transform: 'none'
      };
    }
    
    // Desktop positioning only if we have highlighted element
    if (!highlightedElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const rect = highlightedElement.getBoundingClientRect();
    const step = steps[currentStep];
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    switch (step.position) {
      case 'top':
        return { 
          top: Math.max(20, rect.top - 20), 
          left: Math.min(Math.max(20, rect.left + rect.width / 2), viewportWidth - 320), 
          transform: 'translate(-50%, -100%)' 
        };
      case 'bottom':
        return { 
          top: Math.min(rect.bottom + 20, viewportHeight - 200), 
          left: Math.min(Math.max(20, rect.left + rect.width / 2), viewportWidth - 320), 
          transform: 'translate(-50%, 0)' 
        };
      case 'left':
        return { 
          top: Math.min(Math.max(20, rect.top + rect.height / 2), viewportHeight - 150), 
          left: Math.max(20, rect.left - 340), 
          transform: 'translate(0, -50%)' 
        };
      case 'right':
        return { 
          top: Math.min(Math.max(20, rect.top + rect.height / 2), viewportHeight - 150), 
          left: Math.min(rect.right + 20, viewportWidth - 340), 
          transform: 'translate(0, -50%)' 
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      >
        {/* Spotlight Effect */}
        {highlightedElement && isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none z-30"
            style={{
              top: highlightedElement.getBoundingClientRect().top + window.scrollY - 10,
              left: highlightedElement.getBoundingClientRect().left + window.scrollX - 10,
              width: highlightedElement.getBoundingClientRect().width + 20,
              height: highlightedElement.getBoundingClientRect().height + 20,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid hsl(var(--primary))',
              borderRadius: '8px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 border-2 border-primary/50 rounded-lg"
            />
          </motion.div>
        )}

        {/* Tutorial Welcome Card */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed inset-4 md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:inset-auto md:w-96 flex items-center justify-center"
          >
            <Card className="w-full max-w-md bg-background border-2 border-primary/20 shadow-2xl">
              <CardHeader className="text-center pb-3 px-4 pt-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Lightbulb className="text-primary h-6 w-6" />
                </motion.div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Welcome to BrainMate AI!
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Let's take a quick tour to help you get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-3 text-xs">
                    {steps.length} Steps • 2 minutes
                  </Badge>
                </div>
                <div className="flex gap-2 flex-col">
                  <Button 
                    onClick={startTutorial}
                    className="w-full text-sm"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Tour
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="w-full text-sm"
                  >
                    Skip Tutorial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tutorial Step Tooltip */}
        {isPlaying && steps[currentStep] && (
          <>
            {/* Mobile Tutorial - Fixed at bottom */}
            {isMobile() && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 left-4 right-4 z-50"
              >
                <Card className="w-full bg-background border-2 border-primary/20 shadow-2xl">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Step {currentStep + 1} of {steps.length}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base font-semibold mt-2">
                      {steps[currentStep].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    <p className="text-sm text-muted-foreground">
                      {steps[currentStep].description}
                    </p>
                    
                    {steps[currentStep].action && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <MousePointer className="h-3 w-3" />
                        <span className="capitalize">{steps[currentStep].action}</span>
                        {steps[currentStep].action === 'scroll' && (
                          <ChevronDown className="h-3 w-3 animate-bounce" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="text-xs px-3"
                      >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Prev
                      </Button>
                      
                      <div className="flex gap-1">
                        {steps.map((_, index) => (
                          <motion.div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentStep ? 'bg-primary' : 'bg-muted'
                            }`}
                            animate={{
                              scale: index === currentStep ? 1.2 : 1,
                            }}
                          />
                        ))}
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={nextStep}
                        className="text-xs px-3"
                      >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Desktop Tutorial - Positioned relative to elements */}
            {!isMobile() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed z-50"
                style={{
                  top: typeof getTooltipPosition().top === 'number' 
                    ? `${getTooltipPosition().top}px` 
                    : getTooltipPosition().top,
                  left: typeof getTooltipPosition().left === 'number' 
                    ? `${getTooltipPosition().left}px` 
                    : getTooltipPosition().left,
                  transform: getTooltipPosition().transform,
                }}
              >
                <Card className="w-80 bg-background border-2 border-primary/20 shadow-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Step {currentStep + 1} of {steps.length}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {steps[currentStep].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {steps[currentStep].description}
                    </p>
                    
                    {steps[currentStep].action && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <MousePointer className="h-3 w-3" />
                        <span className="capitalize">{steps[currentStep].action}</span>
                        {steps[currentStep].action === 'scroll' && (
                          <ChevronDown className="h-3 w-3 animate-bounce" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {steps.map((_, index) => (
                          <motion.div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentStep ? 'bg-primary' : 'bg-muted'
                            }`}
                            animate={{
                              scale: index === currentStep ? 1.2 : 1,
                            }}
                          />
                        ))}
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={nextStep}
                      >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* Animated Pointer */}
        {isPlaying && highlightedElement && steps[currentStep]?.action === 'click' && (
          <motion.div
            animate={{
              x: [0, 10, 0],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute pointer-events-none z-40"
            style={{
              top: highlightedElement.getBoundingClientRect().top + window.scrollY + highlightedElement.getBoundingClientRect().height / 2,
              left: highlightedElement.getBoundingClientRect().left + window.scrollX + highlightedElement.getBoundingClientRect().width / 2,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <MousePointer className="text-primary h-6 w-6 drop-shadow-lg" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}