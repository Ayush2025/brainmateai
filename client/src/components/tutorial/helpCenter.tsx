import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  X, 
  Search, 
  BookOpen, 
  PlayCircle, 
  MessageCircle, 
  Settings,
  Upload,
  Bot,
  BarChart3,
  Crown,
  HelpCircle,
  ChevronRight,
  Video,
  FileText,
  Mic,
  Globe
} from "lucide-react";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
}

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: PlayCircle,
    description: "Learn the basics of BrainMate AI",
    articles: [
      {
        title: "Creating Your First AI Tutor",
        description: "Step-by-step guide to building your first intelligent tutor",
        readTime: "5 min",
        difficulty: "Beginner",
        content: "Upload your educational content (PDFs, documents, or YouTube videos), choose a subject area, customize your tutor's personality, and launch it for students to interact with."
      },
      {
        title: "Understanding Subscription Plans",
        description: "Compare features across Free, Pro, and Premium tiers",
        readTime: "3 min",
        difficulty: "Beginner",
        content: "Free plan includes 2 tutors with basic features. Pro plan (₹199/month) adds voice interaction and 10 tutors. Premium plan (₹599/month) includes unlimited tutors, advanced analytics, and priority support."
      },
      {
        title: "Uploading and Managing Content",
        description: "Best practices for content preparation and organization",
        readTime: "4 min",
        difficulty: "Beginner",
        content: "Prepare clear, well-structured educational materials. Supported formats include PDF, DOCX, TXT files, and YouTube video URLs. Organize content by topic for better AI training results."
      }
    ]
  },
  {
    id: "features",
    title: "Features & Tools",
    icon: Settings,
    description: "Explore all platform capabilities",
    articles: [
      {
        title: "AI Voice Interaction",
        description: "Enable natural voice conversations with your tutors",
        readTime: "3 min",
        difficulty: "Intermediate",
        content: "Voice interaction allows students to speak naturally with AI tutors. Enable voice mode in tutor settings, configure language preferences, and customize speech synthesis options."
      },
      {
        title: "3D Avatar Customization",
        description: "Personalize your tutor's visual appearance",
        readTime: "4 min",
        difficulty: "Intermediate",
        content: "Choose from professional avatar styles, adjust facial expressions based on emotional context, and configure visual feedback for different interaction scenarios."
      },
      {
        title: "Multilingual Support",
        description: "Create tutors that support multiple languages",
        readTime: "5 min",
        difficulty: "Intermediate",
        content: "Configure language preferences, enable automatic translation, and set primary and secondary languages for your AI tutors to serve diverse student populations."
      },
      {
        title: "Analytics and Insights",
        description: "Track student engagement and learning progress",
        readTime: "6 min",
        difficulty: "Advanced",
        content: "Access detailed metrics on student interactions, session duration, most asked questions, learning patterns, and engagement trends to optimize your tutoring content."
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: HelpCircle,
    description: "Solutions to common issues",
    articles: [
      {
        title: "AI Tutor Not Responding Accurately",
        description: "Improve AI response quality and accuracy",
        readTime: "4 min",
        difficulty: "Intermediate",
        content: "Ensure content is well-structured, add more context to training materials, review subject area settings, and consider upgrading for better AI models."
      },
      {
        title: "Voice Features Not Working",
        description: "Resolve audio and speech-related issues",
        readTime: "3 min",
        difficulty: "Beginner",
        content: "Check browser microphone permissions, verify audio device settings, ensure stable internet connection, and confirm Pro/Premium subscription for voice features."
      },
      {
        title: "Content Upload Failures",
        description: "Fix file upload and processing problems",
        readTime: "3 min",
        difficulty: "Beginner",
        content: "Verify file format compatibility, check file size limits, ensure stable internet connection, and try uploading smaller files if issues persist."
      }
    ]
  },
  {
    id: "advanced",
    title: "Advanced Usage",
    icon: BarChart3,
    description: "Power user tips and tricks",
    articles: [
      {
        title: "Optimizing AI Training Data",
        description: "Best practices for preparing educational content",
        readTime: "8 min",
        difficulty: "Advanced",
        content: "Structure content with clear headings, include examples and case studies, provide context and explanations, and organize materials by difficulty level for optimal AI training."
      },
      {
        title: "Student Access Management",
        description: "Control and monitor student interactions",
        readTime: "5 min",
        difficulty: "Advanced",
        content: "Generate secure sharing links, set access permissions, monitor student activity, and configure session limits for different user groups."
      },
      {
        title: "API Integration",
        description: "Integrate BrainMate AI with external systems",
        readTime: "10 min",
        difficulty: "Expert",
        content: "Access REST API endpoints, authenticate requests, integrate with learning management systems, and customize data synchronization workflows."
      }
    ]
  }
];

export function HelpCenter({ isOpen, onClose, onStartTutorial }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("getting-started");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-4 bg-background rounded-xl shadow-2xl border max-w-6xl max-h-[90vh] mx-auto overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Help Center</h2>
                <p className="text-sm text-muted-foreground">Get help and learn how to use BrainMate AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onStartTutorial}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Take Tour
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-140px)]">
            {/* Sidebar */}
            <div className="w-80 border-r bg-muted/30 p-6 overflow-y-auto">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedArticle(null);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{category.title}</div>
                          <div className="text-xs opacity-80">{category.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedArticle ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-3xl"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedArticle(null)}
                    className="mb-4"
                  >
                    ← Back to {helpCategories.find(c => c.id === selectedCategory)?.title}
                  </Button>
                  
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {selectedArticle.title}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline">{selectedArticle.readTime}</Badge>
                      <Badge variant="secondary">{selectedArticle.difficulty}</Badge>
                    </div>
                    <p className="text-muted-foreground">{selectedArticle.description}</p>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground leading-relaxed">
                          {selectedArticle.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl"
                >
                  {(() => {
                    const category = helpCategories.find(c => c.id === selectedCategory);
                    if (!category) return null;
                    
                    const Icon = category.icon;
                    return (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h1 className="text-2xl font-bold text-foreground">{category.title}</h1>
                            <p className="text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          {category.articles.map((article, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent 
                                  className="p-4"
                                  onClick={() => setSelectedArticle(article)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-foreground mb-1">
                                        {article.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {article.description}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {article.readTime}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {article.difficulty}
                                        </Badge>
                                      </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}