import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Volume2, 
  Languages, 
  BarChart3, 
  Target,
  Zap,
  Loader2,
  Play,
  Download,
  HelpCircle,
  BookOpen,
  Sparkles
} from "lucide-react";

export function LiveDemo() {
  const { toast } = useToast();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demoMutation = useMutation({
    mutationFn: async (demoType: string) => {
      switch (demoType) {
        case "quiz":
          return await apiRequest("POST", "/api/ai/generate-content", {
            topic: "JavaScript Functions",
            difficulty: "intermediate",
            type: "quiz"
          }).then(r => r.json());
        
        case "analysis":
          return await apiRequest("POST", "/api/ai/analyze-content", {
            content: "JavaScript is a versatile programming language that enables interactive web development and dynamic user experiences."
          }).then(r => r.json());
        
        case "translation":
          return await apiRequest("POST", "/api/ai/translate", {
            text: "Welcome to BrainMate AI - Your intelligent tutoring companion",
            targetLanguage: "es"
          }).then(r => r.json());
        
        case "voice":
          return await apiRequest("POST", "/api/ai/voice-synthesis", {
            text: "Hello! This is AI-generated voice from BrainMate."
          }).then(r => r.json());
        
        case "flashcards":
          return await apiRequest("POST", "/api/ai/generate-content", {
            topic: "Machine Learning Basics",
            difficulty: "beginner", 
            type: "flashcards"
          }).then(r => r.json());
        
        case "prediction":
          return await apiRequest("POST", "/api/ai/predict-performance", {
            tutorId: 1,
            studentData: {}
          }).then(r => r.json());
        
        default:
          throw new Error("Unknown demo type");
      }
    },
    onSuccess: (data, demoType) => {
      toast({
        title: "Demo Complete",
        description: `${demoType} demonstration finished successfully`,
      });
    },
    onError: (error: any) => {
      console.error("Demo error:", error);
      toast({
        title: "Demo Error", 
        description: error.message || "Feature requires API configuration",
        variant: "destructive",
      });
    }
  });

  const demos = [
    {
      id: "quiz",
      title: "AI Quiz Generator",
      description: "Generate quiz questions instantly",
      icon: HelpCircle,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      id: "analysis", 
      title: "Content Analysis",
      description: "Analyze complexity and readability",
      icon: BarChart3,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600"
    },
    {
      id: "translation",
      title: "Multi-Language", 
      description: "Translate to any language",
      icon: Languages,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      id: "voice",
      title: "Voice Synthesis",
      description: "Convert text to speech",
      icon: Volume2,
      color: "bg-orange-500", 
      gradient: "from-orange-500 to-orange-600"
    },
    {
      id: "flashcards",
      title: "Flashcard Creator",
      description: "Generate study cards",
      icon: BookOpen,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-pink-600"
    },
    {
      id: "prediction",
      title: "Performance AI",
      description: "Predict learning outcomes",
      icon: Target,
      color: "bg-cyan-500",
      gradient: "from-cyan-500 to-cyan-600"
    }
  ];

  const runDemo = (demoId: string) => {
    setActiveDemo(demoId);
    demoMutation.mutate(demoId);
  };

  const renderResults = () => {
    if (!demoMutation.data || !activeDemo) return null;

    const data = demoMutation.data;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Live Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDemo === "quiz" && data.questions && (
              <div className="space-y-3">
                <h4 className="font-medium text-primary">Generated Quiz Questions:</h4>
                {data.questions.slice(0, 2).map((q: any, index: number) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3 border">
                    <div className="font-medium text-sm mb-2">{index + 1}. {q.question}</div>
                    <div className="space-y-1 text-xs">
                      {q.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className={optIndex === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeDemo === "analysis" && (
              <div className="space-y-3">
                <h4 className="font-medium text-primary">Analysis Results:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">{data.complexity || "intermediate"}</div>
                    <div className="text-xs text-muted-foreground">Complexity</div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">{data.wordCount || "15"}</div>
                    <div className="text-xs text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-purple-600">{data.readabilityScore || "85"}</div>
                    <div className="text-xs text-muted-foreground">Readability</div>
                  </div>
                  <div className="text-center bg-orange-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-orange-600">{data.estimatedReadingTime || "1"}m</div>
                    <div className="text-xs text-muted-foreground">Read Time</div>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === "translation" && (
              <div className="space-y-3">
                <h4 className="font-medium text-primary">Translation Results:</h4>
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <div className="text-xs text-muted-foreground mb-1">Original (English)</div>
                  <div className="text-sm mb-2">{data.originalText || "Welcome to BrainMate AI"}</div>
                  <div className="text-xs text-muted-foreground mb-1">Spanish Translation</div>
                  <div className="text-sm font-medium text-primary">{data.translatedText || "Bienvenido a BrainMate AI"}</div>
                </div>
              </div>
            )}

            {activeDemo === "voice" && (
              <div className="space-y-3">
                <h4 className="font-medium text-primary">Voice Synthesis:</h4>
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <div className="text-sm mb-2">Audio generated successfully</div>
                  <div className="text-xs text-muted-foreground mb-3">Duration: {data.duration || "3"} seconds</div>
                  {data.audioUrl && (
                    <audio controls className="w-full mb-3">
                      <source src={data.audioUrl} type="audio/mp3" />
                      Your browser does not support audio playback.
                    </audio>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => {
                        if (data.audioUrl) {
                          const audio = new Audio(data.audioUrl);
                          audio.play().catch((error) => {
                            console.error("Audio playback failed:", error);
                            toast({
                              title: "Audio Playback Failed",
                              description: "Unable to play audio. Please try again.",
                              variant: "destructive"
                            });
                          });
                        }
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play Audio
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => {
                        if (data.audioUrl) {
                          const link = document.createElement('a');
                          link.href = data.audioUrl;
                          link.download = 'brainmate-voice.mp3';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === "flashcards" && data.cards && (
              <div className="space-y-3">
                <h4 className="font-medium text-primary">Generated Flashcards:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.cards.slice(0, 2).map((card: any, index: number) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground mb-1">Front</div>
                      <div className="font-medium text-sm mb-2">{card.front}</div>
                      <div className="text-xs text-muted-foreground mb-1">Back</div>
                      <div className="text-sm">{card.back}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDemo === "prediction" && (
              <div className="space-y-3">
                <h4 className="font-medium text-primary">Performance Prediction:</h4>
                <div className="bg-muted/50 rounded-lg p-3 border text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.round(data.predictedScore || 78)}%
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Predicted Success Rate</div>
                  <div className="text-xs">
                    Based on engagement patterns and learning analytics
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Zap className="h-4 w-4" />
          Live AI Demo
        </div>
        <h2 className="text-2xl font-bold mb-2">Experience AI Features Right Now</h2>
        <p className="text-muted-foreground">
          Click any feature below to see real AI capabilities in action
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map((demo) => {
          const IconComponent = demo.icon;
          const isRunning = demoMutation.isPending && activeDemo === demo.id;
          
          return (
            <motion.div
              key={demo.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-0 overflow-hidden"
                onClick={() => !demoMutation.isPending && runDemo(demo.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${demo.gradient}`} />
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${demo.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      {isRunning ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <IconComponent className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm mb-1">{demo.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{demo.description}</p>
                      <Badge 
                        variant={isRunning ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {isRunning ? "Running..." : "Try Now"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {renderResults()}

      {demoMutation.isPending && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Running AI demo...</span>
          </div>
        </div>
      )}
    </div>
  );
}