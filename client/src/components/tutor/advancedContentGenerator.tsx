import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  FileText, 
  HelpCircle, 
  BookOpen, 
  Target,
  Loader2,
  Sparkles,
  Download,
  Copy,
  Zap,
  Play,
  Volume2,
  Languages,
  BarChart3,
  Award,
  Mic
} from "lucide-react";

interface AdvancedContentGeneratorProps {
  onContentGenerated: (content: any) => void;
}

export function AdvancedContentGenerator({ onContentGenerated }: AdvancedContentGeneratorProps) {
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState("ai-generator");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [contentType, setContentType] = useState("quiz");
  const [analysisText, setAnalysisText] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [voiceText, setVoiceText] = useState("");

  // AI Content Generation
  const generateContentMutation = useMutation({
    mutationFn: async () => {
      if (!topic.trim()) throw new Error("Topic is required");
      
      const response = await apiRequest("POST", "/api/ai/generate-content", {
        topic: topic.trim(),
        difficulty,
        type: contentType
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content Generated Successfully",
        description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} has been created for ${topic}`,
      });
      onContentGenerated(data);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    }
  });

  // Content Analysis
  const analyzeContentMutation = useMutation({
    mutationFn: async () => {
      if (!analysisText.trim()) throw new Error("Content is required for analysis");
      
      const response = await apiRequest("POST", "/api/ai/analyze-content", {
        content: analysisText.trim()
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Content complexity: ${data.complexity}, Readability: ${data.readabilityScore}/100`,
      });
    }
  });

  // Translation
  const translateMutation = useMutation({
    mutationFn: async () => {
      if (!translationText.trim()) throw new Error("Text is required for translation");
      
      const response = await apiRequest("POST", "/api/ai/translate", {
        text: translationText.trim(),
        targetLanguage
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Translation Complete",
        description: `Text translated to ${data.targetLanguage}`,
      });
    }
  });

  // Voice Synthesis
  const voiceSynthesisMutation = useMutation({
    mutationFn: async () => {
      if (!voiceText.trim()) throw new Error("Text is required for voice synthesis");
      
      const response = await apiRequest("POST", "/api/ai/voice-synthesis", {
        text: voiceText.trim(),
        voice: "alloy",
        speed: 1.0
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Voice Generated",
        description: `Audio generated (${data.duration}s duration)`,
      });
    }
  });

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const renderGeneratedContent = (data: any) => {
    if (!data) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Generated {data.type}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopyContent(JSON.stringify(data, null, 2))}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
          {data.type === "quiz" && data.questions && (
            <div className="space-y-4">
              {data.questions.map((q: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="font-medium mb-2">{index + 1}. {q.question}</div>
                  <div className="space-y-1 text-sm">
                    {q.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className={`pl-4 ${optIndex === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Explanation: {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {data.type === "flashcards" && data.cards && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.cards.map((card: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="font-medium text-sm text-muted-foreground mb-2">Front</div>
                  <div className="font-medium mb-3">{card.front}</div>
                  <div className="font-medium text-sm text-muted-foreground mb-2">Back</div>
                  <div className="text-sm">{card.back}</div>
                  <Badge variant="outline" className="mt-2 text-xs">{card.category}</Badge>
                </div>
              ))}
            </div>
          )}
          
          {data.type === "summary" && (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{data.content}</pre>
            </div>
          )}
          
          {data.type === "exercises" && data.content && data.content.exercises && (
            <div className="space-y-4">
              {data.content.exercises.map((exercise: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{exercise.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>
                  <div className="text-sm">
                    <strong>Solution:</strong> {exercise.solution}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary mb-3" />
        <h2 className="text-2xl font-bold mb-2">Advanced AI Content Studio</h2>
        <p className="text-muted-foreground">
          Create, analyze, and enhance educational content with powerful AI tools
        </p>
      </div>

      <Tabs value={selectedTool} onValueChange={setSelectedTool}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="ai-generator">AI Generator</TabsTrigger>
          <TabsTrigger value="content-analysis">Analysis</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
          <TabsTrigger value="voice-synthesis">Voice</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Content Generator
              </CardTitle>
              <CardDescription>
                Generate quizzes, flashcards, summaries, and exercises instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type</label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz Questions</SelectItem>
                      <SelectItem value="flashcards">Flashcards</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="exercises">Practice Exercises</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Topic</label>
                  <Input
                    placeholder="Enter topic (e.g., Python Functions)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => generateContentMutation.mutate()}
                disabled={generateContentMutation.isPending || !topic.trim()}
                className="w-full"
                size="lg"
              >
                {generateContentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating {contentType}...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Generate {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                  </>
                )}
              </Button>
              
              {renderGeneratedContent(generateContentMutation.data)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Smart Content Analysis
              </CardTitle>
              <CardDescription>
                Analyze content complexity, readability, and get improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your content here for analysis..."
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                className="min-h-[120px]"
              />
              
              <Button 
                onClick={() => analyzeContentMutation.mutate()}
                disabled={analyzeContentMutation.isPending || !analysisText.trim()}
                className="w-full"
              >
                {analyzeContentMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}
                Analyze Content
              </Button>
              
              {analyzeContentMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-lg p-4 space-y-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analyzeContentMutation.data.complexity}
                      </div>
                      <div className="text-sm text-muted-foreground">Complexity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {analyzeContentMutation.data.wordCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {analyzeContentMutation.data.readabilityScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Readability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {analyzeContentMutation.data.estimatedReadingTime}m
                      </div>
                      <div className="text-sm text-muted-foreground">Read Time</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {analyzeContentMutation.data.keyTopics?.map((topic: string, index: number) => (
                        <Badge key={index} variant="outline">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                    <ul className="text-sm space-y-1">
                      {analyzeContentMutation.data.improvements?.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Multi-Language Translation
              </CardTitle>
              <CardDescription>
                Translate content to multiple languages instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter text to translate..."
                value={translationText}
                onChange={(e) => setTranslationText(e.target.value)}
              />
              
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => translateMutation.mutate()}
                disabled={translateMutation.isPending || !translationText.trim()}
                className="w-full"
              >
                {translateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="mr-2 h-4 w-4" />
                )}
                Translate Text
              </Button>
              
              {translateMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-lg p-4"
                >
                  <div className="font-medium mb-2">Translation Result</div>
                  <div className="text-sm mb-2">
                    <strong>Original:</strong> {translateMutation.data.originalText}
                  </div>
                  <div className="text-sm mb-2">
                    <strong>Translated:</strong> {translateMutation.data.translatedText}
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Confidence: {Math.round(translateMutation.data.confidence * 100)}%</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyContent(translateMutation.data.translatedText)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-synthesis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                AI Voice Synthesis
              </CardTitle>
              <CardDescription>
                Convert text to natural-sounding speech
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to convert to speech..."
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                className="min-h-[100px]"
              />
              
              <Button 
                onClick={() => voiceSynthesisMutation.mutate()}
                disabled={voiceSynthesisMutation.isPending || !voiceText.trim()}
                className="w-full"
              >
                {voiceSynthesisMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="mr-2 h-4 w-4" />
                )}
                Generate Voice
              </Button>
              
              {voiceSynthesisMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-lg p-4"
                >
                  <div className="font-medium mb-2">Audio Generated</div>
                  <div className="text-sm mb-3">
                    Duration: {voiceSynthesisMutation.data.duration} seconds
                  </div>
                  {voiceSynthesisMutation.data.audioUrl && (
                    <audio controls className="w-full mb-3">
                      <source src={voiceSynthesisMutation.data.audioUrl} type="audio/mp3" />
                      Your browser does not support audio playback.
                    </audio>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (voiceSynthesisMutation.data?.audioUrl) {
                          const audio = new Audio(voiceSynthesisMutation.data.audioUrl);
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
                      <Play className="w-4 h-4 mr-1" />
                      Play Audio
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (voiceSynthesisMutation.data?.audioUrl) {
                          const link = document.createElement('a');
                          link.href = voiceSynthesisMutation.data.audioUrl;
                          link.download = 'brainmate-voice.mp3';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}