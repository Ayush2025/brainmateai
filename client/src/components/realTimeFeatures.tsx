import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Volume2, 
  Languages, 
  BarChart3, 
  Target, 
  TrendingUp,
  Award,
  Zap,
  Loader2,
  Play,
  Download,
  Globe,
  Mic
} from "lucide-react";

interface RealTimeFeaturesProps {
  tutorId?: number;
  userId?: string;
}

export function RealTimeFeatures({ tutorId, userId }: RealTimeFeaturesProps) {
  const { toast } = useToast();
  const [selectedFeature, setSelectedFeature] = useState("analytics");
  const [analysisText, setAnalysisText] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [voiceText, setVoiceText] = useState("");

  // Content Analysis
  const analyzeContentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-content", { content, tutorId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Content has been analyzed successfully.",
      });
    }
  });

  // Translation
  const translateMutation = useMutation({
    mutationFn: async ({ text, language }: { text: string; language: string }) => {
      const response = await apiRequest("POST", "/api/ai/translate", { 
        text, 
        targetLanguage: language 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Translation Complete",
        description: "Text has been translated successfully.",
      });
    }
  });

  // Voice Synthesis
  const voiceSynthesisMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai/voice-synthesis", { text });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Voice Generated",
        description: "Audio has been synthesized successfully.",
      });
    }
  });

  // Learning Insights
  const { data: learningInsights, isLoading: insightsLoading } = useQuery({
    queryKey: [`/api/analytics/learning-insights/${tutorId}`],
    enabled: !!tutorId,
  });

  // Achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: [`/api/gamification/achievements/${userId}`],
    enabled: !!userId,
  });

  // Performance Prediction
  const predictPerformanceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/predict-performance", { 
        tutorId,
        studentData: {} 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Performance Predicted",
        description: "AI has analyzed and predicted learning outcomes.",
      });
    }
  });

  // Engagement Tracking
  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: [`/api/analytics/engagement/${tutorId}`],
    enabled: !!tutorId,
  });

  const languages = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Live AI Features</h2>
        <p className="text-muted-foreground">
          Real-time AI capabilities powered by advanced machine learning
        </p>
      </div>

      <Tabs value={selectedFeature} onValueChange={setSelectedFeature}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="gamification">Achievements</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Learning Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                ) : learningInsights ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {learningInsights.engagementMetrics.totalSessions}
                        </div>
                        <div className="text-sm text-muted-foreground">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {Math.round(learningInsights.engagementMetrics.avgSessionDuration)}m
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Duration</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Retention Rate</div>
                      <Progress value={learningInsights.engagementMetrics.retentionRate} className="w-full" />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Engagement Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {engagementLoading ? (
                  <div className="h-24 bg-muted rounded animate-pulse" />
                ) : engagementData ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {engagementData.overview.totalEngagements} Engagements
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Trend: {engagementData.overview.engagementTrend}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {engagementData.insights.slice(0, 2).map((insight: string, index: number) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No engagement data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Content Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter content to analyze..."
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={() => analyzeContentMutation.mutate(analysisText)}
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
                    className="bg-muted p-3 rounded text-sm"
                  >
                    <div className="font-medium">Analysis Results:</div>
                    <div>Complexity: {analyzeContentMutation.data.complexity}</div>
                    <div>Words: {analyzeContentMutation.data.wordCount}</div>
                    <div>Readability: {analyzeContentMutation.data.readabilityScore}/100</div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Multi-Language
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Text to translate..."
                  value={translationText}
                  onChange={(e) => setTranslationText(e.target.value)}
                />
                <select 
                  value={targetLanguage} 
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <Button 
                  onClick={() => translateMutation.mutate({ text: translationText, language: targetLanguage })}
                  disabled={translateMutation.isPending || !translationText.trim()}
                  className="w-full"
                >
                  {translateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="mr-2 h-4 w-4" />
                  )}
                  Translate
                </Button>
                {translateMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted p-3 rounded text-sm"
                  >
                    <div className="font-medium">Translation:</div>
                    <div>{translateMutation.data.translatedText}</div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice Synthesis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Text to convert to speech..."
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={() => voiceSynthesisMutation.mutate(voiceText)}
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
                    className="bg-muted p-3 rounded text-sm space-y-3"
                  >
                    <div className="font-medium">Audio Generated</div>
                    <div>Duration: {voiceSynthesisMutation.data.duration}s</div>
                    {voiceSynthesisMutation.data.audioUrl && (
                      <audio controls className="w-full">
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
                        <Play className="mr-1 h-3 w-3" />
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
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : achievements ? (
                <div className="space-y-4">
                  {achievements.map((achievement: any) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        achievement.earned ? 'bg-green-50 border-green-200' : 'bg-muted border-border'
                      }`}
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                        {!achievement.earned && achievement.progress !== undefined && (
                          <div className="mt-2">
                            <Progress 
                              value={(achievement.progress / achievement.required) * 100} 
                              className="w-full h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {achievement.progress}/{achievement.required}
                            </div>
                          </div>
                        )}
                      </div>
                      {achievement.earned && (
                        <Badge variant="secondary">Earned</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No achievements data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Prediction
              </CardTitle>
              <CardDescription>
                AI-powered predictions based on learning patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => predictPerformanceMutation.mutate()}
                disabled={predictPerformanceMutation.isPending || !tutorId}
                className="w-full"
              >
                {predictPerformanceMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Predict Performance
              </Button>
              
              {predictPerformanceMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(predictPerformanceMutation.data.predictedScore)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Predicted Success Rate</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Key Factors:</div>
                    <div className="space-y-2">
                      {predictPerformanceMutation.data.factors.map((factor: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{factor.name}</span>
                          <Badge variant={factor.impact === 'positive' ? 'default' : 'secondary'}>
                            {factor.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Recommendations:</div>
                    <ul className="text-sm space-y-1">
                      {predictPerformanceMutation.data.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
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