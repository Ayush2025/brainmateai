import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Zap, 
  Mic, 
  Camera, 
  BookOpen, 
  Users, 
  BarChart3, 
  Globe, 
  Sparkles,
  Bot,
  MessageSquare,
  Video,
  FileText,
  Trophy,
  Target,
  Clock,
  Star,
  TrendingUp,
  Lightbulb,
  Gamepad2,
  Share2,
  Download
} from "lucide-react";

interface AdvancedFeaturesProps {
  onFeatureSelect: (feature: string) => void;
}

export function AdvancedFeatures({ onFeatureSelect }: AdvancedFeaturesProps) {
  const [selectedCategory, setSelectedCategory] = useState("ai-features");

  const categories = {
    "ai-features": {
      title: "AI-Powered Features",
      icon: Brain,
      color: "text-purple-500",
      features: [
        {
          id: "smart-content-analysis",
          name: "Smart Content Analysis",
          description: "AI automatically analyzes uploaded content and creates optimized learning paths",
          icon: Brain,
          premium: false,
          status: "new"
        },
        {
          id: "adaptive-learning",
          name: "Adaptive Learning Engine",
          description: "AI adjusts difficulty and teaching style based on student performance",
          icon: Target,
          premium: true,
          status: "popular"
        },
        {
          id: "instant-quiz-generator",
          name: "Instant Quiz Generator",
          description: "Generate quizzes and assessments from any content in seconds",
          icon: Lightbulb,
          premium: false,
          status: "new"
        },
        {
          id: "voice-synthesis",
          name: "Voice Synthesis",
          description: "Your tutor speaks with natural, customizable voice in multiple languages",
          icon: Mic,
          premium: true,
          status: "beta"
        }
      ]
    },
    "interaction": {
      title: "Interactive Learning",
      icon: Users,
      color: "text-blue-500",
      features: [
        {
          id: "video-chat",
          name: "Video Chat Support",
          description: "Face-to-face tutoring sessions with screen sharing capabilities",
          icon: Video,
          premium: true,
          status: "coming-soon"
        },
        {
          id: "collaborative-whiteboard",
          name: "Collaborative Whiteboard",
          description: "Interactive digital whiteboard for visual learning and problem solving",
          icon: FileText,
          premium: true,
          status: "beta"
        },
        {
          id: "gamification",
          name: "Gamification System",
          description: "Achievements, badges, and progress tracking to motivate students",
          icon: Gamepad2,
          premium: false,
          status: "popular"
        },
        {
          id: "study-groups",
          name: "Study Groups",
          description: "Create virtual study groups where students can learn together",
          icon: Users,
          premium: true,
          status: "new"
        }
      ]
    },
    "analytics": {
      title: "Analytics & Insights",
      icon: BarChart3,
      color: "text-green-500",
      features: [
        {
          id: "learning-analytics",
          name: "Advanced Learning Analytics",
          description: "Deep insights into student progress, strengths, and areas for improvement",
          icon: BarChart3,
          premium: true,
          status: "popular"
        },
        {
          id: "performance-prediction",
          name: "Performance Prediction",
          description: "AI predicts student performance and suggests interventions",
          icon: TrendingUp,
          premium: true,
          status: "beta"
        },
        {
          id: "engagement-tracking",
          name: "Engagement Tracking",
          description: "Monitor student engagement levels and optimize content delivery",
          icon: Clock,
          premium: false,
          status: "new"
        },
        {
          id: "custom-reports",
          name: "Custom Reports",
          description: "Generate detailed reports for students, parents, and administrators",
          icon: FileText,
          premium: true,
          status: "popular"
        }
      ]
    },
    "content": {
      title: "Content Enhancement",
      icon: BookOpen,
      color: "text-orange-500",
      features: [
        {
          id: "multi-language",
          name: "Multi-Language Support",
          description: "Tutors that can teach and communicate in 50+ languages",
          icon: Globe,
          premium: true,
          status: "popular"
        },
        {
          id: "ar-visualization",
          name: "AR Visualization",
          description: "Augmented reality features for immersive 3D learning experiences",
          icon: Camera,
          premium: true,
          status: "coming-soon"
        },
        {
          id: "content-marketplace",
          name: "Content Marketplace",
          description: "Access thousands of pre-made educational content and share your own",
          icon: Share2,
          premium: false,
          status: "new"
        },
        {
          id: "offline-mode",
          name: "Offline Learning Mode",
          description: "Download content for offline learning without internet connection",
          icon: Download,
          premium: true,
          status: "beta"
        }
      ]
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "new": { variant: "default" as const, label: "New" },
      "popular": { variant: "secondary" as const, label: "Popular" },
      "beta": { variant: "outline" as const, label: "Beta" },
      "coming-soon": { variant: "destructive" as const, label: "Coming Soon" }
    };
    
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Advanced Features</h2>
        <p className="text-muted-foreground">
          Supercharge your tutoring experience with cutting-edge AI technology
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {Object.entries(categories).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <category.icon className={`h-4 w-4 ${category.color}`} />
              <span className="hidden sm:inline">{category.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        onClick={() => onFeatureSelect(feature.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors`}>
                            <feature.icon className={`h-5 w-5 ${category.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(feature.status)}
                              {feature.premium && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-3 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        {feature.status === "coming-soon" ? "Request Access" : "Learn More"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Want Custom Features?</h3>
        <p className="text-muted-foreground mb-4">
          We're constantly innovating. Suggest new features or request custom integrations for your institution.
        </p>
        <Button variant="outline" onClick={() => onFeatureSelect("custom-request")}>
          <Sparkles className="mr-2 h-4 w-4" />
          Request Custom Feature
        </Button>
      </div>
    </div>
  );
}