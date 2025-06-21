import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Zap,
  Video,
  MessageSquare,
  Target,
  Loader2,
  Copy,
  Download,
  Share2
} from "lucide-react";

interface InstantContentGeneratorProps {
  onContentGenerated: (content: any) => void;
}

export function InstantContentGenerator({ onContentGenerated }: InstantContentGeneratorProps) {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [contentType, setContentType] = useState("quiz");
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const generateContentMutation = useMutation({
    mutationFn: async (params: { topic: string; difficulty: string; type: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-content", params);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      onContentGenerated(data);
      toast({
        title: "Content Generated!",
        description: "Your AI-powered content is ready to use.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const contentTypes = [
    {
      id: "quiz",
      name: "Interactive Quiz",
      description: "Multiple choice questions with explanations",
      icon: Target,
      color: "text-blue-500"
    },
    {
      id: "flashcards",
      name: "Flashcards",
      description: "Key concepts for memorization",
      icon: Brain,
      color: "text-purple-500"
    },
    {
      id: "summary",
      name: "Topic Summary",
      description: "Comprehensive overview with key points",
      icon: BookOpen,
      color: "text-green-500"
    },
    {
      id: "exercises",
      name: "Practice Exercises",
      description: "Hands-on problems and solutions",
      icon: Zap,
      color: "text-orange-500"
    }
  ];

  const difficulties = ["beginner", "intermediate", "advanced", "expert"];

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate content for.",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate({
      topic: topic.trim(),
      difficulty,
      type: contentType
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Instant Content Generator
        </h2>
        <p className="text-muted-foreground">
          Generate educational content powered by AI in seconds
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
          <CardDescription>
            Specify your topic and preferences to create instant educational materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Topic</label>
            <Input
              placeholder="e.g., Photosynthesis, Algebra Basics, JavaScript Functions"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setContentType(type.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      contentType === type.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <type.icon className={`h-5 w-5 ${type.color} mb-1`} />
                    <h4 className="font-medium text-xs">{type.name}</h4>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <div className="space-y-2">
                {difficulties.map((level) => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="text-primary"
                    />
                    <span className="text-sm capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={generateContentMutation.isPending}
            className="w-full"
          >
            {generateContentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Content</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(generatedContent, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  {contentType === "quiz" && generatedContent.questions && (
                    <div className="space-y-4">
                      {generatedContent.questions.map((q: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">Question {index + 1}</h4>
                            <p className="mb-3">{q.question}</p>
                            <div className="space-y-1">
                              {q.options.map((option: string, optIndex: number) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded text-sm ${
                                    optIndex === q.correctAnswer 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-muted'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 rounded">
                                <h5 className="font-medium text-sm">Explanation:</h5>
                                <p className="text-sm">{q.explanation}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {contentType === "flashcards" && generatedContent.cards && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedContent.cards.map((card: any, index: number) => (
                        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h4 className="font-semibold mb-2">Card {index + 1}</h4>
                              <div className="border-b pb-2 mb-2">
                                <p className="text-sm font-medium">Front:</p>
                                <p>{card.front}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Back:</p>
                                <p className="text-muted-foreground">{card.back}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {contentType === "summary" && generatedContent.content && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap">{generatedContent.content}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="raw">
                  <Card>
                    <CardContent className="p-4">
                      <pre className="text-xs overflow-auto bg-muted p-4 rounded">
                        {JSON.stringify(generatedContent, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}